import * as anchor from "@coral-xyz/anchor";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { Connection, PublicKey } from "@solana/web3.js";

import { getAnchorProgram, PROTOCOL_SEED, TREASURY_SEED } from "@lib/anchor";
import {
  formatTravelUsdFromBaseUnits,
  TRAVEL_USD_DECIMALS,
  TRAVEL_USD_SYMBOL,
} from "@lib/travel-usd";

export class DashboardRouteError extends Error {
  constructor(
    message: string,
    public status = 500,
  ) {
    super(message);
  }
}

export function getAmountView(amount: anchor.BN | string | bigint) {
  return {
    amount: amount.toString(),
    amountUsd: formatTravelUsdFromBaseUnits(amount),
    currency: TRAVEL_USD_SYMBOL,
    decimals: TRAVEL_USD_DECIMALS,
  };
}

export function serializeAnchorEnum(value: unknown) {
  if (value && typeof value === "object") {
    const [key] = Object.keys(value);

    if (key) {
      return key;
    }
  }

  return String(value);
}

export async function getProtocolDashboardContext() {
  const { program, wallet, connection } = getAnchorProgram();

  const [protocolConfig] = PublicKey.findProgramAddressSync(
    [Buffer.from(PROTOCOL_SEED), wallet.publicKey.toBuffer()],
    program.programId,
  );

  const protocolConfigInfo = await connection.getAccountInfo(protocolConfig);

  if (!protocolConfigInfo) {
    throw new DashboardRouteError("Protocol is not initialized yet", 400);
  }

  const protocolConfigAccount =
    await program.account.protocolConfig.fetch(protocolConfig);

  const mint = protocolConfigAccount.mint as PublicKey;

  const [treasury] = PublicKey.findProgramAddressSync(
    [Buffer.from(TREASURY_SEED), protocolConfig.toBuffer()],
    program.programId,
  );

  return {
    program,
    wallet,
    connection,
    protocolConfig,
    protocolConfigAccount,
    mint,
    treasury,
  };
}

export async function getTokenBalanceView(
  connection: Connection,
  mint: PublicKey,
  owner: PublicKey,
  allowOwnerOffCurve = false,
) {
  const ata = getAssociatedTokenAddressSync(
    mint,
    owner,
    allowOwnerOffCurve,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
  );

  const accountInfo = await connection.getAccountInfo(ata);

  if (!accountInfo) {
    return {
      ata,
      ...getAmountView("0"),
    };
  }

  const balance = await connection.getTokenAccountBalance(ata);

  return {
    ata,
    amount: balance.value.amount,
    amountUsd: formatTravelUsdFromBaseUnits(balance.value.amount),
    currency: TRAVEL_USD_SYMBOL,
    decimals: TRAVEL_USD_DECIMALS,
  };
}

export function serializePaymentReceipt(
  publicKey: PublicKey,
  account: {
    traveler: PublicKey;
    merchant: PublicKey;
    grossAmount: anchor.BN;
    merchantAmount: anchor.BN;
    protocolFee: anchor.BN;
    timestamp: anchor.BN;
  },
) {
  return {
    receipt: publicKey.toBase58(),
    traveler: account.traveler.toBase58(),
    merchant: account.merchant.toBase58(),
    gross: getAmountView(account.grossAmount),
    merchantAmount: getAmountView(account.merchantAmount),
    protocolFee: getAmountView(account.protocolFee),
    timestamp: account.timestamp.toString(),
  };
}

export function serializeRedemptionRequest(
  publicKey: PublicKey,
  account: {
    merchant: PublicKey;
    id: anchor.BN;
    amount: anchor.BN;
    status: unknown;
  },
) {
  return {
    redemptionRequest: publicKey.toBase58(),
    merchant: account.merchant.toBase58(),
    id: account.id.toString(),
    amount: getAmountView(account.amount),
    status: serializeAnchorEnum(account.status),
  };
}
