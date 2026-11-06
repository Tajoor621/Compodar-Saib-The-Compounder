# Model card — My Doctor

## Intended use

Bilingual clinical reference and patient-safety information aid. Not a diagnostic tool, prescriber, medical device, autonomous triage authority, or replacement for licensed clinicians or emergency services.

## Model providers

The server-side adapter supports provider selection through AI_PROVIDER and optional fallback to other configured providers:

- Groq (default model: llama-3.3-70b-versatile; configurable through GROQ_MODEL)
- Google AI Studio Gemini (default model: gemini-2.5-flash; configurable through GEMINI_MODEL)
- OpenRouter (default model: meta-llama/llama-3.3-70b-instruct:free; configurable through OPENROUTER_MODEL)

Provider model names and free-tier availability can change. Configure keys only as server environment variables. Do not put secrets in source control or browser-visible VITE_ variables.

## Image / photo processing

The medicine-pack OCR reader uses xAI Grok through the server-side XAI_API_KEY. The browser requires an explicit photo-consent checkbox before invoking the server function. It is intended only for medicine packaging, not patient scans or clinical images. The image is resized in the browser and sent to xAI; the app does not add it to assistant chat history. This is not a local OCR path.

## Retrieval sources

- PubMed / NCBI E-utilities: article metadata and abstracts when available.
- openFDA: public drug-label fields.
- DailyMed: current SPL discovery listing; full SPL text retrieval is not yet complete.

MedlinePlus Connect and permitted WHO/NICE retrieval are not implemented yet.

## Safeguards

- Retrieval-augmented prompting with untrusted question/source framing.
- Source ID validation.
- Numeric dose validation against retrieved non-PubMed label passages.
- One regeneration attempt for invalid citation/dose output.
- Fallback to insufficient-evidence response on citation validation failure.
- Provider fallback on provider errors.
- Client and server identifier detection; no server-side raw question logging in the implemented answer function.
- Prompt-injection phrase neutralization.

## Known failure modes and limitations

- A PubMed abstract may be incomplete, outdated, or not a guideline.
- DailyMed discovery entries are not the complete prescribing label.
- openFDA coverage is US-label oriented and may not match local products or approved local labeling.
- Query-to-source matching can miss relevant evidence or retrieve irrelevant evidence.
- LLM output can omit nuance, misread passages, or fail citation formatting; validation is not proof of clinical correctness.
- No token streaming or cancellation control yet.
- No measured Urdu/English parity, clinical refusal correctness, emergency recall, or latency.
- No licensed clinician sign-off or regulatory determination.

## Evaluation

See eval/REPORT.md. All clinical metrics are currently NOT MEASURED; release is blocked.
