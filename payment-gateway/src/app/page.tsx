import { Suspense } from "react";
import { PaymentForm } from "./payment-form";

export default function Page() {
  return (
    <Suspense fallback="...">
      <PaymentForm />
    </Suspense>
  );
}
