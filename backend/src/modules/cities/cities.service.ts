import pool from "../../config/db";
import { RowDataPacket } from "mysql2";

interface CityRow extends RowDataPacket {
  id: number;
  name: string;
  region: string;
}

export async function obtenerCiudades() {
  const [rows] = await pool.query<CityRow[]>(
    "SELECT id, name, region FROM cities WHERE is_active = TRUE ORDER BY region, name"
  );
  return rows;
}