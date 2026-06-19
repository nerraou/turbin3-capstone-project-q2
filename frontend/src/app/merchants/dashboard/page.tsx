import { checkUserPermission, redirectToLogin } from "@lib/login-utils";
import MerchantDashboard from "./merchant-dashboard";
import { PageLayout } from "@components/page-layout";

export default async function MerchantDashboardPage() {
  const { status, payload } = await checkUserPermission(["merchant"]);

  if (status !== "ok") {
    redirectToLogin("/merchants/dashboard");
  }

  return (
    <PageLayout isAuthenticated role={payload.role}>
      <MerchantDashboard />
    </PageLayout>
  );
}
