import { and, desc, eq } from "drizzle-orm";

import { db } from "../connection";
import {
  NewRedemptionRequest,
  RedemptionRequest,
  redemptionRequests,
} from "../schema/redemption-requests";

export async function createRedemptionRequest(
  request: NewRedemptionRequest,
): Promise<RedemptionRequest> {
  const createResult = await db
    .insert(redemptionRequests)
    .values(request)
    .returning();

  return createResult[0] as RedemptionRequest;
}

export async function getRedemptionRequestsByMerchantUserId(
  merchantUserId: bigint,
): Promise<RedemptionRequest[]> {
  return db
    .select()
    .from(redemptionRequests)
    .where(eq(redemptionRequests.merchantUserId, merchantUserId))
    .orderBy(desc(redemptionRequests.createdAt));
}

export async function getPendingRedemptionRequests(): Promise<
  RedemptionRequest[]
> {
  return db
    .select()
    .from(redemptionRequests)
    .where(eq(redemptionRequests.status, "pending"))
    .orderBy(desc(redemptionRequests.createdAt));
}

export async function approveRedemptionRequest(
  merchantWallet: string,
  redemptionId: string,
  approveTx: string,
): Promise<RedemptionRequest | undefined> {
  const updateResult = await db
    .update(redemptionRequests)
    .set({
      approveTx,
      status: "approved",
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(redemptionRequests.merchantWallet, merchantWallet),
        eq(redemptionRequests.redemptionId, redemptionId),
      ),
    )
    .returning();

  return updateResult[0] as RedemptionRequest | undefined;
}
