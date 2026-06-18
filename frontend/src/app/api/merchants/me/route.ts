import { PublicKey } from "@solana/web3.js";
import { NextResponse } from "next/server";

import { MERCHANT_SEED } from "@lib/anchor";
import {
  DashboardRouteError,
  getAmountView,
  getProtocolDashboardContext,
  getTokenBalanceView,
  serializeAnchorEnum,
  serializePaymentReceipt,
  serializeRedemptionRequest,
} from "@lib/dashboard";
import { getWalletByUserId } from "@lib/database/repositories";
import { checkUserPermission } from "@lib/login-utils";
import { decryptWalletEncryption } from "@lib/wallet";
import { StatusCodes } from "http-status-codes";

export async function GET() {
  try {
    const { status, payload } = await checkUserPermission(["merchant"]);

    if (status !== "ok") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        {
          status: StatusCodes.UNAUTHORIZED,
        },
      );
    }

    const walletRow = await getWalletByUserId(BigInt(payload.aud.toString()));

    if (!walletRow) {
      return NextResponse.json(
        { success: false, error: "Merchant wallet not found" },
        { status: StatusCodes.NOT_FOUND },
      );
    }

    const merchantWallet = await decryptWalletEncryption(
      Buffer.from(process.env.WALLET_KEK, "hex"),
      walletRow.encryptedPrivateKey,
      walletRow.encryptedDek,
    );

    const { program, connection, protocolConfig, mint, treasury } =
      await getProtocolDashboardContext();

    const [merchantAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from(MERCHANT_SEED), merchantWallet.publicKey.toBuffer()],
      program.programId,
    );

    const merchantAccountInfo =
      await connection.getAccountInfo(merchantAccount);

    if (!merchantAccountInfo) {
      return NextResponse.json(
        { success: false, error: "Merchant account not found" },
        { status: StatusCodes.NOT_FOUND },
      );
    }

    const merchantAccountData =
      await program.account.merchantAccount.fetch(merchantAccount);

    const balance = await getTokenBalanceView(
      connection,
      mint,
      merchantWallet.publicKey,
    );

    const paymentReceipts = await program.account.paymentReceipt.all();
    const payments = paymentReceipts
      .filter(({ account }) =>
        account.merchant.equals(merchantWallet.publicKey),
      )
      .sort(
        (left, right) =>
          Number(right.account.timestamp.toString()) -
          Number(left.account.timestamp.toString()),
      )
      .slice(0, 25)
      .map(({ publicKey, account }) =>
        serializePaymentReceipt(publicKey, account),
      );

    const redemptionRequests = await program.account.redemptionRequest.all();
    const redemptions = redemptionRequests
      .filter(({ account }) =>
        account.merchant.equals(merchantWallet.publicKey),
      )
      .sort(
        (left, right) =>
          Number(right.account.id.toString()) -
          Number(left.account.id.toString()),
      )
      .slice(0, 25)
      .map(({ publicKey, account }) =>
        serializeRedemptionRequest(publicKey, account),
      );

    return NextResponse.json({
      success: true,
      merchantWallet: merchantWallet.publicKey.toBase58(),
      merchantAccount: merchantAccount.toBase58(),
      protocolConfig: protocolConfig.toBase58(),
      treasury: treasury.toBase58(),
      mint: mint.toBase58(),
      status: serializeAnchorEnum(merchantAccountData.status),
      balance: {
        ata: balance.ata.toBase58(),
        amount: balance.amount,
        amountUsd: balance.amountUsd,
        currency: balance.currency,
        decimals: balance.decimals,
      },
      totals: {
        received: getAmountView(merchantAccountData.totalReceived),
        redeemed: getAmountView(merchantAccountData.totalRedeemed),
        pendingRedemption: redemptions
          .filter((redemption) => redemption.status === "pending")
          .reduce(
            (total, redemption) =>
              getAmountView(
                BigInt(total.amount) + BigInt(redemption.amount.amount),
              ),
            getAmountView("0"),
          ),
      },
      redemptionCount: merchantAccountData.redemptionCount.toString(),
      payments,
      redemptions,
    });
  } catch (error) {
    console.error("Merchant dashboard error:", error);

    if (error instanceof DashboardRouteError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.status },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: StatusCodes.INTERNAL_SERVER_ERROR },
    );
  }
}
