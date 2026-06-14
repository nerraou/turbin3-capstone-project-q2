use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct PaymentReceipt {
    pub traveler: Pubkey,
    pub merchant: Pubkey,
    pub gross_amount: u64,
    pub merchant_amount: u64,
    pub protocol_fee: u64,
    pub timestamp: i64,
    pub bump: u8,
}
