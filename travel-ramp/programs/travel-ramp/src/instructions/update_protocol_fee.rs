use anchor_lang::prelude::*;

use crate::error::TravelRampError;
use crate::*;

#[derive(Accounts)]
pub struct UpdateProtocolFee<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        mut,
        seeds = [PROTOCOL_SEED, admin.key().as_ref()],
        bump = protocol_config.bump,
        has_one = admin
    )]
    pub protocol_config: Account<'info, ProtocolConfig>,
}

impl<'info> UpdateProtocolFee<'info> {
    pub fn update_protocol_fee(&mut self, new_fee_bps: u16) -> Result<()> {
        require!(new_fee_bps <= 1_000, TravelRampError::InvalidFee);

        self.protocol_config.fee_bps = new_fee_bps;

        Ok(())
    }
}
