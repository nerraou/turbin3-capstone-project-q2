import * as anchor from "@coral-xyz/anchor";
import {
  getAnchorProgram,
  PROTOCOL_SEED,
  TRAVELER_SEED,
  TREASURY_SEED,
} from "@lib/anchor";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { NextResponse } from "next/server";
import { MintCreditsData } from "./mint-credits-schema";

export async function mintCreditsHandler(data: MintCreditsData) {
  try {
    const travelerWallet = new PublicKey(data.travelerWallet);
    const amount = new anchor.BN(data.amount);

    const { program, wallet } = getAnchorProgram();

    const protocolConfig = PublicKey.findProgramAddressSync(
      [Buffer.from(PROTOCOL_SEED), wallet.publicKey.toBuffer()],
      program.programId,
    )[0];

    const treasury = PublicKey.findProgramAddressSync(
      [Buffer.from(TREASURY_SEED), protocolConfig.toBuffer()],
      program.programId,
    )[0];

    const travelerAccount = PublicKey.findProgramAddressSync(
      [Buffer.from(TRAVELER_SEED), travelerWallet.toBuffer()],
      program.programId,
    )[0];

    console.log("protocolConfig:", protocolConfig.toBase58());
    console.log("travelerAccount:", travelerAccount.toBase58());
    console.log("travelerWallet:", travelerWallet.toBase58());

    const protocolConfigAccount =
      await program.account.protocolConfig.fetch(protocolConfig);

    const mint = protocolConfigAccount.mint as PublicKey;

    const travelerAta = getAssociatedTokenAddressSync(
      mint,
      travelerWallet,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID,
    );

    const tx = await program.methods
      .mintCredits(amount)
      .accountsPartial({
        admin: wallet.publicKey,
        protocolConfig,
        treasury,
        mint,
        travelerAccount,
        travelerWallet,
        travelerAta,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return NextResponse.json({
      success: true,
      tx,
      travelerWallet: travelerWallet.toBase58(),
      travelerAccount: travelerAccount.toBase58(),
      travelerAta: travelerAta.toBase58(),
      mint: mint.toBase58(),
      amount: amount.toString(),
    });
  } catch (error) {
    console.error("Mint credits error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
