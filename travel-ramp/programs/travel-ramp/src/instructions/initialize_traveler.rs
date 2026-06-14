use anchor_lang::prelude::*;

use crate::constants::*;
use crate::state::*;

#[derive(Accounts)]
#[instruction(traveler_wallet: Pubkey)]
pub struct InitializeTraveler<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        init,
        payer = payer,
        space = TravelerAccount::DISCRIMINATOR.len() + TravelerAccount::INIT_SPACE,
        seeds = [
           TRAVELER_SEED,
            traveler_wallet.as_ref()
        ],
        bump
    )]
    pub traveler_account: Account<'info, TravelerAccount>,

    pub system_program: Program<'info, System>,
}

impl<'info> InitializeTraveler<'info> {
    pub fn initialize_traveler(
        &mut self,
        bumps: &InitializeTravelerBumps,
        traveler_wallet: Pubkey,
    ) -> Result<()> {
        self.traveler_account.set_inner(TravelerAccount {
            operator: self.payer.key(),
            wallet: traveler_wallet,
            status: TravelerStatus::Active,
            payment_count: 0,
            bump: bumps.traveler_account,
        });
        msg!("Traveler initialized: {}", self.traveler_account.key());
        Ok(())
    }
}
