use anchor_lang::prelude::*;

#[error_code]
pub enum TravelRampError {
    #[msg("Invalid amount")]
    InvalidAmount,

    #[msg("Traveler is not active")]
    TravelerInactive,

    #[msg("Math overflow")]
    Overflow,
}
