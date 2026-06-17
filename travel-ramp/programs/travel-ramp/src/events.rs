use anchor_lang::prelude::*;

#[event]
pub struct ProtocolInitialized {
    pub admin: Pubkey,
    pub protocol_config: Pubkey,
    pub treasury: Pubkey,
    pub mint: Pubkey,
    pub fee_bps: u16,
}

#[event]
pub struct CreditsMinted {
    pub traveler: Pubkey,
    pub mint: Pubkey,
    pub amount: u64,
}

#[event]
pub struct MerchantPaid {
    pub traveler: Pubkey,
    pub merchant: Pubkey,
    pub gross_amount: u64,
    pub merchant_amount: u64,
    pub protocol_fee: u64,
    pub receipt: Pubkey,
}

#[event]
pub struct RedemptionRequested {
    pub merchant: Pubkey,
    pub amount: u64,
    pub redemption_request: Pubkey,
}

#[event]
pub struct RedemptionApproved {
    pub merchant: Pubkey,
    pub amount: u64,
    pub redemption_request: Pubkey,
}
