import "dotenv/config";
import { cleanEnv, port, str } from "envalid";

const env = cleanEnv(process.env, {
  PORT: port({ default: 3000 }),
  NODE_ENV: str({
    choices: ["development", "production", "test"],
    default: "development",
  }),
  CORS_ORIGIN: str(),
  CLIENT_URL: str(),

  POSTGRES_HOST: str(),
  POSTGRES_PORT: port(),
  POSTGRES_DB: str(),
  POSTGRES_USER: str(),
  POSTGRES_PASSWORD: str(),

  JWT_SECRET: str(),
  JWT_EXPIRES_IN: str({ default: "7d" }),

  SMTP_HOST: str(),
  SMTP_PORT: port(),
  SMTP_USER: str(),
  SMTP_PASSWORD: str(),
  EMAIL_FROM: str(),

  GOOGLE_CLIENT_ID: str(),
  GOOGLE_CLIENT_SECRET: str(),
  GOOGLE_CALLBACK_URL: str(),
  FORTYTWO_CLIENT_ID: str(),
  FORTYTWO_CLIENT_SECRET: str(),
  FORTYTWO_CALLBACK_URL: str(),
});

export default env;
