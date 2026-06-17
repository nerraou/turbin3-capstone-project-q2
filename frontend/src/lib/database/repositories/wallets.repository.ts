import { eq } from "drizzle-orm";
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

export async function getWalletByUserId(
  id: bigint,
): Promise<Wallet | undefined> {
  const walletsResult = await db
    .select()
    .from(wallets)
    .where(eq(wallets.userId, id));

  if (walletsResult.length === 0) {
    return undefined;
  }

  return walletsResult[0] as Wallet;
}
