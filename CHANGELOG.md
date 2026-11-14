# Changelog — Compodar Saib The Compounder

## Unreleased

- Made the public assistant answer from the same offline references as the Reference desk, and corrected server pack-photo consent to identify Groq.
- Scoped local data removal to Compodar Saib and fixed the post-clear route for GitHub Pages. Validated saved report and chat formats before loading imports.
- Extended browser checks across intake and case recovery, specialist desks, reference assistant, pharmacy, drug information and privacy.

- Added bilingual community care with a danger-sign check, South Asian emergency contacts, village and district service search, and four sourced care guides.
- Detailed intake accepts a country when the town is unlisted and uses that location for emergency contacts. Missing and unsupported locations use local-help guidance without a guessed number or medicine brand.
- Patient-facing chest symptom results direct people to clinical assessment and emergency care and remove automatic aspirin suggestions.
- GitHub Pages caches the static app after the first visit and publishes the Community Care and Specialist desks entry pages together with the matching assets.

## 2026-11-10 — Public GitHub Pages site

- A push to `main` builds the full client app and publishes it at `https://tajoor621.github.io/Compodar-Saib-The-Compounder/`, replacing the Jekyll README page.
- The static site includes home, intake, the clinician desk, case view, pharmacy, drug information, the reference desk, and English / Urdu. Client routes survive a refresh.
- Hosted model calls, pack-photo upload, sign-in, and the database stay on the Vercel/Nitro build. On the public static site those actions say they were not sent, and the rest of the desk still works.

## 2026-11-10 — On-device reference desk

- Added a reference desk that answers only by quoting shelf cards and intake safety-check notes already stored in the app.
- Keyword retrieval stays in the browser. If a note does not match, the desk says so and does not guess.
- Dosing answers require a quoted card line and a reminder to confirm the amount with the current label or a pharmacist. Child questions do not print a numeric dose unless age and weight are given and the number is inside that quote.
- Questions that look like names, birth dates, record numbers, or other identifiers are warned and are not searched or saved.
- Reference history is kept in this browser, with clear, export, and import. The existing assistant disclaimer is reused when it was already accepted.
- Imaging interpretation, image generation, subscriptions, and any new hosted model call were not added.

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
