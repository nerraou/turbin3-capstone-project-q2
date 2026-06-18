import * as anchor from "@coral-xyz/anchor";

export const TRAVEL_USD_SYMBOL = "TravelUSD";
export const TRAVEL_USD_DECIMALS = 6;
export const TRAVEL_USD_UNITS_PER_USD = BigInt(1_000_000);
const U64_MAX = BigInt("18446744073709551615");

function normalizeAmountInput(value: unknown) {
  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new Error("Invalid USD amount");
    }

    return value.toString();
  }

  if (typeof value === "bigint") {
    return value.toString();
  }

  throw new Error("Invalid USD amount");
}

export function parseTravelUsdToBaseUnits(value: unknown) {
  const text = normalizeAmountInput(value);

  if (!/^\d+(\.\d{1,6})?$/.test(text)) {
    throw new Error(
      "Invalid USD amount. Use up to 6 decimals, for example 12.50",
    );
  }

  const [wholePart, fractionalPart = ""] = text.split(".");
  const baseUnits =
    BigInt(wholePart) * TRAVEL_USD_UNITS_PER_USD +
    BigInt(fractionalPart.padEnd(TRAVEL_USD_DECIMALS, "0"));

  if (baseUnits <= BigInt(0)) {
    throw new Error("USD amount must be greater than zero");
  }

  if (baseUnits > U64_MAX) {
    throw new Error("USD amount is too large");
  }

  return new anchor.BN(baseUnits.toString());
}

export function parseBaseUnitsAmount(value: unknown) {
  const text = normalizeAmountInput(value);

  if (!/^\d+$/.test(text)) {
    throw new Error("Invalid base unit amount");
  }

  const baseUnits = BigInt(text);

  if (baseUnits <= BigInt(0)) {
    throw new Error("Amount must be greater than zero");
  }

  if (baseUnits > U64_MAX) {
    throw new Error("Amount is too large");
  }

  return new anchor.BN(baseUnits.toString());
}

export function getTravelUsdAmountFromBody(body: Record<string, unknown>) {
  if (body.amountUsd !== undefined) {
    return parseTravelUsdToBaseUnits(body.amountUsd);
  }

  if (body.amount !== undefined) {
    return parseBaseUnitsAmount(body.amount);
  }

  throw new Error("Missing amountUsd");
}

export function formatTravelUsdFromBaseUnits(
  amount: anchor.BN | string | bigint,
) {
  const baseUnits = BigInt(amount.toString());
  const wholePart = baseUnits / TRAVEL_USD_UNITS_PER_USD;
  const fractionalPart = baseUnits % TRAVEL_USD_UNITS_PER_USD;

  if (fractionalPart === BigInt(0)) {
    return `${wholePart}.00`;
  }

  const trimmedFraction = fractionalPart
    .toString()
    .padStart(TRAVEL_USD_DECIMALS, "0")
    .replace(/0+$/, "");

  return `${wholePart}.${trimmedFraction.padEnd(2, "0")}`;
}
