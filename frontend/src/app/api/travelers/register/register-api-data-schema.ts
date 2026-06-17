import { z } from "zod";

const travelerRegisterApiDataSchema = z.object({
  username: z.string().trim().lowercase(),
  password: z.string(),
});

export default travelerRegisterApiDataSchema;
export type TravelerRegisterApiData = z.infer<
  typeof travelerRegisterApiDataSchema
>;
