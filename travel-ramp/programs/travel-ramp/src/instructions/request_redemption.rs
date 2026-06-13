use anchor_lang::prelude::*;
use anchor_spl::token_interface::{burn, Burn, Mint, TokenAccount, TokenInterface};

use crate::{error::TravelRampError, *};

#[derive(Accounts)]
#[instruction(amount: u64)]
pub struct RequestRedemption<'info> {
    #[account(mut)]
    pub merchant: Signer<'info>,

    #[account(
        seeds = [PROTOCOL_SEED, protocol_config.admin.as_ref()],
        bump = protocol_config.bump,
        has_one = mint
    )]
    pub protocol_config: Account<'info, ProtocolConfig>,

    #[account(mut, address = protocol_config.mint)]
    pub mint: InterfaceAccount<'info, Mint>,

    #[account(
        mut,
        seeds = [MERCHANT_SEED, merchant.key().as_ref()],
        bump = merchant_account.bump
    )]
    pub merchant_account: Account<'info, MerchantAccount>,

    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = merchant
    )]
    pub merchant_ata: InterfaceAccount<'info, TokenAccount>,

    #[account(
        init,
        payer = merchant,
        space = RedemptionRequest::DISCRIMINATOR.len() + RedemptionRequest::INIT_SPACE,
        seeds = [
            REDEMPTION_SEED,
            merchant.key().as_ref(),
            merchant_account.total_redeemed.to_le_bytes().as_ref()
        ],
        bump
    )]
    pub redemption_request: Account<'info, RedemptionRequest>,

    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
}

impl<'info> RequestRedemption<'info> {
    pub fn request_redemption(&mut self, amount: u64) -> Result<()> {
        require!(amount > 0, TravelRampError::InvalidAmount);
        require!(
            self.merchant_account.status == MerchantStatus::Approved,
            TravelRampError::MerchantNotApproved
        );

        let cpi_accounts = Burn {
            mint: self.mint.to_account_info(),
            from: self.merchant_ata.to_account_info(),
            authority: self.merchant.to_account_info(),
        };

        let cpi_ctx = CpiContext::new(self.token_program.key(), cpi_accounts);

        burn(cpi_ctx, amount)?;

        self.redemption_request.set_inner(RedemptionRequest {
            merchant: self.merchant.key(),
            amount,
            status: RedemptionStatus::Pending,
            bump: self.redemption_request.bump,
        });

        Ok(())
    }
}
