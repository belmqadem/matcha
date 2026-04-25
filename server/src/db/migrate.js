import { query } from "./pool.js";

const schema = `
CREATE TABLE IF NOT EXISTS users (
  id                UUID PRIMARY KEY,
  username          VARCHAR(30)  UNIQUE NOT NULL,
  email             VARCHAR(255) UNIQUE NOT NULL,
  password          VARCHAR(255),
  first_name        VARCHAR(50)  NOT NULL,
  last_name         VARCHAR(50)  NOT NULL,

  created_at        TIMESTAMP    WITH TIME ZONE DEFAULT NOW(),
  updated_at        TIMESTAMP    WITH TIME ZONE DEFAULT NOW()
);
`;

(async () => {
  try {
    await query(schema);

    console.log("Migration complete.");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
})();
