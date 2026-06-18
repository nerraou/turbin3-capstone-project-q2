import {
  bigint,
  bigserial,
  pgTable,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const merchantsProfile = pgTable("merchants_profiles", {
  id: bigserial({
    mode: "bigint",
  }).primaryKey(),
  name: varchar(),
  userId: bigint("user_id", {
    mode: "bigint",
  }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => new Date()),
});

export type MerchantProfile = typeof merchantsProfile.$inferSelect;
export type NewMerchantProfile = typeof merchantsProfile.$inferInsert;
