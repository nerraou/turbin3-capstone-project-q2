import { z } from "zod";

const mintCreditsSchema = z.object({
  travelerWallet: z.string(),
  amount: z.coerce.bigint().positive(),
});

export default mintCreditsSchema;
export type MintCreditsData = z.infer<typeof mintCreditsSchema>;
