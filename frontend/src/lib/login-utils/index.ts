import { verifyAccessToken } from "@lib/auth/jwt";
import { getCookie, setHostHttpCookie } from "@lib/cookie-utils";
import { UserRole } from "@lib/database/schema/users";
import { redirect } from "next/navigation";

export const ACCESS_TOKEN_COOKIE_NAME = "X-Access-Token";

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

interface CheckUserPermissionReturn {
  status: "ok" | "unauthorized" | "forbidden";
}

export async function checkUserPermission(
  roles: UserRole[],
): Promise<CheckUserPermissionReturn> {
  const payload = await getAccessTokenPayload();

  if (!payload) {
    return {
      status: "unauthorized",
    };
  }

  const hasRole = roles.includes(payload.role);

  return {
    status: hasRole ? "ok" : "forbidden",
  };
}

export function redirectToLogin(returnUrl?: string) {
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
