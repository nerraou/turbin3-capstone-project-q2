import * as anchor from "@anchor-lang/core";
import { TravelRamp } from "../target/types/travel_ramp";

export const provider = anchor.AnchorProvider.env();
anchor.setProvider(provider);
const commitment = "confirmed";

const connection = provider.connection;

export const program = anchor.workspace
  .TravelRamp as anchor.Program<TravelRamp>;

export const seeds = {
  protocol: Buffer.from("protocol"),
  treasury: Buffer.from("treasury"),
  traveler: Buffer.from("traveler"),
};

export async function confirmTx(signature: string) {
  const latestBlockHash = await connection.getLatestBlockhash();

  await connection.confirmTransaction(
    {
      signature,
      ...latestBlockHash,
    },
    commitment,
  );
}

export function findProtocolConfigPda(admin: anchor.web3.PublicKey) {
  return anchor.web3.PublicKey.findProgramAddressSync(
    [seeds.protocol, admin.toBuffer()],
    program.programId,
  );
}

export function findTreasuryPda(protocolConfig: anchor.web3.PublicKey) {
  return anchor.web3.PublicKey.findProgramAddressSync(
    [seeds.treasury, protocolConfig.toBuffer()],
    program.programId,
  );
}

export function findTravelerPda(travelerWallet: anchor.web3.PublicKey) {
  return anchor.web3.PublicKey.findProgramAddressSync(
    [seeds.traveler, travelerWallet.toBuffer()],
    program.programId,
  );
}
