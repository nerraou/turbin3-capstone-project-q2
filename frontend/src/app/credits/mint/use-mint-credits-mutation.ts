import {
  mintCredits,
  type MintCreditsApiData,
  type MintCreditsApiResponse,
} from "@lib/api";
import { useMutation } from "@tanstack/react-query";

export default function useMintCreditsMutation() {
  return useMutation<
    MintCreditsApiResponse,
    MintCreditsApiResponse,
    MintCreditsApiData
  >({
    mutationFn: mintCredits,
  });
}
