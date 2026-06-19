"use client";

import { BedDouble, CheckCircle2, ShoppingBag } from "lucide-react";
import Link from "next/link";

import { Button } from "@components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@components/ui/card";
import { useSearchParams } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@components/ui/alert";

interface PaymentSuccessAlertProps {
  classsName?: string;
}

function PaymentSuccessAlert(props: PaymentSuccessAlertProps) {
  return (
    <Alert className={props.classsName}>
      <CheckCircle2 className="h-4 w-4" />

      <AlertTitle>Payment Successful</AlertTitle>

      <AlertDescription>
        Your payment has been processed successfully. Your AppUSD balance has
        been updated and is ready to use.
      </AlertDescription>
    </Alert>
  );
}

export default function HomePage() {
  const searchParams = useSearchParams();

  const isPaymentSuccess = searchParams.get("payment_success") === "true";

  return (
    <main className="container mx-auto px-6 py-16">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-5xl font-bold tracking-tight">Welcome</h1>

        <p className="mt-4 text-lg text-muted-foreground">
          Book hotel rooms and discover local products during your journey.
        </p>
      </div>

      {isPaymentSuccess && (
        <PaymentSuccessAlert classsName="mx-auto max-w-5xl mt-16" />
      )}

      <div className="mx-auto mt-16 grid max-w-5xl gap-6 md:grid-cols-2">
        <Card className="transition-shadow hover:shadow-lg">
          <CardHeader>
            <div className="mb-4">
              <BedDouble className="h-10 w-10" />
            </div>

            <CardTitle>Hotel Rooms</CardTitle>

            <CardDescription>
              Browse available rooms and book your stay.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Button className="w-full">
              <Link className="w-full" href="/rooms">
                Browse Rooms
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="transition-shadow hover:shadow-lg">
          <CardHeader>
            <div className="mb-4">
              <ShoppingBag className="h-10 w-10" />
            </div>

            <CardTitle>Products</CardTitle>

            <CardDescription>Shop souvenirs and local goods.</CardDescription>
          </CardHeader>

          <CardContent>
            <Button className="w-full">
              <Link className="w-full" href="/products">
                Browse Products
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
