import * as anchor from "@anchor-lang/core";
import { expect } from "chai";
import {
  confirmTx,
  expectAnchorError,
  findProtocolConfigPda,
  findTravelerPda,
  findTreasuryPda,
  fundAccount,
  program,
} from "./helpers";

async function setupMintCreditsContext() {
  const admin = anchor.web3.Keypair.generate();
  const travelerWallet = anchor.web3.Keypair.generate().publicKey;
  const mint = anchor.web3.Keypair.generate();
  const feeBps = 1000;

  await fundAccount(admin.publicKey);

  const [protocolConfig] = findProtocolConfigPda(admin.publicKey);
  const [treasury] = findTreasuryPda(protocolConfig);
  const [travelerAccount] = findTravelerPda(travelerWallet);
  const travelerAta = anchor.utils.token.associatedAddress({
    mint: mint.publicKey,
    owner: travelerWallet,
  });

  let tx = await program.methods
    .initializeProtocol(feeBps)
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

  return {
    admin,
    travelerWallet,
    mint,
    protocolConfig,
    treasury,
    travelerAccount,
    travelerAta,
  };
}

describe("mint_credits", () => {
  it("mints travel credits to a traveler ATA", async () => {
    const admin = anchor.web3.Keypair.generate();
    const travelerWallet = anchor.web3.Keypair.generate().publicKey;
    const mint = anchor.web3.Keypair.generate();
    const amount = new anchor.BN(1_000_000);
    const feeBps = 1000;

    await fundAccount(admin.publicKey);

    const [protocolConfig] = findProtocolConfigPda(admin.publicKey);
    const [treasury] = findTreasuryPda(protocolConfig);
    const [travelerAccount] = findTravelerPda(travelerWallet);
    const travelerAta = anchor.utils.token.associatedAddress({
      mint: mint.publicKey,
      owner: travelerWallet,
    });

    let tx = await program.methods
      .initializeProtocol(feeBps)
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

  it("rejects minting zero credits", async () => {
    const setup = await setupMintCreditsContext();

    await expectAnchorError(
      program.methods
        .mintCredits(new anchor.BN(0))
        .accountsPartial({
          admin: setup.admin.publicKey,
          protocolConfig: setup.protocolConfig,
          treasury: setup.treasury,
          mint: setup.mint.publicKey,
          travelerAccount: setup.travelerAccount,
          travelerWallet: setup.travelerWallet,
          travelerAta: setup.travelerAta,
          tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
          associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([setup.admin])
        .rpc(),
      "InvalidAmount",
    );
  });

  it("rejects minting to a suspended traveler", async () => {
    const setup = await setupMintCreditsContext();

    const tx = await program.methods
      .updateTravelerStatus({ suspended: {} })
      .accountsPartial({
        admin: setup.admin.publicKey,
        protocolConfig: setup.protocolConfig,
        travelerAccount: setup.travelerAccount,
      })
      .signers([setup.admin])
      .rpc();
    await confirmTx(tx);

    await expectAnchorError(
      program.methods
        .mintCredits(new anchor.BN(1))
        .accountsPartial({
          admin: setup.admin.publicKey,
          protocolConfig: setup.protocolConfig,
          treasury: setup.treasury,
          mint: setup.mint.publicKey,
          travelerAccount: setup.travelerAccount,
          travelerWallet: setup.travelerWallet,
          travelerAta: setup.travelerAta,
          tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
          associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([setup.admin])
        .rpc(),
      "TravelerInactive",
    );
  });
});
