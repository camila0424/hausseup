import express from "express";
import cors from "cors";
import session from "express-session";
import dotenv from "dotenv";
import pool from "./config/db";
import passport from "./config/passport";
import authRoutes from "./modules/auth/auth.routes";
import usersRoutes from "./modules/users/users.routes";
import jobsRoutes from "./modules/jobs/jobs.routes";
import applicationsRoutes from "./modules/applications/applications.routes";
import citiesRoutes from "./modules/cities/cities.routes";
import { errorMiddleware } from "./middlewares/error.middleware";

dotenv.config();

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(session({
  secret: process.env.JWT_SECRET ?? "secreto",
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 5 * 60 * 1000 },
}));
app.use(passport.initialize());
app.use(passport.session());

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/jobs", jobsRoutes);
app.use("/api/applications", applicationsRoutes);
app.use("/api/cities", citiesRoutes);

// Health check
app.get("/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", database: "conectada" });
  } catch {
    res.status(500).json({ status: "error", database: "sin conexión" });
  }
});

// Manejo de errores
app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});