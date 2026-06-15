import { NextResponse } from "next/server";
import { Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { getAnchorProgram } from "../../../lib/anchor";

export async function GET() {
  try {
    const { program, wallet } = getAnchorProgram();

    // Backend creates custodial wallet for traveler
    const travelerWallet = Keypair.generate();

    const [travelerAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("traveler"), travelerWallet.publicKey.toBuffer()],
      program.programId,
    );

    const tx = await program.methods
      .initializeTraveler(travelerWallet.publicKey)
      .accounts({
        payer: wallet.publicKey,
        travelerAccount,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return NextResponse.json({
      success: true,
      tx,
      travelerWallet: travelerWallet.publicKey.toBase58(),
      travelerAccount: travelerAccount.toBase58(),
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
