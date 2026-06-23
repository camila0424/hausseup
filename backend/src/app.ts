import express from "express";
import cors from "cors";
import session from "express-session";
import pool from "./config/db";
import { ENV } from "./config/env";
import passport from "./config/passport";
import authRoutes from "./modules/auth/auth.routes";
import usersRoutes from "./modules/users/users.routes";
import jobsRoutes from "./modules/jobs/jobs.routes";
import applicationsRoutes from "./modules/applications/applications.routes";
import citiesRoutes from "./modules/cities/cities.routes";
import agentRoutes from "./agent/agent.routes";
import { errorMiddleware } from "./middlewares/error.middleware";

const app = express();
const PORT = ENV.PORT;

const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "https://hausseup.com",
  "https://www.hausseup.com",
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(session({
  secret: ENV.JWT_SECRET,
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
app.use("/api/agent", agentRoutes);

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
  console.log(`Servidor corriendo en puerto ${PORT}`);
});