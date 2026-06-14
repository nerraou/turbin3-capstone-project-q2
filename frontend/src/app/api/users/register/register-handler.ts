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
import { StatusCodes } from "http-status-codes";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { type RegisterApiData } from "./register-api-data-schema";

const ACCESS_TOKEN_COOKIE_NAME = "X-Access-Token";

export interface RegisterHandlerReturn {
  message: string;
}

export function isUniqueViolation(error: unknown) {
  if (hasAttribute(error, "cause") && hasAttribute(error?.cause, "code")) {
    return error.cause.code === "23505";
  } else {
    return false;
  }
}

async function createResponse(
  status: number,
  message: string,
  accessToken?: string,
): Promise<NextResponse<RegisterHandlerReturn>> {
  if (accessToken) {
    const cookiesStore = await cookies();

    cookiesStore.set(ACCESS_TOKEN_COOKIE_NAME, accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });
  }

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

export default async function registerHandler(
  data: RegisterApiData,
): Promise<NextResponse<RegisterHandlerReturn>> {
  const user = await getUserByUsername(data.username);

  if (user) {
    return createResponse(StatusCodes.CONFLICT, "Username already exists");
  }

  const hashedPassword = await hashPassword(data.password);

  try {
    const wallet = await generateWallet();

    await db.transaction(async (tx) => {
      const createdUser = await createUser(
        {
          username: data.username,
          password: hashedPassword,
        },
        tx,
      );

      await createWallet(
        {
          chain: "solana",
          address: wallet.address,
          encryptedDek: wallet.encryptedDek,
          encryptedPrivateKey: wallet.encryptedPrivateKey,
          userId: createdUser.id,
          keyVersion: "v1",
        },
        tx,
      );
    });

    return createResponse(StatusCodes.CREATED, "Success");
  } catch (error) {
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
