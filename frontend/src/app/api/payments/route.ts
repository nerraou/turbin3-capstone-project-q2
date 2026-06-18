import * as anchor from "@coral-xyz/anchor";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { NextResponse } from "next/server";

import {
  getAnchorProgram,
  MERCHANT_SEED,
  PAYMENT_RECEIPT_SEED,
  PROTOCOL_SEED,
  TRAVELER_SEED,
  TREASURY_SEED,
} from "@lib/anchor";
import {
  getUserById,
  getUserByUsername,
  getWalletByUserId,
} from "@lib/database/repositories";
import { checkUserPermission, getAccessTokenPayload } from "@lib/login-utils";
import {
  formatTravelUsdFromBaseUnits,
  getTravelUsdAmountFromBody,
  TRAVEL_USD_DECIMALS,
  TRAVEL_USD_SYMBOL,
} from "@lib/travel-usd";
import { decryptWalletEncryption } from "@lib/wallet";
import { StatusCodes } from "http-status-codes";
import paymentApiDataSchema from "./payment-api-data-schema";

async function getUserFromCookie() {
  const payload = await getAccessTokenPayload();

  if (payload) {
    return getUserById(payload.aud);
  }
}

async function getTravelerWallet(userId: bigint) {
  const wallet = await getWalletByUserId(userId);

  if (!wallet) {
    throw new Error("no wallet found");
  }

  const travelerKeypair = decryptWalletEncryption(
    Buffer.from(process.env.WALLET_KEK, "hex"),
    wallet.encryptedPrivateKey,
    wallet.encryptedDek,
  );

  return travelerKeypair;
}

async function getMerchantWallet(username: string) {
  const merchant = await getUserByUsername(username);

  if (!merchant) {
    return undefined;
  }

  const wallet = await getWalletByUserId(merchant.id);

  if (!wallet) {
    throw new Error("no wallet found");
  }

  const merchantWallet = await decryptWalletEncryption(
    Buffer.from(process.env.WALLET_KEK, "hex"),
    wallet.encryptedPrivateKey,
    wallet.encryptedDek,
  );

  return merchantWallet.publicKey;
}

export async function POST(req: Request) {
  try {
    const { status } = await checkUserPermission(["traveler"]);

    if (status !== "ok") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: StatusCodes.UNAUTHORIZED },
      );
    }

    const body = await req.json();
    console.log(body);

    const parseResult = paymentApiDataSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: parseResult.error.issues[0]?.message ?? "Invalid request body",
        },
        { status: StatusCodes.UNPROCESSABLE_ENTITY },
      );
    }

    const user = await getUserFromCookie();

    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: StatusCodes.UNAUTHORIZED },
      );
    }

    const travelerWallet = await getTravelerWallet(user.id);
    const merchantWallet = await getMerchantWallet(parseResult.data.merchant);

    if (!merchantWallet) {
      return NextResponse.json(
        {
          message: "merchant not found",
        },
        {
          status: StatusCodes.UNPROCESSABLE_ENTITY,
        },
      );
    }

    const amount = getTravelUsdAmountFromBody(parseResult.data);

    const { program, wallet, connection } = getAnchorProgram();

    const [protocolConfig] = PublicKey.findProgramAddressSync(
      [Buffer.from(PROTOCOL_SEED), wallet.publicKey.toBuffer()],
      program.programId,
    );

    const configInfo = await connection.getAccountInfo(protocolConfig);

    if (!configInfo) {
      return NextResponse.json(
        {
          success: false,
          error: "Protocol is not initialized yet",
          protocolConfig: protocolConfig.toBase58(),
        },
        { status: 400 },
      );
    }

    const protocolConfigAccount =
      await program.account.protocolConfig.fetch(protocolConfig);

    const mint = protocolConfigAccount.mint as PublicKey;

    const [treasury] = PublicKey.findProgramAddressSync(
      [Buffer.from(TREASURY_SEED), protocolConfig.toBuffer()],
      program.programId,
    );

    const [travelerAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from(TRAVELER_SEED), travelerWallet.publicKey.toBuffer()],
      program.programId,
    );

    const [merchantAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from(MERCHANT_SEED), merchantWallet.toBuffer()],
      program.programId,
    );

    const merchantAccountData =
      await program.account.merchantAccount.fetch(merchantAccount);

    const merchantTotalReceived = new anchor.BN(
      merchantAccountData.totalReceived.toString(),
    );

    const [paymentReceipt] = PublicKey.findProgramAddressSync(
      [
        Buffer.from(PAYMENT_RECEIPT_SEED),
        travelerWallet.publicKey.toBuffer(),
        merchantWallet.toBuffer(),
        merchantTotalReceived.toArrayLike(Buffer, "le", 8),
      ],
      program.programId,
    );

    const travelerAta = getAssociatedTokenAddressSync(
      mint,
      travelerWallet.publicKey,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID,
    );

    const merchantAta = getAssociatedTokenAddressSync(
      mint,
      merchantWallet,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID,
    );

    const treasuryAta = getAssociatedTokenAddressSync(
      mint,
      treasury,
      true,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID,
    );

    const tx = await program.methods
      .payMerchant(amount)
      .accountsPartial({
        travelerWallet: travelerWallet.publicKey,
        merchantWallet,
        protocolConfig,
        payer: wallet.publicKey,
        treasury,
        mint,
        travelerAccount,
        merchantAccount,
        travelerAta,
        merchantAta,
        treasuryAta,
        paymentReceipt,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([travelerWallet])
      .rpc();

    return NextResponse.json({
      success: true,
      tx,
      travelerWallet: travelerWallet.publicKey.toBase58(),
      merchantWallet: merchantWallet.toBase58(),
      travelerAccount: travelerAccount.toBase58(),
      merchantAccount: merchantAccount.toBase58(),
      travelerAta: travelerAta.toBase58(),
      merchantAta: merchantAta.toBase58(),
      treasuryAta: treasuryAta.toBase58(),
      paymentReceipt: paymentReceipt.toBase58(),
      amount: amount.toString(),
      amountUsd: formatTravelUsdFromBaseUnits(amount),
      currency: TRAVEL_USD_SYMBOL,
      decimals: TRAVEL_USD_DECIMALS,
    });
  } catch (error) {
    console.error("Pay merchant error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
