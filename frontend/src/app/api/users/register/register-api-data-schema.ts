import { z } from "zod";

const registerApiDataSchema = z.object({
  username: z.string().trim().lowercase(),
  password: z.string(),
});

export default registerApiDataSchema;
export type RegisterApiData = z.infer<typeof registerApiDataSchema>;
