import type { ClinicalSource } from "../ai/types.ts";

const TTL_MS = 15 * 60 * 1000;
const cache = new Map<string, { expiresAt: number; value: ClinicalSource[] }>();

function compact(value: unknown, max = 1800): string {
  return String(value ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
}

async function getJson(url: string): Promise<any> {
  const response = await fetch(url, {
    headers: { accept: "application/json", "user-agent": "MyDoctorClinicalReference/1.0 (contact: repository owner)" },
    signal: AbortSignal.timeout(9000),
  });
  if (!response.ok) throw new Error(`retrieval_http_${response.status}`);
  return response.json();
}

async function pubmed(query: string): Promise<ClinicalSource[]> {
  const searchUrl = new URL("https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi");
  searchUrl.search = new URLSearchParams({ db: "pubmed", term: query, retmax: "4", retmode: "json", sort: "relevance" }).toString();
  const found = await getJson(searchUrl.toString());
  const ids: string[] = found?.esearchresult?.idlist ?? [];
  if (!ids.length) return [];
  const summaryUrl = new URL("https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi");
  summaryUrl.search = new URLSearchParams({ db: "pubmed", id: ids.join(","), retmode: "json" }).toString();
  const summary = await getJson(summaryUrl.toString());
  const fetchUrl = new URL("https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi");
  fetchUrl.search = new URLSearchParams({ db: "pubmed", id: ids.join(","), retmode: "xml" }).toString();
  const xmlResponse = await fetch(fetchUrl.toString(), { signal: AbortSignal.timeout(9000), headers: { "user-agent": "MyDoctorClinicalReference/1.0" } });
  if (!xmlResponse.ok) throw new Error("pubmed_abstract_fetch_failed");
  const xml = await xmlResponse.text();
  const retrievedAt = new Date().toISOString();
  const decode = (value: string) => value.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
  return ids.map((id) => {
    const item = summary?.result?.[id];
    if (!item) return null;
    const article = xml.match(new RegExp(`<PubmedArticle>[\\s\\S]*?<PMID[^>]*>${id}</PMID>[\\s\\S]*?</PubmedArticle>`))?.[0] ?? "";
    const abstract = [...article.matchAll(/<AbstractText[^>]*>([\\s\\S]*?)<\\/AbstractText>/g)].map((match) => decode(match[1].replace(/<[^>]+>/g, " "))).join(" ");
    const title = compact(item.title, 300);
    const passage = compact([item.title, abstract].filter(Boolean).join(". "), 4500);
    return {
      id: `PMID-${id}`, title, publisher: "PubMed / NCBI",
      url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`, retrievedAt, kind: "pubmed" as const, passage,
    };
  }).filter((item): item is ClinicalSource => Boolean(item && item.title && item.passage));
}

async function openFda(query: string): Promise<ClinicalSource[]> {
  const url = new URL("https://api.fda.gov/drug/label.json");
  url.search = new URLSearchParams({ search: `(openfda.generic_name:"${query}" OR openfda.brand_name:"${query}")`, limit: "3" }).toString();
  const data = await getJson(url.toString());
  const retrievedAt = new Date().toISOString();
  return (data?.results ?? []).map((item: any, index: number) => {
    const fields = ["indications_and_usage", "dosage_and_administration", "contraindications", "warnings_and_precautions", "boxed_warning", "drug_interactions", "adverse_reactions"];
    const passage = fields.flatMap((key) => Array.isArray(item?.[key]) ? item[key] : []).map((v: unknown) => compact(v, 1800)).filter(Boolean).join("\n").slice(0, 6000);
    const title = compact(item?.openfda?.brand_name?.[0] ?? item?.openfda?.generic_name?.[0] ?? `Drug label ${index + 1}`, 300);
    const setId = item?.set_id ?? `result-${index + 1}`;
    return {
      id: `FDA-${String(setId).slice(0, 32)}`, title: `${title} — FDA label`, publisher: "US FDA openFDA",
      url: `https://api.fda.gov/drug/label.json?search=set_id:"${encodeURIComponent(String(setId))}"`,
      retrievedAt, kind: "openfda" as const, passage,
    };
  }).filter((item: ClinicalSource) => item.passage);
}

async function dailyMed(query: string): Promise<ClinicalSource[]> {
  const url = new URL("https://dailymed.nlm.nih.gov/dailymed/services/v2/drugnames.json");
  url.search = new URLSearchParams({ drug_name: query, pagesize: "3" }).toString();
  const data = await getJson(url.toString());
  const entries = data?.data ?? [];
  const retrievedAt = new Date().toISOString();
  return entries.slice(0, 3).map((entry: any, index: number) => {
    const setid = String(entry?.setid ?? entry?.spl_set_id ?? "");
    const title = compact(entry?.drugname ?? entry?.name ?? query, 300);
    return {
      id: `DLM-${setid || index + 1}`, title: `${title} — DailyMed listing`,
      publisher: "US National Library of Medicine DailyMed",
      url: setid ? `https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=${setid}` : "https://dailymed.nlm.nih.gov/dailymed/",
      retrievedAt, kind: "dailymed" as const,
      passage: compact(`DailyMed current Structured Product Label listing for ${title}. Open the source label for complete prescribing information. This listing is not a substitute for the full label.`, 700),
    };
  });
}

export async function retrieveClinicalSources(question: string): Promise<ClinicalSource[]> {
  const key = question.toLowerCase().replace(/[^\p{L}\p{N} ]/gu, " ").replace(/\s+/g, " ").trim().slice(0, 180);
  const cached = cache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.value;
  const medicationLike = /\b(mg|mcg|microgram|tablet|capsule|dose|dosage|drug|medicine|interaction|side effect|contraindication)\b/i.test(question);
  const tasks = [pubmed(question)];
  if (medicationLike) tasks.push(openFda(question).catch(() => []), dailyMed(question).catch(() => []));
  const settled = await Promise.all(tasks.map((task) => task.catch(() => [])));
  const unique = new Map<string, ClinicalSource>();
  for (const source of settled.flat()) unique.set(source.id, source);
  const result = [...unique.values()].slice(0, 10);
  cache.set(key, { expiresAt: Date.now() + TTL_MS, value: result });
  return result;
}
