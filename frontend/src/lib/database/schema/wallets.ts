import {
  bigint,
  bigserial,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const wallets = pgTable("wallets", {
  id: bigserial({
    mode: "bigint",
  }).primaryKey(),

  userId: bigint("user_id", {
    mode: "bigint",
  }).notNull(),

  chain: text().notNull(),
  address: text().notNull().unique(),

  // encrypted private key (DEK-encrypted)
  encryptedPrivateKey: text("encrypted_private_key").notNull(),

  // encrypted DEK (KEK-encrypted)
  encryptedDek: text("encrypted_dek").notNull(),

  // used for key rotation
  keyVersion: text("key_version").notNull().default("v1"),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => new Date()),
});

export type Wallet = typeof wallets.$inferSelect;
export type NewWallet = typeof wallets.$inferInsert;
