import { Request, Response, NextFunction } from "express";
import { obtenerCiudades } from "./cities.service";

export async function getCiudades(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const ciudades = await obtenerCiudades();
    res.json(ciudades);
  } catch (error) {
    next(error);
  }
}