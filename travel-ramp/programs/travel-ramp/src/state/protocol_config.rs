use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct ProtocolConfig {
    pub admin: Pubkey,
    pub treasury: Pubkey,
    pub mint: Pubkey,
    pub fee_bps: u16,
    pub bump: u8,
}
