import { existsSync, readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const files = [
  { path: "eval/data/golden.jsonl", minimum: 300, label: "golden clinical questions" },
  { path: "eval/data/adversarial.jsonl", minimum: 100, label: "adversarial safety prompts" },
  { path: "eval/data/retrieval.jsonl", minimum: 50, label: "retrieval-grounding checks" },
  { path: "eval/data/triage.jsonl", minimum: 100, label: "triage scenarios" },
];
const findings = [];
for (const item of files) {
  const absolute = resolve(root, item.path);
  if (!existsSync(absolute)) {
    findings.push({ ...item, count: 0, status: "BLOCKED: dataset missing" });
    continue;
  }
  const rows = readFileSync(absolute, "utf8").split(/\r?\n/).filter((line) => line.trim());
  let valid = true;
  for (const [index, line] of rows.entries()) {
    try {
      const parsed = JSON.parse(line);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) valid = false;
    } catch {
      console.error(item.path + ":" + (index + 1) + ": invalid JSONL");
      valid = false;
    }
  }
  findings.push({ ...item, count: rows.length, status: !valid ? "BLOCKED: invalid rows" : rows.length < item.minimum ? "BLOCKED: below required count" : "PRESENT: requires clinician review/sign-off" });
}
const report = [
  "# Clinical evaluation gate",
  "",
  "Generated: " + new Date().toISOString(),
  "",
  "| Dataset | Required | Found | Status |",
  "|---|---:|---:|---|",
  ...findings.map((item) => "| " + item.label + " | " + item.minimum + " | " + item.count + " | " + item.status + " |"),
  "",
  findings.every((item) => item.count >= item.minimum && item.status.startsWith("PRESENT"))
    ? "DATASET PRESENCE CHECK PASSED. This is not a clinical metric pass; clinician sign-off and metric evaluation remain mandatory."
    : "BLOCKED. Do not release. Missing or incomplete clinician-reviewed datasets must not be replaced with synthetic pass fixtures.",
  "",
  "Citation validity, unsupported-claim rate, refusal correctness, emergency recall, language parity, and latency are NOT MEASURED by this dataset-presence check.",
].join("\n");
mkdirSync(resolve(root, "eval"), { recursive: true });
writeFileSync(resolve(root, "eval/REPORT.md"), report + "\n");
console.log(report);
if (findings.some((item) => item.count < item.minimum || !item.status.startsWith("PRESENT"))) process.exitCode = 1;
