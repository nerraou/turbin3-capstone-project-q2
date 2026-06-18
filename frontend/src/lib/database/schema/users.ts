import {
  bigserial,
  pgEnum,
  pgTable,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const userRole = pgEnum("role", ["traveler", "merchant", "admin"]);

export const users = pgTable("users", {
  id: bigserial({
    mode: "bigint",
  }).primaryKey(),
  username: varchar().unique().notNull(),
  password: varchar().notNull(),
  role: userRole().notNull(),
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
export type UserRole = (typeof userRole.enumValues)[number];
