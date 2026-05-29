import express from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import cors from "cors";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import env from "./config/env.js";
import pool from "./db/pool.js";
import redis from "./db/redis.js";
import logger, { httpLogger } from "./utils/logger.js";
import { initSocket } from "./socket/index.js";
import passport from "./config/passport.js";
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
import chatRoutes from "./routes/chat.route.js";
import notificationsRoutes from "./routes/notifications.route.js";
import datesRoutes from "./routes/dates.route.js";

const app = express();
const httpServer = createServer(app);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.resolve(__dirname, "..", "uploads");

// Middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "blob:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  }),
);
app.set("trust proxy", 1);
app.use(
  cors({
    origin: (origin, callback) => {
      const allowed = [env.CORS_ORIGIN];
      if (!origin || allowed.includes(origin)) {
        callback(null, true);
      } else {
        logger.warn({ origin }, "CORS blocked");
        callback(null, false);
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type"],
    maxAge: 86400,
  }),
);
app.use(httpLogger);
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));
app.use(cookieParser());
app.use(passport.initialize());
app.use(createRateLimiter());
app.use(
  "/uploads",
  (req, res, next) => {
    res.setHeader("Content-Security-Policy", "default-src 'none'");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Cache-Control", "public, max-age=31536000");
    next();
  },
  express.static(uploadsDir),
);

// Routes
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
app.use("/api/chat", chatRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/dates", datesRoutes);

app.use(notFound);
app.use(errorHandler);

// Start
const startServer = async () => {
  // 1. Check DB
  try {
    await pool.query("SELECT NOW()");
    logger.info("Database connected");
  } catch (err) {
    logger.error({ err }, "Database connection failed");
    process.exit(1);
  }

  // 2. Init Redis
  try {
    await redis.ping();
  } catch (err) {
    logger.error({ err }, "Redis connection failed");
    process.exit(1);
  }

  // 3. Init Socket.io
  initSocket(httpServer);
  logger.info("Socket.io initialized");

  // 4. Start listening
  const PORT = env.PORT;
  httpServer.listen(PORT, () => {
    logger.info(`Matcha Server running on http://localhost:${PORT}`);
  });
};

startServer().catch((err) => {
  logger.error({ err }, "Failed to start server");
  process.exit(1);
});

export default app;
