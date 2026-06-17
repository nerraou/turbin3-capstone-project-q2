"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const travelerRegisterFormSchema = z.object({
  username: z.string().trim().lowercase(),
  password: z.string(),
});

export type TravelerRegisterFormFieldValues = z.infer<
  typeof travelerRegisterFormSchema
>;

export default function useTravelerRegisterForm() {
  return useForm({
    resolver: zodResolver(travelerRegisterFormSchema),
  });
}
