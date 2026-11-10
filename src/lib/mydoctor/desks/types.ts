import type { AgeBand, DangerKey, Lang, RuleId } from "../types.ts";

export type DeskId =
  | "gp"
  | "dermatology"
  | "gastroenterology"
  | "neurology"
  | "cardiology"
  | "pulmonology_ent"
  | "endocrinology";

export type Relation = "me" | "mother" | "father" | "child" | "spouse" | "relative";

export type Sex = "female" | "male" | "unspecified";

export type CareLevel = "self_care" | "doctor" | "urgent" | "emergency";

export type DeskProfile = {
  id: string;
  relation: Relation;
  nickname: string;
  ageBand: AgeBand;
  sex: Sex;
  conditions: string;
  medicines: string;
  allergies: string;
  pastTreatments: string;
};

export type CauseNote = {
  id: string;
  titleEn: string;
  titleUr: string;
  detailEn: string;
  detailUr: string;
  sourceId: string;
  sourceEn: string;
  sourceUr: string;
};

export type Assessment = {
  emergency: boolean;
  ruleIds: RuleId[];
  started: DeskId;
  suggested: DeskId;
  childReview: boolean;
  mentalReview: boolean;
  uncovered: boolean;
  care: CareLevel;
  causes: CauseNote[];
  watchEn: string;
  watchUr: string;
  askEn: string[];
  askUr: string[];
  medicineIds: string[];
};

export type DeskReport = {
  id: string;
  createdAt: string;
  lang: Lang;
  profileId: string;
  relation: Relation;
  nickname: string;
  ageBand: AgeBand;
  complaint: string;
  follow: Record<string, string>;
  danger: Partial<Record<DangerKey, boolean>>;
  result: Assessment;
};
