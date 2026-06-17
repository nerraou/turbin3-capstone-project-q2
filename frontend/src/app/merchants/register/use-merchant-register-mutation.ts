import {
  registerMerchant,
  type TravelerRegisterApiData,
  type TravelerRegisterApiResponse,
} from "@lib/api";
import { useMutation } from "@tanstack/react-query";

export default function useMerchantRegisterMutation() {
  return useMutation<
    TravelerRegisterApiResponse,
    TravelerRegisterApiResponse,
    TravelerRegisterApiData
  >({
    mutationFn: registerMerchant,
  });
}
