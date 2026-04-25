import "dotenv/config";
import { cleanEnv, port, str } from "envalid";

const env = cleanEnv(process.env, {
  PORT: port({ default: 3000 }),
  CORS_ORIGIN: str(),
  POSTGRES_HOST: str(),
  POSTGRES_PORT: port(),
  POSTGRES_DB: str(),
  POSTGRES_USER: str(),
  POSTGRES_PASSWORD: str(),
});

export default env;
