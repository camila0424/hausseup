import pool from '../config/db';

// ─── HISTORIAL DE CONVERSACIÓN ────────────────────────────────────────────────
// El historial vive solo en memoria durante la sesión; no se persiste en BD.

export async function getRecentHistoryText(
  _userId: string,
  _limit = 20
): Promise<string> {
  return '';
}

export async function getConversationMessages(
  _userId: string,
  _limit = 20
): Promise<Array<{ role: 'user' | 'assistant'; content: string }>> {
  return [];
}

export async function saveConversationTurn(
  _userId: string,
  _userMessage: string,
  _agentResponse: string
): Promise<void> {
  return Promise.resolve();
}

// ─── MEMORIA PERSISTENTE DEL AGENTE ──────────────────────────────────────────

export async function getUserMemoryText(userId: string): Promise<string> {
  const { rows } = await pool.query(
    'SELECT memory_key, memory_value FROM agent_user_memory WHERE user_id = $1',
    [userId]
  );

  if (rows.length === 0) return '';

  return rows
    .map((r: { memory_key: string; memory_value: string }) => `${r.memory_key}: ${r.memory_value}`)
    .join('\n');
}

export async function setUserMemory(
  userId: string,
  key: string,
  value: unknown
): Promise<void> {
  const stored = typeof value === 'string' ? value : JSON.stringify(value);

  await pool.query(
    `INSERT INTO agent_user_memory (user_id, memory_key, memory_value)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, memory_key)
     DO UPDATE SET memory_value = $3, updated_at = NOW()`,
    [userId, key, stored]
  );
}
