import { db } from "./connection";

export type PgTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];
