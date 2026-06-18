"use client";

import {
  compactAddress,
  DashboardShell,
  EmptyState,
  ErrorState,
  LoadingState,
  StatusPill,
} from "@components/dashboard/dashboard-ui";
import { Alert, AlertDescription } from "@components/ui/alert";
import { Button } from "@components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@components/ui/card";
import { Separator } from "@components/ui/separator";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import useInitProtocolMutation from "./use-initilize-protocol-mutation";

interface AdminRedemptionView {
  id: string;
  merchantUserId: string;
  merchantWallet: string;
  merchantAccount: string;
  merchantAta: string;
  redemptionRequest: string;
  redemptionId: string;
  amount: string;
  amountUsd: string;
  currency: string;
  decimals: number;
  status: string;
  requestTx: string;
  approveTx?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface AdminRedemptionsResponse {
  success: boolean;
  error?: string;
  redemptions: AdminRedemptionView[];
}

async function fetchPendingRedemptions() {
  const response = await fetch("/api/redemptions");
  const data = (await response.json()) as AdminRedemptionsResponse;

  if (!response.ok || !data.success) {
    throw new Error(data.error ?? "Failed to load redemptions");
  }

  return data.redemptions;
}

async function approveRedemption(redemption: AdminRedemptionView) {
  const response = await fetch("/api/redemptions/approve", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      merchantWallet: redemption.merchantWallet,
      redemptionId: redemption.redemptionId,
    }),
  });
  const data = (await response.json()) as {
    success: boolean;
    error?: string;
  };

  if (!response.ok || !data.success) {
    throw new Error(data.error ?? "Failed to approve redemption");
  }

  return data;
}

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const initProtocolMutation = useInitProtocolMutation();
  const redemptionsQuery = useQuery({
    queryKey: ["admin-redemptions"],
    queryFn: fetchPendingRedemptions,
  });
  const approveRedemptionMutation = useMutation({
    mutationFn: approveRedemption,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin-redemptions"],
      });
    },
  });

  return (
    <DashboardShell
      title="Admin Dashboard"
      description="Protocol administration, maintenance, and redemption approvals."
    >
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

        <Card>
          <CardHeader>
            <CardTitle>Pending Redemptions</CardTitle>
            <CardDescription>
              Merchant redemption requests waiting for admin approval.
            </CardDescription>
          </CardHeader>

          <Separator />

          <CardContent className="space-y-4 pt-6">
            {approveRedemptionMutation.isError ? (
              <Alert variant="destructive">
                <AlertDescription>
                  {approveRedemptionMutation.error.message}
                </AlertDescription>
              </Alert>
            ) : null}

            {approveRedemptionMutation.isSuccess ? (
              <Alert>
                <AlertDescription>Redemption approved.</AlertDescription>
              </Alert>
            ) : null}

            {redemptionsQuery.isLoading ? <LoadingState /> : null}

            {redemptionsQuery.isError ? (
              <ErrorState message={redemptionsQuery.error.message} />
            ) : null}

            {redemptionsQuery.data?.length === 0 ? (
              <EmptyState>No pending redemption requests.</EmptyState>
            ) : null}

            {redemptionsQuery.data?.map((redemption) => (
              <div
                key={redemption.redemptionRequest}
                className="rounded-lg border p-4 text-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-base font-medium">
                      ${redemption.amountUsd}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Request #{redemption.redemptionId} · Merchant{" "}
                      {compactAddress(redemption.merchantWallet)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Created {formatDate(redemption.createdAt)}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <StatusPill status={redemption.status} />
                    <Button
                      type="button"
                      disabled={approveRedemptionMutation.isPending}
                      onClick={() => {
                        approveRedemptionMutation.mutate(redemption);
                      }}
                    >
                      Approve
                    </Button>
                  </div>
                </div>

                <div className="mt-4 grid gap-2 text-xs text-muted-foreground md:grid-cols-3">
                  <span>
                    Redemption PDA:{" "}
                    {compactAddress(redemption.redemptionRequest)}
                  </span>
                  <span>
                    Merchant PDA: {compactAddress(redemption.merchantAccount)}
                  </span>
                  <span>Tx: {compactAddress(redemption.requestTx)}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
