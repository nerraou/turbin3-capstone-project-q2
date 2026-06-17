import * as anchor from "@coral-xyz/anchor";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { NextResponse } from "next/server";

import { getAnchorProgram } from "@lib/anchor";
import { getCookie } from "@lib/cookie-utils";
import { ACCESS_TOKEN_COOKIE_NAME } from "../auth/login/login-handler";
import { StatusCodes } from "http-status-codes";
import { verifyAccessToken } from "@lib/auth/jwt";
import { getUserById, getWalletByUserId } from "@lib/database/repositories";
import { decryptWalletEncryption } from "@lib/wallet";

const PROTOCOL_SEED = "protocol";
const TREASURY_SEED = "treasury";
const TRAVELER_SEED = "traveler";
const MERCHANT_SEED = "merchant";

async function getUserFromCookie() {
  // TODO: move this to @lib/login-utils
  const accessTokenCookie = await getCookie(ACCESS_TOKEN_COOKIE_NAME);

  if (!accessTokenCookie) {
    return undefined;
  }

  const payload = await verifyAccessToken(accessTokenCookie.value);

  if (!payload?.aud) {
    return undefined;
  }

  const user = await getUserById(payload.aud as unknown as bigint);

  return user;
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

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const user = await getUserFromCookie();

    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: StatusCodes.UNAUTHORIZED },
      );
    }

    const travelerWallet = await getTravelerWallet(user.id);

    const merchantWallet = new PublicKey(body.merchantWallet);
    const amount = new anchor.BN(body.amount);

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

    const travelerAccountData =
      await program.account.travelerAccount.fetch(travelerAccount);

    const paymentCount = new anchor.BN(
      travelerAccountData.paymentCount.toString(),
    );

    const [paymentReceipt] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("receipt"),
        travelerWallet.publicKey.toBuffer(),
        paymentCount.toArrayLike(Buffer, "le", 8),
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
        merchantWallet: body.merchantWallet,
        protocolConfig,
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
