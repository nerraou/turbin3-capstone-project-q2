"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function getSafeRedirectUrl(
  redirectUrl: string | null,
  fallback: string,
): string {
  if (!redirectUrl) {
    return fallback;
  }

  return redirectUrl;
}

export default function useExternalRedirectUrl() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirect = useCallback(
    (fallback = "/") => {
      const redirectUrl = searchParams.get("redirectUrl");

      router.push(getSafeRedirectUrl(redirectUrl, fallback));
    },
    [router, searchParams],
  );

  return redirect;
}
