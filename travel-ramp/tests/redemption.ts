import * as anchor from "@anchor-lang/core";
import { expect } from "chai";
import {
  confirmTx,
  findMerchantPda,
  findPaymentReceiptPda,
  findProtocolConfigPda,
  findRedemptionPda,
  findTravelerPda,
  findTreasuryPda,
  fundAccount,
  program,
} from "./helpers";

async function setupMerchantWithCredits() {
  const admin = anchor.web3.Keypair.generate();
  const travelerWallet = anchor.web3.Keypair.generate();
  const merchantWallet = anchor.web3.Keypair.generate();
  const mint = anchor.web3.Keypair.generate();
  const mintAmount = new anchor.BN(1_000_000);
  const payAmount = new anchor.BN(400_000);
  const feeBps = 1000;
  const protocolFee = payAmount
    .mul(new anchor.BN(feeBps))
    .div(new anchor.BN(10_000));
  const merchantAmount = payAmount.sub(protocolFee);

  await fundAccount(admin.publicKey);
  await fundAccount(travelerWallet.publicKey);
  await fundAccount(merchantWallet.publicKey);

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
    .registerMerchant()
    .accountsPartial({
      merchant: merchantWallet.publicKey,
      merchantAccount,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .signers([merchantWallet])
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
    .signers([travelerWallet])
    .rpc();
  await confirmTx(tx);

  return {
    admin,
    merchantWallet,
    mint,
    protocolConfig,
    merchantAccount,
    merchantAta,
    payAmount: merchantAmount,
  };
}

describe("redemption", () => {
  it("requests a merchant redemption", async () => {
    const setup = await setupMerchantWithCredits();
    const redemptionAmount = new anchor.BN(150_000);
    const [redemptionRequest, redemptionBump] = findRedemptionPda(
      setup.merchantWallet.publicKey,
      new anchor.BN(0),
    );

    const tx = await program.methods
      .requestRedemption(redemptionAmount)
      .accountsPartial({
        merchant: setup.merchantWallet.publicKey,
        protocolConfig: setup.protocolConfig,
        mint: setup.mint.publicKey,
        merchantAccount: setup.merchantAccount,
        merchantAta: setup.merchantAta,
        redemptionRequest,
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([setup.merchantWallet])
      .rpc();
    await confirmTx(tx);

    const request = await program.account.redemptionRequest.fetch(
      redemptionRequest,
    );
    const merchantBalance =
      await program.provider.connection.getTokenAccountBalance(
        setup.merchantAta,
      );

    expect(request.merchant.equals(setup.merchantWallet.publicKey)).to.equal(
      true,
    );
    expect(request.amount.toString()).to.equal(redemptionAmount.toString());
    expect(request.status).to.deep.equal({ pending: {} });
    expect(request.bump).to.equal(redemptionBump);
    expect(merchantBalance.value.amount).to.equal(
      setup.payAmount.sub(redemptionAmount).toString(),
    );
  });

  it("approves a pending merchant redemption", async () => {
    const setup = await setupMerchantWithCredits();
    const redemptionAmount = new anchor.BN(175_000);
    const [redemptionRequest] = findRedemptionPda(
      setup.merchantWallet.publicKey,
      new anchor.BN(0),
    );

    let tx = await program.methods
      .requestRedemption(redemptionAmount)
      .accountsPartial({
        merchant: setup.merchantWallet.publicKey,
        protocolConfig: setup.protocolConfig,
        mint: setup.mint.publicKey,
        merchantAccount: setup.merchantAccount,
        merchantAta: setup.merchantAta,
        redemptionRequest,
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([setup.merchantWallet])
      .rpc();
    await confirmTx(tx);

    tx = await program.methods
      .approveRedemption()
      .accountsPartial({
        admin: setup.admin.publicKey,
        protocolConfig: setup.protocolConfig,
        merchantAccount: setup.merchantAccount,
        redemptionRequest,
      })
      .signers([setup.admin])
      .rpc();
    await confirmTx(tx);

    const request = await program.account.redemptionRequest.fetch(
      redemptionRequest,
    );
    const merchant = await program.account.merchantAccount.fetch(
      setup.merchantAccount,
    );

    expect(request.status).to.deep.equal({ approved: {} });
    expect(merchant.totalRedeemed.toString()).to.equal(
      redemptionAmount.toString(),
    );
  });
});
