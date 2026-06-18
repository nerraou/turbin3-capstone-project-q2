import { z } from "zod";

const registerMerchantApiDataSchema = z.object({
  username: z.string().trim().lowercase(),
  password: z.string(),
  name: z.string(),
});

export default registerMerchantApiDataSchema;
export type RegisterMerchantApiData = z.infer<
  typeof registerMerchantApiDataSchema
>;
