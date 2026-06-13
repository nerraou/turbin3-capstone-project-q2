import { drizzle } from "drizzle-orm/node-postgres";
import { config as dbConfig } from "@lib/database/config";

export const db = drizzle({
  connection: dbConfig,
});
