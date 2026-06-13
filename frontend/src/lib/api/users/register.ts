import { RegisterFormFieldValues } from "@app/register/use-register-form";
import { REGISTER_ENDPOINT } from "../endpoints";

export type RegisterApiData = Pick<
  RegisterFormFieldValues,
  "username" | "password"
>;
export interface RegisterApiResponse {
  ok: boolean;
  status: number;
  data: {
    message: string;
  };
}

export async function register(
  data: RegisterApiData,
): Promise<RegisterApiResponse> {
  const response = await fetch(REGISTER_ENDPOINT, {
    method: "POST",
    body: JSON.stringify(data),
  });

  return {
    ok: response.ok,
    status: response.status,
    data: await response.json(),
  };
}
