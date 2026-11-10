import { resolve } from "node:path";
import type { Plugin } from "vite";
import { defineConfig } from "vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { PAGES_BASE } from "./scripts/pages-base.mjs";

const root = resolve(import.meta.dirname);

function pagesStubs(): Plugin {
  const answer = resolve(root, "src/lib/ai/answer.pages.ts");
  const pack = resolve(root, "src/lib/mydoctor/read-pack.pages.ts");
  return {
    name: "compodar-pages-stubs",
    enforce: "pre",
    resolveId(id) {
      const clean = id.split("?")[0] ?? id;
      if (clean.endsWith("/lib/ai/answer") || clean.endsWith("/lib/ai/answer.ts") || clean === "@/lib/ai/answer") {
        return answer;
      }
      if (
        clean.endsWith("/lib/mydoctor/read-pack") ||
        clean.endsWith("/lib/mydoctor/read-pack.ts") ||
        clean === "@/lib/mydoctor/read-pack"
      ) {
        return pack;
      }
      return null;
    },
  };
}

/**
 * Static client build for GitHub Pages. The Vercel/Nitro server build stays on
 * `vite.config.ts` and `npm run build`.
 */
export default defineConfig({
  base: PAGES_BASE,
  plugins: [pagesStubs(), tailwindcss(), viteReact()],
  resolve: { tsconfigPaths: true },
  build: {
    outDir: "dist-pages",
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(root, "index.pages.html"),
    },
  },
});
