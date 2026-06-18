import { relations } from "drizzle-orm";
import { users } from "./users";
import { wallets } from "./wallets";

export const userHasManyWallets = relations(users, ({ many }) => ({
  wallets: many(wallets),
}));

export const walletBelgonsToOneUser = relations(wallets, ({ one }) => ({
  owner: one(users, {
    fields: [wallets.userId],
    references: [users.id],
  }),
}));
