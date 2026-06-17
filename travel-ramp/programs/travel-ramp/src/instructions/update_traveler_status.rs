use anchor_lang::prelude::*;

use crate::*;

#[derive(Accounts)]
pub struct UpdateTravelerStatus<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        seeds = [PROTOCOL_SEED, admin.key().as_ref()],
        bump = protocol_config.bump,
        has_one = admin
    )]
    pub protocol_config: Account<'info, ProtocolConfig>,

    #[account(mut)]
    pub traveler_account: Account<'info, TravelerAccount>,
}

impl<'info> UpdateTravelerStatus<'info> {
    pub fn update_traveler_status(&mut self, status: TravelerStatus) -> Result<()> {
        self.traveler_account.status = status;
        Ok(())
    }
}
