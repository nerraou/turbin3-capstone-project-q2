import { PublicKey } from "@solana/web3.js";
import { NextResponse } from "next/server";

import { TRAVELER_SEED } from "@lib/anchor";
import {
  DashboardRouteError,
  getAmountView,
  getProtocolDashboardContext,
  getTokenBalanceView,
  serializeAnchorEnum,
  serializePaymentReceipt,
} from "@lib/dashboard";
import { getWalletByUserId } from "@lib/database/repositories";
import { checkUserPermission } from "@lib/login-utils";
import { decryptWalletEncryption } from "@lib/wallet";
import { StatusCodes } from "http-status-codes";

export async function GET() {
  try {
    const { status, payload } = await checkUserPermission(["traveler"]);

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
        { success: false, error: "Traveler wallet not found" },
        { status: StatusCodes.NOT_FOUND },
      );
    }

    const travelerWallet = await decryptWalletEncryption(
      Buffer.from(process.env.WALLET_KEK, "hex"),
      walletRow.encryptedPrivateKey,
      walletRow.encryptedDek,
    );

    const { program, connection, protocolConfig, mint, treasury } =
      await getProtocolDashboardContext();

    const [travelerAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from(TRAVELER_SEED), travelerWallet.publicKey.toBuffer()],
      program.programId,
    );

    const travelerAccountInfo =
      await connection.getAccountInfo(travelerAccount);

    if (!travelerAccountInfo) {
      return NextResponse.json(
        { success: false, error: "Traveler account not found" },
        { status: StatusCodes.NOT_FOUND },
      );
    }

    const travelerAccountData =
      await program.account.travelerAccount.fetch(travelerAccount);

    const balance = await getTokenBalanceView(
      connection,
      mint,
      travelerWallet.publicKey,
    );

    const paymentReceipts = await program.account.paymentReceipt.all();
    const payments = paymentReceipts
      .filter(({ account }) =>
        account.traveler.equals(travelerWallet.publicKey),
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

    return NextResponse.json({
      success: true,
      travelerWallet: travelerWallet.publicKey.toBase58(),
      travelerAccount: travelerAccount.toBase58(),
      protocolConfig: protocolConfig.toBase58(),
      treasury: treasury.toBase58(),
      mint: mint.toBase58(),
      status: serializeAnchorEnum(travelerAccountData.status),
      paymentCount: travelerAccountData.paymentCount.toString(),
      balance: {
        ata: balance.ata.toBase58(),
        amount: balance.amount,
        amountUsd: balance.amountUsd,
        currency: balance.currency,
        decimals: balance.decimals,
      },
      totals: {
        paid: payments.reduce(
          (total, payment) =>
            getAmountView(BigInt(total.amount) + BigInt(payment.gross.amount)),
          getAmountView("0"),
        ),
      },
      payments,
    });
  } catch (error) {
    console.error("Traveler dashboard error:", error);

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
