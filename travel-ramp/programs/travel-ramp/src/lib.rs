pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("8auatzShQgGGu6HbNhfPmxFZKNQUzrzW7j7X2n8Knp5g");

#[program]
pub mod travel_ramp {
    use super::*;

    pub fn initialize_protocol(ctx: Context<InitializeProtocol>, mint: Pubkey) -> Result<()> {
        ctx.accounts.initialize_protocol(mint, &ctx.bumps)
    }

    pub fn initialize_traveler(ctx: Context<InitializeTraveler>) -> Result<()> {
        ctx.accounts.initialize_traveler(&ctx.bumps)
    }
}
