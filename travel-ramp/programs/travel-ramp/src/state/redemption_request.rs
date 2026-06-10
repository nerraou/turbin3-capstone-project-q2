use anchor_lang::prelude::*;

#[derive(InitSpace)]
#[account]
pub struct RedemptionRequest {
    pub merchant: Pubkey,
    pub amount: u64,
    pub approved: bool,
    pub bump: u8,
}
