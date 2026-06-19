import pool from "../../config/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { ENV } from "../../config/env";

interface RegistroDTO {
  nombre: string;
  correo: string;
  contrasena: string;
  telefono?: string;
  provincia: string;
  ciudad: string;
  documento: string;
  tipoUsuario: "worker" | "employer";
}

interface LoginDTO {
  correo: string;
  contrasena: string;
}

interface UserRow {
  id: string;
  full_name: string;
  email: string;
  password_hash: string;
  role: string;
}

export async function registrarUsuario(datos: RegistroDTO) {
  const existe = await pool.query(
    "SELECT id FROM users WHERE email = $1",
    [datos.correo]
  );

  if (existe.rows.length > 0) {
    throw { status: 409, message: "El correo ya está registrado" };
  }

  const passwordHash = await bcrypt.hash(datos.contrasena, 12);

  const insertResult = await pool.query(
    `INSERT INTO users
      (email, password_hash, full_name, phone_whatsapp, role, is_active)
     VALUES ($1, $2, $3, $4, $5, true)
     RETURNING id`,
    [
      datos.correo,
      passwordHash,
      datos.nombre,
      datos.telefono ?? null,
      datos.tipoUsuario,
    ]
  );

  const userId = insertResult.rows[0].id as string;

  await pool.query(
    `INSERT INTO user_documents (user_id, doc_type, doc_number, status)
     VALUES ($1, 'NIE', $2, 'pending')`,
    [userId, datos.documento]
  );

  const token = jwt.sign(
    { id: userId, role: datos.tipoUsuario },
    ENV.JWT_SECRET as string,
    { expiresIn: ENV.JWT_EXPIRES_IN as unknown as number }
  );

  return {
    token,
    usuario: {
      id: userId,
      nombre: datos.nombre,
      correo: datos.correo,
      rol: datos.tipoUsuario,
    },
  };
}

interface GoogleProfile {
  id: string;
  displayName: string;
  emails?: Array<{ value: string }>;
}

export async function findOrCreateGoogleUser(
  profile: GoogleProfile,
  defaultRole: "worker" | "employer" = "worker"
) {
  const email = profile.emails?.[0]?.value;
  if (!email) throw { status: 400, message: "No se pudo obtener el correo de Google" };

  const queryResult = await pool.query(
    "SELECT id, full_name, email, role FROM users WHERE email = $1 AND is_active = true",
    [email]
  );
  const rows = queryResult.rows as UserRow[];

  let userId: string;
  let nombre: string;
  let rol: string;

  if (rows.length > 0) {
    userId = rows[0].id;
    nombre = rows[0].full_name;
    rol = rows[0].role;

    if (defaultRole === "employer" && rol !== "employer") {
      await pool.query("UPDATE users SET role = $1 WHERE id = $2", ["employer", userId]);
      rol = "employer";
    }

    await pool.query("UPDATE users SET last_login_at = NOW() WHERE id = $1", [userId]);
  } else {
    nombre = profile.displayName;
    rol = defaultRole;

    const googleInsert = await pool.query(
      `INSERT INTO users (email, password_hash, full_name, role, is_active)
       VALUES ($1, '', $2, $3, true)
       RETURNING id`,
      [email, nombre, rol]
    );
    userId = googleInsert.rows[0].id as string;
  }

  const token = jwt.sign(
    { id: userId, role: rol },
    ENV.JWT_SECRET as string,
    { expiresIn: ENV.JWT_EXPIRES_IN as unknown as number }
  );

  return { token, id: userId, nombre, correo: email, rol };
}

export async function loginUsuario(datos: LoginDTO) {
  const loginResult = await pool.query(
    "SELECT id, full_name, email, password_hash, role FROM users WHERE email = $1 AND is_active = true",
    [datos.correo]
  );
  const rows = loginResult.rows as UserRow[];

  if (rows.length === 0) {
    throw { status: 401, message: "Credenciales incorrectas" };
  }

  const usuario = rows[0];

  const passwordValido = await bcrypt.compare(
    datos.contrasena,
    usuario.password_hash
  );

  if (!passwordValido) {
    throw { status: 401, message: "Credenciales incorrectas" };
  }

  await pool.query(
    "UPDATE users SET last_login_at = NOW() WHERE id = $1",
    [usuario.id]
  );

  const token = jwt.sign(
    { id: usuario.id, role: usuario.role },
    ENV.JWT_SECRET as string,
    { expiresIn: ENV.JWT_EXPIRES_IN as unknown as number }
  );

  return {
    token,
    usuario: {
      id: usuario.id,
      nombre: usuario.full_name,
      correo: usuario.email,
      rol: usuario.role,
    },
  };
}
