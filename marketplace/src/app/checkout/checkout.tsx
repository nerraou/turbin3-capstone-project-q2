"use client";

import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Separator } from "@components/ui/separator";
import { useIsMounted } from "@hooks/use-is-mounted";
import { useRouter } from "next/navigation";
import { useCart } from "react-use-cart";

const merchantName = "Atlas Travel Marketplace";
const merchantUsername = "atlas.travel";

function getPaymentConfirmUrl(cartTotal: number) {
  const paymentConfirmUrl = process.env.NEXT_PUBLIC_PAYMENT_CONFIRM_URL;

  const queryParams = new URLSearchParams({
    merchantName,
    amountUsd: cartTotal.toFixed(2),
    currency: "$",
    ref: `MKT_${Date.now()}`,
    merchant: merchantUsername,
    returnUrl: `${window.location.origin}?payment_success=true`,
  });

  return `${paymentConfirmUrl}?${queryParams.toString()}`;
}

function getItemType(item: unknown) {
  if (!item || typeof item !== "object" || !("metadata" in item)) {
    return "item";
  }

  const metadata = item.metadata;

  if (!metadata || typeof metadata !== "object" || !("type" in metadata)) {
    return "item";
  }

  return typeof metadata.type === "string"
    ? metadata.type.replaceAll("_", " ")
    : "item";
}

export default function Checkout() {
  const { items, totalItems, cartTotal, isEmpty, emptyCart } = useCart();
  const isMounted = useIsMounted();
  const paymentConfirmUrl = isMounted ? getPaymentConfirmUrl(cartTotal) : "";
  const router = useRouter();

  if (!isMounted) {
    return null;
  }

  return (
    <main className="container mx-auto">
      <h1 className="my-16 text-3xl font-bold">Checkout</h1>

      <Card className="mx-auto max-w-md">
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex items-start justify-between">
              <div>
                <p className="font-medium">{item.name}</p>

                <div className="mt-1 flex gap-2">
                  <Badge variant="secondary">{getItemType(item)}</Badge>

                  <span className="text-sm text-muted-foreground">
                    x{item.quantity}
                  </span>
                </div>
              </div>

              <p className="font-semibold">
                ${(item.price * (item.quantity ?? 1)).toLocaleString()}
              </p>
            </div>
          ))}

          <Separator />

          <div className="flex justify-between text-lg font-bold">
            <span>Total for {totalItems} items</span>
            <span>${cartTotal.toLocaleString()}</span>
          </div>

          {!paymentConfirmUrl ? (
            <p className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
              Missing marketplace merchant wallet. Set
              NEXT_PUBLIC_MARKETPLACE_MERCHANT_WALLET.
            </p>
          ) : null}

          <Button
            className="h-11 w-full text-base"
            disabled={isEmpty || !paymentConfirmUrl}
            onClick={() => {
              emptyCart();
              router.push(paymentConfirmUrl);
            }}
          >
            Pay ${cartTotal.toLocaleString()}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Secure payment powered by PaymentGateway
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
