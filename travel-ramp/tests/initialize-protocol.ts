import * as anchor from "@anchor-lang/core";
import { expect } from "chai";
import {
  confirmTx,
  findProtocolConfigPda,
  findTreasuryPda,
  program,
  provider,
} from "./helpers";

describe("initialize_protocol", () => {
  it("initializes the protocol config and treasury PDAs", async () => {
    const admin = provider.wallet.publicKey;
    const mint = anchor.web3.Keypair.generate().publicKey;

    const [protocolConfig, protocolConfigBump] = findProtocolConfigPda(admin);
    const [treasury, treasuryBump] = findTreasuryPda(protocolConfig);

    const tx = await program.methods
      .initializeProtocol(mint)
      .accountsPartial({
        admin,
        protocolConfig,
        treasury,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();
    await confirmTx(tx);

    const protocolConfigAccount =
      await program.account.protocolConfig.fetch(protocolConfig);
    const treasuryAccount = await program.account.treasury.fetch(treasury);

    expect(protocolConfigAccount.admin.equals(admin)).to.equal(true);
    expect(protocolConfigAccount.treasury.equals(treasury)).to.equal(true);
    expect(protocolConfigAccount.mint.equals(mint)).to.equal(true);
    expect(protocolConfigAccount.bump).to.equal(protocolConfigBump);

    expect(treasuryAccount.authority.equals(admin)).to.equal(true);
    expect(treasuryAccount.totalSupply.toNumber()).to.equal(0);
    expect(treasuryAccount.bump).to.equal(treasuryBump);
  });
});
