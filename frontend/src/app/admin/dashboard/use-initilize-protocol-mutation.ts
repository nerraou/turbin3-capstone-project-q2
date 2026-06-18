import { initilizeProtocol, type InitilizeProtocolApiResponse } from "@lib/api";
import { useMutation } from "@tanstack/react-query";

export default function useInitProtocolMutation() {
  return useMutation<
    InitilizeProtocolApiResponse,
    InitilizeProtocolApiResponse
  >({
    mutationFn: initilizeProtocol,
  });
}
