import * as anchor from "@anchor-lang/core";
import { expect } from "chai";
import { confirmTx, findMerchantPda, program, provider } from "./helpers";

describe("register_merchant", () => {
  it("initializes a merchant account", async () => {
    const payer = anchor.web3.Keypair.generate();
    const merchantWallet = anchor.web3.Keypair.generate().publicKey;
    const [merchantAccount, merchantBump] = findMerchantPda(merchantWallet);

    const airdropTx = await provider.connection.requestAirdrop(
      payer.publicKey,
      1 * anchor.web3.LAMPORTS_PER_SOL,
    );
    await confirmTx(airdropTx);

    const tx = await program.methods
      .registerMerchant(merchantWallet)
      .accountsPartial({
        payer: payer.publicKey,
        merchantAccount,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([payer])
      .rpc();
    await confirmTx(tx);

    const account = await program.account.merchantAccount.fetch(
      merchantAccount,
    );

    expect(account.operator.equals(payer.publicKey)).to.equal(true);
    expect(account.wallet.equals(merchantWallet)).to.equal(true);
    expect(account.status).to.deep.equal({ approved: {} });
    expect(account.totalReceived.toNumber()).to.equal(0);
    expect(account.totalRedeemed.toNumber()).to.equal(0);
    expect(account.bump).to.equal(merchantBump);
  });
});
