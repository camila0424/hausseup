import dotenv from "dotenv";
dotenv.config();

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function optional(name: string, fallback: string): string {
  return process.env[name] ?? fallback;
}

export const ENV = {
  PORT: optional("PORT", "3001"),
  DATABASE_URL: required("DATABASE_URL"),
  JWT_SECRET: optional("JWT_SECRET", "secreto"),
  JWT_EXPIRES_IN: optional("JWT_EXPIRES_IN", "7d"),
  GOOGLE_CLIENT_ID: required("GOOGLE_CLIENT_ID"),
  GOOGLE_CLIENT_SECRET: required("GOOGLE_CLIENT_SECRET"),
  GOOGLE_CALLBACK_URL: optional("GOOGLE_CALLBACK_URL", "http://localhost:3001/api/auth/google/callback"),
  FRONTEND_URL: optional("FRONTEND_URL", "http://localhost:5173"),
};