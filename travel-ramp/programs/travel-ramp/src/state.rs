use anchor_lang::prelude::*;

#[derive(InitSpace)]
#[account]
pub struct TravelerAccount {
    pub operator: Pubkey, // backend/admin
    pub wallet: Pubkey,   // generated traveler wallet
    pub total_credits: u64,
    pub bump: u8,
}
#[derive(InitSpace)]
#[account]
pub struct MerchantAccount {
    pub authority: Pubkey,
    pub approved: bool,
    pub balance: u64,
    pub bump: u8,
}

#[derive(InitSpace)]
#[account]
pub struct RedemptionRequest {
    pub merchant: Pubkey,
    pub amount: u64,
    pub approved: bool,
    pub bump: u8,
}

#[derive(InitSpace)]
#[account]
pub struct Treasury {
    pub authority: Pubkey,
    pub total_supply: u64,
    pub bump: u8,
}
