import { Keypair } from "@solana/web3.js";
import { ALGO } from "./consts";
import { decrypt } from "./decrypt";

export async function decryptWalletEncryption(
  kek: Buffer,
  encryptedPrivateKey: string,
  encryptedDek: string,
) {
  const dek = decrypt(kek, encryptedDek, ALGO);

  console.log({ dek });

  const privateKey = decrypt(dek, encryptedPrivateKey, ALGO);

  const jwk = JSON.parse(privateKey.toString("utf-8")) as JsonWebKey;

  //   console.log("decryptWalletEncryption:private-key", jwk.d);

  const seed = Buffer.from(jwk.d!, "base64url");
  const keypair = Keypair.fromSeed(seed);

  //   console.log(
  //     "decryptWalletEncryption:key-pair:private-key",
  //     keypair.secretKey,
  //     keypair.publicKey,
  //   );

  return keypair;
}
