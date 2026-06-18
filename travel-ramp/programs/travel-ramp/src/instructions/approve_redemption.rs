use anchor_lang::prelude::*;

use crate::{error::TravelRampError, *};
#[derive(Accounts)]
pub struct ApproveRedemption<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        seeds = [PROTOCOL_SEED, admin.key().as_ref()],
        bump = protocol_config.bump,
        has_one = admin
    )]
    pub protocol_config: Account<'info, ProtocolConfig>,

    #[account(
        mut,
        seeds = [MERCHANT_SEED, redemption_request.merchant.as_ref()],
        bump = merchant_account.bump
    )]
    pub merchant_account: Account<'info, MerchantAccount>,

    #[account(
        mut,
        seeds = [
           REDEMPTION_SEED,
            redemption_request.merchant.as_ref(),
            merchant_account.total_redeemed.to_le_bytes().as_ref()
        ],
        bump = redemption_request.bump
    )]
    pub redemption_request: Account<'info, RedemptionRequest>,
}

impl<'info> ApproveRedemption<'info> {
    pub fn approve_redemption(&mut self) -> Result<()> {
        require!(
            self.redemption_request.status == RedemptionStatus::Pending,
            TravelRampError::InvalidRedemptionStatus
        );

        self.redemption_request.status = RedemptionStatus::Approved;

        self.merchant_account.total_redeemed = self
            .merchant_account
            .total_redeemed
            .checked_add(self.redemption_request.amount)
            .ok_or(TravelRampError::Overflow)?;

        emit!(RedemptionApproved {
            merchant: self.redemption_request.merchant,
            amount: self.redemption_request.amount,
            redemption_request: self.redemption_request.key(),
        });

        Ok(())
    }
}
