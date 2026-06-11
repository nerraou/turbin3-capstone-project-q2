use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{mint_to, Mint, MintTo, TokenAccount, TokenInterface},
};

use crate::*;

#[derive(Accounts)]
pub struct MintCredits<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        seeds = [PROTOCOL_SEED, admin.key().as_ref()],
        bump = protocol_config.bump,
        has_one = admin,
        has_one = treasury,
        has_one = mint
    )]
    pub protocol_config: Account<'info, ProtocolConfig>,

    #[account(
        seeds = [TREASURY_SEED, protocol_config.key().as_ref()],
        bump = treasury.bump
    )]
    pub treasury: Account<'info, Treasury>,

    #[account(
        mut,
        address = protocol_config.mint
    )]
    pub mint: InterfaceAccount<'info, Mint>,

    #[account(
        mut,
        seeds = [TRAVELER_SEED, traveler_account.wallet.as_ref()],
        bump = traveler_account.bump
    )]
    pub traveler_account: Account<'info, TravelerAccount>,

    #[account(
        init_if_needed,
        payer = admin,
        associated_token::mint = mint,
        associated_token::authority = traveler_account.wallet,
        associated_token::token_program = token_program
    )]
    pub traveler_ata: InterfaceAccount<'info, TokenAccount>,

    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}
