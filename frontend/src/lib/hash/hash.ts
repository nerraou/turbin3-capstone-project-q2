import bcrypt from "bcrypt";

export function hash(value: string) {
  return bcrypt.hash(value, 12);
}
