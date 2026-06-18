import { MerchantRegisterFormFieldValues } from "@app/merchants/register/use-merchant-register-form";
import { MERCHANTS_REGISTER_ENDPOINT } from "../endpoints";

export type MerchantRegisterApiData = Pick<
  MerchantRegisterFormFieldValues,
  "username" | "password"
>;
export interface MerchantRegisterApiResponse {
  ok: boolean;
  status: number;
  data: {
    message: string;
  };
}

export async function registerMerchant(
  data: MerchantRegisterApiData,
): Promise<MerchantRegisterApiResponse> {
  const response = await fetch(MERCHANTS_REGISTER_ENDPOINT, {
    method: "POST",
    body: JSON.stringify(data),
  });

  return {
    ok: response.ok,
    status: response.status,
    data: await response.json(),
  };
}
