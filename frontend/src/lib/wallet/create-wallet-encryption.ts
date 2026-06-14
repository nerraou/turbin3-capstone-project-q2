import crypto from "node:crypto";
import { ALGO } from "./consts";
import { encrypt } from "./encrypt";

export function createWalletEncryption(kek: Buffer, privateKeyJwk: JsonWebKey) {
  const dek = crypto.randomBytes(32);

  // encrypt private key with DEK
  const encryptedPrivateKeyBlob = Buffer.concat(
    encrypt(dek, JSON.stringify(privateKeyJwk), ALGO),
  ).toString("base64");

  // encrypt DEK with KEK
  const encryptedDekBlob = Buffer.concat(encrypt(kek, dek, ALGO)).toString(
    "base64",
  );

  return {
    encryptedPrivateKey: encryptedPrivateKeyBlob,
    encryptedDek: encryptedDekBlob,
  };
}
