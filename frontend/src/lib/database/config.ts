import { config as loadEnv } from "dotenv";

// Need to load envs because it's used in scripts too(env not loaded by NextJS)
loadEnv();

export const config = {
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT, 10),
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  ssl: process.env.NODE_ENV === "production",
};
