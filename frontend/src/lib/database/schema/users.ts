import { pgTable, bigserial, timestamp, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: bigserial({
    mode: "bigint",
  }).primaryKey(),
  username: varchar().unique().notNull(),
  password: varchar().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => new Date()),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
