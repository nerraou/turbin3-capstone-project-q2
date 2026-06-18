import * as anchor from "@coral-xyz/anchor";
import {
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { NextResponse } from "next/server";

import {
  getAnchorProgram,
  MERCHANT_SEED,
  PROTOCOL_SEED,
  REDEMPTION_SEED,
} from "@lib/anchor";
import { getWalletByUserId } from "@lib/database/repositories";
import { checkUserPermission } from "@lib/login-utils";
import {
  formatTravelUsdFromBaseUnits,
  getTravelUsdAmountFromBody,
  TRAVEL_USD_DECIMALS,
  TRAVEL_USD_SYMBOL,
} from "@lib/travel-usd";
import { decryptWalletEncryption } from "@lib/wallet";
import { StatusCodes } from "http-status-codes";

async function getMerchantWallet(userId: bigint) {
  const wallet = await getWalletByUserId(userId);

  if (!wallet) {
    throw new Error("no wallet found");
  }

  const merchantKeypair = decryptWalletEncryption(
    Buffer.from(process.env.WALLET_KEK, "hex"),
    wallet.encryptedPrivateKey,
    wallet.encryptedDek,
  );

  return merchantKeypair;
}

export async function POST(req: Request) {
  try {
    const { status, payload } = await checkUserPermission(["merchant"]);

    if (status !== "ok") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: StatusCodes.UNAUTHORIZED },
      );
    }

    const body = await req.json();

    const merchantWallet = await getMerchantWallet(
      BigInt(payload.aud.toString()),
    );

    const amount = getTravelUsdAmountFromBody(body);

    const { program, wallet, connection } = getAnchorProgram();

    const [protocolConfig] = PublicKey.findProgramAddressSync(
      [Buffer.from(PROTOCOL_SEED), wallet.publicKey.toBuffer()],
      program.programId,
    );

    const protocolConfigInfo = await connection.getAccountInfo(protocolConfig);

    if (!protocolConfigInfo) {
      return NextResponse.json(
        {
          success: false,
          error: "Protocol is not initialized yet",
          protocolConfig: protocolConfig.toBase58(),
        },
        { status: StatusCodes.BAD_REQUEST },
      );
    }

    const protocolConfigAccount =
      await program.account.protocolConfig.fetch(protocolConfig);

    const mint = protocolConfigAccount.mint as PublicKey;

    const [merchantAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from(MERCHANT_SEED), merchantWallet.publicKey.toBuffer()],
      program.programId,
    );

    const merchantAccountData =
      await program.account.merchantAccount.fetch(merchantAccount);

    const merchantAta = getAssociatedTokenAddressSync(
      mint,
      merchantWallet.publicKey,
      false,
      TOKEN_PROGRAM_ID,
    );

    const redemptionCount = new anchor.BN(
      merchantAccountData.redemptionCount.toString(),
    );

    const [redemptionRequest] = PublicKey.findProgramAddressSync(
      [
        Buffer.from(REDEMPTION_SEED),
        merchantWallet.publicKey.toBuffer(),
        redemptionCount.toArrayLike(Buffer, "le", 8),
      ],
      program.programId,
    );

    const tx = await program.methods
      .requestRedemption(amount)
      .accountsStrict({
        merchant: merchantWallet.publicKey,
        protocolConfig,
        payer: wallet.publicKey,
        mint,
        merchantAccount,
        merchantAta,
        redemptionRequest,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([merchantWallet])
      .rpc();

    return NextResponse.json({
      success: true,
      tx,
      merchantWallet: merchantWallet.publicKey.toBase58(),
      merchantAccount: merchantAccount.toBase58(),
      merchantAta: merchantAta.toBase58(),
      redemptionRequest: redemptionRequest.toBase58(),
      amount: amount.toString(),
      amountUsd: formatTravelUsdFromBaseUnits(amount),
      currency: TRAVEL_USD_SYMBOL,
      decimals: TRAVEL_USD_DECIMALS,
      redemptionId: redemptionCount.toString(),
    });
  } catch (error) {
    console.error("Request redemption error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: StatusCodes.INTERNAL_SERVER_ERROR },
    );
  }
}
