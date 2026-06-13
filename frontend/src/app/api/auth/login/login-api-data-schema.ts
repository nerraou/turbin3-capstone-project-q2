import { z } from "zod";

const loginApiDataSchema = z.object({
  username: z.string().trim().lowercase(),
  password: z.string(),
});

export default loginApiDataSchema;
export type LoginApiData = z.infer<typeof loginApiDataSchema>;
