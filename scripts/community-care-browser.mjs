import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { PAGES_BASE } from "./pages-base.mjs";

const directory = fileURLToPath(new URL("../dist-pages/", import.meta.url));
const contentTypes = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".webmanifest": "application/manifest+json",
  ".png": "image/png",
};
const server = createServer(async (req, res) => {
  const pathname = new URL(req.url, "http://localhost").pathname;
  const requested = resolve(directory, pathname.slice(PAGES_BASE.length));
  if (
    !pathname.startsWith(PAGES_BASE) ||
    (requested + sep !== directory && !requested.startsWith(directory))
  ) {
    res.writeHead(404).end();
    return;
  }
  const file = pathname.endsWith("/") ? resolve(requested, "index.html") : requested;
  try {
    const body = await readFile(file);
    res
      .writeHead(200, { "Content-Type": contentTypes[extname(file)] ?? "application/octet-stream" })
      .end(body);
  } catch {
    res.writeHead(404).end();
  }
});
await new Promise((done) => server.listen(0, "127.0.0.1", done));

let browser;
try {
  browser = await chromium.launch({ args: ["--no-sandbox"] });
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 1280, height: 800 },
  ]) {
    const context = await browser.newContext({ viewport });
    try {
      const page = await context.newPage();
      const base = `http://127.0.0.1:${server.address().port}${PAGES_BASE}`;
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto(base);
      await page.getByRole("link", { name: /Community care.*Danger signs/ }).click();
      await page.getByRole("heading", { name: "Community care", exact: true }).waitFor();
      assert.equal(await page.locator('a[href^="tel:"]').count(), 0);
      await page.getByLabel("Where is the patient now?").selectOption("BD");
      assert.equal(
        await page.getByRole("link", { name: "Call 999" }).getAttribute("href"),
        "tel:999",
      );
      assert.equal(
        await page.getByRole("link", { name: "Call 16263" }).getAttribute("href"),
        "tel:16263",
      );
      await page.getByLabel("Village, town or district").fill("Rangpur");
      const map = new URL(
        await page.getByRole("link", { name: "Search on Google Maps" }).getAttribute("href"),
      );
      assert.match(map.searchParams.get("query"), /Rangpur, Bangladesh/);
      await page.getByRole("button", { name: "Not sure", exact: true }).click();
      await page.getByText("Get emergency help now", { exact: true }).waitFor();
      assert.equal(
        await page.getByRole("heading", { name: "Care while arranging help" }).count(),
        0,
      );
      await page.getByRole("button", { name: "Check again" }).click();
      await page.getByText("Struggling to breathe", { exact: false }).waitFor();
      await page.getByRole("button", { name: "اردو", exact: true }).click();
      await page.waitForFunction(() => document.documentElement.dir === "rtl");
      await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
      await context.setOffline(true);
      const response = await page.goto(base + "community-care/");
      assert.equal(response?.fromServiceWorker(), true);
      await page.getByRole("heading", { name: "مقامی طبی رہنمائی", exact: true }).waitFor();
      await page.getByText("دست یا قے", { exact: true }).click();
      await page.getByText(/پیکٹ کو اتنے ہی صاف پانی/).waitFor();
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
        false,
      );
      assert.deepEqual(errors, []);
    } finally {
      await context.close();
    }
  }
  console.log(
    "Community care passed desktop and mobile viewport checks, including an offline reload.",
  );
} finally {
  await browser?.close();
  server.close();
}
