import { UserRole } from "@lib/database/schema/users";
import { jwtVerify, SignJWT } from "jose";

export interface AuthJwtPayload {
  id: bigint;
  role: UserRole;
}

export interface UserJwtPayload {
  aud: bigint;
  iat: number;
  exp: number;
  role: UserRole;
}

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export function createAccessToken(payload: AuthJwtPayload) {
  return new SignJWT({
    role: payload.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setAudience(payload.id.toString())
    .setIssuedAt()
    .setExpirationTime("2h")
    .sign(JWT_SECRET);
}

export async function verifyAccessToken(
  token: string,
): Promise<UserJwtPayload | undefined> {
  try {
    const { payload } = await jwtVerify<UserJwtPayload>(token, JWT_SECRET);

    return payload;
  } catch {
    return undefined;
  }
}
