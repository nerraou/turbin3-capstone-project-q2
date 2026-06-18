import { getPendingRedemptionRequests } from "@lib/database/repositories";
import { checkUserPermission } from "@lib/login-utils";
import { StatusCodes } from "http-status-codes";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { status } = await checkUserPermission(["admin"]);

    if (status !== "ok") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: StatusCodes.UNAUTHORIZED },
      );
    }

    const redemptions = await getPendingRedemptionRequests();

    return NextResponse.json({
      success: true,
      redemptions: redemptions.map((redemption) => ({
        id: redemption.id.toString(),
        merchantUserId: redemption.merchantUserId.toString(),
        merchantWallet: redemption.merchantWallet,
        merchantAccount: redemption.merchantAccount,
        merchantAta: redemption.merchantAta,
        redemptionRequest: redemption.redemptionRequest,
        redemptionId: redemption.redemptionId,
        amount: redemption.amount,
        amountUsd: redemption.amountUsd,
        currency: redemption.currency,
        decimals: Number(redemption.decimals),
        status: redemption.status,
        requestTx: redemption.requestTx,
        approveTx: redemption.approveTx,
        createdAt: redemption.createdAt.toISOString(),
        updatedAt: redemption.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("List redemptions error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: StatusCodes.INTERNAL_SERVER_ERROR },
    );
  }
}
