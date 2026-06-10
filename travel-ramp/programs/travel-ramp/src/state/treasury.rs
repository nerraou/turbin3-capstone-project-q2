use anchor_lang::prelude::*;

#[derive(InitSpace)]
#[account]
pub struct Treasury {
    pub authority: Pubkey,
    pub total_supply: u64,
    pub bump: u8,
}
