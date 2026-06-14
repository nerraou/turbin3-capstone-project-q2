import { relations } from "drizzle-orm";
import { users } from "./users";
import { wallets } from "./wallets";

export const userHasManyWallets = relations(users, ({ many }) => ({
  wallets: many(wallets),
}));
