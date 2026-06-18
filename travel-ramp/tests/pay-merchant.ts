import * as anchor from "@anchor-lang/core";
import { expect } from "chai";
import {
  confirmTx,
  expectAnchorError,
  findMerchantPda,
  findPaymentReceiptPda,
  findProtocolConfigPda,
  findTravelerPda,
  findTreasuryPda,
  fundAccount,
  program,
} from "./helpers";

async function setupPayMerchantContext() {
  const admin = anchor.web3.Keypair.generate();
  const travelerWallet = anchor.web3.Keypair.generate();
  const merchantWallet = anchor.web3.Keypair.generate();
  const mint = anchor.web3.Keypair.generate();
  const mintAmount = new anchor.BN(1_000_000);
  const feeBps = 1000;

  await fundAccount(admin.publicKey);

  const [protocolConfig] = findProtocolConfigPda(admin.publicKey);
  const [treasury] = findTreasuryPda(protocolConfig);
  const [travelerAccount] = findTravelerPda(travelerWallet.publicKey);
  const [merchantAccount] = findMerchantPda(merchantWallet.publicKey);
  const travelerAta = anchor.utils.token.associatedAddress({
    mint: mint.publicKey,
    owner: travelerWallet.publicKey,
  });
  const merchantAta = anchor.utils.token.associatedAddress({
    mint: mint.publicKey,
    owner: merchantWallet.publicKey,
  });
  const treasuryAta = anchor.utils.token.associatedAddress({
    mint: mint.publicKey,
    owner: treasury,
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
    .initializeTraveler(travelerWallet.publicKey)
    .accountsPartial({
      payer: admin.publicKey,
      travelerAccount,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .signers([admin])
    .rpc();
  await confirmTx(tx);

  tx = await program.methods
    .registerMerchant(merchantWallet.publicKey)
    .accountsPartial({
      payer: admin.publicKey,
      merchantAccount,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .signers([admin])
    .rpc();
  await confirmTx(tx);

  tx = await program.methods
    .mintCredits(mintAmount)
    .accountsPartial({
      admin: admin.publicKey,
      protocolConfig,
      treasury,
      mint: mint.publicKey,
      travelerAccount,
      travelerWallet: travelerWallet.publicKey,
      travelerAta,
      tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
      associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .signers([admin])
    .rpc();
  await confirmTx(tx);

  return {
    admin,
    travelerWallet,
    merchantWallet,
    mint,
    protocolConfig,
    treasury,
    travelerAccount,
    merchantAccount,
    travelerAta,
    merchantAta,
    treasuryAta,
  };
}

describe("pay_merchant", () => {
  it("transfers credits from a traveler ATA to a merchant ATA", async () => {
    const admin = anchor.web3.Keypair.generate();
    const travelerWallet = anchor.web3.Keypair.generate();
    const merchantWallet = anchor.web3.Keypair.generate();
    const mint = anchor.web3.Keypair.generate();
    const mintAmount = new anchor.BN(1_000_000);
    const payAmount = new anchor.BN(250_000);
    const feeBps = 1000;
    const protocolFee = payAmount
      .mul(new anchor.BN(feeBps))
      .div(new anchor.BN(10_000));
    const merchantAmount = payAmount.sub(protocolFee);

    await fundAccount(admin.publicKey);

    const [protocolConfig] = findProtocolConfigPda(admin.publicKey);
    const [treasury] = findTreasuryPda(protocolConfig);
    const [travelerAccount] = findTravelerPda(travelerWallet.publicKey);
    const [merchantAccount] = findMerchantPda(merchantWallet.publicKey);
    const [paymentReceipt] = findPaymentReceiptPda(
      travelerWallet.publicKey,
      merchantWallet.publicKey,
      new anchor.BN(0),
    );

    const travelerAta = anchor.utils.token.associatedAddress({
      mint: mint.publicKey,
      owner: travelerWallet.publicKey,
    });
    const merchantAta = anchor.utils.token.associatedAddress({
      mint: mint.publicKey,
      owner: merchantWallet.publicKey,
    });
    const treasuryAta = anchor.utils.token.associatedAddress({
      mint: mint.publicKey,
      owner: treasury,
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
      .initializeTraveler(travelerWallet.publicKey)
      .accountsPartial({
        payer: admin.publicKey,
        travelerAccount,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([admin])
      .rpc();
    await confirmTx(tx);

    tx = await program.methods
      .registerMerchant(merchantWallet.publicKey)
      .accountsPartial({
        payer: admin.publicKey,
        merchantAccount,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([admin])
      .rpc();
    await confirmTx(tx);

    tx = await program.methods
      .mintCredits(mintAmount)
      .accountsPartial({
        admin: admin.publicKey,
        protocolConfig,
        treasury,
        mint: mint.publicKey,
        travelerAccount,
        travelerWallet: travelerWallet.publicKey,
        travelerAta,
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([admin])
      .rpc();
    await confirmTx(tx);

    tx = await program.methods
      .payMerchant(payAmount)
      .accountsPartial({
        travelerWallet: travelerWallet.publicKey,
        merchantWallet: merchantWallet.publicKey,
        protocolConfig,
        payer: admin.publicKey,
        treasury,
        mint: mint.publicKey,
        travelerAccount,
        merchantAccount,
        travelerAta,
        merchantAta,
        treasuryAta,
        paymentReceipt,
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([admin, travelerWallet])
      .rpc();
    await confirmTx(tx);

    const travelerBalance =
      await program.provider.connection.getTokenAccountBalance(travelerAta);
    const merchantBalance =
      await program.provider.connection.getTokenAccountBalance(merchantAta);
    const treasuryBalance =
      await program.provider.connection.getTokenAccountBalance(treasuryAta);
    const merchantAccountState = await program.account.merchantAccount.fetch(
      merchantAccount,
    );
    const receipt = await program.account.paymentReceipt.fetch(paymentReceipt);

    expect(travelerBalance.value.amount).to.equal(
      mintAmount.sub(payAmount).toString(),
    );
    expect(merchantBalance.value.amount).to.equal(merchantAmount.toString());
    expect(treasuryBalance.value.amount).to.equal(protocolFee.toString());
    expect(merchantAccountState.totalReceived.toString()).to.equal(
      merchantAmount.toString(),
    );
    expect(receipt.traveler.equals(travelerWallet.publicKey)).to.equal(true);
    expect(receipt.merchant.equals(merchantWallet.publicKey)).to.equal(true);
    expect(receipt.grossAmount.toString()).to.equal(payAmount.toString());
    expect(receipt.merchantAmount.toString()).to.equal(
      merchantAmount.toString(),
    );
    expect(receipt.protocolFee.toString()).to.equal(protocolFee.toString());
  });

  it("rejects paying zero credits", async () => {
    const setup = await setupPayMerchantContext();
    const [paymentReceipt] = findPaymentReceiptPda(
      setup.travelerWallet.publicKey,
      setup.merchantWallet.publicKey,
      new anchor.BN(0),
    );

    await expectAnchorError(
      program.methods
        .payMerchant(new anchor.BN(0))
        .accountsPartial({
          travelerWallet: setup.travelerWallet.publicKey,
          merchantWallet: setup.merchantWallet.publicKey,
          protocolConfig: setup.protocolConfig,
          payer: setup.admin.publicKey,
          treasury: setup.treasury,
          mint: setup.mint.publicKey,
          travelerAccount: setup.travelerAccount,
          merchantAccount: setup.merchantAccount,
          travelerAta: setup.travelerAta,
          merchantAta: setup.merchantAta,
          treasuryAta: setup.treasuryAta,
          paymentReceipt,
          tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
          associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([setup.admin, setup.travelerWallet])
        .rpc(),
      "InvalidAmount",
    );
  });

  it("rejects payments from a suspended traveler", async () => {
    const setup = await setupPayMerchantContext();
    const [paymentReceipt] = findPaymentReceiptPda(
      setup.travelerWallet.publicKey,
      setup.merchantWallet.publicKey,
      new anchor.BN(0),
    );

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
        .payMerchant(new anchor.BN(1))
        .accountsPartial({
          travelerWallet: setup.travelerWallet.publicKey,
          merchantWallet: setup.merchantWallet.publicKey,
          protocolConfig: setup.protocolConfig,
          payer: setup.admin.publicKey,
          treasury: setup.treasury,
          mint: setup.mint.publicKey,
          travelerAccount: setup.travelerAccount,
          merchantAccount: setup.merchantAccount,
          travelerAta: setup.travelerAta,
          merchantAta: setup.merchantAta,
          treasuryAta: setup.treasuryAta,
          paymentReceipt,
          tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
          associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([setup.admin, setup.travelerWallet])
        .rpc(),
      "TravelerInactive",
    );
  });

  it("rejects payments to a suspended merchant", async () => {
    const setup = await setupPayMerchantContext();
    const [paymentReceipt] = findPaymentReceiptPda(
      setup.travelerWallet.publicKey,
      setup.merchantWallet.publicKey,
      new anchor.BN(0),
    );

    const tx = await program.methods
      .updateMerchantStatus({ suspended: {} })
      .accountsPartial({
        admin: setup.admin.publicKey,
        protocolConfig: setup.protocolConfig,
        merchantAccount: setup.merchantAccount,
      })
      .signers([setup.admin])
      .rpc();
    await confirmTx(tx);

    await expectAnchorError(
      program.methods
        .payMerchant(new anchor.BN(1))
        .accountsPartial({
          travelerWallet: setup.travelerWallet.publicKey,
          merchantWallet: setup.merchantWallet.publicKey,
          protocolConfig: setup.protocolConfig,
          payer: setup.admin.publicKey,
          treasury: setup.treasury,
          mint: setup.mint.publicKey,
          travelerAccount: setup.travelerAccount,
          merchantAccount: setup.merchantAccount,
          travelerAta: setup.travelerAta,
          merchantAta: setup.merchantAta,
          treasuryAta: setup.treasuryAta,
          paymentReceipt,
          tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
          associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([setup.admin, setup.travelerWallet])
        .rpc(),
      "MerchantNotApproved",
    );
  });
});
