import type { Response } from 'express';
import type { AuthRequest } from '../middlewares/auth.middleware';
import { runAgentLoop, confirmAgentAction } from './agent.service';
import type { AgentMessageRequest, ConfirmActionRequest } from './types';

// POST /api/agent/message
// punto de entrada único para los dos agentes
// el tipo de agente (companion | recruiter) se deriva del rol del JWT
export async function handleAgentMessage(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId;
    const userRole = req.userRole; // 'worker' | 'employer'

    if (!userId) {
      res.status(401).json({ error: 'No autenticado' });
      return;
    }

    const { message, conversationId } = req.body as AgentMessageRequest;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      res.status(400).json({ error: 'El mensaje no puede estar vacío' });
      return;
    }

    // derivar el tipo de agente del rol del usuario
    // worker → Agente Compañero, employer → Agente de Selección
    const agentType = userRole === 'employer' ? 'recruiter' : 'companion';

    const response = await runAgentLoop(message.trim(), userId, agentType);

    res.json({
      success: true,
      ...response,
    });
  } catch (error) {
    console.error('[agent.controller] Error en handleAgentMessage:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor. Intenta de nuevo.',
    });
  }
}

// POST /api/agent/confirm-action
// confirma o cancela una acción pendiente (HITL)
export async function handleConfirmAction(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ error: 'No autenticado' });
      return;
    }

    const { pendingActionId, confirmed } = req.body as ConfirmActionRequest;

    if (!pendingActionId || typeof confirmed !== 'boolean') {
      res.status(400).json({
        error: 'Se requieren pendingActionId y confirmed (boolean)',
      });
      return;
    }

    const result = await confirmAgentAction(pendingActionId, confirmed, userId);

    res.json({
      success: result.success,
      message: result.message,
    });
  } catch (error) {
    console.error('[agent.controller] Error en handleConfirmAction:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor.',
    });
  }
}
