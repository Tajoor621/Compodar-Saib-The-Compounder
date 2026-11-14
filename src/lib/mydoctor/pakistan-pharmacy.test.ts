import assert from "node:assert/strict";
import { test } from "node:test";
import { findCatalogListings, findPakistanProducts, retailerSearch } from "./pakistan-pharmacy.ts";
import { lookupPakistanMarket, parseRetailResults } from "./pakistan-pharmacy.server.ts";

test("Mac-F variants stay distinct and the printed form filters them", () => {
  assert.equal(findPakistanProducts("mac-f").length, 3);
  assert.deepEqual(
    findPakistanProducts("MAC – F 120 mL syrup").map((row) => row.form),
    ["Syrup"],
  );
  assert.deepEqual(
    findPakistanProducts("mac f plus tabs").map((row) => row.brand),
    ["Mac-F Plus"],
  );
  assert.equal(findPakistanProducts("Mac-F injection").length, 0);
});

test("Cipocain identifies the ear pack and never matches eye drops", () => {
  const [pack] = findPakistanProducts("cipocain ear drop 5ml");
  assert.equal(pack?.form, "Ear drops");
  assert.match(pack.composition, /ciprofloxacin.*lignocaine/i);
  assert.equal(findPakistanProducts("Cipocain eye drops").length, 0);
  assert.equal(findPakistanProducts("made-up brand").length, 0);
});

test("retailer snapshot matches pack names and keeps links scoped to their source", () => {
  const snapshot = {
    checkedAt: "2026-11-14",
    stores: [["cipocain-ear-drops-5ml", "../bad"], ["mac-f-syrup-120ml"]],
  };
  assert.equal(
    findCatalogListings(snapshot, "cipocain ear drops")[0]?.url,
    "https://sehatmedi.com/products/cipocain-ear-drops-5ml",
  );
  assert.equal(findCatalogListings(snapshot, "nonexistent").length, 0);
  assert.equal(
    new URL(retailerSearch("https://sehatmedi.com", "A+B & C")).searchParams.get("q"),
    "A+B & C",
  );
});

test("retailer responses preserve stock and price with source-specific failure handling", async () => {
  const items = {
    resources: {
      results: {
        products: [
          {
            title: "Cipocain",
            url: "/products/cipocain?tracking=1",
            price: "169.00",
            available: false,
          },
          { title: "Bad URL", url: "https://outside.invalid/products/not-a-match" },
          { title: "Invalid URL", url: "https://[" },
        ],
      },
    },
  };
  const [listing] = parseRetailResults(items, "https://sehatmedi.com");
  assert.deepEqual(listing, {
    title: "Cipocain",
    url: "https://sehatmedi.com/products/cipocain",
    price: "169.00",
    available: false,
  });
  const results = await lookupPakistanMarket("Cipocain", async (input) => {
    const url = new URL(String(input));
    assert.equal(url.searchParams.get("q"), "Cipocain");
    return url.hostname === "sehatmedi.com"
      ? Response.json(items)
      : new Response(null, { status: 503 });
  });
  assert.deepEqual(
    results.stores.map((row) => row.available),
    [true, false],
  );
  assert.equal(results.stores[0].listings.length, 1);
});
