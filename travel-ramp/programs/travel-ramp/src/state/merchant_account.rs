use anchor_lang::prelude::*;

#[derive(InitSpace)]
#[account]
pub struct MerchantAccount {
    pub authority: Pubkey,
    pub approved: bool,
    pub balance: u64,
    pub bump: u8,
}
