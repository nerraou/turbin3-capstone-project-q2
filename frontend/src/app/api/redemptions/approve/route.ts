import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { NextResponse } from "next/server";

import {
  getAnchorProgram,
  MERCHANT_SEED,
  PROTOCOL_SEED,
  REDEMPTION_SEED,
} from "@lib/anchor";
import { approveRedemptionRequest } from "@lib/database/repositories";
import { checkUserPermission } from "@lib/login-utils";
import { StatusCodes } from "http-status-codes";
import approveRedemptionApiDataSchema from "./approve-redemption-api-data-schema";

function parsePublicKey(value: unknown, fieldName: string) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Missing ${fieldName}`);
  }

  try {
    return new PublicKey(value);
  } catch {
    throw new Error(`Invalid ${fieldName}`);
  }
}

function parseRedemptionId(value: unknown) {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== "string" && typeof value !== "number") {
    throw new Error("Invalid redemptionId");
  }

  const text = value.toString();

  if (!/^\d+$/.test(text)) {
    throw new Error("Invalid redemptionId");
  }

  return new anchor.BN(text);
}

export async function POST(req: Request) {
  try {
    const { status } = await checkUserPermission(["admin"]);

    if (status !== "ok") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: StatusCodes.UNAUTHORIZED },
      );
    }

    const body = await req.json();
    const parseResult = approveRedemptionApiDataSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: parseResult.error.issues[0]?.message ?? "Invalid request body",
        },
        { status: StatusCodes.UNPROCESSABLE_ENTITY },
      );
    }

    let merchantWallet: PublicKey;
    let bodyRedemptionId: anchor.BN | undefined;

    try {
      merchantWallet = parsePublicKey(
        parseResult.data.merchantWallet,
        "merchantWallet",
      );
      bodyRedemptionId = parseRedemptionId(parseResult.data.redemptionId);
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : "Invalid request",
        },
        { status: StatusCodes.BAD_REQUEST },
      );
    }

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
        { status: StatusCodes.BAD_REQUEST },
      );
    }

    const [merchantAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from(MERCHANT_SEED), merchantWallet.toBuffer()],
      program.programId,
    );

    const merchantAccountData =
      await program.account.merchantAccount.fetch(merchantAccount);

    const redemptionId =
      bodyRedemptionId ??
      new anchor.BN(merchantAccountData.redemptionCount.toString()).subn(1);

    if (redemptionId.isNeg()) {
      return NextResponse.json(
        {
          success: false,
          error: "No redemption request exists for this merchant",
        },
        { status: StatusCodes.BAD_REQUEST },
      );
    }

    const [redemptionRequest] = PublicKey.findProgramAddressSync(
      [
        Buffer.from(REDEMPTION_SEED),
        merchantWallet.toBuffer(),
        redemptionId.toArrayLike(Buffer, "le", 8),
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

    await approveRedemptionRequest(
      merchantWallet.toBase58(),
      redemptionId.toString(),
      tx,
    );

    return NextResponse.json({
      success: true,
      tx,
      merchantWallet: merchantWallet.toBase58(),
      merchantAccount: merchantAccount.toBase58(),
      redemptionRequest: redemptionRequest.toBase58(),
      redemptionId: redemptionId.toString(),
    });
  } catch (error) {
    console.error("Approve redemption error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: StatusCodes.INTERNAL_SERVER_ERROR },
    );
  }
}
