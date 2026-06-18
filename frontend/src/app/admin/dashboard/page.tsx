import { checkUserPermission, redirectToLogin } from "@lib/login-utils";
import AdminDashboard from "./admin-dashboard";

export default async function AdminDashboardPage() {
  const { status } = await checkUserPermission(["admin"]);

  if (status !== "ok") {
    redirectToLogin("/admin/dashboard");
  }

  return <AdminDashboard />;
}
