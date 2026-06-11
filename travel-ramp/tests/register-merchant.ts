import * as anchor from "@anchor-lang/core";
import { expect } from "chai";
import { confirmTx, findMerchantPda, program, provider } from "./helpers";

describe("register_merchant", () => {
  it("initializes a merchant account", async () => {
    const merchant = anchor.web3.Keypair.generate();
    const [merchantAccount, merchantBump] = findMerchantPda(merchant.publicKey);

    const airdropTx = await provider.connection.requestAirdrop(
      merchant.publicKey,
      1 * anchor.web3.LAMPORTS_PER_SOL,
    );
    await confirmTx(airdropTx);

    const tx = await program.methods
      .registerMerchant()
      .accountsPartial({
        merchant: merchant.publicKey,
        merchantAccount,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([merchant])
      .rpc();
    await confirmTx(tx);

    const account = await program.account.merchantAccount.fetch(
      merchantAccount,
    );

    expect(account.authority.equals(merchant.publicKey)).to.equal(true);
    expect(account.status).to.deep.equal({ approved: {} });
    expect(account.pendingRedemption.toNumber()).to.equal(0);
    expect(account.totalReceived.toNumber()).to.equal(0);
    expect(account.totalRedeemed.toNumber()).to.equal(0);
    expect(account.bump).to.equal(merchantBump);
  });
});
