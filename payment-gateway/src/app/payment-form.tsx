"use client";

import InputFormController from "@components/input-form-controller";
import { Button } from "@components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import useExternalRedirectUrl from "@hooks/use-external-redirect-url";
import { CreditCard, Lock } from "lucide-react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

export const paymentFormSchema = z.object({
  cardNumber: z
    .string()
    .min(1, "Card number is required")
    .regex(/^\d{4}\s?\d{4}\s?\d{4}\s?\d{4}$/, "Invalid card number"),

  cardholderName: z.string().min(2, "Cardholder name is required").max(100),

  expiryDate: z
    .string()
    .min(1, "Expiry date is required")
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Invalid expiry date"),

  cvv: z
    .string()
    .min(3)
    .max(4)
    .regex(/^\d{3,4}$/, "Invalid CVV"),

  email: z.email("Invalid email").optional().or(z.literal("")),
});

export type PaymentFormValues = z.infer<typeof paymentFormSchema>;
export function PaymentForm() {
  const redirect = useExternalRedirectUrl();
  const searchParams = useSearchParams();

  const { control, handleSubmit } = useForm({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      cardholderName: "",
      cardNumber: "",
      cvv: "",
      expiryDate: "",
    },
  });

  const formattedAmount = `${searchParams.get("amount")} ${searchParams.get("currency")}`;

  function onFormSubmit() {
    redirect();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-primary p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <CreditCard className="h-10 w-10 text-primary" />
          </div>

          <CardTitle className="text-center">Secure Payment</CardTitle>

          <div className="rounded-lg border bg-muted/40 p-4">
            <div className="flex justify-between text-sm">
              <span>Merchant</span>
              <span className="font-medium">Travel Booking Platform</span>
            </div>

            <div className="mt-2 flex justify-between text-sm">
              <span>Amount</span>
              <span className="font-semibold">{formattedAmount}</span>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit(onFormSubmit)}>
            <InputFormController
              control={control}
              name="cardNumber"
              label="Card Number"
              inputProps={{
                placeholder: "1234 5678 9012 3456",
                autoComplete: "cc-number",
              }}
            />

            <InputFormController
              control={control}
              name="cardholderName"
              label="Cardholder Name"
              inputProps={{
                placeholder: "JOHN DOE",
                autoComplete: "cc-name",
              }}
            />

            <div className="grid grid-cols-2 gap-3">
              <InputFormController
                control={control}
                name="expiryDate"
                label="Expiry Date"
                inputProps={{
                  placeholder: "MM/YY",
                  autoComplete: "cc-exp",
                }}
              />

              <InputFormController
                control={control}
                name="cvv"
                label="CVV"
                inputProps={{
                  placeholder: "123",
                  autoComplete: "cc-csc",
                }}
              />
            </div>

            <InputFormController
              control={control}
              name="email"
              label="Email (optional)"
              inputProps={{
                placeholder: "john@exmaple.com",
              }}
            />

            <div className="flex justify-center gap-2 py-2">
              <Image
                src="/visa.svg"
                alt="Visa"
                className="w-14"
                width={780}
                height={500}
              />

              <Image
                src="/mastercard.svg"
                alt="Mastercard"
                className="w-14"
                width={780}
                height={500}
              />
            </div>

            <Button type="submit" className="h-11 w-full text-base">
              Pay {formattedAmount}
            </Button>

            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Lock className="h-3 w-3" />
              <span>Your payment is protected with SSL encryption</span>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
