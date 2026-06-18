import "server-only";

import * as anchor from "@coral-xyz/anchor";
import {
  Keypair,
  PublicKey,
  Transaction,
  VersionedTransaction,
} from "@solana/web3.js";

export class BackendWallet implements anchor.Wallet {
  constructor(readonly payer: Keypair) {}

  get publicKey(): PublicKey {
    return this.payer.publicKey;
  }

  async signTransaction<T extends Transaction | VersionedTransaction>(
    tx: T,
  ): Promise<T> {
    if (tx instanceof Transaction) {
      tx.partialSign(this.payer);
    } else {
      tx.sign([this.payer]);
    }

    return tx;
  }

  async signAllTransactions<T extends Transaction | VersionedTransaction>(
    txs: T[],
  ): Promise<T[]> {
    return txs.map((tx) => {
      if (tx instanceof Transaction) {
        tx.partialSign(this.payer);
      } else {
        tx.sign([this.payer]);
      }

      return tx;
    });
  }
}
