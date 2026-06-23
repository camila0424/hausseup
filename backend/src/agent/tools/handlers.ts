import { randomUUID } from 'crypto';
import type { PendingAction } from '../types';
import { generateMatchReason, generateCandidateMatchReason } from './matchReason';
import pool from '../../config/db';

// mapa en memoria para acciones pendientes de confirmación (HITL)
// la clave es el UUID de la acción, el valor es la acción con su TTL
// esto reemplaza Redis para el MVP — es suficiente para un solo proceso
export const pendingActionsMap = new Map<string, PendingAction>();

// limpia acciones expiradas cada minuto
setInterval(() => {
  const now = new Date();
  for (const [id, action] of pendingActionsMap.entries()) {
    if (action.expiresAt < now) {
      pendingActionsMap.delete(id);
    }
  }
}, 60_000);

// ejecuta el bloque tool_use que devuelve Claude y retorna el resultado
export async function executeTool(
  toolName: string,
  toolInput: Record<string, unknown>,
  userId: number,
  agentType: 'companion' | 'recruiter'
): Promise<unknown> {
  switch (toolName) {
    // ─── TOOLS DEL COMPAÑERO ────────────────────────────────────────────

    case 'buscar_empleos':
      return await handleBuscarEmpleos(toolInput, userId);

    case 'obtener_perfil':
      return await handleObtenerPerfil(userId);

    case 'actualizar_perfil':
      return await handleActualizarPerfil(toolInput, userId);

    case 'aplicar_a_empleo':
      return await handleAplicarAEmpleo(toolInput, userId);

    case 'mis_candidaturas':
      return await handleMisCandidaturas(userId);

    case 'guardar_empleo':
      return await handleGuardarEmpleo(toolInput, userId);

    // ─── TOOLS DEL SELECCIÓN ────────────────────────────────────────────

    case 'crear_oferta_empleo':
      return await handleCrearOfertaEmpleo(toolInput, userId);

    case 'recomendar_candidatos':
      return await handleRecomendarCandidatos(toolInput, userId);

    case 'programar_entrevista':
      return await handleProgramarEntrevista(toolInput, userId);

    // ─── TOOL COMPARTIDA ────────────────────────────────────────────────

    case 'log_audit_event':
      return await handleLogAuditEvent(toolInput, userId, agentType);

    default:
      return { error: `Tool desconocida: ${toolName}` };
  }
}

// ─── IMPLEMENTACIONES ────────────────────────────────────────────────────────

async function handleBuscarEmpleos(
  input: Record<string, unknown>,
  userId: number
): Promise<unknown> {
  const limit = (input.limit as number) || 3;

  // construir query dinámica según los filtros que proporcione el agente
  let query = `
    SELECT j.*, c.name as city_name
    FROM jobs j
    LEFT JOIN cities c ON j.city_id = c.id
    WHERE j.status = 'active'
  `;
  const params: unknown[] = [];

  if (input.city) {
    params.push(`%${input.city}%`);
    query += ` AND c.name ILIKE $${params.length}`;
  }

  if (input.sector) {
    params.push(`%${input.sector}%`);
    query += ` AND (j.title ILIKE $${params.length} OR j.description ILIKE $${params.length})`;
  }

  if (input.contractType) {
    params.push(input.contractType);
    query += ` AND j.contract_type = $${params.length}`;
  }

  params.push(limit);
  query += ` ORDER BY j.created_at DESC LIMIT $${params.length}`;

  const { rows: jobs } = await pool.query(query, params);

  // obtener perfil del usuario para generar frases de match
  const { rows: profileRows } = await pool.query(
    'SELECT * FROM users WHERE id = $1',
    [userId]
  );
  const profile = profileRows[0];

  // generar matchScore y matchReason para cada empleo
  const jobsWithMatch = await Promise.all(
    jobs.map(async (job: Record<string, unknown>) => {
      // matchScore simple basado en coincidencia de campos — mejorar con embeddings en Fase 2
      const matchScore = calculateSimpleMatchScore(profile, job);

      const matchReason = await generateMatchReason(
        {
          userId: profile.id,
          name: profile.name,
          city: profile.city,
          sector: profile.sector,
          experienceSummary: profile.experience_summary,
          languages: profile.languages,
        },
        {
          id: job.id as number,
          title: job.title as string,
          company: job.company_name as string,
          location: job.city_name as string,
          description: job.description as string,
          salary: job.salary as string,
          schedule: job.schedule as string,
          contractType: job.contract_type as string,
          paperworkRequired: job.paperwork_required as string,
        }
      );

      return {
        id: job.id,
        company: job.company_name,
        title: job.title,
        location: job.city_name,
        salary: job.salary,
        schedule: job.schedule,
        contractType: job.contract_type,
        paperworkRequired: job.paperwork_required,
        description: job.description,
        matchScore,
        matchReason,
      };
    })
  );

  // filtrar tarjetas sin matchReason válido (regla dura del doc maestro)
  const validJobs = jobsWithMatch.filter(
    (j) => j.matchScore !== undefined && j.matchReason && j.matchReason.length > 0
  );

  return { jobs: validJobs, total: validJobs.length };
}

async function handleObtenerPerfil(userId: number): Promise<unknown> {
  const { rows } = await pool.query(
    `SELECT id, name, email, phone, city, migration_status,
            sector, experience_summary, languages, salary_expectation,
            availability, extra_info, verified, created_at
     FROM users WHERE id = $1`,
    [userId]
  );
  return rows[0] || { error: 'Usuario no encontrado' };
}

async function handleActualizarPerfil(
  input: Record<string, unknown>,
  userId: number
): Promise<unknown> {
  // construir SET dinámico solo con los campos que vienen
  const fieldMap: Record<string, string> = {
    city: 'city',
    migrationStatus: 'migration_status',
    sector: 'sector',
    experienceSummary: 'experience_summary',
    languages: 'languages',
    salaryExpectation: 'salary_expectation',
    availability: 'availability',
    extraInfo: 'extra_info',
  };

  const setClauses: string[] = [];
  const params: unknown[] = [];

  for (const [inputKey, dbColumn] of Object.entries(fieldMap)) {
    if (input[inputKey] !== undefined) {
      params.push(input[inputKey]);
      setClauses.push(`${dbColumn} = $${params.length}`);
    }
  }

  if (setClauses.length === 0) {
    return { success: true, message: 'Nada que actualizar' };
  }

  params.push(userId);
  const query = `UPDATE users SET ${setClauses.join(', ')}, updated_at = NOW() WHERE id = $${params.length}`;
  await pool.query(query, params);

  // también guardar en agent_user_memory para acceso rápido en el prompt
  for (const [inputKey, value] of Object.entries(input)) {
    await pool.query(
      `INSERT INTO agent_user_memory (user_id, memory_key, memory_value)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, memory_key)
       DO UPDATE SET memory_value = $3, updated_at = NOW()`,
      [userId, inputKey, JSON.stringify(value)]
    );
  }

  return { success: true };
}

async function handleAplicarAEmpleo(
  input: Record<string, unknown>,
  userId: number
): Promise<unknown> {
  // esta tool NO ejecuta la candidatura directamente
  // crea una acción pendiente que el frontend debe confirmar (HITL)
  const pendingAction: PendingAction = {
    id: randomUUID(),
    type: 'apply_to_job',
    context: {
      jobTitle: input.jobTitle,
      companyName: input.companyName,
    },
    payload: {
      jobId: input.jobId,
      userId,
    },
    expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutos
  };

  pendingActionsMap.set(pendingAction.id, pendingAction);

  // devolvemos la acción pendiente — el agente.service la incluirá en la respuesta
  return {
    pendingAction,
    message: `Tengo listo para enviarte a ${input.companyName} como candidato/a para ${input.jobTitle}. ¿Lo hacemos?`,
  };
}

// ejecuta la candidatura real después de que el usuario confirme en el modal
export async function executeConfirmedAction(
  action: PendingAction,
  userId: number
): Promise<{ success: boolean; message: string }> {
  switch (action.type) {
    case 'apply_to_job': {
      const jobId = action.payload.jobId as number;

      // verificar que no haya aplicado antes
      const { rows: existing } = await pool.query(
        'SELECT id FROM applications WHERE user_id = $1 AND job_id = $2',
        [userId, jobId]
      );

      if (existing.length > 0) {
        return { success: false, message: 'Ya enviaste tu candidatura a este empleo.' };
      }

      await pool.query(
        `INSERT INTO applications (user_id, job_id, status, created_at)
         VALUES ($1, $2, 'pending', NOW())`,
        [userId, jobId]
      );

      return {
        success: true,
        message: 'Candidatura enviada. Te aviso cuando la revisen. 👍',
      };
    }

    case 'reject_candidate': {
      const { applicationId } = action.payload as { applicationId: number };
      await pool.query(
        "UPDATE applications SET status = 'rejected', updated_at = NOW() WHERE id = $1",
        [applicationId]
      );
      return { success: true, message: 'Candidato descartado.' };
    }

    default:
      return { success: false, message: 'Acción no reconocida.' };
  }
}

async function handleMisCandidaturas(userId: number): Promise<unknown> {
  const { rows } = await pool.query(
    `SELECT a.id, a.status, a.created_at,
            j.title, j.company_name, j.location
     FROM applications a
     JOIN jobs j ON a.job_id = j.id
     WHERE a.user_id = $1
     ORDER BY a.created_at DESC
     LIMIT 20`,
    [userId]
  );
  return { applications: rows, total: rows.length };
}

async function handleGuardarEmpleo(
  input: Record<string, unknown>,
  userId: number
): Promise<unknown> {
  const jobId = input.jobId as number;

  // verificar que no esté guardado ya
  const { rows: existing } = await pool.query(
    'SELECT user_id FROM saved_jobs WHERE user_id = $1 AND job_id = $2',
    [userId, jobId]
  );

  if (existing.length > 0) {
    return { success: true, message: 'Este empleo ya estaba en tu lista.' };
  }

  await pool.query(
    'INSERT INTO saved_jobs (user_id, job_id) VALUES ($1, $2)',
    [userId, jobId]
  );

  return { success: true, message: 'Empleo guardado en tu lista.' };
}

async function handleCrearOfertaEmpleo(
  input: Record<string, unknown>,
  userId: number
): Promise<unknown> {
  // igual que aplicar_a_empleo, requiere confirmación antes de publicar
  // primero buscamos el employer_id asociado al usuario
  const { rows: empRows } = await pool.query(
    'SELECT id FROM employers WHERE user_id = $1',
    [userId]
  );

  if (empRows.length === 0) {
    return { error: 'No se encontró un perfil de empresa asociado a tu cuenta.' };
  }

  const employerId = empRows[0].id;

  // insertar en estado 'draft' — se publica al confirmar
  const { rows } = await pool.query(
    `INSERT INTO jobs (
       employer_id, title, description, location, salary,
       schedule, contract_type, paperwork_required, city_id, status, created_at
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'draft',NOW())
     RETURNING id, title, company_name`,
    [
      employerId,
      input.title,
      input.description,
      input.location,
      input.salary || null,
      input.schedule || null,
      input.contractType || null,
      input.paperworkRequired,
      input.cityId || null,
    ]
  );

  const newJob = rows[0];

  // crear acción pendiente para que el empleador confirme la publicación
  const pendingAction: PendingAction = {
    id: randomUUID(),
    type: 'accept_offer', // reutilizamos este tipo para la confirmación de publicación
    context: {
      jobTitle: newJob.title,
      jobId: newJob.id,
    },
    payload: {
      jobId: newJob.id,
      action: 'publish_job',
    },
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  };

  pendingActionsMap.set(pendingAction.id, pendingAction);

  return {
    pendingAction,
    job: newJob,
    message: `Estructuré la oferta para ${newJob.title}. ¿La publicamos?`,
  };
}

async function handleRecomendarCandidatos(
  input: Record<string, unknown>,
  userId: number
): Promise<unknown> {
  const jobId = input.jobId as number;
  const limit = (input.limit as number) || 5;

  // obtener la oferta
  const { rows: jobRows } = await pool.query('SELECT * FROM jobs WHERE id = $1', [jobId]);
  if (jobRows.length === 0) {
    return { error: 'Empleo no encontrado.' };
  }
  const job = jobRows[0];

  // obtener candidatos con perfil activo
  // en una versión futura esto usará embeddings + similitud coseno
  const { rows: candidates } = await pool.query(
    `SELECT u.id, u.name, u.city, u.migration_status,
            u.sector, u.experience_summary, u.languages,
            u.availability, u.photo
     FROM users u
     WHERE u.role = 'worker'
       AND u.id NOT IN (
         SELECT user_id FROM applications WHERE job_id = $1
       )
     LIMIT $2`,
    [jobId, limit * 3] // traemos más para rankear
  );

  if (candidates.length === 0) {
    return { candidates: [], message: 'No hay candidatos disponibles para esta oferta aún.' };
  }

  // rankear con score simple + generar matchReason
  const ranked = await Promise.all(
    candidates.map(async (c: Record<string, unknown>) => {
      const matchScore = calculateSimpleMatchScore(c, job);

      const matchReason = await generateCandidateMatchReason(
        {
          userId: c.id as number,
          name: c.name as string,
          city: c.city as string,
          sector: c.sector as string,
          experienceSummary: c.experience_summary as string,
          languages: c.languages as string[],
          availability: c.availability as string,
        },
        {
          id: job.id,
          title: job.title,
          company: job.company_name,
          location: job.location,
          description: job.description,
          salary: job.salary,
          paperworkRequired: job.paperwork_required,
        }
      );

      // privacidad: migración solo visible si el candidato dio consentimiento
      const { rows: consentRows } = await pool.query(
        `SELECT id FROM user_consents
         WHERE user_id = $1
           AND consent_type = 'migration_status_share'
           AND granted = TRUE
           AND revoked_at IS NULL`,
        [c.id]
      );

      const canSeeMigration = consentRows.length > 0;

      return {
        id: c.id,
        name: c.name,
        photo: c.photo,
        city: c.city,
        experienceSummary: c.experience_summary,
        languages: c.languages,
        migrationStatus: canSeeMigration ? c.migration_status : 'hidden',
        availability: c.availability,
        matchScore,
        matchReason,
      };
    })
  );

  // ordenar por matchScore y tomar los top `limit`
  ranked.sort((a, b) => b.matchScore - a.matchScore);
  const topCandidates = ranked.slice(0, limit).filter(
    (c) => c.matchReason && c.matchReason.length > 0
  );

  return { candidates: topCandidates, total: topCandidates.length };
}

async function handleProgramarEntrevista(
  input: Record<string, unknown>,
  userId: number
): Promise<unknown> {
  // insertar la entrevista — ajustar tabla según esquema real
  const { rows } = await pool.query(
    `INSERT INTO interviews (
       employer_user_id, candidate_id, job_id,
       scheduled_at, format, location, status, created_at
     ) VALUES ($1,$2,$3,$4,$5,$6,'scheduled',NOW())
     RETURNING id`,
    [
      userId,
      input.candidateId,
      input.jobId,
      input.dateTime,
      input.format,
      input.location || null,
    ]
  );

  return {
    success: true,
    interviewId: rows[0].id,
    message: `Entrevista agendada para el ${input.dateTime}. Se notificará a ambas partes.`,
  };
}

async function handleLogAuditEvent(
  input: Record<string, unknown>,
  userId: number,
  agentType: 'companion' | 'recruiter'
): Promise<unknown> {
  await pool.query(
    `INSERT INTO ai_audit_log (event_type, user_id, description, original_request, agent_type)
     VALUES ($1, $2, $3, $4, $5)`,
    [
      input.event_type,
      userId,
      input.description,
      input.original_request || null,
      agentType,
    ]
  );
  // respuesta silenciosa — el agente no necesita saber el resultado
  return { logged: true };
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

// cálculo simple de match score sin embeddings
// devuelve 0-100 basado en coincidencia de campos clave
// se reemplazará con embeddings + coseno en Fase 3
function calculateSimpleMatchScore(
  profile: Record<string, unknown>,
  job: Record<string, unknown>
): number {
  let score = 50; // base

  // coincidencia de ciudad
  const profileCity = String(profile.city || '').toLowerCase();
  const jobCity = String(job.city_name || job.location || '').toLowerCase();
  if (profileCity && jobCity && (profileCity.includes(jobCity) || jobCity.includes(profileCity))) {
    score += 25;
  }

  // coincidencia de sector
  const profileSector = String(profile.sector || '').toLowerCase();
  const jobTitle = String(job.title || '').toLowerCase();
  const jobDescription = String(job.description || '').toLowerCase();
  if (
    profileSector &&
    (jobTitle.includes(profileSector) || jobDescription.includes(profileSector))
  ) {
    score += 15;
  }

  // papeles: bonus si el empleo acepta situación del candidato
  const paperwork = job.paperwork_required as string;
  const migration = profile.migration_status as string;
  if (paperwork === 'none' || (paperwork === 'in_process_ok' && migration === 'in_process')) {
    score += 10;
  }

  return Math.min(score, 100);
}
