import { checkUserPermission, redirectToLogin } from "@lib/login-utils";
import AdminDashboard from "./admin-dashboard";
import { PageLayout } from "@components/page-layout";

export default async function AdminDashboardPage() {
  const { status, payload } = await checkUserPermission(["admin"]);

  if (status !== "ok") {
    redirectToLogin("/admin/dashboard");
  }

  return (
    <PageLayout isAuthenticated role={payload.role}>
      <AdminDashboard />
    </PageLayout>
  );
}
