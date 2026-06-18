export const TRAVEL_USD_SYMBOL = "TravelUSD";
export const TRAVEL_USD_DECIMALS = 6;
export const TRAVEL_USD_UNITS_PER_USD = BigInt(1_000_000);

export function baseUnitsToTravelUSD(baseUnits: bigint): bigint {
  return baseUnits / TRAVEL_USD_UNITS_PER_USD;
}

export function travelUSDToBaseUnits(amount: number): bigint {
  return BigInt(amount) * TRAVEL_USD_UNITS_PER_USD;
}
