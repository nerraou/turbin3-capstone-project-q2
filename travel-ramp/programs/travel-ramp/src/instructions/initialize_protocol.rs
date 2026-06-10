use anchor_lang::prelude::*;

use crate::constants::*;
use crate::state::*;

#[derive(Accounts)]
pub struct InitializeProtocol<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        init,
        payer = admin,
        space = ProtocolConfig::DISCRIMINATOR.len() + ProtocolConfig::INIT_SPACE,
        seeds = [PROTOCOL_SEED, admin.key().as_ref()],
        bump
    )]
    pub protocol_config: Account<'info, ProtocolConfig>,

    #[account(
        init,
        payer = admin,
        space = Treasury::DISCRIMINATOR.len() + Treasury::INIT_SPACE,
        seeds = [TREASURY_SEED, protocol_config.key().as_ref()],
        bump
    )]
    pub treasury: Account<'info, Treasury>,

    pub system_program: Program<'info, System>,
}

impl<'info> InitializeProtocol<'info> {
    pub fn initialize_protocol(
        &mut self,
        mint: Pubkey,
        bumps: &InitializeProtocolBumps,
    ) -> Result<()> {
        self.protocol_config.set_inner(ProtocolConfig {
            admin: self.admin.key(),
            treasury: self.treasury.key(),
            mint,
            bump: bumps.protocol_config,
        });

        self.treasury.set_inner(Treasury {
            authority: self.admin.key(),
            total_supply: 0,
            bump: bumps.treasury,
        });

        msg!("Protocol initialized: {}", self.protocol_config.key());
        Ok(())
    }
}
