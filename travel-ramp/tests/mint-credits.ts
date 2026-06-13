import * as anchor from "@anchor-lang/core";
import { expect } from "chai";
import {
  confirmTx,
  findProtocolConfigPda,
  findTravelerPda,
  findTreasuryPda,
  fundAccount,
  program,
} from "./helpers";

describe("mint_credits", () => {
  it("mints travel credits to a traveler ATA", async () => {
    const admin = anchor.web3.Keypair.generate();
    const travelerWallet = anchor.web3.Keypair.generate().publicKey;
    const mint = anchor.web3.Keypair.generate();
    const amount = new anchor.BN(1_000_000);

    await fundAccount(admin.publicKey);

    const [protocolConfig] = findProtocolConfigPda(admin.publicKey);
    const [treasury] = findTreasuryPda(protocolConfig);
    const [travelerAccount] = findTravelerPda(travelerWallet);
    const travelerAta = anchor.utils.token.associatedAddress({
      mint: mint.publicKey,
      owner: travelerWallet,
    });

    let tx = await program.methods
      .initializeProtocol()
      .accountsPartial({
        admin: admin.publicKey,
        protocolConfig,
        treasury,
        travelCreditMint: mint.publicKey,
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([admin, mint])
      .rpc();
    await confirmTx(tx);

    tx = await program.methods
      .initializeTraveler(travelerWallet)
      .accountsPartial({
        payer: admin.publicKey,
        travelerAccount,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([admin])
      .rpc();
    await confirmTx(tx);

    tx = await program.methods
      .mintCredits(amount)
      .accountsPartial({
        admin: admin.publicKey,
        protocolConfig,
        treasury,
        mint: mint.publicKey,
        travelerAccount,
        travelerWallet,
        travelerAta,
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([admin])
      .rpc();
    await confirmTx(tx);

    const balance = await program.provider.connection.getTokenAccountBalance(
      travelerAta,
    );
    const treasuryAccount = await program.account.treasury.fetch(treasury);

    expect(balance.value.amount).to.equal(amount.toString());
    expect(treasuryAccount.totalSupply.toString()).to.equal(amount.toString());
  });
});
