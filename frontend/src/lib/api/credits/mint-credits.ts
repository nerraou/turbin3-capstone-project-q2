import { MintCreditsData } from "@app/api/credits/mint/mint-credits-schema";
import { MINT_CREDITS_ENDPOINT } from "../endpoints";

export type MintCreditsApiData = MintCreditsData;
export interface MintCreditsApiResponse {
  ok: boolean;
  status: number;
  data: {
    message: string;
  };
}

export async function mintCredits(
  data: MintCreditsApiData,
): Promise<MintCreditsApiResponse> {
  const response = await fetch(MINT_CREDITS_ENDPOINT, {
    method: "POST",
    body: JSON.stringify(data),
  });

  return {
    ok: response.ok,
    status: response.status,
    data: await response.json(),
  };
}
