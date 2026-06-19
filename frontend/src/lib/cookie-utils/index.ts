import { isProduction } from "@lib/env";
import { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { cookies } from "next/headers";

export class CookieError extends Error {
  constructor(message?: string, options?: ErrorOptions) {
    super(message, options);

    this.name = "CookieError";
  }
}

export async function setCookie(
  key: string,
  value: string,
  options?: Partial<ResponseCookie>,
) {
  const cookiesStore = await cookies();

  return cookiesStore.set(key, value, options);
}

export async function hasCookie(key: string) {
  const cookiesStore = await cookies();

  return cookiesStore.has(key);
}

export async function getCookie(key: string) {
  const cookiesStore = await cookies();

  return cookiesStore.get(key);
}

export async function deleteCookie(key: string) {
  const cookiesStore = await cookies();

  return cookiesStore.delete(key);
}

export function setHostHttpCookie(key: string, value: string) {
  if (isProduction() && !key.startsWith("__Host-")) {
    throw new CookieError("missing __Host- prefix");
  }

  return setCookie(key, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
}
