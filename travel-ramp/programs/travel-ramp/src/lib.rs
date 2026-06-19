pub mod constants;
pub mod error;
pub mod events;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use events::*;
pub use instructions::*;
pub use state::*;

declare_id!("Di6eWsPjLxVJwkZ9wJPs71PkFuxJrwieCKYa93kdfFYa");

#[program]
pub mod travel_ramp {
    use super::*;

    pub fn initialize_protocol(ctx: Context<InitializeProtocol>, fee_bps: u16) -> Result<()> {
        ctx.accounts.initialize_protocol(fee_bps, &ctx.bumps)
    }

    pub fn initialize_traveler(
        ctx: Context<InitializeTraveler>,
        traveler_wallet: Pubkey,
    ) -> Result<()> {
        msg!("Traveler wallet: {}", traveler_wallet);
        ctx.accounts
            .initialize_traveler(&ctx.bumps, traveler_wallet)
    }

    pub fn register_merchant(
        ctx: Context<RegisterMerchant>,
        merchant_wallet: Pubkey,
    ) -> Result<()> {
        ctx.accounts.register_merchant(ctx.bumps, merchant_wallet)
    }

    pub fn mint_credits(ctx: Context<MintCredits>, amount: u64) -> Result<()> {
        ctx.accounts.mint_credits(amount)
    }
    pub fn pay_merchant(ctx: Context<PayMerchant>, amount: u64) -> Result<()> {
        ctx.accounts.pay_merchant(amount, &ctx.bumps)
    }

    pub fn request_redemption(ctx: Context<RequestRedemption>, amount: u64) -> Result<()> {
        ctx.accounts.request_redemption(amount, &ctx.bumps)
    }

    pub fn approve_redemption(ctx: Context<ApproveRedemption>) -> Result<()> {
        ctx.accounts.approve_redemption()
    }

    pub fn update_protocol_fee(ctx: Context<UpdateProtocolFee>, new_fee_bps: u16) -> Result<()> {
        ctx.accounts.update_protocol_fee(new_fee_bps)
    }

    pub fn update_merchant_status(
        ctx: Context<UpdateMerchantStatus>,
        status: MerchantStatus,
    ) -> Result<()> {
        ctx.accounts.update_merchant_status(status)
    }

    pub fn update_traveler_status(
        ctx: Context<UpdateTravelerStatus>,
        status: TravelerStatus,
    ) -> Result<()> {
        ctx.accounts.update_traveler_status(status)
    }
}
