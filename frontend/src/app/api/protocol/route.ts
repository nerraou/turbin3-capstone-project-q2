import { Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { NextResponse } from "next/server";
import { getAnchorProgram } from "@lib/anchor";

const PROTOCOL_SEED = "protocol";
const TREASURY_SEED = "treasury";

export async function GET() {
  try {
    const { program, wallet, connection } = getAnchorProgram();

    const feeBps = 100; // 1%
    const mint = Keypair.generate();

    const [protocolConfig] = PublicKey.findProgramAddressSync(
      [Buffer.from(PROTOCOL_SEED), wallet.publicKey.toBuffer()],
      program.programId,
    );

    const [treasury] = PublicKey.findProgramAddressSync(
      [Buffer.from(TREASURY_SEED), protocolConfig.toBuffer()],
      program.programId,
    );

    const existingProtocolConfig =
      await connection.getAccountInfo(protocolConfig);

    if (existingProtocolConfig) {
      return NextResponse.json(
        {
          success: false,
          error: "Protocol is already initialized for this backend wallet",
          protocolConfig: protocolConfig.toBase58(),
          treasury: treasury.toBase58(),
        },
        { status: 409 },
      );
    }

    const tx = await program.methods
      .initializeProtocol(feeBps)
      .accountsPartial({
        admin: wallet.publicKey,
        protocolConfig,
        treasury,
        travelCreditMint: mint.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([mint])
      .rpc();

    return NextResponse.json({
      success: true,
      tx,
      protocolConfig: protocolConfig.toBase58(),
      treasury: treasury.toBase58(),
      mint: mint.publicKey.toBase58(),
      feeBps,
    });
  } catch (error) {
    if (error && typeof error === "object" && "logs" in error) {
      console.error("Solana transaction logs:", error.logs);
    }
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
