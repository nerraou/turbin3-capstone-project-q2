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
    pub total_credits: u64,
    pub status: TravelerStatus,
    pub bump: u8,
}
