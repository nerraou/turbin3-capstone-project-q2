import { z } from "zod";

const amountInputSchema = z.union([z.string(), z.number(), z.bigint()]);

const requestRedemptionApiDataSchema = z
  .object({
    amount: amountInputSchema.optional(),
    amountUsd: amountInputSchema.optional(),
  })
  .refine((data) => data.amount !== undefined || data.amountUsd !== undefined, {
    message: "Missing amountUsd",
    path: ["amountUsd"],
  });

export default requestRedemptionApiDataSchema;
export type RequestRedemptionApiData = z.infer<
  typeof requestRedemptionApiDataSchema
>;
