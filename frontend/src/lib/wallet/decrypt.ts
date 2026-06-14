import crypto, { CipherGCMTypes } from "node:crypto";
import { IV_LENGTH, TAG_LENGTH } from "./consts";

export function decrypt(
  encryptionKey: Buffer,
  encryptedBlob: string,
  algo: CipherGCMTypes,
): Buffer {
  const data = Buffer.from(encryptedBlob, "base64");

  const iv = data.subarray(0, IV_LENGTH);
  const tag = data.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
  const cipherText = data.subarray(IV_LENGTH + TAG_LENGTH);

  const decipher = crypto.createDecipheriv(algo, encryptionKey, iv);

  decipher.setAuthTag(tag);

  return Buffer.concat([decipher.update(cipherText), decipher.final()]);
}
