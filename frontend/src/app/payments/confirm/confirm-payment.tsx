"use client";

import { Button } from "@components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Separator } from "@components/ui/separator";

export default function ConfirmPayment() {
  const payment = {
    merchantName: "Atlas Travel Marketplace",
    paymentReference: "PAY_123456",
    total: 3149,
  };

  const walletBalance = 5000;

  return (
    <div className="container mx-auto max-w-2xl py-10">
      <Card>
        <CardHeader>
          <CardTitle>Confirm Payment</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
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
            <div className="flex justify-between">
              <span>Wallet Balance</span>
              <span>{walletBalance.toFixed(2)} MAD</span>
            </div>

            <div className="flex justify-between text-lg font-semibold">
              <span>Total</span>
              <span>{payment.total.toFixed(2)} MAD</span>
            </div>
          </div>

          <Button className="w-full" size="lg">
            Confirm Purchase
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
