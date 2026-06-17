import { getAnchorProgram } from "@lib/anchor";
import { db } from "@lib/database/connection";
import {
  createUser,
  createWallet,
  getUserByUsername,
} from "@lib/database/repositories";
import { hash as hashPassword } from "@lib/hash";
import { hasAttribute } from "@lib/utils";
import { createWalletEncryption } from "@lib/wallet";
import { generateKeyPairSigner } from "@solana/kit";
import {
  PublicKey,
  SendTransactionError,
  SystemProgram,
} from "@solana/web3.js";
import { StatusCodes } from "http-status-codes";
import { NextResponse } from "next/server";
import { type TravelerRegisterApiData } from "./register-api-data-schema";

export interface RegisterHandlerReturn {
  message: string;
}

export function isUniqueViolation(error: unknown) {
  if (hasAttribute(error, "cause") && hasAttribute(error.cause, "code")) {
    return error.cause.code === "23505";
  } else {
    return false;
  }
}

async function createResponse(
  status: number,
  message: string,
): Promise<NextResponse<RegisterHandlerReturn>> {
  return NextResponse.json({ message }, { status });
}

async function generateWallet() {
  const signer = await generateKeyPairSigner(true);

  const kek = Buffer.from(process.env.WALLET_KEK, "hex");
  const privateKeyJwk = await crypto.subtle.exportKey(
    "jwk",
    signer.keyPair.privateKey,
  );

  return {
    ...createWalletEncryption(kek, privateKeyJwk),
    address: signer.address,
  };
}

export default async function registerTravelerHandler(
  data: TravelerRegisterApiData,
): Promise<NextResponse<RegisterHandlerReturn>> {
  const user = await getUserByUsername(data.username);
  const { program, wallet } = getAnchorProgram();

  if (user) {
    return createResponse(StatusCodes.CONFLICT, "Username already exists");
  }

  const hashedPassword = await hashPassword(data.password);

  try {
    const travelerWallet = await generateWallet();
    const travelerWalletPublicKey = new PublicKey(travelerWallet.address);
    let initializeTravelerTx: string | undefined;

    await db.transaction(async (tx) => {
      const createdUser = await createUser(
        {
          username: data.username,
          password: hashedPassword,
          role: "traveler",
        },
        tx,
      );

      await createWallet(
        {
          chain: "solana",
          address: travelerWallet.address,
          encryptedDek: travelerWallet.encryptedDek,
          encryptedPrivateKey: travelerWallet.encryptedPrivateKey,
          userId: createdUser.id,
          keyVersion: "v1",
        },
        tx,
      );

      const [travelerAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from("traveler"), travelerWalletPublicKey.toBuffer()],
        program.programId,
      );

      initializeTravelerTx = await program.methods
        .initializeTraveler(travelerWalletPublicKey)
        .accountsPartial({
          payer: wallet.publicKey,
          travelerAccount,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
    });

    return NextResponse.json(
      {
        message: "Success",
        initializeTravelerTx,
        travelerWallet: travelerWallet.address,
      },
      { status: StatusCodes.CREATED },
    );
  } catch (error) {
    if (error instanceof SendTransactionError) {
      console.error("Solana transaction:", error);
    } else {
      console.error(error);
    }

    if (isUniqueViolation(error)) {
      return createResponse(StatusCodes.CONFLICT, "Username already exists");
    } else {
      return createResponse(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "Internal Server Error",
      );
    }
  }
}
