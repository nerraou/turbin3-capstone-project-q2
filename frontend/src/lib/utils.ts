import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function hasAttribute(
  obj: unknown,
  key: string,
): obj is Record<string, unknown> {
  if (typeof obj === "object" && obj !== null) {
    return key in obj;
  }
  return false;
}
