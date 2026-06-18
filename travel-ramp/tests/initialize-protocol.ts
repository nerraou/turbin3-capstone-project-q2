import * as anchor from "@anchor-lang/core";
import { expect } from "chai";
import {
  confirmTx,
  expectAnchorError,
  findProtocolConfigPda,
  findTreasuryPda,
  fundAccount,
  program,
} from "./helpers";

describe("initialize_protocol", () => {
  it("initializes the protocol config and treasury PDAs", async () => {
    const admin = anchor.web3.Keypair.generate();
    const mint = anchor.web3.Keypair.generate();
    const fee_bps = 1000;

    await fundAccount(admin.publicKey);

    const [protocolConfig, protocolConfigBump] = findProtocolConfigPda(
      admin.publicKey,
    );
    const [treasury, treasuryBump] = findTreasuryPda(protocolConfig);

    const tx = await program.methods
      .initializeProtocol(fee_bps)
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

    const protocolConfigAccount = await program.account.protocolConfig.fetch(
      protocolConfig,
    );
    const treasuryAccount = await program.account.treasury.fetch(treasury);

    expect(protocolConfigAccount.admin.equals(admin.publicKey)).to.equal(true);
    expect(protocolConfigAccount.treasury.equals(treasury)).to.equal(true);
    expect(protocolConfigAccount.mint.equals(mint.publicKey)).to.equal(true);
    expect(protocolConfigAccount.bump).to.equal(protocolConfigBump);

    expect(treasuryAccount.authority.equals(admin.publicKey)).to.equal(true);
    expect(treasuryAccount.totalSupply.toNumber()).to.equal(0);
    expect(treasuryAccount.bump).to.equal(treasuryBump);
  });

  it("rejects protocol fees above the maximum", async () => {
    const admin = anchor.web3.Keypair.generate();
    const mint = anchor.web3.Keypair.generate();
    const invalidFeeBps = 1001;

    await fundAccount(admin.publicKey);

    const [protocolConfig] = findProtocolConfigPda(admin.publicKey);
    const [treasury] = findTreasuryPda(protocolConfig);

    await expectAnchorError(
      program.methods
        .initializeProtocol(invalidFeeBps)
        .accountsPartial({
          admin: admin.publicKey,
          protocolConfig,
          treasury,
          travelCreditMint: mint.publicKey,
          tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([admin, mint])
        .rpc(),
      "InvalidFee",
    );
  });
});
