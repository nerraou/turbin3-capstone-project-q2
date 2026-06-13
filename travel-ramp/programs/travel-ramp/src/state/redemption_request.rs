use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum RedemptionStatus {
    Pending,
    Approved,
}

#[account]
#[derive(InitSpace)]
pub struct RedemptionRequest {
    pub merchant: Pubkey,
    pub amount: u64,
    pub status: RedemptionStatus,
    pub bump: u8,
}
