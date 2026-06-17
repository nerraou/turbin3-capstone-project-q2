import { getCookie, hasCookie, setHostHttpCookie } from "@lib/cookie-utils";
import { redirect } from "next/navigation";

export const ACCESS_TOKEN_COOKIE_NAME = "X-Access-Token";

export async function createSession(accessToken: string) {
  await setHostHttpCookie(ACCESS_TOKEN_COOKIE_NAME, accessToken);
}

export async function getAccessToken() {
  const accessToken = await getCookie(ACCESS_TOKEN_COOKIE_NAME);

  return accessToken?.value;
}

export function hasSessionToken() {
  return hasCookie(ACCESS_TOKEN_COOKIE_NAME);
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
