export const DRAFT_LABEL = "DRAFT — REQUIRES CLINICIAN REVIEW" as const;
export const FORMULARY_LABEL = "OPTIONS ONLY — CLINICIAN SELECTS AND SIGNS" as const;

export type Lang = "en" | "ur";
export type Jurisdiction = "PK" | "UK";
export type ReachCare = "" | "hospital" | "dispensary" | "neither";
export type AgeBand = "0-28d" | "1m-5y" | "6-15" | "16-64" | "65+";
export type ForWhom = "self" | "child" | "other";
export type Pregnant = "yes" | "no" | "unknown" | "na";
export type Urgency = "RED" | "AMBER" | "YELLOW" | "GREEN" | "BLUE";
export type SpecialtyId =
  | "dermatology"
  | "cardiology"
  | "general_internal_medicine"
  | "pediatrics"
  | "psychiatry";

export type DangerKey =
  | "chest"
  | "fast"
  | "breath"
  | "sepsis"
  | "anaphylaxis"
  | "pregnancy"
  | "child"
  | "suicide"
  | "trauma"
  | "tox"
  | "metabolic";

export type RuleId =
  | "RF-CARDIAC-1"
  | "RF-NEURO-1"
  | "RF-RESP-1"
  | "RF-SEPSIS-1"
  | "RF-ANAPH-1"
  | "RF-OB-1"
  | "RF-PEDS-1"
  | "RF-PSYCH-1"
  | "RF-TRAUMA-1"
  | "RF-TOX-1"
  | "RF-MET-1";

export type HitSource = "answer" | "confirmed_phrase" | "neonate_fever";

export type GateHit = {
  ruleId: RuleId;
  domain: string;
  source: HitSource;
  excerpt?: string;
};

export type GateResult = {
  level: "RED" | "CLEAR" | "NEEDS_CONFIRMATION";
  hits: GateHit[];
  pending: GateHit[];
};

export type RoutingDecision = {
  primarySpecialty: SpecialtyId;
  secondary: SpecialtyId[];
  urgency: Urgency;
  confidence: "high" | "low";
  reasoning: string;
  halted: boolean;
};

export type Citation = {
  title: string;
  publisher: string;
  href?: string;
};

export type SpecialistDraft = {
  rankedDifferential: { name: string; confidence: "low" | "moderate"; evidence: string }[];
  redFlagsPresent: string[];
  recommendedInvestigations: string[];
  urgencyRecommendation: Urgency;
  suggestedSpecialistType: string;
  citations: Citation[];
  uncertaintyStatement: string;
  label: typeof DRAFT_LABEL;
};

export type LocalBrand = {
  id: string;
  brand: string;
  company: string;
  strength: string;
  packSize: string;
  mrpPKR: string;
  drapRegNo: string;
  status: string;
};

export type FormularyPacket = {
  activeIngredient: string;
  atcCode: string;
  inn: string;
  localBrands: LocalBrand[];
  interactions: string[];
  doseConsiderations: {
    renal: string;
    hepatic: string;
    pediatric: string;
    pregnancy: string;
  };
  label: typeof FORMULARY_LABEL;
  demoStamp: string;
  suppressedReason?: string;
};

export type Intake = {
  forWhom: ForWhom;
  ageBand: AgeBand;
  pregnant: Pregnant;
  complaint: string;
  duration: string;
  severity: number;
  voiceUsed: boolean;
  asrNote: string;
  danger: Partial<Record<DangerKey, boolean>>;
  confirmed: RuleId[];
  denied: RuleId[];
  cluster: Record<string, string>;
  medications: string;
  allergies: string;
  medsConfirmed: boolean;
  reportName: string;
  reportNormal: boolean;
  reportAbnormal: boolean;
  cityId: string;
  reachCare: ReachCare;
};

export type AuditEvent = {
  at: string;
  kind: string;
  detail: string;
};

export type Verdict = {
  action: "accept" | "modify" | "reject";
  text: string;
  reason: string;
  selectedBrandIds: string[];
  signedAt: string;
  signerLabel: string;
};

export type CaseRecord = {
  id: string;
  createdAt: string;
  lang: Lang;
  jurisdiction: Jurisdiction;
  intake: Intake;
  gate: GateResult;
  routing: RoutingDecision;
  draft: SpecialistDraft;
  formulary: FormularyPacket;
  audit: AuditEvent[];
  verdict?: Verdict;
  status: "red" | "awaiting_clinician" | "signed";
};

export const RULE_META: Record<RuleId, { domain: string; dangerKey: DangerKey }> = {
  "RF-CARDIAC-1": { domain: "Cardiac", dangerKey: "chest" },
  "RF-NEURO-1": { domain: "Neurological", dangerKey: "fast" },
  "RF-RESP-1": { domain: "Respiratory", dangerKey: "breath" },
  "RF-SEPSIS-1": { domain: "Sepsis", dangerKey: "sepsis" },
  "RF-ANAPH-1": { domain: "Anaphylaxis", dangerKey: "anaphylaxis" },
  "RF-OB-1": { domain: "Obstetric", dangerKey: "pregnancy" },
  "RF-PEDS-1": { domain: "Pediatric", dangerKey: "child" },
  "RF-PSYCH-1": { domain: "Psychiatric", dangerKey: "suicide" },
  "RF-TRAUMA-1": { domain: "Trauma", dangerKey: "trauma" },
  "RF-TOX-1": { domain: "Toxicology", dangerKey: "tox" },
  "RF-MET-1": { domain: "Metabolic", dangerKey: "metabolic" },
};

export const DANGER_KEYS = Object.values(RULE_META).map((rule) => rule.dangerKey);

export function emptyIntake(): Intake {
  return {
    forWhom: "self",
    ageBand: "16-64",
    pregnant: "na",
    complaint: "",
    duration: "",
    severity: 3,
    voiceUsed: false,
    asrNote: "",
    danger: {},
    confirmed: [],
    denied: [],
    cluster: {},
    medications: "",
    allergies: "",
    medsConfirmed: false,
    reportName: "",
    reportNormal: false,
    reportAbnormal: false,
    cityId: "",
    reachCare: "",
  };
}
