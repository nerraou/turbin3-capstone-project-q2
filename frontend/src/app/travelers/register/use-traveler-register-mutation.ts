import {
  registerTraveler,
  type TravelerRegisterApiData,
  type TravelerRegisterApiResponse,
} from "@lib/api";
import { useMutation } from "@tanstack/react-query";

export default function useTravelerRegisterMutation() {
  return useMutation<
    TravelerRegisterApiResponse,
    TravelerRegisterApiResponse,
    TravelerRegisterApiData
  >({
    mutationFn: registerTraveler,
  });
}
