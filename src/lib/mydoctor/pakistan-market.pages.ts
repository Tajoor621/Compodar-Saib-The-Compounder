import type { MarketResults } from "./pakistan-pharmacy.ts";

/** GitHub Pages exposes the direct source links instead of a same-origin server function. */
export async function searchPakistanMarket(_input: {
  data: { query: string };
}): Promise<MarketResults> {
  throw new Error("In-app retailer lookup requires the server deployment");
}
