import { TravelerRegisterFormFieldValues } from "@app/travelers/register/use-traveler-register-form";
import { TRAVELER_REGISTER_ENDPOINT } from "../endpoints";

export type TravelerRegisterApiData = Pick<
  TravelerRegisterFormFieldValues,
  "username" | "password"
>;
export interface TravelerRegisterApiResponse {
  ok: boolean;
  status: number;
  data: {
    message: string;
  };
}

export async function registerTraveler(
  data: TravelerRegisterApiData,
): Promise<TravelerRegisterApiResponse> {
  const response = await fetch(TRAVELER_REGISTER_ENDPOINT, {
    method: "POST",
    body: JSON.stringify(data),
  });

  return {
    ok: response.ok,
    status: response.status,
    data: await response.json(),
  };
}
