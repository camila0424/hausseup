import Anthropic from '@anthropic-ai/sdk';
import type { AgentType, AgentResponse, AgentCard, PendingAction, JobCardData, CandidateCardData } from './types';
import { COMPANION_TOOLS } from './tools/companion.tools';
import { RECRUITER_TOOLS } from './tools/recruiter.tools';
import { executeTool, executeConfirmedAction, pendingActionsMap } from './tools/handlers';
import { buildCompanionPrompt } from './prompts/companion.prompt';
import { buildRecruiterPrompt } from './prompts/recruiter.prompt';
import pool from '../config/db';
import {
  getUserMemoryText,
  getRecentHistoryText,
  saveConversationTurn,
} from './memory.repository';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// número máximo de iteraciones del loop para evitar bucles infinitos
// es como un límite de intentos: si Claude llama a más de 5 tools seguidas, algo está mal
const MAX_ITERATIONS = 10;

// ─── LOOP PRINCIPAL ───────────────────────────────────────────────────────────

export async function runAgentLoop(
  userMessage: string,
  userId: string,
  agentType: AgentType,
  history?: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<AgentResponse> {
  console.log('[agent DEBUG] userMessage recibido:', JSON.stringify(userMessage));
  console.log('[agent DEBUG] agentType:', agentType, 'userId:', userId);

  // preparar contexto: memoria, herramientas y nombre del usuario
  const [userMemory, recentHistoryText] = await Promise.all([
    getUserMemoryText(userId),
    getRecentHistoryText(userId, 10),
  ]);
  console.log('[agent DEBUG] userMemory raw:', JSON.stringify(userMemory));
  console.log('[agent DEBUG] userMemory length:', userMemory?.length);
  const historyMessages: Anthropic.MessageParam[] = (history ?? []).map((m) => ({
    role: m.role,
    content: m.content,
  }));

  let userName = '';
  try {
    const userRow = await pool.query<{ full_name: string }>(
      'SELECT full_name FROM users WHERE id = $1',
      [userId]
    );
    userName = userRow.rows[0]?.full_name ?? '';
  } catch (err) {
    console.error('Could not fetch user name:', (err as Error).message);
  }

  // short-circuit: primer mensaje de companion sin memoria previa → texto literal, sin llamar a Claude
  if (userMessage === '__init__' && agentType === 'companion') {
    const hasMemory = userMemory && userMemory.trim() !== '' && userMemory.trim() !== 'Sin datos previos.';
    if (!hasMemory) {
      const firstName = userName.trim().split(' ')[0] || '';
      const greeting = firstName ? `¡Hola ${firstName}! ` : '¡Hola! ';
      const literalMessage =
        `${greeting}Soy María, tu agente en Hausseup. Antes de nada, gracias por confiar en nosotros ` +
        `y darle una oportunidad a esta plataforma que estamos construyendo con mucho cariño para la ` +
        `comunidad latina en España. Estoy aquí para ayudarte a encontrar trabajo digno y armar tu perfil ` +
        `para que las empresas te encuentren. Lo que me cuentes queda entre nosotras. Cuéntame un poco de ` +
        `ti: de dónde vienes, cuánto tiempo llevas en España, a qué te has dedicado profesionalmente y ` +
        `cómo te ves trabajando aquí. Cuéntame con calma, sin formularios.`;
      await saveConversationTurn(userId, userMessage, literalMessage);
      return { message: literalMessage };
    }
  }

  console.log('[agent DEBUG] short-circuit NO se disparó, continuando al modelo');

  const systemPrompt =
    agentType === 'companion'
      ? buildCompanionPrompt(userMemory, recentHistoryText, userName)
      : buildRecruiterPrompt(userMemory, recentHistoryText);

  const tools = agentType === 'companion' ? COMPANION_TOOLS : RECRUITER_TOOLS;

  // construir el array de mensajes para la API:
  // historial anterior + el mensaje nuevo del usuario
  const messages: Anthropic.MessageParam[] = [
    ...historyMessages,
    { role: 'user', content: userMessage },
  ];

  // variables que puede ir acumulando el loop
  let finalMessage = '';
  let pendingAction: PendingAction | undefined;
  const cards: AgentCard[] = [];

  let iterations = 0;

  while (iterations < MAX_ITERATIONS) {
    const response = await anthropic.messages.create({
      model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: systemPrompt,
      tools,
      messages,
    });

    console.log('[agent] iter', iterations, 'stop_reason:', response.stop_reason);
    if (response.stop_reason === 'tool_use') {
      const toolNames = response.content
        .filter((b: any) => b.type === 'tool_use')
        .map((b: any) => b.name);
      console.log('[agent] tools called:', toolNames);
    }

    // si Claude terminó de hablar, tomamos su respuesta final
    if (response.stop_reason === 'end_turn') {
      const textBlock = response.content.find((b) => b.type === 'text');
      if (textBlock && textBlock.type === 'text') {
        finalMessage = textBlock.text;
      }
      break;
    }

    // si Claude quiere usar herramientas, las ejecutamos todas en paralelo
    if (response.stop_reason === 'tool_use') {
      const toolUseBlocks = response.content.filter(
        (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use'
      );

      // añadir la respuesta de Claude al historial local
      messages.push({ role: 'assistant', content: response.content });

      // ejecutar todas las tools en paralelo
      const toolResults = await Promise.all(
        toolUseBlocks.map(async (block) => {
          const result = await executeTool(
            block.name,
            block.input as Record<string, unknown>,
            userId,
            agentType
          );

          // detectar si el resultado incluye una acción pendiente (HITL)
          if (
            result &&
            typeof result === 'object' &&
            'pendingAction' in result
          ) {
            pendingAction = (result as { pendingAction: PendingAction }).pendingAction;
          }

          // detectar si el resultado incluye empleos o candidatos para tarjetas inline
          if (
            result &&
            typeof result === 'object' &&
            'jobs' in result
          ) {
            const { jobs } = result as { jobs: unknown[] };
            for (const job of jobs) {
              cards.push({ type: 'job', data: job as JobCardData });
            }
          }

          if (
            result &&
            typeof result === 'object' &&
            'candidates' in result
          ) {
            const { candidates } = result as { candidates: unknown[] };
            for (const candidate of candidates) {
              cards.push({ type: 'candidate', data: candidate as CandidateCardData });
            }
          }

          // devolver el resultado en el formato que espera la API de Anthropic
          return {
            type: 'tool_result' as const,
            tool_use_id: block.id,
            content: JSON.stringify(result),
          };
        })
      );

      // añadir los resultados al historial para que Claude los procese
      messages.push({ role: 'user', content: toolResults });
    }

    iterations++;
  }

  if (iterations >= MAX_ITERATIONS) {
    console.warn('[agent] MAX_ITERATIONS reached for user', userId);
    finalMessage = 'Perdona, me distraje. ¿Puedes repetirme lo último?';
  }

  // guardar el turno en la base de datos
  await saveConversationTurn(userId, userMessage, finalMessage);

  return {
    message: finalMessage,
    pendingAction,
    cards: cards.length > 0 ? cards : undefined,
  };
}

// ─── CONFIRMAR ACCIÓN HITL ────────────────────────────────────────────────────

export async function confirmAgentAction(
  pendingActionId: string,
  confirmed: boolean,
  userId: string
): Promise<{ success: boolean; message: string }> {
  const action = pendingActionsMap.get(pendingActionId);

  if (!action) {
    return {
      success: false,
      message: 'Esta acción ya expiró o no existe. Vuelve a intentarlo.',
    };
  }

  // limpiar la acción del mapa independientemente del resultado
  pendingActionsMap.delete(pendingActionId);

  if (!confirmed) {
    return { success: true, message: 'De acuerdo, no hago nada. Dime si cambias de idea.' };
  }

  // verificar que no haya expirado
  if (action.expiresAt < new Date()) {
    return {
      success: false,
      message: 'Esta acción expiró. Vuelve a decirme qué quieres hacer.',
    };
  }

  return await executeConfirmedAction(action, userId);
}
