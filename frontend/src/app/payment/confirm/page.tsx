import { checkUserPermission, redirectToLogin } from "@lib/login-utils";
import { Suspense } from "react";
import ConfirmPayment from "../../payments/confirm/confirm-payment";

interface ConfirmPaymentPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

async function buildReturnUrl(
  pathname: string,
  searchParams: ConfirmPaymentPageProps["searchParams"],
) {
  const params = await searchParams;
  const queryParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      value.forEach((entry) => queryParams.append(key, entry));
    } else if (value !== undefined) {
      queryParams.set(key, value);
    }
  }

  const query = queryParams.toString();

  return query ? `${pathname}?${query}` : pathname;
}

export default async function ConfirmPaymentPage({
  searchParams,
}: ConfirmPaymentPageProps) {
  const { status } = await checkUserPermission(["traveler"]);

  if (status !== "ok") {
    redirectToLogin(await buildReturnUrl("/payment/confirm", searchParams));
  }

  return (
    <Suspense fallback="...">
      <ConfirmPayment />
    </Suspense>
  );
}
