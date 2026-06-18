import { checkUserPermission, redirectToLogin } from "@lib/login-utils";
import { Suspense } from "react";
import ConfirmPayment from "./confirm-payment";

export default async function ConfirmPaymentPage() {
  const { status } = await checkUserPermission(["traveler"]);

  if (status !== "ok") {
    redirectToLogin("/payments/confirm");
  }

  return (
    <Suspense fallback="...">
      <ConfirmPayment />
    </Suspense>
  );
}
