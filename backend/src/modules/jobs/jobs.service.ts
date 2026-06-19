import pool from "../../config/db";

interface JobRow {
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
    params.push(filtros.ciudad);
    query += ` AND c.name = $${params.length}`;
  }

  if (filtros.sector) {
    params.push(filtros.sector);
    query += ` AND s.name = $${params.length}`;
  }

  if (filtros.contrato) {
    params.push(filtros.contrato);
    query += ` AND j.contract_type = $${params.length}`;
  }

  query += " ORDER BY j.created_at DESC LIMIT 50";

  const result = await pool.query(query, params);
  return result.rows as JobRow[];
}

export async function obtenerEmpleo(id: string) {
  const result = await pool.query(
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
     WHERE j.id = $1 AND j.status = 'active'`,
    [id]
  );

  if (result.rows.length === 0) {
    throw { status: 404, message: "Empleo no encontrado" };
  }

  return result.rows[0] as JobRow;
}

export async function crearEmpleo(employerId: string, datos: CrearJobDTO) {
  const ciudadResult = await pool.query(
    "SELECT id FROM cities WHERE id = $1",
    [datos.cityId]
  );

  if (ciudadResult.rows.length === 0) {
    throw { status: 400, message: "Ciudad no encontrada" };
  }

  const sectorResult = await pool.query(
    "SELECT id FROM sectors WHERE name = $1",
    [datos.sector]
  );

  const cityId = datos.cityId;
  const sectorId = sectorResult.rows[0]?.id ?? null;

  const jobInsert = await pool.query(
    `INSERT INTO jobs
      (employer_id, city_id, sector_id, title, description, contract_type, vacancies, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, 'active')
     RETURNING id`,
    [
      employerId,
      cityId,
      sectorId,
      datos.titulo,
      datos.descripcion,
      datos.contrato,
      datos.vacantes ?? 1,
    ]
  );

  return { id: jobInsert.rows[0].id as string, mensaje: "Empleo creado correctamente" };
}

export async function obtenerEmpleosDeEmpleador(employerId: string) {
  const result = await pool.query(
    `SELECT j.id, j.title as titulo, j.description as descripcion,
            j.contract_type, j.vacancies, j.applications_count,
            j.status, j.created_at,
            c.name as ciudad,
            s.name as sector
     FROM jobs j
     LEFT JOIN cities c ON j.city_id = c.id
     LEFT JOIN sectors s ON j.sector_id = s.id
     WHERE j.employer_id = $1
     ORDER BY j.created_at DESC`,
    [employerId]
  );

  return result.rows as JobRow[];
}
