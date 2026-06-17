import { db } from "../connection";
import {
  type NewMerchantProfile,
  merchantsProfile,
  type MerchantProfile,
} from "../schema/merchants-profiles";
import { PgTransaction } from "../types";

export async function createMerchant(
  merchant: Omit<NewMerchantProfile, "id" | "createdAt" | "updatedAt">,
  tx?: PgTransaction,
) {
  let createResult: MerchantProfile[];

  if (tx) {
    createResult = await tx
      .insert(merchantsProfile)
      .values(merchant)
      .returning();
  } else {
    createResult = await db
      .insert(merchantsProfile)
      .values(merchant)
      .returning();
  }

  return createResult[0];
}
