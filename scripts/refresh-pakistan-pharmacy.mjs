import { mkdir, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";

const sources = ["https://sehatmedi.com", "https://www.medishop.pk"];

async function getXml(url) {
  // curl also works in development environments that require an HTTPS proxy.
  const { status, stdout, stderr } = spawnSync(
    "curl",
    ["--fail", "--silent", "--show-error", "--compressed", "--max-time", "30", url],
    { encoding: "utf8", maxBuffer: 12 * 1024 * 1024 },
  );
  if (status !== 0) throw new Error(`Cannot read ${url}: ${stderr}`);
  return stdout;
}

function locations(xml) {
  return [...xml.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/g)].map((match) =>
    match[1].trim().replaceAll("&amp;", "&"),
  );
}

const stores = [];
for (const origin of sources) {
  const index = locations(await getXml(origin + "/sitemap.xml"))
    .map((location) => new URL(location))
    .filter((url) => url.origin === origin && /^\/sitemap_products_\d+\.xml$/.test(url.pathname));
  if (index.length === 0 || index.length > 50)
    throw new Error(`Unexpected sitemap index for ${origin}`);
  const handles = new Set();
  for (const url of index) {
    const xml = await getXml(url.href);
    for (const location of locations(xml)) {
      const product = new URL(location);
      if (product.origin !== origin) continue;
      const handle = /^\/products\/([\w-]+)\/?$/.exec(product.pathname)?.[1];
      if (handle) handles.add(handle);
    }
  }
  if (handles.size < 100) throw new Error(`Incomplete product sitemap for ${origin}`);
  stores.push([...handles].sort());
  console.log(`${origin}: ${handles.size} product links`);
}
const target = new URL("../public/pakistan-pharmacy/", import.meta.url);
await mkdir(target, { recursive: true });
await writeFile(
  new URL("catalog.json", target),
  JSON.stringify({ checkedAt: new Date().toISOString().slice(0, 10), stores }) + "\n",
);
