import {
  registerMerchant,
  type MerchantRegisterApiData,
  type MerchantRegisterApiResponse,
} from "@lib/api";
import { useMutation } from "@tanstack/react-query";

export default function useMerchantRegisterMutation() {
  return useMutation<
    MerchantRegisterApiResponse,
    MerchantRegisterApiResponse,
    MerchantRegisterApiData
  >({
    mutationFn: registerMerchant,
  });
}
