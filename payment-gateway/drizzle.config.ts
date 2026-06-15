import { defineConfig } from "drizzle-kit";
import { config as dbConfig } from "@lib/database/config";

import { config } from "dotenv";

config();

export default defineConfig({
  dbCredentials: dbConfig,
  dialect: "postgresql",
  schema: "./src/lib/database/schema",
  out: "./src/lib/database/migrations",
});
