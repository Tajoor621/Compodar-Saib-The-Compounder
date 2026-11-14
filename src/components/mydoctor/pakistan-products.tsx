import { useEffect, useMemo, useState } from "react";
import {
  DRAP_LINKS,
  findCatalogListings,
  findPakistanProducts,
  marketQuery,
  PHARMACY_STORES,
  retailerSearch,
  type MarketResults,
  type RetailCatalog,
} from "@/lib/mydoctor/pakistan-pharmacy";
import { searchPakistanMarket } from "@/lib/mydoctor/pakistan-market";
import { isStaticPages } from "@/lib/static-pages";
import type { Lang } from "@/lib/mydoctor/types";

const COPY = {
  en: {
    records: "Pakistan product records",
    catalogue: "Pakistan retailer catalogue matches",
    catalogueNote:
      "Names are derived from retailer product links. Open the listing for current details and availability.",
    indexed: "Index dated",
    checkingCatalogue: "Checking the Pakistan retailer index…",
    variants: "Match the name and form on your pack. Each variant has its own composition.",
    manufacturer: "Manufacturer",
    composition: "Listed ingredients",
    sources: "Product sources",
    miss: "No exact product record is stored for this search. Try the full brand name, generic name, strength, or pack form. Use the online sources below for broader coverage.",
    links: "Check current Pakistan sources",
    registration: "DRAP registered drugs",
    otc: "DRAP health and OTC products",
    price: "DRAP price index",
    recalls: "DRAP recalls and alerts",
    registryNote: "Registration, listed prices, and retailer stock come from separate sources.",
    stores: "Search store listings for",
    live: "Check retailer listings in the app",
    loading: "Checking retailers…",
    offers: "Retailer search results",
    failure: "Retailer lookup is unavailable. Try opening the stores directly.",
    unavailable: "Source unavailable",
    none: "No listings returned",
    matched: "Store reports available",
    soldOut: "Store reports unavailable",
    stockUnknown: "Stock not reported",
    retailNote:
      "Retailer results may include similar names. Compare the exact pack before relying on a price or stock status.",
  },
  ur: {
    records: "پاکستانی مصنوعات کا ریکارڈ",
    catalogue: "پاکستانی دکانوں کی فہرست میں نتائج",
    catalogueNote:
      "نام دکانوں کے لنکس سے لیے گئے ہیں۔ تازہ تفصیل اور دستیابی کے لیے اصل صفحہ کھولیں۔",
    indexed: "فہرست کی تاریخ",
    checkingCatalogue: "پاکستانی دکانوں کی فہرست دیکھی جا رہی ہے…",
    variants: "اپنے پیک کا نام اور شکل ملائیں۔ ہر قسم کے اجزا الگ ہو سکتے ہیں۔",
    manufacturer: "بنانے والی کمپنی",
    composition: "درج اجزا",
    sources: "مصنوعات کے ذرائع",
    miss: "اس تلاش کا عین مطابق ریکارڈ محفوظ نہیں۔ پورا برانڈ، جنرک نام، طاقت یا پیک کی شکل لکھیں۔ مزید تلاش کے لیے نیچے آن لائن ذرائع استعمال کریں۔",
    links: "پاکستان کے تازہ ذرائع دیکھیں",
    registration: "ڈریپ کی رجسٹرڈ ادویات",
    otc: "ڈریپ کی صحت اور او ٹی سی مصنوعات",
    price: "ڈریپ قیمت انڈیکس",
    recalls: "ڈریپ واپسی اور انتباہات",
    registryNote: "رجسٹریشن، درج قیمتیں اور دکان کا اسٹاک الگ ذرائع سے آتے ہیں۔",
    stores: "دکانوں میں تلاش کریں",
    live: "ایپ میں دکانوں کی فہرست دیکھیں",
    loading: "دکانوں میں تلاش جاری ہے…",
    offers: "دکانوں کی تلاش کے نتائج",
    failure: "دکانوں کی تلاش دستیاب نہیں۔ دکان کی سائٹ براہ راست کھولیں۔",
    unavailable: "ذریعہ دستیاب نہیں",
    none: "کوئی نتیجہ نہیں ملا",
    matched: "دکان کے مطابق دستیاب",
    soldOut: "دکان کے مطابق دستیاب نہیں",
    stockUnknown: "اسٹاک کی معلومات دستیاب نہیں",
    retailNote:
      "دکان کے نتائج میں ملتے جلتے نام ہو سکتے ہیں۔ قیمت یا دستیابی دیکھنے سے پہلے عین پیک ملائیں۔",
  },
};

const link =
  "inline-flex min-h-11 items-center py-2 font-semibold text-primary underline underline-offset-4";

let catalogueRequest: Promise<RetailCatalog> | undefined;

function loadCatalogue() {
  catalogueRequest ??= fetch(`${import.meta.env.BASE_URL}pakistan-pharmacy/catalog.json`)
    .then((response) => {
      if (!response.ok) throw new Error("Catalogue unavailable");
      return response.json() as Promise<RetailCatalog>;
    })
    .then((catalogue) => {
      if (!Array.isArray(catalogue?.stores) || !catalogue.stores.every(Array.isArray))
        throw new Error("Invalid catalogue");
      return catalogue;
    })
    .catch((error: unknown) => {
      catalogueRequest = undefined;
      throw error;
    });
  return catalogueRequest;
}

export function PakistanProducts({
  query,
  lang,
  localMiss,
  hasExactMonograph,
}: {
  query: string;
  lang: Lang;
  localMiss: boolean;
  hasExactMonograph: boolean;
}) {
  const copy = COPY[lang];
  const term = marketQuery(query);
  const products = findPakistanProducts(term);
  const lookupCatalogue = !hasExactMonograph && products.length === 0 && term.length >= 3;
  const [catalogue, setCatalogue] = useState<RetailCatalog | null>();
  useEffect(() => {
    if (!lookupCatalogue) return;
    let active = true;
    void loadCatalogue().then(
      (data) => {
        if (active) setCatalogue(data);
      },
      () => {
        if (active) setCatalogue(null);
      },
    );
    return () => {
      active = false;
    };
  }, [lookupCatalogue, term]);
  const listings = useMemo(
    () => (lookupCatalogue && catalogue ? findCatalogListings(catalogue, term) : []),
    [catalogue, lookupCatalogue, term],
  );

  return (
    <>
      {products.length > 0 && (
        <section className="grid gap-3" aria-label={copy.records}>
          <h2 className="text-xl font-semibold">{copy.records}</h2>
          {products.length > 1 && <p className="text-sm text-muted">{copy.variants}</p>}
          {products.map((product) => (
            <article
              key={`${product.brand}-${product.form}-${product.composition}`}
              className="rounded-xl border border-line bg-surface p-4"
            >
              <h3 className="font-semibold">
                <bdi>
                  {product.brand} · {product.form}
                  {product.pack ? ` · ${product.pack}` : ""}
                </bdi>
              </h3>
              <dl className="mt-2 grid gap-1 text-sm">
                <div>
                  <dt className="font-semibold">{copy.composition}</dt>
                  <dd>
                    <bdi>{product.composition}</bdi>
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold">{copy.manufacturer}</dt>
                  <dd>
                    <bdi>{product.manufacturer}</bdi>
                  </dd>
                </div>
              </dl>
              <ul aria-label={copy.sources} className="mt-1 flex flex-wrap gap-x-4 text-sm">
                {product.sources.map((source) => (
                  <li key={source.url}>
                    <a className={link} href={source.url} target="_blank" rel="noreferrer">
                      {source.label}
                    </a>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </section>
      )}
      {lookupCatalogue && catalogue === undefined && (
        <p role="status" className="text-sm">
          {copy.checkingCatalogue}
        </p>
      )}
      {lookupCatalogue && localMiss && catalogue !== undefined && listings.length === 0 && (
        <p role="status" className="rounded-xl border border-line bg-surface p-4 text-sm">
          {copy.miss}
        </p>
      )}
      {catalogue && listings.length > 0 && (
        <section className="grid gap-2 rounded-xl border border-line bg-surface p-4">
          <h2 className="text-xl font-semibold">{copy.catalogue}</h2>
          <p className="text-sm text-muted">
            {copy.catalogueNote} {copy.indexed} <bdi>{catalogue.checkedAt}</bdi>.
          </p>
          <ul className="grid divide-y divide-line">
            {listings.map((item) => (
              <li key={item.url}>
                <a
                  className={`${link} capitalize`}
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {item.name} · {item.store}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
      <section className="grid gap-2 rounded-xl border border-line bg-surface p-4">
        <h2 className="text-lg font-semibold">{copy.links}</h2>
        <p className="text-sm text-muted">{copy.registryNote}</p>
        <ul className="grid gap-x-4 text-sm sm:grid-cols-2">
          {(Object.keys(DRAP_LINKS) as (keyof typeof DRAP_LINKS)[]).map((id) => (
            <li key={id}>
              <a className={link} href={DRAP_LINKS[id]} target="_blank" rel="noreferrer">
                {copy[id]}
              </a>
            </li>
          ))}
        </ul>
        {term.length >= 3 && (
          <div className="border-t border-line pt-3">
            <p className="text-sm">
              {copy.stores} <bdi className="font-semibold">{term}</bdi>
            </p>
            <ul className="flex flex-wrap gap-x-4 text-sm">
              {PHARMACY_STORES.map((store) => (
                <li key={store.name}>
                  <a
                    className={link}
                    href={retailerSearch(store.origin, term)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {store.name}
                  </a>
                </li>
              ))}
            </ul>
            {!isStaticPages() && <LiveRetailSearch key={term} term={term} lang={lang} />}
          </div>
        )}
      </section>
    </>
  );
}

function LiveRetailSearch({ term, lang }: { term: string; lang: Lang }) {
  const copy = COPY[lang];
  const [result, setResult] = useState<MarketResults | null>(null);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  async function search() {
    setBusy(true);
    setFailed(false);
    setResult(null);
    try {
      setResult(await searchPakistanMarket({ data: { query: term } }));
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-2">
      <button
        type="button"
        disabled={busy}
        onClick={() => void search()}
        className="min-h-11 rounded-lg border border-primary px-3 text-start text-sm font-semibold text-primary disabled:opacity-60"
      >
        {busy ? copy.loading : copy.live}
      </button>
      {failed && (
        <p role="alert" className="text-sm">
          {copy.failure}
        </p>
      )}
      {result && (
        <div aria-live="polite" className="grid gap-2">
          <p className="font-semibold">
            {copy.offers} ·{" "}
            <time dateTime={result.checkedAt}>
              {new Date(result.checkedAt).toLocaleString(lang === "ur" ? "ur-PK" : "en-PK")}
            </time>
          </p>
          <p className="text-sm text-muted">{copy.retailNote}</p>
          {result.stores.map((store) => (
            <section key={store.name}>
              <h3 className="font-semibold">{store.name}</h3>
              {!store.available && <p className="text-sm">{copy.unavailable}</p>}
              {store.available && store.listings.length === 0 && (
                <p className="text-sm">{copy.none}</p>
              )}
              <ul className="grid divide-y divide-line">
                {store.listings.map((item) => (
                  <li key={item.url} className="text-sm">
                    <a className={link} href={item.url} target="_blank" rel="noreferrer">
                      {item.title}
                    </a>
                    <p className="pb-2">
                      {item.price && (
                        <>
                          <bdi>PKR {item.price}</bdi> ·{" "}
                        </>
                      )}
                      {item.available === true
                        ? copy.matched
                        : item.available === false
                          ? copy.soldOut
                          : copy.stockUnknown}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
