import { ALGO } from "./consts";
import { decrypt } from "./decrypt";

export async function decryptWalletEncryption(
  kek: Buffer,
  encryptedPrivateKey: string,
  encryptedDek: string,
) {
  const dek = decrypt(kek, encryptedDek, ALGO);

  const privateKey = decrypt(dek, encryptedPrivateKey, ALGO);

  const jwkKey = await crypto.subtle.importKey(
    "jwk",
    JSON.parse(privateKey.toString("utf-8")) as JsonWebKey,
    {
      name: "Ed25519",
    },
    false,
    ["sign"],
  );

  return jwkKey;
}
