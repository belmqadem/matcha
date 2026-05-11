import express from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import cors from "cors";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import env from "./config/env.js";
import pool from "./db/pool.js";
import logger, { httpLogger } from "./utils/logger.js";
import { initSocket } from "./socket/index.js";
import notFound from "./middleware/notFound.js";
import errorHandler from "./middleware/errorHandler.js";
import { createRateLimiter } from "./middleware/rateLimiter.js";
import authRoutes from "./routes/auth.route.js";
import usersRoutes from "./routes/users.route.js";
import profileRoutes from "./routes/profile.route.js";
import locationRoutes from "./routes/location.route.js";
import browseRoutes from "./routes/browse.route.js";
import searchRoutes from "./routes/search.route.js";
import likesRoutes from "./routes/likes.route.js";
import blocksRoutes from "./routes/blocks.route.js";
import reportsRoutes from "./routes/reports.route.js";

const app = express();
const httpServer = createServer(app);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.resolve(__dirname, "uploads");

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

app.use("/uploads", express.static(uploadsDir));

const startServer = async () => {
  try {
    await pool.query("SELECT NOW()");
    logger.info("Database connected");
  } catch (err) {
    logger.error({ err }, "Database connection failed");
    process.exit(1);
  }

  try {
    initSocket(httpServer);
    logger.info("Socket.io initialized");
  } catch (err) {
    logger.error({ err }, "Socket initialization failed");
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
app.use("/api/search", searchRoutes);
app.use("/api/likes", likesRoutes);
app.use("/api/blocks", blocksRoutes);
app.use("/api/reports", reportsRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
