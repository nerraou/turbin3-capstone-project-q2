"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const merchantRegisterFormSchema = z.object({
  username: z.string().trim().lowercase(),
  password: z.string(),
  name: z.string().trim(),
});

export type MerchantRegisterFormFieldValues = z.infer<
  typeof merchantRegisterFormSchema
>;

export default function useMerchantRegisterForm() {
  return useForm({
    resolver: zodResolver(merchantRegisterFormSchema),
  });
}
