# Changelog — Compodar Saib The Compounder

## 2026-11-06 — Compodar Saib The Compounder rebrand and grounded AI foundation

- Added server-only Groq, Gemini, and OpenRouter adapters with configured-provider fallback.
- Added PubMed E-utilities, openFDA drug-label, and DailyMed discovery retrieval with an in-memory TTL cache.
- Added source metadata and citation / numeric-dose validation.
- Replaced the assistant's local template answer generator with a TanStack server function.
- Added client and server identifier detection and prompt-injection neutralization.
- Added privacy disclosure language and source metadata to local chat history.
- Added privacy / injection regression tests and a release-blocking evaluation dataset-presence check.
- Upgraded Better Auth and Zod dependencies, applied transitive dependency overrides, and migrated generic OAuth client calls to Better Auth 1.7 social sign-in APIs.
- Added explicit xAI Grok photo-processing consent for the medicine-pack reader.
- Added the phase-by-phase acceptance report with measured CI outcomes and clinical release blockers.
- Documented limitations: full DailyMed SPL retrieval, MedlinePlus Connect, WHO/NICE retrieval, streaming, stop control, complete evaluation datasets, clinician review, Vercel deployment, and full privacy controls remain outstanding.

- Rebranded visible application identity, metadata, install-page/PWA fallback name, bilingual copy, exported chat filename, package metadata, and documentation to Compodar Saib The Compounder.
- The GitHub repository was subsequently renamed to `Compodar-Saib-The-Compounder`. Internal `mydoctor` source-module paths remain as private implementation namespaces; no runtime imports depend on the former repository slug.
