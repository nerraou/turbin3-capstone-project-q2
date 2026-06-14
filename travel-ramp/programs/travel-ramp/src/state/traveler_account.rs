use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum TravelerStatus {
    Active,
    Suspended,
}

#[derive(InitSpace)]
#[account]
pub struct TravelerAccount {
    pub operator: Pubkey, // backend/admin
    pub wallet: Pubkey,   // generated traveler wallet
    pub status: TravelerStatus,
    pub payment_count: u64,
    pub bump: u8,
}
