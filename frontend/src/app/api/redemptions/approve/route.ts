import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { NextResponse } from "next/server";

import {
  getAnchorProgram,
  MERCHANT_SEED,
  PROTOCOL_SEED,
  REDEMPTION_SEED,
} from "@lib/anchor";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const merchantWallet = new PublicKey(body.merchantWallet);

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

    const [merchantAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from(MERCHANT_SEED), merchantWallet.toBuffer()],
      program.programId,
    );

    const merchantAccountData =
      await program.account.merchantAccount.fetch(merchantAccount);

    const totalRedeemed = new anchor.BN(
      merchantAccountData.totalRedeemed.toString(),
    );

    const [redemptionRequest] = PublicKey.findProgramAddressSync(
      [
        Buffer.from(REDEMPTION_SEED),
        merchantWallet.toBuffer(),
        totalRedeemed.toArrayLike(Buffer, "le", 8),
      ],
      program.programId,
    );

    const tx = await program.methods
      .approveRedemption()
      .accountsStrict({
        admin: wallet.publicKey,
        protocolConfig,
        merchantAccount,
        redemptionRequest,
      })
      .rpc();

    return NextResponse.json({
      success: true,
      tx,
      merchantWallet: merchantWallet.toBase58(),
      merchantAccount: merchantAccount.toBase58(),
      redemptionRequest: redemptionRequest.toBase58(),
    });
  } catch (error) {
    console.error("Approve redemption error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
