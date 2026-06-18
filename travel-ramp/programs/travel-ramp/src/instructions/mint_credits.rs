use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{mint_to, Mint, MintTo, TokenAccount, TokenInterface},
};

use crate::{error::TravelRampError, *};

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
		mut,
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

    /// CHECK: only used as ATA authority
    #[account(address = traveler_account.wallet)]
    pub traveler_wallet: UncheckedAccount<'info>,

    #[account(
        init_if_needed,
        payer = admin,
        associated_token::mint = mint,
        associated_token::authority = traveler_wallet,
        associated_token::token_program = token_program
    )]
    pub traveler_ata: InterfaceAccount<'info, TokenAccount>,

    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

impl<'info> MintCredits<'info> {
    pub fn mint_credits(&mut self, amount: u64) -> Result<()> {
        require!(amount > 0, TravelRampError::InvalidAmount);
        require!(
            self.traveler_account.status == TravelerStatus::Active,
            TravelRampError::TravelerInactive
        );

        let config_key = self.protocol_config.key();

        let signer_seeds: &[&[&[u8]]] =
            &[&[TREASURY_SEED, config_key.as_ref(), &[self.treasury.bump]]];

        let cpi_accounts = MintTo {
            mint: self.mint.to_account_info(),
            to: self.traveler_ata.to_account_info(),
            authority: self.treasury.to_account_info(),
        };

        let cpi_ctx =
            CpiContext::new_with_signer(self.token_program.key(), cpi_accounts, signer_seeds);

        mint_to(cpi_ctx, amount)?;

        self.treasury.total_supply = self
            .treasury
            .total_supply
            .checked_add(amount)
            .ok_or(TravelRampError::Overflow)?;

        emit!(CreditsMinted {
            traveler: self.traveler_wallet.key(),
            mint: self.mint.key(),
            amount,
        });

        Ok(())
    }
}
