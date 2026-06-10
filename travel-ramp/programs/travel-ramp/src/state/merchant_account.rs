use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum MerchantStatus {
    Pending,
    Approved,
    Suspended,
}

#[derive(InitSpace)]
#[account]
pub struct MerchantAccount {
    pub authority: Pubkey,
    pub status: MerchantStatus,
    pub pending_redemption: u64,
    pub total_received: u64,
    pub total_redeemed: u64,
    pub bump: u8,
}
