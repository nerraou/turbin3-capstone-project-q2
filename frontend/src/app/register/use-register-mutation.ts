import {
  register,
  type RegisterApiData,
  type RegisterApiResponse,
} from "@lib/api";
import { useMutation } from "@tanstack/react-query";

export default function useRegisterMutation() {
  return useMutation<RegisterApiResponse, RegisterApiResponse, RegisterApiData>(
    {
      mutationFn: register,
    },
  );
}
