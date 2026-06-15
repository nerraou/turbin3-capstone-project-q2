import "server-only";

import * as anchor from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import idl from "./anchor/idl/travel_ramp.json";
import { BackendWallet } from "./wallet-wrapper";

export function getAnchorProgram() {
  const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL;
  const programId = process.env.TRAVELRAMP_PROGRAM_ID;
  const secretKey = process.env.BACKEND_WALLET_SECRET_KEY;

  if (!rpcUrl) throw new Error("Missing NEXT_PUBLIC_RPC_URL");
  if (!programId) throw new Error("Missing TRAVELRAMP_PROGRAM_ID");
  if (!secretKey) throw new Error("Missing BACKEND_WALLET_SECRET_KEY");

  const connection = new Connection(rpcUrl, "confirmed");

  const keypair = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(secretKey)));

  const wallet = new BackendWallet(keypair);

  const provider = new anchor.AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });

  const idlWithAddress = {
    ...idl,
    address: new PublicKey(programId).toBase58(),
  };

  const program = new anchor.Program(idlWithAddress as anchor.Idl, provider);
  return {
    program,
    provider,
    wallet,
    connection,
  };
}
