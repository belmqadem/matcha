import express from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import cors from "cors";
import { createServer } from "http";
import { rateLimit } from "express-rate-limit";
import env from "./config/env.js";
import pool from "./db/pool.js";
import logger, { httpLogger } from "./utils/logger.js";
import notFound from "./middleware/notFound.js";
import errorHandler from "./middleware/errorHandler.js";
import authRoutes from "./routes/auth.js";

const app = express();
const httpServer = createServer(app);

// Middleware
app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(httpLogger);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

// Test DB connection on startup
pool
  .query("SELECT NOW()")
  .then(() => {
    logger.info("Database connected");
  })
  .catch((err) => {
    logger.error({ err }, "Database connection failed");
    process.exit(1);
  });

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = env.PORT;
httpServer.listen(PORT, () => {
  logger.info(`Matcha Server running on http://localhost:${PORT}`);
});

export default app;
