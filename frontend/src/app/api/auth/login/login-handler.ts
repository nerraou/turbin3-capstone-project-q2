import { createAccessToken } from "@lib/auth/jwt";
import { getUserByUsername } from "@lib/database/repositories";
import { compare as compareHash } from "@lib/hash";
import { createSession } from "@lib/login-utils";
import { StatusCodes } from "http-status-codes";
import { NextResponse } from "next/server";
import { type LoginApiData } from "./login-api-data-schema";

export interface LoginHandlerReturn {
  message: string;
}

async function createResponse(
  status: number,
  message: string,
  accessToken?: string,
): Promise<NextResponse<LoginHandlerReturn>> {
  if (accessToken) {
    await createSession(accessToken);
  }

  return NextResponse.json({ message }, { status });
}

export default async function loginHandler(
  data: LoginApiData,
): Promise<NextResponse<LoginHandlerReturn>> {
  const user = await getUserByUsername(data.username);

  if (!user) {
    return createResponse(StatusCodes.UNAUTHORIZED, "Unauthorized");
  }

  const isCorrectPassword = compareHash(data.password, user.password);

  if (!isCorrectPassword) {
    return createResponse(StatusCodes.UNAUTHORIZED, "Unauthorized");
  } else {
    const accessToken = await createAccessToken({ id: user.id });
    return createResponse(StatusCodes.OK, "Success", accessToken);
  }
}
