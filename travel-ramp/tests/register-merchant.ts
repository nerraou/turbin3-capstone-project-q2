import * as anchor from "@anchor-lang/core";
import { expect } from "chai";
import {
  confirmTx,
  findMerchantPda,
  fundAccount,
  program,
  provider,
} from "./helpers";

describe("register_merchant", () => {
  it("initializes a merchant account for a wallet", async () => {
    const payer = provider.wallet.publicKey;
    const merchantWallet = anchor.web3.Keypair.generate().publicKey;
    const [merchantAccount, merchantBump] = findMerchantPda(merchantWallet);

    const tx = await program.methods
      .registerMerchant(merchantWallet)
      .accountsPartial({
        payer,
        merchantAccount,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();
    await confirmTx(tx);

    const account = await program.account.merchantAccount.fetch(
      merchantAccount,
    );

    expect(account.operator.equals(payer)).to.equal(true);
    expect(account.wallet.equals(merchantWallet)).to.equal(true);
    expect(account.status).to.deep.equal({ approved: {} });
    expect(account.totalReceived.toNumber()).to.equal(0);
    expect(account.totalRedeemed.toNumber()).to.equal(0);
    expect(account.bump).to.equal(merchantBump);
  });
});
