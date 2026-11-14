export const DRAP_LINKS = {
  registration: "https://eapp.dra.gov.pk/WebProductIndex.php",
  otc: "https://www.dra.gov.pk/e-services/online-data-verification/provisionally-enlistments-of-health-otc-products/",
  price: "https://e.dra.gov.pk/public/price",
  recalls: "https://www.dra.gov.pk/safety-information/product-recalls/rapid-alert-system/",
};

const fleming = "Pasteur & Fleming Pharmaceuticals";
const barrett = "Barrett Hodgson Pakistan";
const flemingCatalogue = { label: fleming, url: "https://pfpp.com.pk/products/" };
const barrettCatalogue = { label: barrett, url: "https://www.barretthodgson.com/Home/ProductList" };

export type PakistanProduct = {
  brand: string;
  form: string;
  pack?: string;
  composition: string;
  manufacturer: string;
  sources: { label: string; url: string }[];
};

export const PAKISTAN_PRODUCTS: readonly PakistanProduct[] = [
  {
    brand: "Mac-F",
    form: "Tablets",
    pack: "30 tablets",
    composition: "Methylcobalamin (vitamin B12), folic acid and alpha-lipoic acid",
    manufacturer: fleming,
    sources: [
      flemingCatalogue,
      {
        label: "Medishop · pack and ingredients",
        url: "https://www.medishop.pk/products/mac-f-tablets",
      },
    ],
  },
  {
    brand: "Mac-F",
    form: "Syrup",
    pack: "120 mL",
    composition: "Iron, folic acid and B-complex vitamins",
    manufacturer: fleming,
    sources: [
      flemingCatalogue,
      {
        label: "Medishop · pack and ingredients",
        url: "https://www.medishop.pk/products/mac-f-syrup-120ml",
      },
    ],
  },
  {
    brand: "Mac-F Plus",
    form: "Tablets",
    pack: "30 tablets",
    composition: "Methylcobalamin, folic acid, alpha-lipoic acid, thiamine and pyridoxine",
    manufacturer: fleming,
    sources: [
      flemingCatalogue,
      {
        label: "Medishop · pack and ingredients",
        url: "https://www.medishop.pk/products/mac-f-plus-tablets",
      },
    ],
  },
  {
    brand: "Cipocain",
    form: "Ear drops",
    pack: "5 mL",
    composition: "Ciprofloxacin and lignocaine (lidocaine)",
    manufacturer: barrett,
    sources: [
      barrettCatalogue,
      {
        label: "SehatMedi · 5 mL pack",
        url: "https://sehatmedi.com/products/cipocain-ear-drops-5ml",
      },
    ],
  },
  ...(
    [
      ["Cipotic", "Ear drops", "Ciprofloxacin"],
      ["Cipotic-D", "Ear drops", "Ciprofloxacin and dexamethasone"],
      ["Ciclobar", "Eye emulsion", "Cyclosporine 0.05%"],
      ["Cefspan", "Suspension", "Cefixime 100 mg/5 mL"],
      ["Cefspan DS", "Suspension", "Cefixime 200 mg/5 mL"],
      ["Cefspan", "Capsule", "Cefixime 400 mg"],
      ["Cefstar", "Injection", "Cefepime"],
      ["Ceflactam", "Injection", "Cefoperazone and sulbactam"],
      ["Cefamezin", "Injection", "Cefazolin"],
      ["Cefcom", "Injection", "Ceftazidime"],
      ["Cefizox", "Injection", "Ceftizoxime"],
      ["ClotNil", "Tablets", "Clopidogrel 75 mg"],
      ["ClotNil Plus", "Tablets", "Clopidogrel 75 mg and aspirin 75 mg"],
      ["Combigan", "Eye drops", "Brimonidine tartrate 0.2% and timolol 0.5%"],
      ["Citabar", "Tablets", "Cinitapride 1 mg"],
      ["Citabar", "Oral solution", "Cinitapride 1 mg/5 mL"],
      ["Britanyl", "Tablets", "Terbutaline sulphate"],
      ["Britanyl", "Syrup", "Terbutaline sulphate"],
      ["Britanyl", "Injection", "Terbutaline sulphate"],
      ["Boonest", "Tablets", "Ibandronic acid 150 mg"],
    ] as const
  ).map(([brand, form, composition]) => ({
    brand,
    form,
    composition,
    manufacturer: barrett,
    sources: [barrettCatalogue],
  })),
];

function fold(value: string): string {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]/gu, "");
}

const formatTokens =
  /\b(?:tablet[s]?|tab[s]?|syrup|capsule[s]?|cap[s]?|ear|eye|drops?|oral|solution|emulsion|injection|suspension|\d+(?:\.\d+)?\s*(?:mg|mcg|ml|g))\b/gi;

export function findPakistanProducts(query: string): PakistanProduct[] {
  const full = fold(query);
  if (full.length < 3) return [];
  const name = fold(query.replace(formatTokens, ""));
  if (name.length < 3) return [];
  const qualifier = full !== name;
  const ranked = PAKISTAN_PRODUCTS.flatMap((row) => {
    const brand = fold(row.brand);
    const details = fold([row.form, row.pack, row.composition].filter(Boolean).join(" "));
    const shortDetails = fold([row.form, row.pack].filter(Boolean).join(" "));
    const composition = fold(row.composition);
    let score = 0;
    if (brand === name) score = 100;
    else if (brand.startsWith(name) && name.length >= 4) score = 80;
    else if (composition.includes(full) && full.length >= 5) score = 60;
    if (qualifier && score >= 80) {
      const extras = (query.match(formatTokens) ?? []).map((part) =>
        fold(part)
          .replace(/^(?:tabs?|tablets?)$/, "tablet")
          .replace(/^(?:caps?|capsules?)$/, "capsul")
          .replace(/^drops?$/, "drop"),
      );
      if (extras.every((part) => shortDetails.includes(part))) score += 25;
      else if (extras.every((part) => details.includes(part))) score += 15;
      else return [];
    }
    return score ? [{ row, score }] : [];
  });
  return ranked
    .sort((a, b) => b.score - a.score)
    .slice(0, 12)
    .map(({ row }) => row);
}

export const PHARMACY_STORES = [
  { name: "SehatMedi", origin: "https://sehatmedi.com" },
  { name: "Medishop.pk", origin: "https://www.medishop.pk" },
] as const;

export function retailerSearch(origin: string, query: string) {
  const url = new URL("/search", origin);
  url.searchParams.set("type", "product");
  url.searchParams.set("q", query);
  return url.href;
}

export function marketQuery(query: string) {
  return query.normalize("NFKC").trim().replace(/\s+/g, " ").slice(0, 100);
}

export type RetailListing = {
  title: string;
  url: string;
  price: string | null;
  available: boolean | null;
};

export type MarketResults = {
  checkedAt: string;
  stores: { name: string; available: boolean; listings: RetailListing[] }[];
};

export type RetailCatalog = { checkedAt: string; stores: string[][] };

export function findCatalogListings(catalog: RetailCatalog, query: string) {
  const name = fold(query);
  if (name.length < 3) return [];
  const tokens = query.toLowerCase().match(/[a-z0-9]+/g) ?? [];
  return PHARMACY_STORES.flatMap((store, index) => {
    const records = (catalog.stores[index] ?? []).flatMap((handle) => {
      if (!/^[\w-]+$/.test(handle)) return [];
      const folded = fold(handle);
      const parts = handle.split("-");
      const score =
        folded === name
          ? 100
          : folded.startsWith(name)
            ? 80
            : tokens.length > 1 && tokens.every((token) => parts.some((part) => part === token || (/^\d+$/.test(token) && new RegExp(`^${token}(?:mg|mcg|ml|g)$`).test(part))))
              ? 55
              : tokens.length === 1 && parts.includes(name)
                ? 50
                : 0;
      return score ? [{ handle, score }] : [];
    });
    return records
      .sort((a, b) => b.score - a.score || a.handle.length - b.handle.length)
      .slice(0, 6)
      .map(({ handle }) => ({
        name: handle.replaceAll("-", " "),
        url: `${store.origin}/products/${handle}`,
        store: store.name,
      }));
  });
}
