use anchor_lang::prelude::*;

use crate::*;

#[derive(Accounts)]
pub struct UpdateMerchantStatus<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        seeds = [PROTOCOL_SEED, admin.key().as_ref()],
        bump = protocol_config.bump,
        has_one = admin
    )]
    pub protocol_config: Account<'info, ProtocolConfig>,

    #[account(mut)]
    pub merchant_account: Account<'info, MerchantAccount>,
}

impl<'info> UpdateMerchantStatus<'info> {
    pub fn update_merchant_status(&mut self, status: MerchantStatus) -> Result<()> {
        self.merchant_account.status = status;
        Ok(())
    }
}
