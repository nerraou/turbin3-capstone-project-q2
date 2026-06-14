import * as anchor from "@anchor-lang/core";
import { expect } from "chai";
import {
  confirmTx,
  findMerchantPda,
  findPaymentReceiptPda,
  findProtocolConfigPda,
  findTravelerPda,
  findTreasuryPda,
  fundAccount,
  program,
} from "./helpers";

describe("pay_merchant", () => {
  it("transfers credits from a traveler ATA to a merchant ATA", async () => {
    const admin = anchor.web3.Keypair.generate();
    const travelerWallet = anchor.web3.Keypair.generate();
    const merchantWallet = anchor.web3.Keypair.generate();
    const mint = anchor.web3.Keypair.generate();
    const mintAmount = new anchor.BN(1_000_000);
    const payAmount = new anchor.BN(250_000);

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
        paymentReceipt,
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([travelerWallet])
      .rpc();
    await confirmTx(tx);

    const travelerBalance =
      await program.provider.connection.getTokenAccountBalance(travelerAta);
    const merchantBalance =
      await program.provider.connection.getTokenAccountBalance(merchantAta);
    const merchantAccountState =
      await program.account.merchantAccount.fetch(merchantAccount);
    const receipt =
      await program.account.paymentReceipt.fetch(paymentReceipt);

    expect(travelerBalance.value.amount).to.equal(
      mintAmount.sub(payAmount).toString(),
    );
    expect(merchantBalance.value.amount).to.equal(payAmount.toString());
    expect(merchantAccountState.totalReceived.toString()).to.equal(
      payAmount.toString(),
    );
    expect(receipt.traveler.equals(travelerWallet.publicKey)).to.equal(true);
    expect(receipt.merchant.equals(merchantWallet.publicKey)).to.equal(true);
    expect(receipt.grossAmount.toString()).to.equal(payAmount.toString());
    expect(receipt.merchantAmount.toString()).to.equal(payAmount.toString());
    expect(receipt.protocolFee.toString()).to.equal("0");
  });
});
