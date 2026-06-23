import pool from '../config/db';

const AGENT_SYSTEM_ID = '00000000-0000-0000-0000-000000000001';

// ─── HISTORIAL DE CONVERSACIÓN ────────────────────────────────────────────────

export async function getRecentHistoryText(
  userId: string,
  limit = 20
): Promise<string> {
  const { rows: convRows } = await pool.query(
    `SELECT id FROM conversations
     WHERE user_a_id = $1
     ORDER BY last_message_at DESC NULLS LAST LIMIT 1`,
    [userId]
  );

  if (convRows.length === 0) return '';

  const conversationId = convRows[0].id as string;

  const { rows: messages } = await pool.query(
    `SELECT sender_id, body
     FROM messages
     WHERE conversation_id = $1
     ORDER BY created_at ASC
     LIMIT $2`,
    [conversationId, limit]
  );

  return messages
    .map((m: { sender_id: string; body: string }) =>
      `${m.sender_id === userId ? 'Usuario' : 'Agente'}: ${m.body}`
    )
    .join('\n');
}

export async function getConversationMessages(
  userId: string,
  limit = 20
): Promise<Array<{ role: 'user' | 'assistant'; content: string }>> {
  const { rows: convRows } = await pool.query(
    `SELECT id FROM conversations
     WHERE user_a_id = $1
     ORDER BY last_message_at DESC NULLS LAST LIMIT 1`,
    [userId]
  );

  if (convRows.length === 0) return [];

  const conversationId = convRows[0].id as string;

  const { rows: messages } = await pool.query(
    `SELECT sender_id, body
     FROM messages
     WHERE conversation_id = $1
     ORDER BY created_at ASC
     LIMIT $2`,
    [conversationId, limit]
  );

  return messages.map((m: { sender_id: string; body: string }) => ({
    role: (m.sender_id === userId ? 'user' : 'assistant') as 'user' | 'assistant',
    content: m.body,
  }));
}

export async function saveConversationTurn(
  userId: string,
  userMessage: string,
  agentResponse: string
): Promise<void> {
  const { rows: convRows } = await pool.query(
    `SELECT id FROM conversations
     WHERE user_a_id = $1
     ORDER BY last_message_at DESC NULLS LAST LIMIT 1`,
    [userId]
  );

  let conversationId: string;

  if (convRows.length === 0) {
    const { rows: newConv } = await pool.query(
      `INSERT INTO conversations (user_a_id, user_b_id, last_message_at)
       VALUES ($1, $2, NOW())
       RETURNING id`,
      [userId, AGENT_SYSTEM_ID]
    );
    conversationId = newConv[0].id as string;
  } else {
    conversationId = convRows[0].id as string;
    await pool.query(
      'UPDATE conversations SET last_message_at = NOW() WHERE id = $1',
      [conversationId]
    );
  }

  await pool.query(
    `INSERT INTO messages (conversation_id, sender_id, body)
     VALUES ($1, $2, $3)`,
    [conversationId, userId, userMessage]
  );

  await pool.query(
    `INSERT INTO messages (conversation_id, sender_id, body)
     VALUES ($1, $2, $3)`,
    [conversationId, AGENT_SYSTEM_ID, agentResponse]
  );
}

// ─── MEMORIA COMPACTADA ───────────────────────────────────────────────────────

export async function getUserMemoryText(userId: string): Promise<string> {
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

export async function setUserMemory(
  userId: string,
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
