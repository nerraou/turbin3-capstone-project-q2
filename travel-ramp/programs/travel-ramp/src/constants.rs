use anchor_lang::prelude::*;

#[constant]
pub const TRAVELER_SEED: &[u8] = b"traveler";

pub const PROTOCOL_SEED: &[u8] = b"protocol";

pub const TREASURY_SEED: &[u8] = b"treasury";

pub const MERCHANT_SEED: &[u8] = b"merchant";

pub const REDEMPTION_SEED: &[u8] = b"redemption";

pub const PAYMENT_RECEIPT_SEED: &[u8] = b"payment_receipt";

#[constant]
pub const TRAVEL_USD_DECIMALS: u8 = 6;

#[constant]
pub const TRAVEL_USD_UNITS_PER_USD: u64 = 1_000_000;
