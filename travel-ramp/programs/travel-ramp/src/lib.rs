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

    pub fn initialize_protocol(ctx: Context<InitializeProtocol>) -> Result<()> {
        ctx.accounts.initialize_protocol(&ctx.bumps)
    }

    pub fn initialize_traveler(
        ctx: Context<InitializeTraveler>,
        traveler_wallet: Pubkey,
    ) -> Result<()> {
        ctx.accounts
            .initialize_traveler(&ctx.bumps, traveler_wallet)
    }

    pub fn register_merchant(ctx: Context<RegisterMerchant>) -> Result<()> {
        ctx.accounts.register_merchant(ctx.bumps)
    }

    pub fn mint_credits(ctx: Context<MintCredits>, amount: u64) -> Result<()> {
        ctx.accounts.mint_credits(amount)
    }
    pub fn pay_merchant(ctx: Context<PayMerchant>, amount: u64) -> Result<()> {
        ctx.accounts.pay_merchant(amount)
    }

    pub fn request_redemption(ctx: Context<RequestRedemption>, amount: u64) -> Result<()> {
        ctx.accounts.request_redemption(amount)
    }

    pub fn approve_redemption(ctx: Context<ApproveRedemption>) -> Result<()> {
        ctx.accounts.approve_redemption()
    }
}
