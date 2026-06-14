import { db } from "../connection";
import { NewWallet, Wallet, wallets } from "../schema/wallets";
import { PgTransaction } from "../types";

export async function createWallet(
  user: Omit<NewWallet, "id" | "createdAt" | "updatedAt">,
  tx?: PgTransaction,
) {
  let createResult: Wallet[];

  if (tx) {
    createResult = await tx.insert(wallets).values(user).returning();
  } else {
    createResult = await db.insert(wallets).values(user).returning();
  }

  return createResult[0];
}
