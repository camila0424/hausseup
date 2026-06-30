import { randomUUID } from 'crypto';
import type { PendingAction } from '../types';
import { generateMatchReason, generateCandidateMatchReason } from './matchReason';

import pool from '../../config/db';
import {
  recordSignal,
  updateEmotionalState,
} from '../memory/signals.repository';
import {
  generateEmbedding,
  cosineSimilarity,
  upsertEmbedding,
  getEmbedding,
  buildWorkerText,
  buildJobText,
} from '../embeddings/voyage';

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
  userId: string,
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

    case 'guardar_profesion':
      return await handleGuardarProfesion(toolInput, userId);

    case 'guardar_idioma':
      return await handleGuardarIdioma(toolInput, userId);

    case 'guardar_certificacion':
      return await handleGuardarCertificacion(toolInput, userId);

    case 'guardar_disposicion_profesion':
      return await handleGuardarDisposicionProfesion(toolInput, userId);

    case 'guardar_disponibilidad':
      return await handleGuardarDisponibilidad(toolInput, userId);

    // ─── TOOLS DEL SELECCIÓN ────────────────────────────────────────────

    case 'listar_mis_ofertas':
      return await handleListarMisOfertas(toolInput, userId);

    case 'crear_oferta_empleo':
      return await handleCrearOfertaEmpleo(toolInput, userId);

    case 'editar_oferta_empleo':
      return await handleEditarOfertaEmpleo(toolInput, userId);

    case 'recomendar_candidatos':
      return await handleRecomendarCandidatos(toolInput, userId);

    case 'obtener_perfil_candidato':
      return await handleObtenerPerfilCandidato(toolInput);

    case 'programar_entrevista':
      return await handleProgramarEntrevista(toolInput, userId);

    // ─── TOOLS DE APRENDIZAJE ───────────────────────────────────────────

    case 'registrar_senal':
      return await handleRegistrarSenal(toolInput, userId);

    case 'actualizar_estado_emocional':
      return await handleActualizarEstadoEmocional(toolInput, userId);

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
  userId: string
): Promise<unknown> {
  const limit = (input.limit as number) || 3;

  // obtener embedding del worker
  const workerEmbedding = await getEmbedding('user_profile', userId);

  // candidatos jobs activos
  let query = `
    SELECT j.id, j.title, j.description, j.contract_type,
           j.requires_nie, j.city_id, j.status, j.created_at,
           c.name as city_name
    FROM jobs j
    LEFT JOIN cities c ON j.city_id = c.id
    WHERE j.status = 'active'
  `;
  const params: unknown[] = [];
  if (input.city) {
    params.push(`%${input.city}%`);
    query += ` AND c.name ILIKE $${params.length}`;
  }
  const contractTypeMap: Record<string, string> = {
    'indefinido': 'full_time',
    'permanente': 'full_time',
    'tiempo completo': 'full_time',
    'jornada completa': 'full_time',
    'completa': 'full_time',
    'full time': 'full_time',
    'full_time': 'full_time',
    'tiempo parcial': 'part_time',
    'media jornada': 'part_time',
    'parcial': 'part_time',
    'part time': 'part_time',
    'part_time': 'part_time',
    'temporal': 'temporary',
    'temporary': 'temporary',
    'por horas': 'temporary',
    'practicas': 'internship',
    'prácticas': 'internship',
    'internship': 'internship',
    'becario': 'internship',
    'freelance': 'freelance',
    'autonomo': 'freelance',
    'autónomo': 'freelance',
    'por cuenta propia': 'freelance',
  };
  if (input.contractType) {
    const normalized = String(input.contractType).toLowerCase().trim();
    const mapped = contractTypeMap[normalized];
    if (mapped) {
      input.contractType = mapped;
    } else {
      // si no reconocemos el valor, lo ignoramos en lugar de romper la query
      delete input.contractType;
    }
  }
  if (input.contractType) {
    params.push(input.contractType);
    query += ` AND j.contract_type = $${params.length}`;
  }
  params.push(limit * 5);
  query += ` ORDER BY j.created_at DESC LIMIT $${params.length}`;

  const { rows: jobs } = await pool.query(query, params);
  const { rows: profileRows } = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
  const profile = profileRows[0];

  const jobsWithMatch = await Promise.all(
    jobs.map(async (job: Record<string, unknown>) => {
      let semanticScore = 0.5;
      if (workerEmbedding) {
        const jobEmb = await getEmbedding('job', job.id as string);
        if (jobEmb) {
          const sim = cosineSimilarity(workerEmbedding, jobEmb);
          semanticScore = (sim + 1) / 2;
        }
      }
      const ruleScore = calculateSimpleMatchScore(profile, job) / 100;
      const matchScore = Math.round((semanticScore * 0.7 + ruleScore * 0.3) * 100);

      const matchReason = await generateMatchReason(
        {
          userId: profile.id,
          name: profile.full_name,
          city: profile.city_name,
          experienceSummary: profile.bio,
        },
        {
          id: job.id as number,
          title: job.title as string,
          company: 'Empresa en Hausseup',
          location: job.city_name as string,
          description: job.description as string,
          contractType: job.contract_type as string,
          paperworkRequired: (job.requires_nie ? 'required' : 'none') as string,
        }
      );

      return {
        id: job.id,
        company: 'Empresa en Hausseup',
        title: job.title,
        location: job.city_name,
        contractType: job.contract_type,
        paperworkRequired: job.requires_nie ? 'required' : 'none',
        description: job.description,
        matchScore,
        matchReason,
      };
    })
  );

  jobsWithMatch.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
  const validJobs = jobsWithMatch
    .filter((j) => j.matchScore !== undefined && j.matchReason && j.matchReason.length > 0)
    .slice(0, limit);

  return { jobs: validJobs, total: validJobs.length };
}

async function handleObtenerPerfil(userId: string): Promise<unknown> {
  const { rows } = await pool.query(
    `SELECT id, full_name, email, phone_whatsapp, avatar_url, city_id,
            role, bio, is_available, is_verified, created_at
     FROM users WHERE id = $1`,
    [userId]
  );
  return rows[0] || { error: 'Usuario no encontrado' };
}

async function handleActualizarPerfil(
  input: Record<string, unknown>,
  userId: string
): Promise<unknown> {
  const fieldMap: Record<string, string> = {
    fullName: 'full_name',
    bio: 'bio',
    phoneWhatsapp: 'phone_whatsapp',
    avatarUrl: 'avatar_url',
    isAvailable: 'is_available',
  };

  const setClauses: string[] = [];
  const params: unknown[] = [];

  for (const [inputKey, dbColumn] of Object.entries(fieldMap)) {
    if (input[inputKey] !== undefined) {
      params.push(input[inputKey]);
      setClauses.push(`${dbColumn} = $${params.length}`);
    }
  }

  if (setClauses.length > 0) {
    params.push(userId);
    await pool.query(
      `UPDATE users SET ${setClauses.join(', ')}, updated_at = NOW() WHERE id = $${params.length}`,
      params
    );
  }

  // todo lo que no va a users se persiste en agent_user_memory
  const userFields = new Set(Object.keys(fieldMap));
  for (const [inputKey, value] of Object.entries(input)) {
    if (!userFields.has(inputKey)) {
      await pool.query(
        `INSERT INTO agent_user_memory (user_id, memory_key, memory_value)
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id, memory_key)
         DO UPDATE SET memory_value = $3, updated_at = NOW()`,
        [userId, inputKey, value]
      );
    }
  }

  // regenerar embedding en background tras cualquier cambio del perfil
  regenerateWorkerEmbedding(userId).catch((e) => console.error('[embeddings] regen failed:', e));
  return { success: true };
}

async function handleAplicarAEmpleo(
  input: Record<string, unknown>,
  userId: string
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
  userId: string
): Promise<{ success: boolean; message: string }> {
  switch (action.type) {
    case 'apply_to_job': {
      const jobId = action.payload.jobId as number;

      // verificar que no haya aplicado antes
      const { rows: existing } = await pool.query(
        'SELECT id FROM applications WHERE worker_id = $1 AND job_id = $2',
        [userId, jobId]
      );

      if (existing.length > 0) {
        return { success: false, message: 'Ya enviaste tu candidatura a este empleo.' };
      }

      await pool.query(
        `INSERT INTO applications (worker_id, job_id, status, created_at)
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

    case 'accept_offer': {
      const jobId = action.payload.jobId as string;
      const actionType = action.payload.action as string;

      if (actionType === 'publish_job') {
        // cambiar estado de paused a active para que sea visible
        await pool.query(
          `UPDATE jobs SET status = 'active', updated_at = NOW() WHERE id = $1`,
          [jobId]
        );
        return {
          success: true,
          message: '¡Oferta publicada! Ya está visible para los candidatos. Ahora arranco la búsqueda de perfiles que encajen. 🚀',
        };
      }

      return { success: true, message: 'Acción completada.' };
    }

    default:
      return { success: false, message: 'Acción no reconocida.' };
  }
}

async function handleMisCandidaturas(userId: string): Promise<unknown> {
  const { rows } = await pool.query(
    `SELECT a.id, a.status, a.created_at, j.title
     FROM applications a
     JOIN jobs j ON a.job_id = j.id
     WHERE a.worker_id = $1
     ORDER BY a.created_at DESC
     LIMIT 20`,
    [userId]
  );
  return { applications: rows, total: rows.length };
}

async function handleGuardarEmpleo(
  input: Record<string, unknown>,
  userId: string
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

async function handleListarMisOfertas(
  input: Record<string, unknown>,
  userId: string
): Promise<unknown> {
  const status = (input.status as string) || 'active';
  const { rows } = await pool.query(
    `SELECT j.id, j.title, j.description, j.status, j.city_id, j.contract_type,
            j.requires_nie, j.created_at, j.applications_count,
            c.name as city_name,
            m.memory_value as salary
     FROM jobs j
     LEFT JOIN cities c ON j.city_id = c.id
     LEFT JOIN agent_user_memory m
       ON m.user_id = $1
       AND m.memory_key = CONCAT('job_', j.id::text, '_salary')
     WHERE j.employer_id = $1 AND j.status = $2
     ORDER BY j.created_at DESC`,
    [userId, status]
  );
    // si la llamada es interna (para obtener jobId), no renderizar cards
    if (input.internal === true) {
      return { jobsList: rows, total: rows.length };
    }
    return { jobs: rows, total: rows.length };
  }

async function handleEditarOfertaEmpleo(
  input: Record<string, unknown>,
  userId: string
): Promise<unknown> {
  const { rows: check } = await pool.query(
    'SELECT id FROM jobs WHERE id = $1 AND employer_id = $2',
    [input.jobId, userId]
  );
  if (check.length === 0) {
    return { error: 'Oferta no encontrada o no tienes permiso para editarla.' };
  }

  const setClauses: string[] = [];
  const params: unknown[] = [];
  const changedFields: string[] = [];

  const directFields: Record<string, string> = {
    title: 'title',
    description: 'description',
    requiresNie: 'requires_nie',
    status: 'status',
    vacancies: 'vacancies',
  };

  for (const [inputKey, dbColumn] of Object.entries(directFields)) {
    if (input[inputKey] !== undefined) {
      params.push(input[inputKey]);
      setClauses.push(`${dbColumn} = $${params.length}`);
      changedFields.push(inputKey);
    }
  }

  if (input.contractType !== undefined) {
    params.push(mapContractType(input.contractType));
    setClauses.push(`contract_type = $${params.length}`);
    changedFields.push('contrato');
  }

  // city by name (legacy field)
  if (input.city !== undefined) {
    const { rows: cityRows } = await pool.query(
      'SELECT id FROM cities WHERE name ILIKE $1 LIMIT 1',
      [input.city]
    );
    if (cityRows.length > 0) {
      params.push(cityRows[0].id);
      setClauses.push(`city_id = $${params.length}`);
      changedFields.push('ciudad');
    }
  }

  // cityName — resolve to city_id
  if (input.cityName !== undefined) {
    const { rows: cityRows } = await pool.query(
      'SELECT id FROM cities WHERE name ILIKE $1 LIMIT 1',
      [`%${input.cityName}%`]
    );
    if (cityRows.length > 0) {
      params.push(cityRows[0].id);
      setClauses.push(`city_id = $${params.length}`);
      changedFields.push('ciudad');
    }
  }

  if (setClauses.length === 0 && input.salary === undefined) {
    return { error: 'No hay campos para actualizar.' };
  }

  if (setClauses.length > 0) {
    params.push(input.jobId);
    console.log('DEBUG editar_oferta_empleo:', { setClauses, params });
    await pool.query(
      `UPDATE jobs SET ${setClauses.join(', ')}, updated_at = NOW() WHERE id = $${params.length}`,
      params
    );
  }

  // salary has no column in jobs — store in agent_user_memory
  if (input.salary !== undefined) {
    await pool.query(
      `INSERT INTO agent_user_memory (user_id, memory_key, memory_value)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, memory_key)
       DO UPDATE SET memory_value = $3, updated_at = NOW()`,
      [userId, `job_${input.jobId}_salary`, String(input.salary)]
    );
    changedFields.push('salario');
  }

  // regenerar embedding del job tras editar
  (async () => {
    const { rows: jobInfo } = await pool.query(
      `SELECT j.title, j.description, j.contract_type, j.requires_nie, c.name as city_name
       FROM jobs j LEFT JOIN cities c ON j.city_id = c.id WHERE j.id = $1`,
      [input.jobId]
    );
    if (jobInfo[0]) {
      const text = buildJobText({
        title: jobInfo[0].title,
        description: jobInfo[0].description,
        cityName: jobInfo[0].city_name,
        contractType: jobInfo[0].contract_type,
        requiresNie: jobInfo[0].requires_nie,
      });
      const vector = await generateEmbedding(text);
      if (vector) await upsertEmbedding('job', String(input.jobId), vector);
    }
  })().catch((e) => console.error('[embeddings] job edit error:', e));

  const changed = changedFields.join(', ');
  const { rows: updatedJob } = await pool.query(
    `SELECT j.id, j.title, j.description, j.status, j.city_id, j.contract_type,
            j.requires_nie, j.created_at, j.applications_count,
            c.name as city_name,
            m.memory_value as salary
     FROM jobs j
     LEFT JOIN cities c ON j.city_id = c.id
     LEFT JOIN agent_user_memory m
       ON m.user_id = $1
       AND m.memory_key = CONCAT('job_', j.id::text, '_salary')
     WHERE j.id = $2`,
    [userId, input.jobId]
  );
  return {
    success: true,
    message: `Oferta actualizada: ${changed}.`,
    jobs: updatedJob,
  };
}

async function handleCrearOfertaEmpleo(
  input: Record<string, unknown>,
  userId: string
): Promise<unknown> {
  // resolver city_id: usar el del input, o buscar Vitoria-Gasteiz, o caer en Madrid (id=1)
  let resolvedCityId = input.cityId as number | null | undefined;
  if (resolvedCityId == null) {
    if (input.cityName) {
      const { rows: cityRows } = await pool.query(
        'SELECT id FROM cities WHERE name ILIKE $1 LIMIT 1',
        [`%${input.cityName}%`]
      );
      resolvedCityId = cityRows[0]?.id ?? null;
    }
    if (resolvedCityId == null && input.city) {
      const { rows: cityRows } = await pool.query(
        'SELECT id FROM cities WHERE name ILIKE $1 LIMIT 1',
        [`%${input.city}%`]
      );
      resolvedCityId = cityRows[0]?.id ?? null;
    }
    if (resolvedCityId == null) {
      const { rows: cityRows } = await pool.query(
        `SELECT id FROM cities WHERE name = 'Madrid' LIMIT 1`
      );
      resolvedCityId = cityRows[0]?.id ?? 1;
    }
  }

  const contractTypeMap: Record<string, string> = {
    'indefinido': 'full_time',
    'permanente': 'full_time',
    'tiempo completo': 'full_time',
    'jornada completa': 'full_time',
    'completa': 'full_time',
    'full time': 'full_time',
    'full_time': 'full_time',
    'tiempo parcial': 'part_time',
    'media jornada': 'part_time',
    'parcial': 'part_time',
    'part time': 'part_time',
    'part_time': 'part_time',
    'temporal': 'temporary',
    'temporary': 'temporary',
    'por horas': 'temporary',
    'practicas': 'internship',
    'prácticas': 'internship',
    'internship': 'internship',
    'becario': 'internship',
    'freelance': 'freelance',
    'autonomo': 'freelance',
    'autónomo': 'freelance',
    'por cuenta propia': 'freelance',
  };
  if (input.contractType) {
    const normalized = String(input.contractType).toLowerCase().trim();
    const mapped = contractTypeMap[normalized];
    if (mapped) {
      input.contractType = mapped;
    } else {
      // si no reconocemos el valor, lo ignoramos en lugar de romper la query
      delete input.contractType;
    }
  }

  const { rows } = await pool.query(
    `INSERT INTO jobs (
       employer_id, city_id, title, description,
       contract_type, requires_nie, status
     ) VALUES ($1, $2, $3, $4, $5, $6, 'paused')
     RETURNING id, title`,
    [
      userId,
      resolvedCityId,
      input.title,
      input.description,
      mapContractType(input.contractType),
      input.paperworkRequired !== 'none',
    ]
  );

  const newJob = rows[0];

  await pool.query(
    `INSERT INTO agent_user_memory (user_id, memory_key, memory_value)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, memory_key)
     DO UPDATE SET memory_value = $3, updated_at = NOW()`,
    [userId, `job_${newJob.id}_salary`, JSON.stringify(input.salary || '')]
  );

  await pool.query(
    `INSERT INTO agent_user_memory (user_id, memory_key, memory_value)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, memory_key)
     DO UPDATE SET memory_value = $3, updated_at = NOW()`,
    [userId, `job_${newJob.id}_paperwork`, JSON.stringify(input.paperworkRequired || '')]
  );

  await pool.query(
    `INSERT INTO agent_user_memory (user_id, memory_key, memory_value)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, memory_key)
     DO UPDATE SET memory_value = $3, updated_at = NOW()`,
    [userId, `job_${newJob.id}_salary_info`, JSON.stringify(input.salary || '')]
  );

  // generar embedding semántico del job en background (no bloquea la respuesta)
  (async () => {
    const { rows: cityRows } = await pool.query(
      'SELECT name FROM cities WHERE id = $1',
      [resolvedCityId]
    );
    const text = buildJobText({
      title: input.title as string,
      description: input.description as string,
      cityName: cityRows[0]?.name,
      contractType: input.contractType as string,
      requiresNie: input.paperworkRequired !== 'none',
    });
    const vector = await generateEmbedding(text);
    if (vector) await upsertEmbedding('job', newJob.id, vector);
  })().catch((e) => console.error('[embeddings] job create error:', e));

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
  userId: string
): Promise<unknown> {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!input.jobId || !uuidRegex.test(String(input.jobId))) {
    const { rows: latestJob } = await pool.query(
      `SELECT id FROM jobs WHERE employer_id = $1 AND status = 'active'
       ORDER BY created_at DESC LIMIT 1`,
      [userId]
    );
    if (latestJob.length === 0) {
      return { candidates: [], message: 'No tienes ofertas activas para buscar candidatos.' };
    }
    input = { ...input, jobId: latestJob[0].id };
  }

  const jobId = input.jobId as string;
  const limit = (input.limit as number) || 5;

  const { rows: jobRows } = await pool.query('SELECT * FROM jobs WHERE id = $1', [jobId]);
  if (jobRows.length === 0) return { error: 'Empleo no encontrado.' };
  const job = jobRows[0];

  const { rows: jobCityRow } = await pool.query(
    'SELECT name FROM cities WHERE id = $1', [job.city_id]
  );
  const jobCityName = jobCityRow[0]?.name || 'la zona';

  // obtener embedding del job (si no existe, generarlo ahora)
  let jobEmbedding = await getEmbedding('job', jobId);
  if (!jobEmbedding) {
    const text = buildJobText({
      title: job.title,
      description: job.description,
      cityName: jobCityName,
      contractType: job.contract_type,
      requiresNie: job.requires_nie,
    });
    jobEmbedding = await generateEmbedding(text);
    if (jobEmbedding) await upsertEmbedding('job', jobId, jobEmbedding);
  }

  // candidatos en la misma ciudad
  const { rows: candidates } = await pool.query(
    `SELECT u.id, u.full_name as name, u.bio as experience_summary,
            u.is_available as availability, u.avatar_url as photo,
            u.city_id, c.name as city_name
     FROM users u
     LEFT JOIN cities c ON u.city_id = c.id
     WHERE u.role = 'worker'
       AND u.city_id = $1
       AND u.id NOT IN (SELECT worker_id FROM applications WHERE job_id = $2)
     LIMIT $3`,
    [job.city_id, jobId, limit * 5]
  );

  if (candidates.length === 0) {
    return {
      candidates: [],
      message: `Aún no hay trabajadores registrados en ${jobCityName} disponibles para este puesto. Te aviso en cuanto aparezca alguno.`,
    };
  }

  // calcular score combinado: 70% semántico + 30% reglas simples
  const ranked = await Promise.all(
    candidates.map(async (c: Record<string, unknown>) => {
      let semanticScore = 0.5;
      if (jobEmbedding) {
        const workerEmbedding = await getEmbedding('user_profile', c.id as string);
        if (workerEmbedding) {
          const sim = cosineSimilarity(jobEmbedding, workerEmbedding);
          semanticScore = (sim + 1) / 2;
        }
      }
      const ruleScore = calculateSimpleMatchScore(c, job) / 100;
      const matchScore = Math.round((semanticScore * 0.7 + ruleScore * 0.3) * 100);

      const matchReason = await generateCandidateMatchReason(
        {
          userId: c.id as number,
          name: c.name as string,
          experienceSummary: c.experience_summary as string,
          availability: c.availability ? 'Disponible' : 'No disponible',
        },
        {
          id: job.id,
          title: job.title,
          company: 'Empresa en Hausseup',
          location: jobCityName,
          description: job.description,
          paperworkRequired: job.requires_nie ? 'required' : 'none',
        }
      );

      return {
        id: c.id,
        name: c.name,
        photo: c.photo,
        city: c.city_name || 'España',
        experienceSummary: c.experience_summary,
        languages: [],
        migrationStatus: 'hidden' as const,
        availability: c.availability,
        matchScore,
        matchReason,
      };
    })
  );

  ranked.sort((a, b) => b.matchScore - a.matchScore);
  const topCandidates = ranked.slice(0, limit).filter(
    (c) => c.matchReason && c.matchReason.length > 0
  );

  return { candidates: topCandidates, total: topCandidates.length };
}

async function handleProgramarEntrevista(
  input: Record<string, unknown>,
  userId: string
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
  userId: string,
  agentType: 'companion' | 'recruiter'
): Promise<unknown> {
  try {
    await pool.query(
      `INSERT INTO ai_audit_log (event_type, user_id, description, original_request, agent_type)
       VALUES ($1, $2, $3, $4, $5)`,
      [input.event_type, userId, input.description, input.original_request || null, agentType]
    );
  } catch {
    // tabla puede no existir aún — nunca bloquear el agente por esto
  }
  return { logged: true };
}

async function handleObtenerPerfilCandidato(
  input: Record<string, unknown>
): Promise<unknown> {
  const candidateId = input.candidateId as string;
  if (!candidateId) return { error: 'Falta candidateId' };

  const { rows: userRows } = await pool.query(
    `SELECT u.id, u.full_name as name, u.avatar_url as photo,
            u.bio, u.short_intro, u.migration_status, u.time_in_spain,
            u.availability_schedule, u.availability_start_date,
            u.accepts_relocation, u.max_commute_km,
            c.name as city_name
     FROM users u
     LEFT JOIN cities c ON u.city_id = c.id
     WHERE u.id = $1 AND u.role = 'worker'`,
    [candidateId]
  );

  if (userRows.length === 0) return { error: 'Candidato no encontrado' };
  const user = userRows[0];

  const [profsResult, langsResult, certsResult, openToResult] = await Promise.all([
    pool.query(
      `SELECT profession_name as name, years_experience as "yearsExperience",
              has_title as "hasTitle", title_homologated as "titleHomologated",
              description
       FROM user_professions WHERE user_id = $1
       ORDER BY is_primary DESC, years_experience DESC NULLS LAST`,
      [candidateId]
    ),
    pool.query(
      `SELECT language, level FROM user_languages WHERE user_id = $1`,
      [candidateId]
    ),
    pool.query(
      `SELECT certification_name as name, details
       FROM user_certifications WHERE user_id = $1`,
      [candidateId]
    ),
    pool.query(
      `SELECT profession_name FROM user_open_to_professions WHERE user_id = $1`,
      [candidateId]
    ),
  ]);

  return {
    candidateProfile: {
      id: user.id,
      name: user.name,
      photo: user.photo,
      city: user.city_name || 'España',
      shortIntro: user.short_intro || user.bio,
      migrationStatus: user.migration_status,
      timeInSpain: user.time_in_spain,
      availability: user.availability_schedule,
      availabilityStartDate: user.availability_start_date,
      acceptsRelocation: user.accepts_relocation,
      maxCommuteKm: user.max_commute_km,
      professions: profsResult.rows,
      languages: langsResult.rows,
      certifications: certsResult.rows,
      openToProfessions: openToResult.rows.map((r: any) => r.profession_name),
    },
  };
}

async function handleGuardarProfesion(
  input: Record<string, unknown>,
  userId: string
): Promise<unknown> {
  await pool.query(
    `INSERT INTO user_professions
     (user_id, profession_name, years_experience, has_title, title_homologated, description, is_primary)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      userId,
      input.professionName,
      input.yearsExperience || null,
      input.hasTitle || false,
      input.titleHomologated || false,
      input.description || null,
      input.isPrimary || false,
    ]
  );
  // regenerar embedding en background tras cualquier cambio del perfil
  regenerateWorkerEmbedding(userId).catch((e) => console.error('[embeddings] regen failed:', e));
  return { success: true };
}

async function handleGuardarIdioma(
  input: Record<string, unknown>,
  userId: string
): Promise<unknown> {
  await pool.query(
    `INSERT INTO user_languages (user_id, language, level)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, language)
     DO UPDATE SET level = $3`,
    [userId, input.language, input.level]
  );
  // regenerar embedding en background tras cualquier cambio del perfil
  regenerateWorkerEmbedding(userId).catch((e) => console.error('[embeddings] regen failed:', e));
  return { success: true };
}

async function handleGuardarCertificacion(
  input: Record<string, unknown>,
  userId: string
): Promise<unknown> {
  await pool.query(
    `INSERT INTO user_certifications (user_id, certification_name, details)
     VALUES ($1, $2, $3)`,
    [userId, input.certificationName, input.details || null]
  );
  // regenerar embedding en background tras cualquier cambio del perfil
  regenerateWorkerEmbedding(userId).catch((e) => console.error('[embeddings] regen failed:', e));
  return { success: true };
}

async function handleGuardarDisposicionProfesion(
  input: Record<string, unknown>,
  userId: string
): Promise<unknown> {
  await pool.query(
    `INSERT INTO user_open_to_professions (user_id, profession_name)
     VALUES ($1, $2)`,
    [userId, input.professionName]
  );
  // regenerar embedding en background tras cualquier cambio del perfil
  regenerateWorkerEmbedding(userId).catch((e) => console.error('[embeddings] regen failed:', e));
  return { success: true };
}

async function handleGuardarDisponibilidad(
  input: Record<string, unknown>,
  userId: string
): Promise<unknown> {
  const setClauses: string[] = [];
  const params: unknown[] = [];
  const fieldMap: Record<string, string> = {
    schedule: 'availability_schedule',
    startDate: 'availability_start_date',
    acceptsRelocation: 'accepts_relocation',
    maxCommuteKm: 'max_commute_km',
    migrationStatus: 'migration_status',
    timeInSpain: 'time_in_spain',
    shortIntro: 'short_intro',
  };
  for (const [inputKey, dbCol] of Object.entries(fieldMap)) {
    if (input[inputKey] !== undefined) {
      params.push(input[inputKey]);
      setClauses.push(`${dbCol} = $${params.length}`);
    }
  }
  if (setClauses.length === 0) return { success: true };
  params.push(userId);
  await pool.query(
    `UPDATE users SET ${setClauses.join(', ')}, updated_at = NOW() WHERE id = $${params.length}`,
    params
  );
  // regenerar embedding en background tras cualquier cambio del perfil
  regenerateWorkerEmbedding(userId).catch((e) => console.error('[embeddings] regen failed:', e));
  return { success: true };
}

async function regenerateWorkerEmbedding(userId: string): Promise<void> {
  try {
    const [userRes, profsRes, langsRes, certsRes, openToRes] = await Promise.all([
      pool.query(
        `SELECT u.full_name as name, u.bio, u.short_intro, c.name as city_name
         FROM users u LEFT JOIN cities c ON u.city_id = c.id WHERE u.id = $1`,
        [userId]
      ),
      pool.query(
        `SELECT profession_name as name, description, years_experience as "yearsExperience"
         FROM user_professions WHERE user_id = $1`,
        [userId]
      ),
      pool.query(`SELECT language, level FROM user_languages WHERE user_id = $1`, [userId]),
      pool.query(`SELECT certification_name as name FROM user_certifications WHERE user_id = $1`, [userId]),
      pool.query(`SELECT profession_name FROM user_open_to_professions WHERE user_id = $1`, [userId]),
    ]);
    const user = userRes.rows[0];
    if (!user) return;
    const text = buildWorkerText({
      name: user.name,
      bio: user.bio,
      shortIntro: user.short_intro,
      city: user.city_name,
      professions: profsRes.rows,
      languages: langsRes.rows,
      certifications: certsRes.rows,
      openToProfessions: openToRes.rows.map((r: any) => r.profession_name),
    });
    const vector = await generateEmbedding(text);
    if (vector) await upsertEmbedding('user_profile', userId, vector);
  } catch (err) {
    console.error('[embeddings] worker regen error:', (err as Error).message);
  }
}

async function handleRegistrarSenal(
  input: Record<string, unknown>,
  userId: string
): Promise<unknown> {
  const signalType = input.signalType as string;
  const signalValue = input.signalValue as string;
  const metadata = (input.metadata as Record<string, unknown>) || {};

  if (!signalType || !signalValue) {
    return { error: 'Faltan signalType o signalValue' };
  }

  await recordSignal(userId, {
    signalType: signalType as 'job_rejected' | 'candidate_rejected' | 'application_made' | 'preference_stated' | 'job_filled' | 'worker_hired',
    signalValue,
    metadata,
  });

  return { success: true };
}

async function handleActualizarEstadoEmocional(
  input: Record<string, unknown>,
  userId: string
): Promise<unknown> {
  const currentMood = input.currentMood as string | undefined;
  const contextSummary = input.contextSummary as string | undefined;
  const urgencyLevel = input.urgencyLevel as string | undefined;

  if (!currentMood && !contextSummary && !urgencyLevel) {
    return { error: 'Debe haber al menos un campo' };
  }

  await updateEmotionalState(userId, { currentMood, contextSummary, urgencyLevel });
  return { success: true };
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

// mapea el valor libre que puede mandar el agente al enum contract_type de PG
function mapContractType(value: unknown): string {
  const map: Record<string, string> = {
    full_time:   'full_time',
    fulltime:    'full_time',
    'full-time': 'full_time',
    completa:    'full_time',
    part_time:   'part_time',
    parttime:    'part_time',
    'part-time': 'part_time',
    parcial:     'part_time',
    temporary:   'temporary',
    temporal:    'temporary',
    freelance:   'freelance',
    autonomo:    'freelance',
    autónomo:    'freelance',
    internship:  'internship',
    practicas:   'internship',
    prácticas:   'internship',
  };
  const key = String(value ?? '').toLowerCase().trim();
  return map[key] ?? 'full_time';
}

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
