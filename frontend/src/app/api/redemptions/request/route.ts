import * as anchor from "@coral-xyz/anchor";
import { NextResponse } from "next/server";
import { Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import {
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

import { getAnchorProgram } from "@lib/anchor";

export const runtime = "nodejs";

const PROTOCOL_SEED = "protocol";
const MERCHANT_SEED = "merchant";
const REDEMPTION_SEED = "redemption";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const merchantSecretKey = Uint8Array.from(body.merchantSecretKey);
    const merchantWallet = Keypair.fromSecretKey(merchantSecretKey);

    const amount = new anchor.BN(body.amount);

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
        { status: 400 },
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

    const totalRedeemed = new anchor.BN(
      merchantAccountData.totalRedeemed.toString(),
    );

    const [redemptionRequest] = PublicKey.findProgramAddressSync(
      [
        Buffer.from(REDEMPTION_SEED),
        merchantWallet.publicKey.toBuffer(),
        totalRedeemed.toArrayLike(Buffer, "le", 8),
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
    });
  } catch (error) {
    console.error("Request redemption error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
