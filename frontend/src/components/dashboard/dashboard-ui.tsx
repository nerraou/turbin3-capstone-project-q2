"use client";

import { Alert, AlertDescription, AlertTitle } from "@components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@components/ui/card";
import { Separator } from "@components/ui/separator";
import { cn } from "@lib/utils";
import { AlertCircle, Loader2 } from "lucide-react";
import type { ReactNode } from "react";

export interface AmountView {
  amount: string;
  amountUsd: string;
  currency: string;
  decimals: number;
}

export function formatUsd(amount?: AmountView) {
  if (!amount) {
    return "$0.00";
  }

  return `$${amount.amountUsd}`;
}

export function compactAddress(address?: string) {
  if (!address) {
    return "-";
  }

  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

export function titleCase(value?: string) {
  if (!value) {
    return "-";
  }

  return `${value[0].toUpperCase()}${value.slice(1)}`;
}

export function StatusPill({ status }: { status?: string }) {
  const isHealthy = status === "active" || status === "approved";

  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        isHealthy
          ? "border-foreground/15 bg-muted text-foreground"
          : "border-destructive/20 bg-destructive/10 text-destructive",
      )}
    >
      {titleCase(status)}
    </span>
  );
}

export function DashboardShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <main className="container mx-auto max-w-6xl px-4 py-8 md:py-10">
      <div className="mb-8 space-y-1">
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>

      {children}
    </main>
  );
}

export function StatCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl">{value}</CardTitle>
      </CardHeader>
      {detail ? (
        <>
          <Separator />
          <CardContent className="pt-4 text-xs text-muted-foreground">
            {detail}
          </CardContent>
        </>
      ) : null}
    </Card>
  );
}

export function InfoCard({
  title,
  description,
  rows,
}: {
  title: string;
  description?: string;
  rows: Array<{ label: string; value: ReactNode }>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <Separator />
      <CardContent className="space-y-3 pt-4">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-start justify-between gap-4 text-sm"
          >
            <span className="text-muted-foreground">{row.label}</span>
            <span className="max-w-[65%] text-right font-mono break-all">
              {row.value}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function LoadingState() {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Loader2 className="size-4 animate-spin" />
      Loading dashboard
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="size-4" />
      <AlertTitle>Could not load dashboard</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
      {children}
    </div>
  );
}
