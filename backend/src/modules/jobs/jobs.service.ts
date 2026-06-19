import pool from "../../config/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

interface JobRow extends RowDataPacket {
  id: string;
  titulo: string;
  descripcion: string;
  contract_type: string;
  status: string;
  ciudad: string;
  sector: string;
  employer_nombre: string;
  vacancies: number;
  applications_count: number;
  created_at: Date;
}

interface CrearJobDTO {
  titulo: string;
  descripcion: string;
  contrato: "full_time" | "part_time" | "temporary" | "freelance" | "internship";
  cityId: number;
  sector: string;
  vacantes?: number;
}

export async function obtenerEmpleos(filtros: {
  ciudad?: string;
  sector?: string;
  contrato?: string;
}) {
  let query = `
    SELECT j.id, j.title as titulo, j.description as descripcion,
           j.contract_type, j.vacancies, j.applications_count,
           j.status, j.created_at,
           c.name as ciudad,
           s.name as sector,
           u.full_name as employer_nombre
    FROM jobs j
    LEFT JOIN cities c ON j.city_id = c.id
    LEFT JOIN sectors s ON j.sector_id = s.id
    LEFT JOIN users u ON j.employer_id = u.id
    WHERE j.status = 'active'
  `;

  const params: string[] = [];

  if (filtros.ciudad) {
    query += " AND c.name = ?";
    params.push(filtros.ciudad);
  }

  if (filtros.sector) {
    query += " AND s.name = ?";
    params.push(filtros.sector);
  }

  if (filtros.contrato) {
    query += " AND j.contract_type = ?";
    params.push(filtros.contrato);
  }

  query += " ORDER BY j.created_at DESC LIMIT 50";

  const [rows] = await pool.query<JobRow[]>(query, params);
  return rows;
}

export async function obtenerEmpleo(id: string) {
  const [rows] = await pool.query<JobRow[]>(
    `SELECT j.id, j.title as titulo, j.description as descripcion,
            j.contract_type, j.vacancies, j.applications_count,
            j.status, j.created_at,
            c.name as ciudad,
            s.name as sector,
            u.full_name as employer_nombre
     FROM jobs j
     LEFT JOIN cities c ON j.city_id = c.id
     LEFT JOIN sectors s ON j.sector_id = s.id
     LEFT JOIN users u ON j.employer_id = u.id
     WHERE j.id = ? AND j.status = 'active'`,
    [id]
  );

  if (rows.length === 0) {
    throw { status: 404, message: "Empleo no encontrado" };
  }

  return rows[0];
}

export async function crearEmpleo(employerId: string, datos: CrearJobDTO) {
  const [ciudadRows] = await pool.query<RowDataPacket[]>(
    "SELECT id FROM cities WHERE id = ?",
    [datos.cityId]
  );

  if (ciudadRows.length === 0) {
    throw { status: 400, message: "Ciudad no encontrada" };
  }

  const [sectorRows] = await pool.query<RowDataPacket[]>(
    "SELECT id FROM sectors WHERE name = ?",
    [datos.sector]
  );

  const cityId = datos.cityId;
  const sectorId = sectorRows[0]?.id ?? null;

  // Generar UUID manualmente igual que en auth
  const [uuidRow] = await pool.query<RowDataPacket[]>("SELECT UUID() as uuid");
  const jobId = uuidRow[0]?.uuid as string;

  await pool.query(
    `INSERT INTO jobs 
      (id, employer_id, city_id, sector_id, title, description, contract_type, vacancies, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
    [
      jobId,
      employerId,
      cityId,
      sectorId,
      datos.titulo,
      datos.descripcion,
      datos.contrato,
      datos.vacantes ?? 1,
    ]
  );

  return { id: jobId, mensaje: "Empleo creado correctamente" };
}

export async function obtenerEmpleosDeEmpleador(employerId: string) {
  const [rows] = await pool.query<JobRow[]>(
    `SELECT j.id, j.title as titulo, j.description as descripcion,
            j.contract_type, j.vacancies, j.applications_count,
            j.status, j.created_at,
            c.name as ciudad,
            s.name as sector
     FROM jobs j
     LEFT JOIN cities c ON j.city_id = c.id
     LEFT JOIN sectors s ON j.sector_id = s.id
     WHERE j.employer_id = ?
     ORDER BY j.created_at DESC`,
    [employerId]
  );

  return rows;
}