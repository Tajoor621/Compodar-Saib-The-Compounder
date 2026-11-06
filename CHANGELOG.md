# Changelog

## 2026-11-06 — Grounded AI and safety foundation

- Added server-only Groq, Gemini, and OpenRouter adapters with configured-provider fallback.
- Added PubMed E-utilities, openFDA drug-label, and DailyMed discovery retrieval with an in-memory TTL cache.
- Added source metadata and citation / numeric-dose validation.
- Replaced the assistant's local template answer generator with a TanStack server function.
- Added client and server identifier detection and prompt-injection neutralization.
- Added privacy disclosure language and source metadata to local chat history.
- Added privacy / injection regression tests and a release-blocking evaluation dataset-presence check.
- Documented limitations: full DailyMed SPL retrieval, MedlinePlus Connect, WHO/NICE retrieval, streaming, stop control, complete evaluation datasets, clinician review, Vercel deployment, and full privacy controls remain outstanding.
