# Compodar Saib The Compounder — Acceptance report

**Decision: RELEASE BLOCKED.** This repository has a working server-side AI foundation and privacy/safety improvements, but it does not meet the clinical evaluation, complete retrieval, clinician-review, or deployment requirements. Do not use it for clinical decisions or deploy it as a clinical product.

- Report date: 2026-11-06
- Branch: main
- Verified CI run: https://github.com/Tajoor621/Compodar-Saib-The-Compounder/actions/runs/42214215576
- Current deployment status: Vercel deployment NOT VERIFIED. The supplied public URL is GitHub Pages, which cannot execute TanStack Start server functions.

## Application identity update

- Official application name: **Compodar Saib The Compounder**.
- Updated browser title and description, Open Graph site title, visible header, privacy-page brand, English/Urdu brand copy, PWA fallback name, installation-page identity, assistant-history export filename, package name, README, model card, changelog, and acceptance report.
- PWA manifest uses the full official name and the compact launcher label **Compodar Saib**.
- The GitHub repository has since been renamed to `Compodar-Saib-The-Compounder`. The `src/lib/mydoctor` and `src/components/mydoctor` directories remain internal source-module namespaces; they are not user-facing branding. They are intentionally retained until a coordinated import-path migration is separately tested.
- GitHub Pages build/deployment for the branding revision: https://github.com/Tajoor621/Compodar-Saib-The-Compounder/actions/runs/42214215434 (PASS).

## Phase-by-phase result

| Phase | Result | Evidence / remaining blockers |
|---|---|---|
| 1 — Real answers | PARTIAL | Added Groq, Gemini, and OpenRouter server-side adapters, configured primary provider/fallback, PubMed abstracts, openFDA labels, DailyMed discovery, source metadata, citation validation, numeric-dose validation, and insufficient-source fallback. Full DailyMed SPL text, MedlinePlus Connect, WHO/NICE retrieval, provider-specific error UX, true token streaming, and stop/cancel remain incomplete. |
| 2 — Safety and privacy | PARTIAL | Added date/ID/CNIC/phone/email/address/name detection, Urdu identifier patterns, server-side blocking, injection neutralization, intake submission blocking, privacy page, local data erasure, and explicit xAI photo consent. Crisis contacts are not verified for every country. A reliable pre-upload patient-scan classifier/hard block is NOT VERIFIED; the photo reader prompt asks xAI to refuse non-pack images, but the image has already been sent to xAI for that check. |
| 3 — Complete drug knowledge | NOT COMPLETE | Existing monographs have not been rebuilt from current DailyMed/openFDA label text. The 13-section completeness, label version, retrieval date, regional formulary/pricing dates, and mandatory visible clinician-review status have NOT been verified for every medicine. |
| 4 — Specialties and features | NOT COMPLETE | No verified configuration/sign-off set for all requested specialties. The 100-scenario clinician-reviewed triage corpus and 100% RED recall are NOT PRESENT. No verified country-specific emergency number set. Teaching-only imaging hard block is NOT VERIFIED. |
| 5 — Quality and evaluation | BLOCKED | Added a dataset-presence release gate only. Golden set (300), adversarial set (100), retrieval checks (50), and clinician-reviewed triage set (100) are missing. Citation validity, unsupported-claim rate, refusal correctness, emergency recall, language parity, and median latency are NOT MEASURED. |
| 6 — UX, accessibility, performance | PARTIAL | Bilingual privacy and assistant copy, privacy route, and clear-data control added. WCAG 2.2 AA, keyboard/screen-reader, contrast, Urdu RTL/Nastaliq, offline-cache safety, FCP, and JavaScript budget audits are NOT VERIFIED. |
| 7 — Operations and documentation | PARTIAL | Added CI, README, model card, changelog, evaluation report, and this acceptance report. Dependency audit currently passes. Full repository test suite still has 16 failures in environment/scaffolding tests requiring missing .grok/skills/og files and .grok/app-env.json. Structured redacted observability, outage dashboard, Vercel deployment, and operational smoke tests remain NOT VERIFIED. |

## Verified CI results

From CI run 42214215576 (renamed-repository main revision):

| Check | Result |
|---|---|
| Dependency install | PASS |
| Typecheck | PASS |
| Lint | PASS |
| Focused clinical and safety tests | PASS — 164 tests, 164 passed, 0 failed |
| Full repository test suite | FAIL — 198 tests, 182 passed, 16 failed |
| Clinical evaluation release gate | FAIL — all four required datasets missing |
| Dependency audit | PASS — 0 vulnerabilities reported |
| Production-mode compile | PASS |

The 16 full-suite failures remain unresolved. At least four are directly attributable to absent .grok/skills/og/SKILL.md and .grok/app-env.json scaffolding; the remaining failures are in PWA metadata and app-environment harness assumptions and have not yet been fully triaged. None has been waived or counted as passing.

## Privacy and external processing

- Persisted browser data includes language/jurisdiction settings, signer name, saved case records and their free-text fields, assistant history, and disclaimer/consent preference.
- Submitted assistant questions are used as queries against public retrieval services and are sent with retrieved passages to the configured Groq, Gemini, or OpenRouter model provider.
- Medicine-pack photos are resized in the browser and sent to xAI Grok only after the explicit photo-consent checkbox is selected. The photo reader is not a local OCR implementation.
- The clear-all control clears localStorage, IndexedDB databases, Cache Storage, service-worker registrations, and requests Better Auth sign-out when enabled. If sign-out cannot be confirmed, it reports failure.
- Identifier detection is a safety layer, not a guarantee. Do not enter real patient data.

## Release gates

- Citation validity ≥98%: NOT MEASURED.
- Unsupported-claim rate <2%: NOT MEASURED.
- Safety-refusal correctness 100%: NOT MEASURED.
- Emergency recall 100%: NOT MEASURED.
- English/Urdu parity: NOT MEASURED.
- Median latency: NOT MEASURED.

**All clinical release gates remain BLOCKED.**

## Required licensed-clinician review

1. Review and approve every medicine monograph, dose section, contraindication, interaction, pregnancy/lactation section, overdose section, and regional formulary note.
2. Review every specialty prompt, approved-source list, red-flag trigger, and specialty evaluation set.
3. Review all 100 triage scenarios, including RED cases, and sign off the emergency-recall result.
4. Verify crisis contacts and emergency numbers against official sources for every supported country.
5. Review the 300-question golden set, 100 adversarial prompts, and 50 retrieval-grounding checks before their metrics are used as release evidence.
6. Approve the reviewer workflow and ensure reviewer IDs/sign-offs contain no patient data.

## Required security, privacy, and regulatory review

1. Complete a privacy impact assessment of browser storage, retrieval-provider queries, AI-provider processing, xAI photo processing, Better Auth sessions, and the clear-all flow.
2. Verify the photo reader cannot be used to interpret patient scans; a prompt-only refusal is not a hard upload block.
3. Verify Better Auth callback URLs and broker configuration after the 1.7 upgrade.
4. Deploy to Vercel with server-only keys and verify the server functions, database behavior, session deletion, and provider failover in production.
5. Obtain jurisdiction-specific legal/regulatory review for the UAE, Pakistan, and any other country supported, including medical-device/software classification, health-data privacy, clinical governance, and required approvals.

No regulatory approval, clinical certification, medical-device status, or production readiness is claimed.
