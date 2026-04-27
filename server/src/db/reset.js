import logger from "../utils/logger.js";
import { query } from "./pool.js";

(async () => {
  try {
    await query("DROP SCHEMA public CASCADE");
    await query("CREATE SCHEMA public");
    logger.info(
      "Database reset successfully — run db:migrate to recreate tables.",
    );
    process.exit(0);
  } catch (err) {
    logger.error({ err }, "Database reset failed.");
    process.exit(1);
  }
})();
