import { checkUserPermission, redirectToLogin } from "@lib/login-utils";
import TravelerDashboard from "./traveler-dashboard";

export default async function TravelerDashboardPage() {
  const { status } = await checkUserPermission(["traveler"]);

  if (status !== "ok") {
    redirectToLogin("/travelers/dashboard");
  }

  return <TravelerDashboard />;
}
