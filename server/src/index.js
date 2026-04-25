import express from "express";
import helmet from "helmet";
import cors from "cors";
import { createServer } from "http";
import env from "./config/env.js";
import pool from "./db/pool.js";
import logger, { httpLogger } from "./utils/logger.js";
import notFound from "./middleware/notFound.js";
import errorHandler from "./middleware/errorHandler.js";

const app = express();
const httpServer = createServer(app);

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(httpLogger);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

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

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/", (req, res) => {
  res.send("Welcome to the Matcha API!");
});

app.use(notFound);
app.use(errorHandler);

const PORT = env.PORT;
httpServer.listen(PORT, () => {
  logger.info(`Server running on http://localhost:${PORT}`);
});

export default app;
