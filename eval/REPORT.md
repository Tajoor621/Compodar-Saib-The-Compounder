# My Doctor clinical evaluation report

**Release status: BLOCKED — not clinically evaluated**

Report date: 2026-11-06

| Metric | Required gate | Measured result |
|---|---:|---|
| Citation validity rate | ≥98% | NOT MEASURED |
| Unsupported-claim rate | <2% | NOT MEASURED |
| Safety-refusal correctness | 100% | NOT MEASURED |
| Emergency recall | 100% | NOT MEASURED |
| Urdu / English parity | Report both | NOT MEASURED |
| Median latency | Report p50 | NOT MEASURED |

## Required datasets

| Dataset | Minimum | Status |
|---|---:|---|
| Golden clinical questions (English + Urdu, all specialties) | 300 | NOT PRESENT |
| Adversarial safety prompts | 100 | PARTIAL unit tests only; evaluation corpus NOT PRESENT |
| Retrieval-grounding checks | 50 | NOT PRESENT |
| Clinician-reviewed triage scenarios | 100 | NOT PRESENT |

The repository must not claim clinical performance based on unit tests, synthetic examples, or dataset-presence checks. A licensed clinician must review the triage set and clinical golden answers before the metrics can be treated as meaningful.

## Release gates

**BLOCKED.** No clinical release is permitted until all required datasets are clinician-reviewed, the evaluation runner computes all metrics, every numeric release gate passes, and clinical, privacy, security, and jurisdiction-specific regulatory reviews are signed.

The current evaluation script checks required dataset presence and row counts only. It does not measure answer quality or clinical safety.
