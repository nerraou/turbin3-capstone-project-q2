import { jwtVerify, SignJWT } from "jose";

export interface AuthJwtPayload {
  id: number;
}

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export function createAccessToken(payload: AuthJwtPayload) {
  return new SignJWT()
    .setProtectedHeader({ alg: "HS256" })
    .setAudience(payload.id.toString())
    .setIssuedAt()
    .setExpirationTime("2h")
    .sign(JWT_SECRET);
}

// export function createRefreshToken(payload: JwtPayload) {}

export async function verifyAccessToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);

    return payload;
  } catch {
    return undefined;
  }
}
