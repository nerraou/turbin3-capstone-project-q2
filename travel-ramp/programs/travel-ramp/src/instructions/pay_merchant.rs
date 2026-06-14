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
        seeds = [TREASURY_SEED, protocol_config.key().as_ref()],
        bump = treasury.bump
    )]
    pub treasury: Account<'info, Treasury>,

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
        init_if_needed,
        payer = traveler_wallet,
        associated_token::mint = mint,
        associated_token::authority = treasury,
        associated_token::token_program = token_program
    )]
    pub treasury_ata: InterfaceAccount<'info, TokenAccount>,

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

        let fee = amount
            .checked_mul(self.protocol_config.fee_bps as u64)
            .ok_or(TravelRampError::Overflow)?
            .checked_div(10_000)
            .ok_or(TravelRampError::Overflow)?;

        let merchant_amount = amount.checked_sub(fee).ok_or(TravelRampError::Overflow)?;

        // Transfer merchant amount
        let merchant_transfer_accounts = TransferChecked {
            from: self.traveler_ata.to_account_info(),
            mint: self.mint.to_account_info(),
            to: self.merchant_ata.to_account_info(),
            authority: self.traveler_wallet.to_account_info(),
        };

        let merchant_ctx = CpiContext::new(self.token_program.key(), merchant_transfer_accounts);

        transfer_checked(merchant_ctx, merchant_amount, self.mint.decimals)?;

        // Transfer protocol fee to treasury ATA
        if fee > 0 {
            let fee_transfer_accounts = TransferChecked {
                from: self.traveler_ata.to_account_info(),
                mint: self.mint.to_account_info(),
                to: self.treasury_ata.to_account_info(),
                authority: self.traveler_wallet.to_account_info(),
            };

            let fee_ctx = CpiContext::new(self.token_program.key(), fee_transfer_accounts);

            transfer_checked(fee_ctx, fee, self.mint.decimals)?;
        }

        self.merchant_account.total_received = self
            .merchant_account
            .total_received
            .checked_add(merchant_amount)
            .ok_or(TravelRampError::Overflow)?;

        let clock = Clock::get()?;

        self.payment_receipt.set_inner(PaymentReceipt {
            traveler: self.traveler_wallet.key(),
            merchant: self.merchant_account.authority,
            gross_amount: amount,
            merchant_amount,
            protocol_fee: fee,
            timestamp: clock.unix_timestamp,
            bump: bumps.payment_receipt,
        });

        self.traveler_account.payment_count = self
            .traveler_account
            .payment_count
            .checked_add(1)
            .ok_or(TravelRampError::Overflow)?;

        Ok(())
    }
}
