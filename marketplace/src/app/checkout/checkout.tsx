"use client";

import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Separator } from "@components/ui/separator";
import { useIsMounted } from "@hooks/use-is-mounted";
import { useCart } from "react-use-cart";

export default function Checkout() {
  const { items, totalItems, cartTotal } = useCart();
  const isMounted = useIsMounted();

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
                  <Badge variant="secondary">{item.type}</Badge>

                  <span className="text-sm text-muted-foreground">
                    x{item.quantity}
                  </span>
                </div>
              </div>

              <p className="font-semibold">
                {(item.price * (item.quantity ?? 1)).toLocaleString()} MAD
              </p>
            </div>
          ))}

          <Separator />

          <div className="flex justify-between text-lg font-bold">
            <span>Total for {totalItems} items</span>
            <span>{cartTotal.toLocaleString()} MAD</span>
          </div>

          <Button className="h-11 w-full text-base">
            Pay {cartTotal.toLocaleString()} MAD
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Secure payment powered by PaymentGateway
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
