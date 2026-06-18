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
  merchant: string;
  gross: AmountView;
  merchantAmount: AmountView;
  protocolFee: AmountView;
  timestamp: string;
}

interface TravelerDashboardData {
  success: boolean;
  error?: string;
  travelerWallet: string;
  travelerAccount: string;
  protocolConfig: string;
  treasury: string;
  mint: string;
  status: string;
  paymentCount: string;
  balance: AmountView & { ata: string };
  totals: {
    paid: AmountView;
  };
  payments: PaymentReceiptView[];
}

async function fetchTravelerDashboard() {
  const response = await fetch("/api/travelers/me");
  const data = (await response.json()) as TravelerDashboardData;

  if (!response.ok || !data.success) {
    throw new Error(data.error ?? "Failed to load traveler dashboard");
  }

  return data;
}

function formatDate(timestamp: string) {
  return new Date(Number(timestamp) * 1000).toLocaleString();
}

export default function TravelerDashboard() {
  const dashboardQuery = useQuery({
    queryKey: ["traveler-dashboard"],
    queryFn: fetchTravelerDashboard,
  });

  return (
    <DashboardShell
      title="Traveler Dashboard"
      description="Your TravelUSD balance, account status, and payment history."
    >
      {dashboardQuery.isLoading ? <LoadingState /> : null}

      {dashboardQuery.isError ? (
        <ErrorState message={dashboardQuery.error.message} />
      ) : null}

      {dashboardQuery.data ? (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard
              label="Available Balance"
              value={formatUsd(dashboardQuery.data.balance)}
              detail={`${dashboardQuery.data.balance.amount} base units`}
            />
            <StatCard
              label="Total Paid"
              value={formatUsd(dashboardQuery.data.totals.paid)}
              detail={`${dashboardQuery.data.paymentCount} payment(s)`}
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
                  value: dashboardQuery.data.travelerWallet,
                },
                {
                  label: "Traveler PDA",
                  value: dashboardQuery.data.travelerAccount,
                },
                {
                  label: "Token ATA",
                  value: dashboardQuery.data.balance.ata,
                },
                {
                  label: "Mint",
                  value: dashboardQuery.data.mint,
                },
              ]}
            />

            <Card>
              <CardHeader>
                <CardTitle>Recent Payments</CardTitle>
                <CardDescription>
                  Latest merchant payments made with TravelUSD.
                </CardDescription>
              </CardHeader>
              <Separator />
              <CardContent className="pt-4">
                {dashboardQuery.data.payments.length === 0 ? (
                  <EmptyState>No payments yet.</EmptyState>
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
                              {formatUsd(payment.gross)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Merchant {compactAddress(payment.merchant)}
                            </div>
                          </div>
                          <div className="text-right text-xs text-muted-foreground">
                            {formatDate(payment.timestamp)}
                          </div>
                        </div>
                        <div className="mt-3 grid gap-2 text-xs text-muted-foreground md:grid-cols-3">
                          <span>
                            Merchant: {formatUsd(payment.merchantAmount)}
                          </span>
                          <span>Fee: {formatUsd(payment.protocolFee)}</span>
                          <span>
                            Receipt: {compactAddress(payment.receipt)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : null}
    </DashboardShell>
  );
}
