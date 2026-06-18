import { checkUserPermission, redirectToLogin } from "@lib/login-utils";
import MerchantDashboard from "./merchant-dashboard";

export default async function MerchantDashboardPage() {
  const { status } = await checkUserPermission(["merchant"]);

  if (status !== "ok") {
    redirectToLogin("/merchants/dashboard");
  }

  return <MerchantDashboard />;
}
