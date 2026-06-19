import { LoginFormFieldValues } from "@app/login/use-login-form";
import { type UserRole } from "@lib/database/schema/users";
import { LOGIN_ENDPOINT } from "../endpoints";

export type LoginApiData = Pick<LoginFormFieldValues, "username" | "password">;
export interface LoginApiResponse {
  ok: boolean;
  status: number;
  data: {
    message: string;
    role: UserRole;
  };
}

export async function login(data: LoginApiData): Promise<LoginApiResponse> {
  const response = await fetch(LOGIN_ENDPOINT, {
    method: "POST",
    body: JSON.stringify(data),
  });

  return {
    ok: response.ok,
    status: response.status,
    data: await response.json(),
  };
}
