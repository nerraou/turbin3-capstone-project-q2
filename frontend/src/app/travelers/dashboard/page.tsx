import { checkUserPermission, redirectToLogin } from "@lib/login-utils";
import { randomBytes } from "crypto";
import TravelerDashboard from "./traveler-dashboard";

function generatePaymentReference() {
  return `PAY-${Date.now()}-${randomBytes(3).toString("hex").toUpperCase()}`;
}

export default async function TravelerDashboardPage() {
  const { status } = await checkUserPermission(["traveler"]);

  if (status !== "ok") {
    redirectToLogin("/travelers/dashboard");
  }

  const paymentReference = generatePaymentReference();

  return <TravelerDashboard paymentReference={paymentReference} />;
}
