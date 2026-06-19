import { Button } from "@components/ui/button";
import Link from "next/link";
import ThemeToggle from "./theme-toggle";

export function GuestNavbar() {
  return (
    <header className="w-full border-b">
      <div className="container mx-auto flex h-16 items-center justify-between">
        <Link href="/" className="text-lg font-semibold">
          TravelRamp
        </Link>

        <nav className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost">
            <Link href="/login">Login</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
