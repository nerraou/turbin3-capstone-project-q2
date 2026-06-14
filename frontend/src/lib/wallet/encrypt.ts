import crypto, { BinaryLike, CipherGCMTypes } from "node:crypto";

export function encrypt(
  encryptionKey: Buffer,
  data: string | BinaryLike,
  algo: CipherGCMTypes,
) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(algo, encryptionKey, iv);

  let cipherBuffer: Buffer;

  if (typeof data === "string") {
    cipherBuffer = cipher.update(data, "utf-8");
  } else {
    cipherBuffer = cipher.update(data);
  }

  const cipherText = Buffer.concat([cipherBuffer, cipher.final()]);

  const tag = cipher.getAuthTag();

  return [iv, tag, cipherText];
}
