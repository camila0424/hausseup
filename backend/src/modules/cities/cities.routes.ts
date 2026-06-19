import { Router } from "express";
import { getCiudades } from "./cities.controller";

const router = Router();

router.get("/", getCiudades);

export default router;