import * as anchor from "@anchor-lang/core";
import { expect } from "chai";
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
  merchant: Buffer.from("merchant"),
  redemption: Buffer.from("redemption"),
  paymentReceipt: Buffer.from("payment_receipt"),
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

export async function fundAccount(
  account: anchor.web3.PublicKey,
  lamports = anchor.web3.LAMPORTS_PER_SOL / 5,
) {
  const currentBalance = await connection.getBalance(account, commitment);

  if (currentBalance >= lamports) {
    return;
  }

  const rpcEndpoint = connection.rpcEndpoint;
  const isLocalValidator =
    rpcEndpoint.includes("127.0.0.1") || rpcEndpoint.includes("localhost");

  if (isLocalValidator) {
    const tx = await connection.requestAirdrop(account, lamports);
    await confirmTx(tx);
    return;
  }

  const providerBalance = await connection.getBalance(
    provider.wallet.publicKey,
    commitment,
  );

  if (providerBalance < lamports) {
    throw new Error(
      `Provider wallet needs at least ${lamports} lamports to fund tests`,
    );
  }

  const tx = await provider.sendAndConfirm(
    new anchor.web3.Transaction().add(
      anchor.web3.SystemProgram.transfer({
        fromPubkey: provider.wallet.publicKey,
        toPubkey: account,
        lamports,
      }),
    ),
  );
  await confirmTx(tx);
}

export async function expectAnchorError(
  promise: Promise<unknown>,
  expectedCode: string,
) {
  try {
    await promise;
    expect.fail(`Expected Anchor error ${expectedCode}`);
  } catch (error) {
    const anchorCode =
      (error as { error?: { errorCode?: { code?: string } } }).error?.errorCode
        ?.code ?? (error as { errorCode?: { code?: string } }).errorCode?.code;
    const message = error instanceof Error ? error.message : String(error);

    expect(anchorCode ?? message).to.contain(expectedCode);
  }
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

export function findMerchantPda(merchant: anchor.web3.PublicKey) {
  return anchor.web3.PublicKey.findProgramAddressSync(
    [seeds.merchant, merchant.toBuffer()],
    program.programId,
  );
}

export function findRedemptionPda(
  merchant: anchor.web3.PublicKey,
  redemptionId: anchor.BN,
) {
  return anchor.web3.PublicKey.findProgramAddressSync(
    [
      seeds.redemption,
      merchant.toBuffer(),
      redemptionId.toArrayLike(Buffer, "le", 8),
    ],
    program.programId,
  );
}

export function findPaymentReceiptPda(
  traveler: anchor.web3.PublicKey,
  merchant: anchor.web3.PublicKey,
  merchantTotalReceived: anchor.BN,
) {
  return anchor.web3.PublicKey.findProgramAddressSync(
    [
      seeds.paymentReceipt,
      traveler.toBuffer(),
      merchant.toBuffer(),
      merchantTotalReceived.toArrayLike(Buffer, "le", 8),
    ],
    program.programId,
  );
}
