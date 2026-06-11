import * as anchor from "@anchor-lang/core";
import { expect } from "chai";
import { confirmTx, findTravelerPda, program, provider } from "./helpers";

describe("initialize_traveler", () => {
  it("initializes a traveler account for a wallet", async () => {
    const payer = provider.wallet.publicKey;
    const travelerWallet = anchor.web3.Keypair.generate().publicKey;
    const [travelerAccount, travelerBump] = findTravelerPda(travelerWallet);

    const tx = await program.methods
      .initializeTraveler(travelerWallet)
      .accountsPartial({
        payer,
        travelerAccount,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();
    await confirmTx(tx);

    const account = await program.account.travelerAccount.fetch(
      travelerAccount
    );

    expect(account.operator.equals(payer)).to.equal(true);
    expect(account.wallet.equals(travelerWallet)).to.equal(true);
    expect(account.totalCredits.toNumber()).to.equal(0);
    expect(account.status).to.deep.equal({ active: {} });
    expect(account.bump).to.equal(travelerBump);
  });
});
