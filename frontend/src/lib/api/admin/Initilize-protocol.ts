import { INITILIZE_PROTOCOL_ENDPOINT } from "../endpoints";

export interface InitilizeProtocolApiResponse {
  ok: boolean;
  status: number;
  data: {
    message: string;
  };
}

export async function initilizeProtocol(): Promise<InitilizeProtocolApiResponse> {
  const response = await fetch(INITILIZE_PROTOCOL_ENDPOINT, {
    method: "POST",
    body: JSON.stringify({}),
  });

  return {
    ok: response.ok,
    status: response.status,
    data: await response.json(),
  };
}
