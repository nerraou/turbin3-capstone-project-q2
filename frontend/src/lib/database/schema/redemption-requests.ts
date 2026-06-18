import {
  bigint,
  bigserial,
  pgTable,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

export const redemptionRequests = pgTable(
  "redemption_requests",
  {
    id: bigserial({
      mode: "bigint",
    }).primaryKey(),

    merchantUserId: bigint("merchant_user_id", {
      mode: "bigint",
    }).notNull(),

    merchantWallet: text("merchant_wallet").notNull(),
    merchantAccount: text("merchant_account").notNull(),
    merchantAta: text("merchant_ata").notNull(),
    redemptionRequest: text("redemption_request").notNull().unique(),
    redemptionId: text("redemption_id").notNull(),
    amount: text().notNull(),
    amountUsd: text("amount_usd").notNull(),
    currency: text().notNull(),
    decimals: text().notNull(),
    status: text().notNull().default("pending"),
    requestTx: text("request_tx").notNull(),
    approveTx: text("approve_tx"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdateFn(() => new Date()),
  },
  (table) => [
    unique("redemption_requests_merchant_redemption_id_unique").on(
      table.merchantWallet,
      table.redemptionId,
    ),
  ],
);

export type RedemptionRequest = typeof redemptionRequests.$inferSelect;
export type NewRedemptionRequest = typeof redemptionRequests.$inferInsert;
