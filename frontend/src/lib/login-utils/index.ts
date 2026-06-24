import { UserJwtPayload, verifyAccessToken } from "@lib/auth/jwt";
import { deleteCookie, getCookie, setHostHttpCookie } from "@lib/cookie-utils";
import { UserRole } from "@lib/database/schema/users";
import { redirect } from "next/navigation";

export const ACCESS_TOKEN_COOKIE_NAME =
  process.env.NODE_ENV === "production"
    ? "__Host-Http-X-Access-Token"
    : "X-Access-Token";

export async function createSession(accessToken: string) {
  await setHostHttpCookie(ACCESS_TOKEN_COOKIE_NAME, accessToken);
}

export async function getAccessTokenPayload() {
  const accessTokenCookie = await getCookie(ACCESS_TOKEN_COOKIE_NAME);

  if (!accessTokenCookie) {
    return undefined;
  }

  return verifyAccessToken(accessTokenCookie.value);
}

type CheckUserPermissionReturn =
  | {
      status: "unauthorized" | "forbidden";
      payload: undefined;
    }
  | {
      status: "ok";
      payload: UserJwtPayload;
    };

export async function checkUserPermission(
  roles: UserRole[],
): Promise<CheckUserPermissionReturn> {
  const payload = await getAccessTokenPayload();

  if (!payload) {
    return {
      status: "unauthorized",
      payload: undefined,
    };
  }

  const hasRole = roles.includes(payload.role);

  if (!hasRole) {
    return {
      payload: undefined,
      status: "forbidden",
    };
  }

  return {
    payload,
    status: "ok",
  };
}

export function redirectToLogin(returnUrl?: string): never {
  const loginUrlPath = "/login";
  let query = "";

  if (returnUrl) {
    const queryParams = new URLSearchParams({
      redirectUrl: returnUrl,
    });

    query = `?${queryParams.toString()}`;
  }

  return redirect(`${loginUrlPath}${query}`);
}

export async function destroySession() {
  await deleteCookie(ACCESS_TOKEN_COOKIE_NAME);
}
