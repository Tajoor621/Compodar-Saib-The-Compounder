import { spawnSync } from "node:child_process";
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PAGES_BASE, PAGES_ROUTES } from "./pages-base.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "dist-pages");

const childEnv = {
  ...process.env,
  VITE_AUTH_ENABLED: "false",
  VITE_STATIC_PAGES: "true",
};

const built = spawnSync(
  process.execPath,
  [join(root, "node_modules/vite/bin/vite.js"), "build", "--config", "vite.pages.config.ts"],
  { cwd: root, stdio: "inherit", env: childEnv },
);
if (built.status !== 0) process.exit(built.status ?? 1);

const htmlPath = join(outDir, "index.pages.html");
const html = readFileSync(htmlPath, "utf8");
writeFileSync(join(outDir, "index.html"), html);
writeFileSync(join(outDir, "404.html"), html);
rmSync(htmlPath);

for (const route of PAGES_ROUTES) {
  const dir = join(outDir, route);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), html);
}

writeFileSync(join(outDir, ".nojekyll"), "");
writeFileSync(
  join(outDir, "manifest.webmanifest"),
  JSON.stringify(
    {
      name: "Compodar Saib The Compounder",
      short_name: "Compodar Saib",
      id: PAGES_BASE,
      start_url: PAGES_BASE,
      scope: PAGES_BASE,
      display: "standalone",
      background_color: "#f3efe6",
      theme_color: "#1B5E4F",
      icons: [
        {
          src: `${PAGES_BASE}__grok/icon-180.png`,
          sizes: "180x180",
          type: "image/png",
        },
      ],
    },
    null,
    2,
  ),
);

if (!html.includes(`${PAGES_BASE}assets/`)) {
  console.error("Pages HTML is missing base-prefixed assets.");
  process.exit(1);
}
if (!html.includes('id="app"')) {
  console.error("Pages HTML is missing the app root.");
  process.exit(1);
}

// GitHub Pages for this repo publishes the main branch root with the legacy
// builder. The same files have to live in the repository, not only in the
// Actions artifact, or the public URL keeps serving the README.
writeFileSync(join(root, "index.html"), html);
writeFileSync(join(root, "404.html"), html);
writeFileSync(join(root, ".nojekyll"), "");
cpSync(join(outDir, "manifest.webmanifest"), join(root, "manifest.webmanifest"));
cpSync(join(outDir, "favicon.svg"), join(root, "favicon.svg"));
rmSync(join(root, "assets"), { recursive: true, force: true });
cpSync(join(outDir, "assets"), join(root, "assets"), { recursive: true });
mkdirSync(join(root, "__grok"), { recursive: true });
cpSync(join(outDir, "__grok/icon-180.png"), join(root, "__grok/icon-180.png"));
for (const route of PAGES_ROUTES) {
  const dir = join(root, route);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), html);
}
console.log(`GitHub Pages site written to ${outDir} and the repository root`);
