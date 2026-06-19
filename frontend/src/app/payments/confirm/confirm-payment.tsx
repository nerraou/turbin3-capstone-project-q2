"use client";

import { Alert, AlertDescription } from "@components/ui/alert";
import { Button } from "@components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Separator } from "@components/ui/separator";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

interface PaymentResponse {
  success: boolean;
  error?: string;
  tx?: string;
  paymentReceipt?: string;
  amountUsd?: string;
  currency?: string;
}

function buildPaymentReference() {
  return `PAY_${Date.now()}`;
}

export default function ConfirmPayment() {
  const searchParams = useSearchParams();
  const [isPaying, setIsPaying] = useState(false);
  const [paymentResult, setPaymentResult] = useState<PaymentResponse>();
  const [error, setError] = useState<string>();

  const payment = useMemo(
    () => ({
      merchantName:
        searchParams.get("merchantName") ?? "Atlas Travel Marketplace",
      paymentReference: searchParams.get("ref") ?? buildPaymentReference(),
      amountUsd: searchParams.get("amountUsd") ?? searchParams.get("amount"),
      currency: searchParams.get("currency") ?? "TravelUSD",
      returnUrl: searchParams.get("returnUrl"),
      merchant: searchParams.get("merchant") ?? "",
    }),
    [searchParams],
  );

  const total = Number(payment.amountUsd ?? "0");
  const isReady = payment.merchant.length > 0 && total > 0;

  async function confirmPayment() {
    if (!isReady || !payment.amountUsd) {
      setError("Missing merchant wallet or payment amount");
      return;
    }

    setError(undefined);
    setPaymentResult(undefined);
    setIsPaying(true);

    try {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amountUsd: payment.amountUsd,
          merchant: payment.merchant,
        }),
      });
      const data = (await response.json()) as PaymentResponse;

      if (!response.ok || !data.success) {
        throw new Error(data.error ?? "Payment failed");
      }

      setPaymentResult(data);
    } catch (paymentError) {
      setError(
        paymentError instanceof Error ? paymentError.message : "Payment failed",
      );
    } finally {
      setIsPaying(false);
    }
  }

  return (
    <div className="container mx-auto max-w-2xl py-10">
      <Card>
        <CardHeader>
          <CardTitle>Confirm Payment</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {!isReady ? (
            <Alert variant="destructive">
              <AlertDescription>
                Missing payment details. Please return to checkout and try
                again.
              </AlertDescription>
            </Alert>
          ) : null}

          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          {paymentResult ? (
            <Alert>
              <AlertDescription>
                Payment confirmed. Transaction {paymentResult.tx}
              </AlertDescription>
            </Alert>
          ) : null}

          <div>
            <p className="text-sm text-muted-foreground">Merchant</p>

            <p className="font-medium">{payment.merchantName}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Payment Reference</p>

            <p className="font-mono">{payment.paymentReference}</p>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex justify-between text-lg font-semibold">
              <span>Total</span>
              <span>
                {payment.currency}
                {total.toFixed(2)}
              </span>
            </div>
          </div>

          <Button
            className="w-full"
            size="lg"
            disabled={!isReady || isPaying || Boolean(paymentResult)}
            onClick={confirmPayment}
          >
            {isPaying ? "Confirming..." : "Confirm Purchase"}
          </Button>

          {paymentResult && payment.returnUrl ? (
            <Button
              className="w-full"
              size="lg"
              variant="outline"
              onClick={() => {
                window.location.href = payment.returnUrl ?? "/";
              }}
            >
              Return to Marketplace
            </Button>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
