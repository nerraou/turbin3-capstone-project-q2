"use client";

import { Button } from "@components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@components/ui/card";
import { Separator } from "@components/ui/separator";
import { AlertTriangle } from "lucide-react";
import useInitProtocolMutation from "./use-initilize-protocol-mutation";

export default function AdminDashboard() {
  const initProtocolMutation = useInitProtocolMutation();

  return (
    <main className="container mx-auto max-w-4xl py-10">
      <div className="mb-8 space-y-1">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>

        <p className="text-muted-foreground">
          Protocol administration and maintenance.
        </p>
      </div>

      <div className="grid gap-6">
        <Card className="border-destructive/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive" />

              <div>
                <CardTitle>Protocol Initialization</CardTitle>

                <CardDescription>
                  Initializes the protocol on-chain. This operation should only
                  be executed once.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <Separator />

          <CardContent className="space-y-4 pt-6">
            <div className="rounded-lg border bg-muted/40 p-4">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Creates protocol state accounts</li>
                <li>• Configures initial protocol settings</li>
                <li>• May fail if already initialized</li>
              </ul>
            </div>

            <Button
              size="lg"
              variant="destructive"
              className="w-full"
              onClick={() => {
                initProtocolMutation.mutate();
              }}
            >
              Initialize Protocol
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
