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
  try {
    const [userRes, memRes, profsRes, langsRes, certsRes, openToRes] = await Promise.all([
      pool.query(
        `SELECT u.full_name, u.bio, u.short_intro, u.migration_status,
                u.time_in_spain, u.availability_schedule, u.availability_start_date,
                u.accepts_relocation, u.max_commute_km, u.role,
                c.name as city_name, co.name as country_name
         FROM users u
         LEFT JOIN cities c ON u.city_id = c.id
         LEFT JOIN countries co ON u.country_id = co.id
         WHERE u.id = $1`,
        [userId]
      ),
      pool.query(
        `SELECT memory_key, memory_value FROM agent_user_memory WHERE user_id = $1`,
        [userId]
      ),
      pool.query(
        `SELECT profession_name, years_experience, has_title, title_homologated, description, is_primary
         FROM user_professions WHERE user_id = $1`,
        [userId]
      ),
      pool.query(
        `SELECT language, level FROM user_languages WHERE user_id = $1`,
        [userId]
      ),
      pool.query(
        `SELECT certification_name, details FROM user_certifications WHERE user_id = $1`,
        [userId]
      ),
      pool.query(
        `SELECT profession_name FROM user_open_to_professions WHERE user_id = $1`,
        [userId]
      ),
    ]);

    const user = userRes.rows[0];
    if (!user) return 'Sin datos previos.';

    const lines: string[] = [];
    lines.push(`Nombre: ${user.full_name}`);
    if (user.country_name) lines.push(`País de origen: ${user.country_name}`);
    if (user.city_name) lines.push(`Ciudad actual: ${user.city_name}`);
    if (user.migration_status) lines.push(`Situación migratoria: ${user.migration_status}`);
    if (user.time_in_spain) lines.push(`Tiempo en España: ${user.time_in_spain}`);
    if (user.short_intro) lines.push(`Presentación: ${user.short_intro}`);
    if (user.availability_schedule) lines.push(`Disponibilidad horaria: ${user.availability_schedule}`);
    if (user.availability_start_date) lines.push(`Puede empezar: ${user.availability_start_date}`);
    if (user.accepts_relocation) lines.push(`Acepta desplazarse hasta ${user.max_commute_km || '?'} km`);

    if (profsRes.rows.length > 0) {
      lines.push('Profesiones:');
      for (const p of profsRes.rows) {
        const parts = [p.profession_name];
        if (p.years_experience) parts.push(`${p.years_experience} años`);
        if (p.has_title) parts.push(p.title_homologated ? 'título homologado' : 'título sin homologar');
        if (p.is_primary) parts.push('(principal)');
        lines.push(`  ${parts.join(', ')}`);
      }
    }

    if (langsRes.rows.length > 0) {
      const langs = langsRes.rows.map((l: any) => `${l.language} (${l.level})`).join(', ');
      lines.push(`Idiomas: ${langs}`);
    }

    if (certsRes.rows.length > 0) {
      const certs = certsRes.rows.map((c: any) => c.certification_name).join(', ');
      lines.push(`Certificaciones: ${certs}`);
    }

    if (openToRes.rows.length > 0) {
      const open = openToRes.rows.map((o: any) => o.profession_name).join(', ');
      lines.push(`Dispuesta a trabajar también en: ${open}`);
    }

    // memorias adicionales (texto libre que el agente guardó)
    for (const m of memRes.rows) {
      if (!m.memory_key.startsWith('job_')) {
        lines.push(`${m.memory_key}: ${m.memory_value}`);
      }
    }

    return lines.join('\n');
  } catch (err) {
    console.error('[getUserMemoryText] error:', (err as Error).message);
    return 'Sin datos previos.';
  }
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
