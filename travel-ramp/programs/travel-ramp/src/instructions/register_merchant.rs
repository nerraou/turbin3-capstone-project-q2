use crate::{state::*, MERCHANT_SEED};
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(merchant_wallet: Pubkey)]
pub struct RegisterMerchant<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        init,
        payer = payer,
        space = MerchantAccount::DISCRIMINATOR.len() + MerchantAccount::INIT_SPACE,
        seeds = [MERCHANT_SEED, merchant_wallet.as_ref()],
        bump
    )]
    pub merchant_account: Account<'info, MerchantAccount>,

    pub system_program: Program<'info, System>,
}

impl<'info> RegisterMerchant<'info> {
    pub fn register_merchant(
        &mut self,
        bumps: RegisterMerchantBumps,
        merchant_wallet: Pubkey,
    ) -> Result<()> {
        self.merchant_account.set_inner(MerchantAccount {
            operator: self.payer.key(),
            wallet: merchant_wallet,
            status: MerchantStatus::Approved,
            total_received: 0,
            total_redeemed: 0,
            bump: bumps.merchant_account,
        });

        msg!("RegisterMerchant");
        Ok(())
    }
}
