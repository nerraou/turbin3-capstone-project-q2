import { login, type LoginApiData, type LoginApiResponse } from "@lib/api";
import { useMutation } from "@tanstack/react-query";

export default function useLoginMutation() {
  return useMutation<LoginApiResponse, LoginApiResponse, LoginApiData>({
    mutationFn: login,
  });
}
