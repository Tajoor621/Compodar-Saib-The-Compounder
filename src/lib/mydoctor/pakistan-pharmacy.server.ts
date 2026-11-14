import { PHARMACY_STORES, type MarketResults, type RetailListing } from "./pakistan-pharmacy.ts";

export function parseRetailResults(data: unknown, origin: string): RetailListing[] {
  const products = (data as { resources?: { results?: { products?: unknown } } } | null)?.resources
    ?.results?.products;
  if (!Array.isArray(products)) throw new Error("Missing retailer response");
  const listings = new Map<string, RetailListing>();
  for (const item of products.slice(0, 8)) {
    if (!item || typeof item.title !== "string" || typeof item.url !== "string") continue;
    const title = item.title.trim().slice(0, 200);
    if (!title || !URL.canParse(item.url, origin)) continue;
    const url = new URL(item.url, origin);
    if (url.origin !== origin || !/^\/products\/[\w-]+\/?$/.test(url.pathname)) continue;
    const price =
      typeof item.price === "string" && /^\d{1,8}(\.\d{1,2})?$/.test(item.price)
        ? item.price
        : null;
    const key = url.origin + url.pathname;
    listings.set(key, {
      title,
      url: key,
      price,
      available: typeof item.available === "boolean" ? item.available : null,
    });
  }
  return [...listings.values()];
}

export async function lookupPakistanMarket(
  query: string,
  fetcher: typeof fetch = fetch,
): Promise<MarketResults> {
  const stores = await Promise.all(
    PHARMACY_STORES.map(async ({ name, origin }) => {
      try {
        const url = new URL("/search/suggest.json", origin);
        url.searchParams.set("q", query);
        url.searchParams.set("resources[type]", "product");
        url.searchParams.set("resources[limit]", "8");
        url.searchParams.set("resources[options][unavailable_products]", "last");
        const response = await fetcher(url, {
          headers: { Accept: "application/json" },
          redirect: "error",
          signal: AbortSignal.timeout(7000),
        });
        if (!response.ok) throw new Error("Retailer unavailable");
        const listings = parseRetailResults(await response.json(), origin);
        return { name, available: true, listings };
      } catch {
        return { name, available: false, listings: [] };
      }
    }),
  );
  return { checkedAt: new Date().toISOString(), stores };
}
