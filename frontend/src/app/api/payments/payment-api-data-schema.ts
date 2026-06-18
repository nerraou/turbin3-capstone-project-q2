import { z } from "zod";

const amountInputSchema = z.union([z.string(), z.number(), z.bigint()]);

const paymentApiDataSchema = z
  .object({
    merchant: z.string().trim().min(1, "Missing merchant"),
    amount: amountInputSchema.optional(),
    amountUsd: amountInputSchema.optional(),
  })
  .refine((data) => data.amount !== undefined || data.amountUsd !== undefined, {
    message: "Missing amountUsd",
    path: ["amountUsd"],
  });

export default paymentApiDataSchema;
export type PaymentApiData = z.infer<typeof paymentApiDataSchema>;
