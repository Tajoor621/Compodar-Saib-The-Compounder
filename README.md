# My Doctor

Bilingual pharmacist and specialist desk for people far from a clinic. English and Urdu. The pack in your hand overrides the card. This is not a prescription.

## Added: Clinical drug information

A clinician-facing drug-information desk, separate from the patient medicine card.

- Open it in the app at Clinical drug information (`/drug-info`).
- Generic and brand names. Pakistan and Gulf examples when the library has them.
- Every medicine gets the same 13 sections: names, uses (off-label called out), mechanism, dosing, administration, contraindications and boxed warnings, major interactions, adverse effects, monitoring, pregnancy and breastfeeding, storage, counseling, and overdose.
- If a name could be more than one product, the desk asks which one before it gives details.
- A child's dose is withheld until age and weight are both given, and even then the card does not calculate mg/kg.
- Kidney, liver, pregnancy, and older age are flagged when mentioned. No dose is invented.
- Requests about self-harm or a harmful quantity get crisis contacts only: UAE 998/999 and 800-HOPE (800 4673), Pakistan 1122/115, United States 988. No dose and no lethal amount.
- A suspected overdose already taken is directed to emergency services or a poison centre.
- Every answer ends with: Verify against the current prescribing information and your local formulary before clinical use.
- The pharmacy specialty inside AI Assistant uses the same rules.
- This is an AI tool for licensed professionals. It does not replace the current label, a pharmacist, or a prescriber.

## Added: AI Knowledge Assistant

- Specialty assistants (general, cardiology, oncology, radiology/teaching, pediatrics, pharmacy)
- Knowledge topics: labs, drug interactions, guidelines, prognosis, chronic disease, surgical risk
- Disclaimer gate on first use
- Safety banner against identifiers + pattern check
- Local chat history (export/import, clear)
- Cited reference answers with verification reminder
- No server-side patient data storage

Imaging analysis and image generation are intentionally teaching-only / omitted for safety and free-tier limits. Wire a free model API (Groq, Google AI Studio, OpenRouter) later if desired.
