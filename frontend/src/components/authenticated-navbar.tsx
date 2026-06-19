import { Button } from "@components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@components/ui/dropdown-menu";
import { User } from "lucide-react";
import Link from "next/link";
import ThemeToggle from "./theme-toggle";

interface AuthenticatedNavbarProps {
  dashboardUrl: string;
}

export function AuthenticatedNavbar(props: AuthenticatedNavbarProps) {
  const { dashboardUrl } = props;

  return (
    <header className="w-full border-b">
      <div className="container mx-auto flex h-16 items-center justify-between">
        <Link href={dashboardUrl} className="text-lg font-semibold">
          TravelRamp
        </Link>

        <nav className="flex items-center gap-6">
          <ThemeToggle />
          <Link href={dashboardUrl} className="text-sm font-medium">
            Dashboard
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="outline">
                  <User />
                </Button>
              }
            />

            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Link className="w-full" href="/api/auth/logout">
                  Logout
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>
    </header>
  );
}
