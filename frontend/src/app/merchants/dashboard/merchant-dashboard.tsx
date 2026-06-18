"use client";

import {
  AmountView,
  compactAddress,
  DashboardShell,
  EmptyState,
  ErrorState,
  formatUsd,
  InfoCard,
  LoadingState,
  StatCard,
  StatusPill,
  titleCase,
} from "@components/dashboard/dashboard-ui";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@components/ui/card";
import { Separator } from "@components/ui/separator";
import { useQuery } from "@tanstack/react-query";

interface PaymentReceiptView {
  receipt: string;
  traveler: string;
  gross: AmountView;
  merchantAmount: AmountView;
  protocolFee: AmountView;
  timestamp: string;
}

interface RedemptionView {
  redemptionRequest: string;
  id: string;
  amount: AmountView;
  status: string;
}

interface MerchantDashboardData {
  success: boolean;
  error?: string;
  merchantWallet: string;
  merchantAccount: string;
  protocolConfig: string;
  treasury: string;
  mint: string;
  status: string;
  balance: AmountView & { ata: string };
  totals: {
    received: AmountView;
    redeemed: AmountView;
    pendingRedemption: AmountView;
  };
  redemptionCount: string;
  payments: PaymentReceiptView[];
  redemptions: RedemptionView[];
}

async function fetchMerchantDashboard() {
  const response = await fetch("/api/merchants/me");
  const data = (await response.json()) as MerchantDashboardData;

  if (!response.ok || !data.success) {
    throw new Error(data.error ?? "Failed to load merchant dashboard");
  }

  return data;
}

function formatDate(timestamp: string) {
  return new Date(Number(timestamp) * 1000).toLocaleString();
}

export default function MerchantDashboard() {
  const dashboardQuery = useQuery({
    queryKey: ["merchant-dashboard"],
    queryFn: fetchMerchantDashboard,
  });

  return (
    <DashboardShell
      title="Merchant Dashboard"
      description="Track received TravelUSD, redemption status, and customer payments."
    >
      {dashboardQuery.isLoading ? <LoadingState /> : null}

      {dashboardQuery.isError ? (
        <ErrorState message={dashboardQuery.error.message} />
      ) : null}

      {dashboardQuery.data ? (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard
              label="Available Balance"
              value={formatUsd(dashboardQuery.data.balance)}
              detail={`${dashboardQuery.data.balance.amount} base units`}
            />
            <StatCard
              label="Total Received"
              value={formatUsd(dashboardQuery.data.totals.received)}
            />
            <StatCard
              label="Total Redeemed"
              value={formatUsd(dashboardQuery.data.totals.redeemed)}
            />
            <Card>
              <CardHeader>
                <CardDescription>Status</CardDescription>
                <CardTitle>
                  <StatusPill status={dashboardQuery.data.status} />
                </CardTitle>
              </CardHeader>
              <Separator />
              <CardContent className="pt-4">
                <button
                  type="button"
                  className="inline-flex h-9 w-full items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground"
                  onClick={() => {
                    void dashboardQuery.refetch();
                  }}
                >
                  Refresh
                </button>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr_2fr]">
            <InfoCard
              title="Account"
              rows={[
                {
                  label: "Wallet",
                  value: dashboardQuery.data.merchantWallet,
                },
                {
                  label: "Merchant PDA",
                  value: dashboardQuery.data.merchantAccount,
                },
                {
                  label: "Token ATA",
                  value: dashboardQuery.data.balance.ata,
                },
                {
                  label: "Redemptions",
                  value: dashboardQuery.data.redemptionCount,
                },
              ]}
            />

            <Card>
              <CardHeader>
                <CardTitle>Redemptions</CardTitle>
                <CardDescription>
                  Redemption requests created from your merchant balance.
                </CardDescription>
              </CardHeader>
              <Separator />
              <CardContent className="space-y-3 pt-4">
                <div className="rounded-lg bg-muted/50 p-3 text-sm">
                  Pending:{" "}
                  <span className="font-medium">
                    {formatUsd(dashboardQuery.data.totals.pendingRedemption)}
                  </span>
                </div>

                {dashboardQuery.data.redemptions.length === 0 ? (
                  <EmptyState>No redemption requests yet.</EmptyState>
                ) : (
                  <div className="space-y-3">
                    {dashboardQuery.data.redemptions.map((redemption) => (
                      <div
                        key={redemption.redemptionRequest}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4 text-sm"
                      >
                        <div>
                          <div className="font-medium">
                            {formatUsd(redemption.amount)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Request #{redemption.id} ·{" "}
                            {compactAddress(redemption.redemptionRequest)}
                          </div>
                        </div>
                        <StatusPill status={redemption.status} />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Payments</CardTitle>
              <CardDescription>
                Latest TravelUSD payments received from travelers.
              </CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="pt-4">
              {dashboardQuery.data.payments.length === 0 ? (
                <EmptyState>No payments received yet.</EmptyState>
              ) : (
                <div className="space-y-3">
                  {dashboardQuery.data.payments.map((payment) => (
                    <div
                      key={payment.receipt}
                      className="rounded-lg border p-4 text-sm"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <div className="font-medium">
                            {formatUsd(payment.merchantAmount)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Traveler {compactAddress(payment.traveler)}
                          </div>
                        </div>
                        <div className="text-right text-xs text-muted-foreground">
                          {formatDate(payment.timestamp)}
                        </div>
                      </div>
                      <div className="mt-3 grid gap-2 text-xs text-muted-foreground md:grid-cols-4">
                        <span>Gross: {formatUsd(payment.gross)}</span>
                        <span>Fee: {formatUsd(payment.protocolFee)}</span>
                        <span>
                          Status: {titleCase(dashboardQuery.data.status)}
                        </span>
                        <span>Receipt: {compactAddress(payment.receipt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : null}
    </DashboardShell>
  );
}
