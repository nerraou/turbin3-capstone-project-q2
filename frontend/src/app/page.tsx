import { Separator } from "@base-ui/react";
import { Button } from "@components/ui/button";
import { dashboardsUrls } from "@lib/dashboards-urls";
import { checkUserPermission } from "@lib/login-utils";
import Link from "next/link";

export default async function HomePage() {
  const { status, payload } = await checkUserPermission([
    "admin",
    "merchant",
    "traveler",
  ]);

  const isAuthenticated = status === "ok";

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-xl text-center">
        <h1 className="text-5xl font-bold tracking-tight">
          Welcome to TravelRamp
        </h1>

        <p className="mt-4 text-muted-foreground">
          Purchase TravelUSD tokens and use them across supported marketplaces
          and merchants.
        </p>

        <div className="mt-8 flex justify-center gap-4">
          {isAuthenticated ? (
            <Button size="lg">
              <Link href={dashboardsUrls[payload.role]}>Go to Dashboard</Link>
            </Button>
          ) : (
            <div className="flex flex-col gap-2">
              <Button size="lg">
                <Link className="w-full" href="/login">
                  Login
                </Link>
              </Button>

              <Separator />

              <div className="flex gap-2">
                <Button variant="outline" size="lg">
                  <Link href="/travelers/register">
                    Create Traveler Account
                  </Link>
                </Button>

                <Button variant="outline" size="lg">
                  <Link href="/merchants/register">
                    Create Merchant Account
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
