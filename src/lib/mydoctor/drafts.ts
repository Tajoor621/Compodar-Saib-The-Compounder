import { careFor } from "./suggestions.ts";
import type { Citation, GateResult, Intake, RoutingDecision, SpecialistDraft } from "./types.ts";
import { DRAFT_LABEL } from "./types.ts";

const NICE = "NICE";

function cite(title: string, href: string, publisher = NICE): Citation {
  return { title, publisher, href };
}

const COMMON: Record<string, Citation> = {
  chest: cite("Chest pain of recent onset: assessment and diagnosis (CG95)", "https://www.nice.org.uk/guidance/cg95"),
  acs: cite("Acute coronary syndromes (NG185)", "https://www.nice.org.uk/guidance/ng185"),
  sepsis: cite("Sepsis: recognition, diagnosis and early management (NG51)", "https://www.nice.org.uk/guidance/ng51"),
  stroke: cite("Stroke", "https://www.nhs.uk/conditions/stroke/", "NHS"),
  urticaria: cite("Urticaria", "https://cks.nice.org.uk/topics/urticaria/", "NICE CKS"),
  eczema: cite("Atopic eczema in under 12s (CG57)", "https://www.nice.org.uk/guidance/cg57"),
  depression: cite("Depression in adults: treatment and management (NG222)", "https://www.nice.org.uk/guidance/ng222"),
  feverChild: cite("Fever in under 5s: assessment and initial management (NG143)", "https://www.nice.org.uk/guidance/ng143"),
  diabetes: cite("Type 2 diabetes in adults: management (NG28)", "https://www.nice.org.uk/guidance/ng28"),
  anaphylaxis: cite("Anaphylaxis: assessment and referral (CG134)", "https://www.nice.org.uk/guidance/cg134"),
  head: cite("Head injury: assessment and early management (CG176)", "https://www.nice.org.uk/guidance/cg176"),
  pregnancy: cite("Ectopic pregnancy and miscarriage (NG126)", "https://www.nice.org.uk/guidance/ng126"),
  selfHarm: cite("Self-harm: assessment, management and preventing recurrence (NG225)", "https://www.nice.org.uk/guidance/ng225"),
};

export function buildDraft(routing: RoutingDecision, intake: Intake, gate: GateResult): SpecialistDraft {
  const flags = [...gate.hits, ...gate.pending].map((hit) => `${hit.ruleId} (${hit.domain})`);
  const base = {
    redFlagsPresent: flags,
    urgencyRecommendation: routing.urgency,
    label: DRAFT_LABEL,
  } satisfies Pick<SpecialistDraft, "redFlagsPresent" | "urgencyRecommendation" | "label">;

  if (routing.halted || routing.urgency === "RED") {
    return {
      ...base,
      suggestedSpecialistType: "Emergency care first. A specialty opinion follows only after the person is safe.",
      rankedDifferential: cantMiss(gate),
      recommendedInvestigations: [
        "None from this app. Do not delay transfer for a community test.",
        "The receiving team decides ECG, glucose, imaging, or observations.",
      ],
      citations: citationsForGate(gate),
      uncertaintyStatement:
        "This draft must not be used to downgrade a red flag or to reassure the patient. The rule engine already fired. History may be incomplete because questioning stopped.",
    };
  }

  switch (routing.primarySpecialty) {
    case "dermatology":
      return {
        ...base,
        suggestedSpecialistType: "Dermatology",
        rankedDifferential: [
          { name: "Urticaria or eczematous dermatitis", confidence: "low", evidence: "Itch and duration from history only." },
          { name: "Superficial skin infection", confidence: "low", evidence: "Consider only if fever or spreading redness was reported." },
          { name: "Unclassified rash", confidence: "low", evidence: "No image is interpreted by this draft." },
        ],
        recommendedInvestigations: careFor(routing, intake).tests.map((item) => item.en),
        citations: [COMMON.urticaria, COMMON.eczema],
        uncertaintyStatement:
          "Pattern matching on words is not a skin diagnosis. A normal photo, if one was named, was not read and cannot lower urgency.",
      };
    case "cardiology":
      return {
        ...base,
        suggestedSpecialistType: "Cardiology",
        rankedDifferential: [
          { name: "Possible anginal symptoms", confidence: "low", evidence: "Effort-related chest words without current red-flag features." },
          { name: "Non-cardiac chest symptom", confidence: "low", evidence: "History alone cannot separate these." },
          { name: "Arrhythmia symptoms", confidence: "low", evidence: "Only if palpitation was described." },
        ],
        recommendedInvestigations: careFor(routing, intake).tests.map((item) => item.en),
        citations: [COMMON.chest, COMMON.acs],
        uncertaintyStatement:
          "Red-flag features were screened and not confirmed. That is not a rule-out of acute coronary syndrome. If pain returns with sweat, breathlessness, or radiation, the emergency rule applies.",
      };
    case "pediatrics":
      return {
        ...base,
        suggestedSpecialistType: "Paediatrics",
        rankedDifferential: [
          { name: "Self-limited childhood illness", confidence: "low", evidence: "Danger-sign screen was negative." },
          { name: "Dehydration risk", confidence: "low", evidence: "Only if drinking was reported as reduced." },
          { name: "Rash illness needing eyes-on review", confidence: "low", evidence: "No glass-test interpretation was done by the app." },
        ],
        recommendedInvestigations: careFor(routing, intake).tests.map((item) => item.en),
        citations: [COMMON.feverChild],
        uncertaintyStatement:
          "A negative danger-sign screen is not a diagnosis and not permission to stay home if the child worsens. Neonatal fever is handled by the rule engine, not by this list.",
      };
    case "psychiatry":
      return {
        ...base,
        suggestedSpecialistType: "Psychiatry and mental health",
        rankedDifferential: [
          { name: "Depressive symptoms", confidence: "low", evidence: "Low mood or sleep change described by the person." },
          { name: "Anxiety symptoms", confidence: "low", evidence: "Worry words, if present, are not a disorder label." },
          { name: "Needs direct risk review", confidence: "moderate", evidence: "Risk questions were asked. A negative answer is not a clearance." },
        ],
        recommendedInvestigations: careFor(routing, intake).tests.map((item) => item.en),
        citations: [COMMON.depression, COMMON.selfHarm],
        uncertaintyStatement:
          "If suicidal thoughts, intent, or a plan appear, the psychiatric red-flag rule overrides this draft. Do not treat a calm transcript as low risk.",
      };
    default:
      return {
        ...base,
        suggestedSpecialistType: "General internal medicine",
        rankedDifferential: [
          { name: "Undifferentiated medical symptom", confidence: "low", evidence: routing.reasoning },
          { name: "Blood pressure or glucose concern", confidence: "low", evidence: "Only if the person used those words. Not a diagnosis." },
          { name: "Pregnancy-related complaint", confidence: "low", evidence: "Included when pregnancy was disclosed. Obstetrics review may still be required." },
        ],
        recommendedInvestigations: careFor(routing, intake).tests.map((item) => item.en),
        citations: [COMMON.diabetes, COMMON.sepsis],
        uncertaintyStatement:
          routing.confidence === "low"
            ? "Routing confidence is low. General medicine is the safe default, not a confident specialty assignment."
            : "This is a holding draft for a general doctor. It is not a diagnosis and it does not choose a medicine.",
      };
  }
}

function cantMiss(gate: GateResult): SpecialistDraft["rankedDifferential"] {
  const domains = new Set(gate.hits.map((hit) => hit.domain));
  const rows: SpecialistDraft["rankedDifferential"] = [];
  if (domains.has("Cardiac")) {
    rows.push({ name: "Acute coronary syndrome (cannot-miss)", confidence: "moderate", evidence: "Red-flag chest pattern. For the receiving clinician after transfer." });
  }
  if (domains.has("Neurological")) {
    rows.push({ name: "Stroke or other sudden neurological emergency", confidence: "moderate", evidence: "FAST-type or sudden severe neurological words." });
  }
  if (domains.has("Psychiatric")) {
    rows.push({ name: "Active suicide risk", confidence: "moderate", evidence: "Ideation, intent, or plan. Not a risk score." });
  }
  if (domains.has("Pediatric")) {
    rows.push({ name: "Paediatric danger signs, including neonatal fever", confidence: "moderate", evidence: "Rule engine. Not a diagnosis." });
  }
  if (rows.length === 0) {
    rows.push({ name: "Emergency presentation matching a deterministic rule", confidence: "moderate", evidence: gate.hits.map((hit) => hit.ruleId).join(", ") || "Red flag" });
  }
  rows.push({ name: "Alternative emergencies the receiving team must not forget", confidence: "low", evidence: "This list is not exhaustive and not a ranked diagnosis for the patient." });
  return rows.slice(0, 3);
}

function citationsForGate(gate: GateResult): Citation[] {
  const domains = new Set(gate.hits.map((hit) => hit.domain));
  const cites: Citation[] = [];
  if (domains.has("Cardiac")) cites.push(COMMON.chest, COMMON.acs);
  if (domains.has("Neurological")) cites.push(COMMON.stroke);
  if (domains.has("Sepsis")) cites.push(COMMON.sepsis);
  if (domains.has("Anaphylaxis")) cites.push(COMMON.anaphylaxis);
  if (domains.has("Pediatric")) cites.push(COMMON.feverChild);
  if (domains.has("Psychiatric")) cites.push(COMMON.selfHarm);
  if (domains.has("Trauma")) cites.push(COMMON.head);
  if (domains.has("Obstetric")) cites.push(COMMON.pregnancy);
  if (domains.has("Metabolic")) cites.push(COMMON.diabetes);
  if (cites.length === 0) cites.push(COMMON.sepsis);
  return cites;
}

export function draftHasRequiredLabel(draft: SpecialistDraft): boolean {
  return draft.label === DRAFT_LABEL && draft.citations.length > 0 && draft.uncertaintyStatement.length > 0;
}

export type PatientSafe = {
  showEmergency: boolean;
  paragraphs: string[];
  phones: { name: string; detail: string; phone: string }[];
};

export function isDraftLeak(text: string): boolean {
  return /DRAFT — REQUIRES|ranked differential|cannot-miss|acute coronary/i.test(text);
}
