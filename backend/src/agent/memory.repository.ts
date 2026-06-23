import pool from '../config/db';

// ─── HISTORIAL DE CONVERSACIÓN ────────────────────────────────────────────────

// obtiene el historial reciente formateado para inyectar en el system prompt
export async function getRecentHistoryText(
  userId: number,
  limit = 20
): Promise<string> {
  // buscar la conversación de tipo 'agent' más reciente del usuario
  const { rows: convRows } = await pool.query(
    `SELECT id FROM conversations
     WHERE user_id = $1 AND conversation_type = 'agent'
     ORDER BY updated_at DESC LIMIT 1`,
    [userId]
  );

  if (convRows.length === 0) return '';

  const conversationId = convRows[0].id;

  const { rows: messages } = await pool.query(
    `SELECT role, content, created_at
     FROM messages
     WHERE conversation_id = $1
     ORDER BY created_at ASC
     LIMIT $2`,
    [conversationId, limit]
  );

  // formatear como texto plano para el system prompt
  return messages
    .map((m: { role: string; content: string }) => `${m.role === 'user' ? 'Usuario' : 'Agente'}: ${m.content}`)
    .join('\n');
}

// obtiene el historial en formato Anthropic messages para el loop del agente
export async function getConversationMessages(
  userId: number,
  limit = 20
): Promise<Array<{ role: 'user' | 'assistant'; content: string }>> {
  const { rows: convRows } = await pool.query(
    `SELECT id FROM conversations
     WHERE user_id = $1 AND conversation_type = 'agent'
     ORDER BY updated_at DESC LIMIT 1`,
    [userId]
  );

  if (convRows.length === 0) return [];

  const conversationId = convRows[0].id;

  const { rows: messages } = await pool.query(
    `SELECT role, content
     FROM messages
     WHERE conversation_id = $1
     ORDER BY created_at ASC
     LIMIT $2`,
    [conversationId, limit]
  );

  return messages.map((m: { role: string; content: string }) => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }));
}

// guarda un turno de la conversación (mensaje del usuario + respuesta del agente)
export async function saveConversationTurn(
  userId: number,
  userMessage: string,
  agentResponse: string
): Promise<void> {
  // buscar o crear la conversación de tipo 'agent'
  let { rows: convRows } = await pool.query(
    `SELECT id FROM conversations
     WHERE user_id = $1 AND conversation_type = 'agent'
     ORDER BY updated_at DESC LIMIT 1`,
    [userId]
  );

  let conversationId: number;

  if (convRows.length === 0) {
    const { rows: newConv } = await pool.query(
      `INSERT INTO conversations (user_id, conversation_type, created_at, updated_at)
       VALUES ($1, 'agent', NOW(), NOW())
       RETURNING id`,
      [userId]
    );
    conversationId = newConv[0].id;
  } else {
    conversationId = convRows[0].id;
    // actualizar timestamp para que quede como la más reciente
    await pool.query(
      'UPDATE conversations SET updated_at = NOW() WHERE id = $1',
      [conversationId]
    );
  }

  // guardar mensaje del usuario
  await pool.query(
    `INSERT INTO messages (conversation_id, role, content, created_at)
     VALUES ($1, 'user', $2, NOW())`,
    [conversationId, userMessage]
  );

  // guardar respuesta del agente
  await pool.query(
    `INSERT INTO messages (conversation_id, role, content, created_at)
     VALUES ($1, 'assistant', $2, NOW())`,
    [conversationId, agentResponse]
  );
}

// ─── MEMORIA COMPACTADA ───────────────────────────────────────────────────────

// obtiene toda la memoria del usuario como texto para inyectar en el system prompt
export async function getUserMemoryText(userId: number): Promise<string> {
  const { rows } = await pool.query(
    'SELECT memory_key, memory_value FROM agent_user_memory WHERE user_id = $1',
    [userId]
  );

  if (rows.length === 0) return '';

  return rows
    .map((r: { memory_key: string; memory_value: string }) => {
      try {
        const value = JSON.parse(r.memory_value);
        return `${r.memory_key}: ${typeof value === 'object' ? JSON.stringify(value) : value}`;
      } catch {
        return `${r.memory_key}: ${r.memory_value}`;
      }
    })
    .join('\n');
}

// guarda un par clave-valor en la memoria del usuario
export async function setUserMemory(
  userId: number,
  key: string,
  value: unknown
): Promise<void> {
  await pool.query(
    `INSERT INTO agent_user_memory (user_id, memory_key, memory_value)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, memory_key)
     DO UPDATE SET memory_value = $3, updated_at = NOW()`,
    [userId, key, JSON.stringify(value)]
  );
}
