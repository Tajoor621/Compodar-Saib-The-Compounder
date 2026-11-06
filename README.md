# Compodar Saib The Compounder

Compodar Saib The Compounder is a bilingual (English / Urdu) clinical reference and patient-safety aid. It is not a diagnostic tool, prescriber, medical device, or substitute for a licensed clinician. It must not be used to make autonomous clinical decisions.

## Current implementation status

The AI assistant has a server-side retrieval-augmented answer path in progress:

- Provider adapters: Groq, Google Gemini (AI Studio), and OpenRouter.
- Primary provider selection: `AI_PROVIDER`; fallback attempts other configured providers.
- Current retrieval integrations: PubMed / NCBI E-utilities, openFDA drug labels, and DailyMed drug-name discovery.
- Retrieval cache: in-memory, 15-minute TTL.
- Answer generation uses retrieved passages only and requires source-ID citations.
- Citation IDs are checked against the retrieved set. Numeric dose expressions are rejected unless the exact expression occurs in a retrieved non-PubMed label passage.
- Questions containing detected identifiers are blocked before provider submission.
- Questions and retrieved passages are sent to the configured AI provider only when the user submits a question. They are not written to server logs by this feature.
- Chat history and disclaimer preference are stored in browser local storage on the user's device.

**Important limitations:** DailyMed currently supplies a product/SPL discovery record, not the full SPL label text. MedlinePlus Connect and WHO/NICE page retrieval are not yet integrated. The assistant is not streaming tokens and does not yet provide a stop-generation control. The clinical evaluation corpus and clinician sign-offs are not complete. The product is not approved for clinical deployment.

## Deployment

**GitHub Pages cannot host this application runtime.** The app is a TanStack Start server application with server functions, authentication, database access and AI endpoints. The GitHub Pages deployment currently runs Jekyll, which publishes repository documentation rather than building this application. A green Pages deployment is therefore not proof that the app is running.

The repository is configured for the Vercel Nitro output preset. The checked-in `vercel.json` explicitly installs development dependencies (required by Vite/TypeScript) and runs the production build. The Vite/Nitro build emits Vercel's Build Output API at `.vercel/output`; **do not set a custom Output Directory** that overrides this output.

### Vercel project settings

Import `Tajoor621/Compodar-Saib-The-Compounder` into Vercel and use:

| Setting | Value |
|---|---|
| Root Directory | `./` |
| Framework Preset | Other (use the repository's Nitro/Vercel preset) |
| Install Command | `npm install --no-audit --no-fund` |
| Build Command | `npm run build` |
| Output Directory | Leave unset; Nitro generates `.vercel/output` |
| Node.js | 22.x |

A successful Vercel production deployment and live browser verification have **not yet been confirmed**. The existing `github.io` address will continue to serve the GitHub Pages artifact; it does not automatically become a Vercel deployment. Use the Vercel-assigned domain (or a custom domain configured in Vercel) as the application URL.

### Environment variables

Configure the following in Vercel Project Settings → Environment Variables for Production and Preview as appropriate. Never commit secrets, put secrets in `VITE_*` variables, or create a committed `.env` file.

| Variable | Purpose |
|---|---|
| `VITE_AUTH_ENABLED` | Set to `true` for deployed authentication; this is a build-time client flag |
| `BETTER_AUTH_URL` | Exact public HTTPS origin of the deployed app |
| `BETTER_AUTH_SECRET` | Long, random server-only Better Auth signing secret |
| `DATABASE_URL` | Persistent PostgreSQL connection string; required for durable production users/sessions |
| `GROK_AUTH_ISSUER` | Auth broker issuer; defaults to `https://auth.grok.me` |
| `GROK_AUTH_CLIENT_ID` | Per-app OAuth broker client ID provisioned for the production callback URL |
| `GROK_AUTH_CLIENT_SECRET` | Matching server-only OAuth broker client secret |
| `GROK_PROJECT_ID` | Deployment project identifier used to distinguish deployed runtime from workspace preview |
| `AI_PROVIDER` | Primary provider: `groq`, `gemini`, or `openrouter` |
| `GROQ_API_KEY` | Groq server-side key |
| `GROQ_MODEL` | Optional Groq model override |
| `GEMINI_API_KEY` | Google AI Studio server-side key |
| `GEMINI_MODEL` | Optional Gemini model override |
| `OPENROUTER_API_KEY` | OpenRouter server-side key |
| `OPENROUTER_MODEL` | Optional OpenRouter model override |
| `XAI_API_KEY` | Optional server-side xAI key for medicine-pack photo reading; photo consent is required |
| `APP_URL` | Public app URL for OpenRouter attribution |
| `VITE_PUBLIC_HOSTNAME` | Optional public hostname used for share-card URLs; hostname only, no scheme |

At least one AI provider key is required for AI answers. Production authentication additionally requires a persistent PostgreSQL database, a stable Better Auth secret, and an OAuth broker client provisioned for the deployed callback URL. The embedded PGLite fallback is in-memory and must not be treated as durable production storage. Never use the preview-only OAuth client for a production callback.

## Privacy and safety

- Never enter names, dates of birth, phone numbers, email addresses, addresses, national identifiers, medical record numbers, or patient photos.
- A submitted question is used as a search query with public references (PubMed/NCBI, openFDA, and DailyMed where applicable); the question and retrieved passages are then sent to the configured model provider for processing.
- Medicine-pack photos are sent to xAI (Grok) only after the explicit photo-consent checkbox is selected; never upload patient scans or clinical images.
- The privacy page provides a clear-all control for localStorage, IndexedDB, browser Cache Storage and service-worker registrations; when Better Auth is enabled it also requests server-side sign-out. The app currently has no IndexedDB clinical-data store. If server sign-out cannot be confirmed, the page reports failure.
- Do not use real patient data. No patient identifiers should be submitted, even where a detector fails to recognize them.
- AI output is not a prescription or diagnosis. Verify every clinical decision against the current local label and current guideline with a licensed professional.
- Emergency symptoms require local emergency services; do not wait for an AI response.

## Supported languages and jurisdictions

The user interface and assistant response selection support English and Urdu. Clinical localization, verified country-specific crisis contacts, and regional formulary coverage for Pakistan and Gulf countries are incomplete and must not be assumed to be comprehensive.

## Clinical sources

- [PubMed / NCBI E-utilities](https://www.ncbi.nlm.nih.gov/books/NBK25501/)
- [openFDA drug labeling API](https://open.fda.gov/apis/drug/label/)
- [DailyMed](https://dailymed.nlm.nih.gov/dailymed/)

Retrieval date is attached to each returned source record. A listing or abstract is not equivalent to a complete guideline or official prescribing label.

## Quality and release

- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npm run eval`

The release evaluation gates are intentionally blocked until the required clinician-reviewed datasets are present and the measured thresholds pass. See [eval/REPORT.md](eval/REPORT.md) and [ACCEPTANCE_REPORT.md](ACCEPTANCE_REPORT.md) for the current measured checks and explicit release blockers.

## Known limitations and pre-deployment work

1. Finish full DailyMed SPL text retrieval, MedlinePlus Connect, and permitted WHO/NICE source retrieval.
2. Add true server streaming, cancellation, provider-specific error UX, and explicit external-processing consent separate from the general disclaimer.
3. Add complete identifier, injection, and privacy tests, including false-positive review by privacy/security specialists.
4. Verify crisis contacts and emergency numbers against official sources for every supported country.
5. Replace all non-source-backed medicine monograph content with current source-linked labels; clinician review is mandatory.
6. Complete the 300-question golden set, 100 adversarial prompts, 50 retrieval-grounding checks, and 100 clinician-reviewed triage scenarios.
7. Complete reviewer sign-off, WCAG 2.2 AA audit, Urdu RTL/Nastaliq testing, PWA offline safety verification, and performance budgets.
8. Deploy and verify on Vercel with server-side keys and run production smoke/security tests.
9. Obtain qualified clinical, privacy, security, and jurisdiction-specific regulatory review before any clinical deployment.

## Disclaimer

Compodar Saib The Compounder is an informational reference and triage aid only. It does not diagnose, prescribe, clear a patient, replace emergency services, or replace a licensed healthcare professional. It may be incomplete, inaccurate, outdated, or unavailable. Never delay urgent care or change treatment based on this application.
