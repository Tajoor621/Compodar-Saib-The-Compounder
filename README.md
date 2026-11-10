# Compodar Saib The Compounder

Compodar Saib The Compounder is a bilingual (English / Urdu) clinical reference and patient-safety aid designed for users in Pakistan and the Gulf Cooperation Council (GCC) states. It combines the knowledge of a senior physician, clinical pharmacist familiar with local markets, pathologist, and home-remedies information desk. It provides evidence-based information, triage guidance, and practical suggestions. It is not a diagnostic tool, prescriber, medical device, or substitute for a licensed clinician. It must not be used to make autonomous clinical decisions.

## $0 Free Workflow

The app is designed for a zero-cost workflow:

- **Local monographs & drug information**: Fully offline, no API required.
- **Pack scanning**: Uses Groq free-tier vision models (default `qwen/qwen3.8-27b`). Set `GROQ_API_KEY` (free, no credit card). Optional `GROQ_VISION_MODEL` override.
- **AI clinical answers**: Prefers free models. Default OpenRouter free model (`...:free`) or Groq free tier. Set `GROQ_API_KEY` and/or `OPENROUTER_API_KEY`.
- **Hosting**: GitHub Pages (static client) is free. Server functions on Vercel free tier.

Only free-tier keys are needed for full AI features. Paid keys remain optional for higher limits.

## Current implementation status

The AI assistant has a server-side retrieval-augmented answer path:

- Provider adapters: Groq, Google Gemini (AI Studio), and OpenRouter.
- Primary provider selection: `AI_PROVIDER`; fallback attempts other configured providers.
- Current retrieval integrations: PubMed / NCBI E-utilities, openFDA drug labels, and DailyMed drug-name discovery.
- Retrieval cache: in-memory, 15-minute TTL.
- Answer generation uses retrieved passages only and requires source-ID citations.
- Citation IDs are checked against the retrieved set. Numeric dose expressions are rejected unless the exact expression occurs in a retrieved non-PubMed label passage.
- Questions containing detected identifiers are blocked before provider submission.
- Strengthened system prompt incorporates regional disease awareness (dengue, malaria, typhoid, hepatitis, TB in Pakistan; heat illness, diabetes, vitamin D in the Gulf), structured clinical response format (summary, likely causes, red flags, next steps, pharmacy notes, disclaimer), emergency triage guidance with local emergency numbers, clinical pharmacist and pathologist roles, labeled home remedies, and strict safety rules.
- Specialty assistants (general, cardiology, oncology, radiology teaching, pediatrics, clinical pharmacy) have been updated with aligned regional and structured guidance.
- Medicine-pack photo reader now uses **Groq free vision** (Qwen models) by default. Extracts medicine name, strength, form, active ingredients, visible indications, warnings, and side effects. Explicit photo consent is required. Patient scans and clinical images are refused. Falls back to typed name entry if unavailable.
- Questions and retrieved passages are sent to the configured AI provider only when the user submits a question. They are not written to server logs by this feature.
- Chat history and disclaimer preference are stored in browser local storage on the user's device.

**Important limitations:** DailyMed currently supplies a product/SPL discovery record, not the full SPL label text. MedlinePlus Connect and WHO/NICE page retrieval are not yet integrated. The assistant is not streaming tokens and does not yet provide a stop-generation control. The clinical evaluation corpus and clinician sign-offs are not complete. The product is not approved for clinical deployment. Regional formulary coverage and verified local brand lists remain incomplete and must be confirmed with DRAP, SFDA, MOHAP or the relevant regulator. Pack scanning accuracy depends on image quality and readable text; always verify against the physical pack and official label. Free-tier rate limits apply.

## Deployment

The public website is [https://tajoor621.github.io/Compodar-Saib-The-Compounder/](https://tajoor621.github.io/Compodar-Saib-The-Compounder/). A push to `main` builds the full client app and publishes it there. Opening that address loads the working desk: home, intake, the clinician desk, case view, pharmacy, drug information, the reference desk, and English / Urdu. It is not a rendered copy of this README.

GitHub Pages for this repository publishes the `main` branch. `npm run build:pages` writes the static app into the branch (`index.html`, `404.html`, and `assets/`) at base path `/Compodar-Saib-The-Compounder/`. A refresh on a client route loads that same shell. Questions, cases, and reference history stay in the browser. The reference desk quotes the notes stored in the app. Guidance is not a prescription, and the pack in hand overrides the card. The Vercel build ignores that shell (`renderer: false`) and keeps the TanStack Start server.

Hosted model answers, pack-photo upload, sign-in, and the database need the server runtime. Those screens stay in the public UI. On the static site they explain that the question or photo was not sent, instead of failing blank. The server runtime remains the Vercel Nitro build (`npm run build`).

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

Use the Vercel-assigned domain when you need the server runtime (hosted assistant, pack-photo reading, sign-in, and the database). The github.io address is the public static app and does not become a Vercel deployment by itself. A successful Vercel production deployment still depends on the project settings below and the server environment variables.

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
| `GROQ_API_KEY` | Groq server-side key (free tier recommended for $0) |
| `GROQ_MODEL` | Optional Groq model override (free-tier models preferred) |
| `GROQ_VISION_MODEL` | Optional Groq vision model for pack scanning (default free Qwen) |
| `GEMINI_API_KEY` | Google AI Studio server-side key (free tier available) |
| `GEMINI_MODEL` | Optional Gemini model override |
| `OPENROUTER_API_KEY` | OpenRouter server-side key |
| `OPENROUTER_MODEL` | Optional OpenRouter model override (default free `:free` model) |
| `APP_URL` | Public app URL for OpenRouter attribution |
| `VITE_PUBLIC_HOSTNAME` | Optional public hostname used for share-card URLs; hostname only, no scheme |

At least one AI provider key is required for AI answers and pack scanning. Free-tier keys are sufficient. Production authentication additionally requires a persistent PostgreSQL database, a stable Better Auth secret, and an OAuth broker client provisioned for the deployed callback URL. The embedded PGLite fallback is in-memory and must not be treated as durable production storage. Never use the preview-only OAuth client for a production callback.

## Privacy and safety

- Never enter names, dates of birth, phone numbers, email addresses, addresses, national identifiers, medical record numbers, or patient photos.
- A submitted question is used as a search query with public references (PubMed/NCBI, openFDA, and DailyMed where applicable); the question and retrieved passages are then sent to the configured model provider for processing.
- Medicine-pack photos are sent to the configured free-tier vision provider (Groq by default) only after the explicit photo-consent checkbox is selected; never upload patient scans or clinical images.
- The privacy page provides a clear-all control for localStorage, IndexedDB, browser Cache Storage and service-worker registrations; when Better Auth is enabled it also requests server-side sign-out. The app currently has no IndexedDB clinical-data store. If server sign-out cannot be confirmed, the page reports failure.
- Do not use real patient data. No patient identifiers should be submitted, even where a detector fails to recognize them.
- AI output is not a prescription or diagnosis. Verify every clinical decision against the current local label and current guideline with a licensed professional.
- Emergency symptoms require local emergency services; do not wait for an AI response. Confirm emergency numbers locally (Pakistan 1122/115, Saudi Arabia 997/911, UAE 998/999, Qatar 999, Kuwait 112, Bahrain 999, Oman 9999).

## Supported languages and jurisdictions

The user interface and assistant response selection support English and Urdu. Clinical localization, verified country-specific crisis contacts, and regional formulary coverage for Pakistan and Gulf countries are incomplete and must not be assumed to be comprehensive. Always verify medicine registration, availability, and pricing with DRAP (Pakistan) or the relevant GCC regulator (SFDA, MOHAP, etc.).

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

Compodar Saib The Compounder is an informational reference and triage aid only. It does not diagnose, prescribe, clear a patient, replace emergency services, or replace a licensed healthcare professional. It may be incomplete, inaccurate, outdated, or unavailable. Never delay urgent care or change treatment based on this application. Always verify with current official sources and a qualified clinician.
