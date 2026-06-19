import { AuthenticatedNavbar } from "@components/authenticated-navbar";
import { GuestNavbar } from "@components/guest-navbar";
import { dashboardsUrls } from "@lib/dashboards-urls";
import { type UserRole } from "@lib/database/schema/users";
import { type ReactNode } from "react";

type PageLayoutProps = {
  children: ReactNode;
} & (
  | {
      isAuthenticated: true;
      role: UserRole;
    }
  | {
      isAuthenticated: false;
      role: undefined;
    }
);

export async function PageLayout(props: PageLayoutProps) {
  const { children, isAuthenticated, role } = props;

  let navbar: ReactNode;

  if (isAuthenticated) {
    const dashboardUrl = dashboardsUrls[role];
    navbar = <AuthenticatedNavbar dashboardUrl={dashboardUrl} />;
  } else {
    navbar = <GuestNavbar />;
  }

  return (
    <>
      {navbar}
      {children}
    </>
  );
}
