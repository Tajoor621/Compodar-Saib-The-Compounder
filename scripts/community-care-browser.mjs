import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
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
  try {
    const entry = await stat(requested).catch(() => null);
    const file = entry?.isDirectory() ? resolve(requested, "index.html") : requested;
    const body = await readFile(file);
    res
      .writeHead(200, { "Content-Type": contentTypes[extname(file)] ?? "application/octet-stream" })
      .end(body);
  } catch {
    if (req.headers.accept?.includes("text/html")) {
      res
        .writeHead(404, { "Content-Type": "text/html" })
        .end(await readFile(resolve(directory, "404.html")));
      return;
    }
    res.writeHead(404).end();
  }
});
await new Promise((done) => server.listen(0, "127.0.0.1", done));

async function verifyOtherScreens(page, base) {
  const open = async (route, heading) => {
    const response = await page.goto(base + route);
    assert.equal(response?.ok(), true);
    await page.getByRole("heading", { name: heading, exact: true }).waitFor();
  };

  await open("pharmacy/?q=Panadol", "Pharmacist desk");
  await page.waitForFunction(() => document.querySelector("main input")?.value === "Panadol");
  await page
    .getByRole("heading", { name: /paracetamol/i })
    .first()
    .waitFor();
  assert.equal(await page.locator("input[type=file]").count(), 0);

  await open("drug-info/", "Clinical drug information");
  await page.getByLabel("Generic or brand").fill("paracetamol");
  await page.getByRole("button", { name: "Show drug information" }).click();
  await page.getByRole("heading", { name: /^paracetamol\b/i }).waitFor();

  await open("assistant/", "Before we begin");
  await page.getByRole("button", { name: /I understand/ }).click();
  await page.getByLabel("Question", { exact: true }).fill("Paracetamol with warfarin");
  await page.getByLabel("Question", { exact: true }).press("Enter");
  await page.waitForFunction(() =>
    localStorage.getItem("mydoctor-reference-history")?.includes("local-shelf:paracetamol"),
  );
  await open("reference/", "Reference desk");
  await page.getByRole("paragraph").filter({ hasText: /^Paracetamol with warfarin$/ }).waitFor();

  await open("desks/", "Specialist desks");
  await page.locator("input[type=file]").setInputFiles({
    name: "broken.json",
    mimeType: "application/json",
    buffer: Buffer.from(
      JSON.stringify({
        kind: "compodar-saib-portable",
        version: 1,
        profiles: [],
        reports: [{ id: "broken" }],
      }),
    ),
  });
  await page
    .getByRole("alert")
    .getByText(/not a profiles and reports export/)
    .waitFor();
  await page.getByRole("button", { name: "New profile" }).click();
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await page.getByRole("button", { name: /Family doctor/ }).click();
  await page.locator("main textarea").fill("Chest tightness");
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await page.getByRole("button", { name: "Yes", exact: true }).click();
  await page
    .getByRole("link", { name: "Find the emergency number for your current location" })
    .waitFor();
  await open("desks/", "Specialist desks");
  await page.getByRole("button", { name: /Chest tightness/ }).click();
  await page
    .getByRole("link", { name: "Find the emergency number for your current location" })
    .waitFor();

  await open("intake/", "Before we begin");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page
    .getByRole("group", { name: "Pregnant, or could be?" })
    .getByRole("button", { name: "No", exact: true })
    .click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page
    .getByLabel("Town or village missing? Select your current country")
    .selectOption("country:BD");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.locator("main textarea").fill("Chest tightness");
  await page.getByRole("button", { name: "Hours", exact: true }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: "Yes", exact: true }).click();
  await page.locator('main a[href="tel:999"]').waitFor();
  await page.reload();
  await page.locator('main a[href="tel:999"]').waitFor();
  await open("desk/", "Clinician desk");
  await page.getByRole("link", { name: /Chest tightness/ }).waitFor();

  await open("privacy/", "Privacy and data handling");
  await page.evaluate(() => localStorage.setItem("another-app-setting", "keep"));
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Clear all local app data" }).click();
  await page
    .getByRole("status")
    .getByText(/Local app data was cleared/)
    .waitFor();
  assert.equal(await page.evaluate(() => localStorage.getItem("another-app-setting")), "keep");
  assert.equal(
    await page.evaluate(
      () => Object.keys(localStorage).filter((key) => key.startsWith("mydoctor")).length,
    ),
    0,
  );
  await page.getByRole("link", { name: "Return to home" }).click();
  await page.waitForURL((url) => url.pathname.replace(/\/$/, "") === PAGES_BASE.slice(0, -1));
}

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
      if (viewport.width === 1280) {
        await context.setOffline(false);
        await page.getByRole("button", { name: "EN", exact: true }).click();
        await verifyOtherScreens(page, base);
      }
      assert.deepEqual(errors, []);
    } finally {
      await context.close();
    }
  }
  console.log(
    "Public routes passed browser checks, including community care on mobile and offline.",
  );
} finally {
  await browser?.close();
  server.close();
}
