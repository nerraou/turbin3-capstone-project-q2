"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const loginFormSchema = z.object({
  username: z.string().trim().lowercase(),
  password: z.string(),
});

export type LoginFormFieldValues = z.infer<typeof loginFormSchema>;

export default function useLoginForm() {
  return useForm({
    resolver: zodResolver(loginFormSchema),
  });
}
