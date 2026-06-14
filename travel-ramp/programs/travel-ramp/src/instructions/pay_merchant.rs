use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{transfer_checked, Mint, TokenAccount, TokenInterface, TransferChecked},
};

use crate::{error::TravelRampError, *};

#[derive(Accounts)]
pub struct PayMerchant<'info> {
    #[account(mut, address = traveler_account.wallet)]
    pub traveler_wallet: Signer<'info>,

    /// CHECK: only used as ATA authority
    #[account(address = merchant_account.authority)]
    pub merchant_wallet: UncheckedAccount<'info>,

    #[account(
        seeds = [PROTOCOL_SEED, protocol_config.admin.as_ref()],
        bump = protocol_config.bump,
        has_one = mint
    )]
    pub protocol_config: Box<Account<'info, ProtocolConfig>>,

    #[account(
        mut,
        address = protocol_config.mint
    )]
    pub mint: Box<InterfaceAccount<'info, Mint>>,

    #[account(
        mut,
        seeds = [TRAVELER_SEED, traveler_wallet.key().as_ref()],
        bump = traveler_account.bump
    )]
    pub traveler_account: Box<Account<'info, TravelerAccount>>,

    #[account(
        mut,
        seeds = [MERCHANT_SEED, merchant_account.authority.as_ref()],
        bump = merchant_account.bump
    )]
    pub merchant_account: Box<Account<'info, MerchantAccount>>,

    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = traveler_wallet,
        associated_token::token_program = token_program
    )]
    pub traveler_ata: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        init_if_needed,
        payer = traveler_wallet,
        associated_token::mint = mint,
        associated_token::authority = merchant_wallet,
        associated_token::token_program = token_program
    )]
    pub merchant_ata: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        init,
        payer = traveler_wallet,
        space = PaymentReceipt::DISCRIMINATOR.len() + PaymentReceipt::INIT_SPACE,
        seeds = [
            PAYMENT_RECEIPT_SEED,
            traveler_wallet.key().as_ref(),
            merchant_wallet.key().as_ref(),
            merchant_account.total_received.to_le_bytes().as_ref()
        ],
        bump
    )]
    pub payment_receipt: Box<Account<'info, PaymentReceipt>>,

    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

impl<'info> PayMerchant<'info> {
    pub fn pay_merchant(&mut self, amount: u64, bumps: &PayMerchantBumps) -> Result<()> {
        require!(amount > 0, TravelRampError::InvalidAmount);

        require!(
            self.traveler_account.status == TravelerStatus::Active,
            TravelRampError::TravelerInactive
        );

        require!(
            self.merchant_account.status == MerchantStatus::Approved,
            TravelRampError::MerchantNotApproved
        );

        let cpi_accounts = TransferChecked {
            from: self.traveler_ata.to_account_info(),
            mint: self.mint.to_account_info(),
            to: self.merchant_ata.to_account_info(),
            authority: self.traveler_wallet.to_account_info(),
        };

        let cpi_ctx = CpiContext::new(self.token_program.key(), cpi_accounts);

        transfer_checked(cpi_ctx, amount, self.mint.decimals)?;

        self.payment_receipt.set_inner(PaymentReceipt {
            traveler: self.traveler_wallet.key(),
            merchant: self.merchant_wallet.key(),
            gross_amount: amount,
            merchant_amount: amount,
            protocol_fee: 0,
            timestamp: Clock::get()?.unix_timestamp,
            bump: bumps.payment_receipt,
        });

        self.merchant_account.total_received = self
            .merchant_account
            .total_received
            .checked_add(amount)
            .ok_or(TravelRampError::Overflow)?;

        Ok(())
    }
}
