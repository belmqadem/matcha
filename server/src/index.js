import express from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import cors from "cors";
import { createServer } from "http";
import env from "./config/env.js";
import pool from "./db/pool.js";
import logger, { httpLogger } from "./utils/logger.js";
import notFound from "./middleware/notFound.js";
import errorHandler from "./middleware/errorHandler.js";
import { createRateLimiter } from "./middleware/rateLimiter.js";
import authRoutes from "./routes/auth.route.js";
import usersRoutes from "./routes/users.route.js";
import profileRoutes from "./routes/profile.route.js";
import locationRoutes from "./routes/location.route.js";
import browseRoutes from "./routes/browse.route.js";

const app = express();
const httpServer = createServer(app);

app.use(helmet());
app.set("trust proxy", 1);
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(httpLogger);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const globalLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 200,
});
app.use(globalLimiter);

const startServer = async () => {
  try {
    await pool.query("SELECT NOW()");
    logger.info("Database connected");
  } catch (err) {
    logger.error({ err }, "Database connection failed");
    process.exit(1);
  }

  const PORT = env.PORT;
  httpServer.listen(PORT, () => {
    logger.info(`Matcha Server running on http://localhost:${PORT}`);
  });
};

startServer();

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/profile", locationRoutes);
app.use("/api/browse", browseRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
