import bcrypt from "bcrypt";

export function compare(value: string, encrypted: string) {
  return bcrypt.compare(value, encrypted);
}
