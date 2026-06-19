import pool from "../../config/db";

interface ApplicationRow {
  id: number;
  job_id: string;
  worker_id: string;
  status: string;
  cover_note: string;
  created_at: Date;
  titulo: string;
  empresa: string;
  ciudad: string;
}

export async function aplicarEmpleo(workerId: string, jobId: string, nota?: string) {
  const existeResult = await pool.query(
    "SELECT id FROM applications WHERE job_id = $1 AND worker_id = $2",
    [jobId, workerId]
  );

  if (existeResult.rows.length > 0) {
    throw { status: 409, message: "Ya has aplicado a este empleo" };
  }

  const appInsert = await pool.query(
    `INSERT INTO applications (job_id, worker_id, cover_note, status)
     VALUES ($1, $2, $3, 'pending')
     RETURNING id`,
    [jobId, workerId, nota ?? null]
  );

  await pool.query(
    "UPDATE jobs SET applications_count = applications_count + 1 WHERE id = $1",
    [jobId]
  );

  return { id: appInsert.rows[0].id as number, mensaje: "Candidatura enviada correctamente" };
}

export async function obtenerMisCandidaturas(workerId: string) {
  const result = await pool.query(
    `SELECT a.id, a.status, a.cover_note, a.created_at,
            j.title as titulo,
            u.full_name as empresa,
            c.name as ciudad
     FROM applications a
     JOIN jobs j ON a.job_id = j.id
     JOIN users u ON j.employer_id = u.id
     LEFT JOIN cities c ON j.city_id = c.id
     WHERE a.worker_id = $1
     ORDER BY a.created_at DESC`,
    [workerId]
  );

  return result.rows as ApplicationRow[];
}

export async function obtenerCandidaturasDeEmpleo(jobId: string, employerId: string) {
  const result = await pool.query(
    `SELECT a.id, a.status, a.cover_note, a.created_at,
            u.full_name as candidato,
            u.email as correo
     FROM applications a
     JOIN users u ON a.worker_id = u.id
     JOIN jobs j ON a.job_id = j.id
     WHERE a.job_id = $1 AND j.employer_id = $2
     ORDER BY a.created_at DESC`,
    [jobId, employerId]
  );

  return result.rows as ApplicationRow[];
}
