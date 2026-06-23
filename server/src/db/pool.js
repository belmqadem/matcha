import pg from "pg";
import env from "../config/env.js";
import logger from "../utils/logger.js";

const { Pool } = pg;

const pool = new Pool({
  host: env.POSTGRES_HOST,
  port: env.POSTGRES_PORT,
  database: env.POSTGRES_DB,
  user: env.POSTGRES_USER,
  password: env.POSTGRES_PASSWORD,
});

pool.on("error", (err) => {
  logger.error({ err }, "Unexpected error on idle PostgreSQL client");
  process.exit(1);
});

export const query = (text, params) => pool.query(text, params);

export const getClient = () => pool.connect();

export default pool;
