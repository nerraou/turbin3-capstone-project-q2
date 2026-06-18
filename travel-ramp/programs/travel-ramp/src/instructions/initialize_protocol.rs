use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint, TokenInterface};

use crate::constants::*;
use crate::error::TravelRampError;
use crate::events::ProtocolInitialized;
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

    #[account(
        init,
        payer = admin,
        mint::decimals = TRAVEL_USD_DECIMALS,
        mint::authority = treasury,
        mint::freeze_authority = treasury
    )]
    pub travel_credit_mint: InterfaceAccount<'info, Mint>,

    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
}

impl<'info> InitializeProtocol<'info> {
    pub fn initialize_protocol(
        &mut self,
        fee_bps: u16,
        bumps: &InitializeProtocolBumps,
    ) -> Result<()> {
        require!(fee_bps <= 1_000, TravelRampError::InvalidFee);
        self.protocol_config.set_inner(ProtocolConfig {
            admin: self.admin.key(),
            treasury: self.treasury.key(),
            mint: self.travel_credit_mint.key(),
            fee_bps,
            bump: bumps.protocol_config,
        });

        self.treasury.set_inner(Treasury {
            authority: self.admin.key(),
            total_supply: 0,
            bump: bumps.treasury,
        });

        msg!("Protocol initialized: {}", self.protocol_config.key());
        emit!(ProtocolInitialized {
            admin: self.admin.key(),
            protocol_config: self.protocol_config.key(),
            treasury: self.treasury.key(),
            mint: self.travel_credit_mint.key(),
            fee_bps,
        });
        Ok(())
    }
}
