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
import { Button } from "@components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@components/ui/card";
import { Input } from "@components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@components/ui/popover";
import { Separator } from "@components/ui/separator";
import { travelUSDToBaseUnits } from "@lib/travel-usd-utils";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

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

interface PurchaseBalanceProps {
  paymentReference: string;
  wallet: string;
}

function PurchaseBalance(props: PurchaseBalanceProps) {
  const { paymentReference, wallet } = props;
  const [amount, setAmount] = useState("");

  function buildPaymentGatewayUrl() {
    const parsedAmount = parseInt(amount, 10);

    if (isNaN(parsedAmount)) {
      return "";
    }

    const paymentGatewayUrl = process.env.NEXT_PUBLIC_GATEWAY_URL;
    const hostUrl = process.env.NEXT_PUBLIC_HOST_URL;

    const amountInBaseUnit = travelUSDToBaseUnits(parsedAmount);

    const redirectUrl = `${hostUrl}/credits/mint`;
    const redirectUrlParams = new URLSearchParams({
      travelerWallet: wallet,
      amount: amountInBaseUnit.toString(),
    });

    const queryParams = new URLSearchParams({
      ref: paymentReference,
      redirectUrl: `${redirectUrl}?${redirectUrlParams.toString()}`,
      amount: amount.toString(),
      currency: "$",
    });

    return `${paymentGatewayUrl}?${queryParams.toString()}`;
  }

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button size="lg">
            <Plus />
            Get More
          </Button>
        }
      />

      <PopoverContent align="end" className="w-80 space-y-4">
        <div>
          <h4 className="font-medium">Buy Tokens</h4>

          <p className="text-sm text-muted-foreground">
            Enter the amount of tokens you want to purchase.
          </p>
        </div>

        <Input
          min={1}
          placeholder="$100"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <Button size="lg" className="w-full" disabled={!amount}>
          <Link className="w-full" href={buildPaymentGatewayUrl()}>
            Continue to Payment
          </Link>
        </Button>
      </PopoverContent>
    </Popover>
  );
}

interface TravelerDashboardProps {
  paymentReference: string;
}

export default function TravelerDashboard(props: TravelerDashboardProps) {
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
              detail={
                <div className="flex items-center justify-between">
                  {dashboardQuery.data.balance.amount} base units
                  <PurchaseBalance
                    paymentReference={props.paymentReference}
                    wallet={dashboardQuery.data.travelerWallet}
                  />
                </div>
              }
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
