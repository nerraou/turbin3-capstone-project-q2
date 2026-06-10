use crate::{state::*, MARCHANT_SEED};
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct RegisterMerchant<'info> {
    #[account(mut)]
    pub merchant: Signer<'info>,

    #[account(
        init,
        payer = merchant,
        space = MerchantAccount::DISCRIMINATOR.len() + MerchantAccount::INIT_SPACE,
        seeds = [MARCHANT_SEED, merchant.key().as_ref()],
        bump
    )]
    pub merchant_account: Account<'info, MerchantAccount>,

    pub system_program: Program<'info, System>,
}

impl<'info> RegisterMerchant<'info> {
    pub fn register_merchant(&mut self, bumps: RegisterMerchantBumps) -> Result<()> {
        self.merchant_account.set_inner(MerchantAccount {
            authority: self.merchant.key(),
            status: MerchantStatus::Approved,
            pending_redemption: 0,
            total_received: 0,
            total_redeemed: 0,
            bump: bumps.merchant_account,
        });

        msg!("RegisterMerchant");
        Ok(())
    }
}
