"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const registerFormSchema = z.object({
  username: z.string().trim().lowercase(),
  password: z.string(),
});

export type RegisterFormFieldValues = z.infer<typeof registerFormSchema>;

export default function useRegisterForm() {
  return useForm({
    resolver: zodResolver(registerFormSchema),
  });
}
