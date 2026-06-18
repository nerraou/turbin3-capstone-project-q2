import { z } from "zod";

const approveRedemptionApiDataSchema = z.object({
  merchantWallet: z.string().trim().min(1, "Missing merchantWallet"),
  redemptionId: z.union([z.string(), z.number()]).optional(),
});

export default approveRedemptionApiDataSchema;
export type ApproveRedemptionApiData = z.infer<
  typeof approveRedemptionApiDataSchema
>;
