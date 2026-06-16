import { NextResponse } from "next/server";
import { Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import { getAnchorProgram } from "@lib/anchor";

export async function GET() {
  try {
    const { program, wallet } = getAnchorProgram();

    // Backend creates custodial wallet for merchant.
    const merchantWallet = Keypair.generate();

    const [merchantAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("merchant"), merchantWallet.publicKey.toBuffer()],
      program.programId,
    );

    const tx = await program.methods
      .registerMerchant(merchantWallet.publicKey)
      .accountsPartial({
        payer: wallet.publicKey,
        merchantAccount,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return NextResponse.json({
      success: true,
      tx,
      merchantWallet: merchantWallet.publicKey.toBase58(),
      merchantSecretKey: Array.from(merchantWallet.secretKey),
      merchantAccount: merchantAccount.toBase58(),
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
