import pool from "../../config/db";

interface UserRow {
  id: string;
  full_name: string;
  email: string;
  role: string;
  city_id: number;
  ciudad: string;
  is_available: boolean;
  bio: string;
}

export async function obtenerPerfil(userId: string) {
  const result = await pool.query(
    `SELECT u.id, u.full_name, u.email, u.role, u.is_available, u.bio,
            c.name as ciudad
     FROM users u
     LEFT JOIN cities c ON u.city_id = c.id
     WHERE u.id = $1 AND u.is_active = true`,
    [userId]
  );

  if (result.rows.length === 0) {
    throw { status: 404, message: "Usuario no encontrado" };
  }

  return result.rows[0] as UserRow;
}

export async function obtenerCandidatosDisponibles(ciudad?: string) {
  let query = `
    SELECT u.id, u.full_name, u.role, u.bio, u.is_available,
           c.name as ciudad
    FROM users u
    LEFT JOIN cities c ON u.city_id = c.id
    WHERE u.role = 'worker'
      AND u.is_active = true
      AND u.is_available = true
  `;

  const params: string[] = [];

  if (ciudad) {
    params.push(ciudad);
    query += ` AND c.name = $${params.length}`;
  }

  query += " ORDER BY u.created_at DESC LIMIT 50";

  const result = await pool.query(query, params);
  return result.rows as UserRow[];
}

export async function actualizarPerfil(
  userId: string,
  datos: { bio?: string; is_available?: boolean }
) {
  await pool.query(
    "UPDATE users SET bio = COALESCE($1, bio), is_available = COALESCE($2, is_available), updated_at = NOW() WHERE id = $3",
    [datos.bio ?? null, datos.is_available ?? null, userId]
  );

  return obtenerPerfil(userId);
}
