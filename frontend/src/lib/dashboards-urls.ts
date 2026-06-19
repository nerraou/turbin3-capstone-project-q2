import { UserRole } from "./database/schema/users";

export const dashboardsUrls: Record<UserRole, string> = {
  traveler: "/travelers/dashboard",
  admin: "/admin/dashboard",
  merchant: "/merchants/dashboard",
};
