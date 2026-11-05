import {
  RULE_META,
  type AgeBand,
  type DangerKey,
  type GateHit,
  type GateResult,
  type RuleId,
  type Urgency,
} from "./types.ts";

const URGENCY_RANK: Record<Urgency, number> = {
  BLUE: 0,
  GREEN: 1,
  YELLOW: 2,
  AMBER: 3,
  RED: 4,
};

type PhraseRule = {
  ruleId: RuleId;
  test: (text: string) => boolean;
};

const PHRASES: PhraseRule[] = [
  {
    ruleId: "RF-CARDIAC-1",
    test: (text) =>
      (/chest pain|chest tightness|seene? (mein|men|me) dard|سینے میں درد/i.test(text) &&
        /left arm|jaw|sweat|sweating|short of breath|breathless|bazu|baazu|pasina|saans|بازو|پسین|سانس/i.test(
          text,
        )) ||
      /syncope.{0,40}exert|passed out.{0,30}(running|exert|exercise)/i.test(text),
  },
  {
    ruleId: "RF-NEURO-1",
    test: (text) =>
      /face (is )?droop|arm weakness|slurred speech|sudden severe headache|worst headache|new seizure|stroke/i.test(
        text,
      ) || /چہرہ جھک|اچانک دورہ|فالج/i.test(text),
  },
  {
    ruleId: "RF-RESP-1",
    test: (text) =>
      /cannot breathe|can't breathe|cant breathe|unable to breathe|stridor|so breathless/i.test(text) ||
      /saans nahi|سانس نہیں/i.test(text),
  },
  {
    ruleId: "RF-SEPSIS-1",
    test: (text) =>
      /sepsis/i.test(text) ||
      (/fever|bukhar|بخار/i.test(text) &&
        /confused|confusion|not making sense|very faint|hypotension/i.test(text) &&
        /racing heart|fast heart|tachycardia/i.test(text)),
  },
  {
    ruleId: "RF-ANAPH-1",
    test: (text) =>
      /anaphylaxis/i.test(text) ||
      (/swell/i.test(text) && /lip|tongue|throat/i.test(text) && /rash|faint|collapse/i.test(text)),
  },
  {
    ruleId: "RF-OB-1",
    test: (text) =>
      /bleeding in pregnancy|pregnant and bleeding|reduced fetal|baby (is )?not moving|postpartum haemorrhage|postpartum hemorrhage|pre-?eclampsia/i.test(
        text,
      ) || /حمل میں خون|بچے کی حرکت/i.test(text),
  },
  {
    ruleId: "RF-PEDS-1",
    test: (text) =>
      /non-?blanching|rash that does not fade|rash that doesn't fade|glass test/i.test(text) ||
      (/sleepy|lethargic|hard to wake/i.test(text) &&
        /not feeding|isn't feeding|poor feeding|won't feed/i.test(text)),
  },
  {
    ruleId: "RF-PSYCH-1",
    test: (text) => {
      const cleaned = text
        .replace(/\b(not|no|never)\s+(suicidal|suicide)\b/gi, "")
        .replace(/خودکشی نہیں/g, "");
      return /suicide|suicidal|kill myself|end my life|want to die|khudkushi|خودکشی/i.test(cleaned);
    },
  },
  {
    ruleId: "RF-TRAUMA-1",
    test: (text) =>
      /head injury.{0,40}(warfarin|blood thinner|anticoag)|penetrating (injury|wound)|stab wound|gunshot/i.test(
        text,
      ),
  },
  {
    ruleId: "RF-TOX-1",
    test: (text) =>
      /overdose|took all (my |the )?(pills|tablets)|poisoning|poisoned|snake bite|envenom/i.test(text) ||
      /زہر|سانپ نے کاٹا|سانپ کا کاٹا/i.test(text),
  },
  {
    ruleId: "RF-MET-1",
    test: (text) =>
      /fruity breath|diabetic keto|dka|very low sugar.{0,40}(collapse|unconscious)|severe hypogly/i.test(text),
  },
];

export function scanTranscript(text: string): GateHit[] {
  const source = text.normalize("NFC");
  const hits: GateHit[] = [];
  for (const phrase of PHRASES) {
    if (!phrase.test(source)) continue;
    const meta = RULE_META[phrase.ruleId];
    hits.push({
      ruleId: phrase.ruleId,
      domain: meta.domain,
      source: "confirmed_phrase",
      excerpt: source.trim().slice(0, 140),
    });
  }
  return hits;
}

function neonateFever(ageBand: AgeBand | undefined, text: string): boolean {
  if (ageBand !== "0-28d") return false;
  const negated = /\bno fever\b|\bwithout fever\b|fever nahi|bukhar nahi|بخار نہیں/i.test(text);
  const positive = /\bfever\b|\bbukhar\b|بخار|high temperature/i.test(text);
  return positive && !negated;
}

export type GateInput = {
  answers: Partial<Record<DangerKey, boolean>>;
  transcript: string;
  confirmed: RuleId[];
  denied: RuleId[];
  ageBand?: AgeBand;
};

export function evaluateGate(input: GateInput): GateResult {
  const hits: GateHit[] = [];
  const seen = new Set<RuleId>();

  const push = (hit: GateHit) => {
    if (seen.has(hit.ruleId)) return;
    seen.add(hit.ruleId);
    hits.push(hit);
  };

  for (const [ruleId, meta] of Object.entries(RULE_META) as [RuleId, (typeof RULE_META)[RuleId]][]) {
    if (input.answers[meta.dangerKey] === true) {
      push({ ruleId, domain: meta.domain, source: "answer" });
    }
  }

  for (const ruleId of input.confirmed) {
    push({ ruleId, domain: RULE_META[ruleId].domain, source: "confirmed_phrase" });
  }

  if (neonateFever(input.ageBand, input.transcript)) {
    push({
      ruleId: "RF-PEDS-1",
      domain: "Pediatric",
      source: "neonate_fever",
      excerpt: input.transcript.trim().slice(0, 140),
    });
  }

  const pending = scanTranscript(input.transcript).filter(
    (hit) => !input.denied.includes(hit.ruleId) && !seen.has(hit.ruleId),
  );

  if (hits.length > 0) {
    return { level: "RED", hits, pending };
  }
  if (pending.length > 0) {
    return { level: "NEEDS_CONFIRMATION", hits: [], pending };
  }
  return { level: "CLEAR", hits: [], pending: [] };
}

/** A report may raise urgency. A normal report never lowers it. */
export function mergeUrgency(base: Urgency, reportAbnormal: boolean, _reportNormal: boolean): Urgency {
  if (reportAbnormal && URGENCY_RANK[base] < URGENCY_RANK.AMBER) {
    return "AMBER";
  }
  return base;
}

export type RegressionRow = {
  id: string;
  input: GateInput;
  expect: GateResult["level"];
  ruleId?: RuleId;
};

const noAnswers: Partial<Record<DangerKey, boolean>> = {
  chest: false,
  fast: false,
  breath: false,
  sepsis: false,
  anaphylaxis: false,
  pregnancy: false,
  child: false,
  suicide: false,
  trauma: false,
  tox: false,
  metabolic: false,
};

function yes(key: DangerKey): Partial<Record<DangerKey, boolean>> {
  return { ...noAnswers, [key]: true };
}

export const REGRESSION: RegressionRow[] = [
  { id: "cardiac-answer", input: { answers: yes("chest"), transcript: "", confirmed: [], denied: [] }, expect: "RED", ruleId: "RF-CARDIAC-1" },
  { id: "neuro-answer", input: { answers: yes("fast"), transcript: "", confirmed: [], denied: [] }, expect: "RED", ruleId: "RF-NEURO-1" },
  { id: "resp-answer", input: { answers: yes("breath"), transcript: "", confirmed: [], denied: [] }, expect: "RED", ruleId: "RF-RESP-1" },
  { id: "sepsis-answer", input: { answers: yes("sepsis"), transcript: "", confirmed: [], denied: [] }, expect: "RED", ruleId: "RF-SEPSIS-1" },
  { id: "anaph-answer", input: { answers: yes("anaphylaxis"), transcript: "", confirmed: [], denied: [] }, expect: "RED", ruleId: "RF-ANAPH-1" },
  { id: "ob-answer", input: { answers: yes("pregnancy"), transcript: "", confirmed: [], denied: [] }, expect: "RED", ruleId: "RF-OB-1" },
  { id: "peds-answer", input: { answers: yes("child"), transcript: "", confirmed: [], denied: [] }, expect: "RED", ruleId: "RF-PEDS-1" },
  { id: "psych-answer", input: { answers: yes("suicide"), transcript: "", confirmed: [], denied: [] }, expect: "RED", ruleId: "RF-PSYCH-1" },
  { id: "trauma-answer", input: { answers: yes("trauma"), transcript: "", confirmed: [], denied: [] }, expect: "RED", ruleId: "RF-TRAUMA-1" },
  { id: "tox-answer", input: { answers: yes("tox"), transcript: "", confirmed: [], denied: [] }, expect: "RED", ruleId: "RF-TOX-1" },
  { id: "met-answer", input: { answers: yes("metabolic"), transcript: "", confirmed: [], denied: [] }, expect: "RED", ruleId: "RF-MET-1" },
  {
    id: "cardiac-phrase-not-cleared",
    input: {
      answers: noAnswers,
      transcript: "Chest pain spreading to my left arm with sweating and shortness of breath",
      confirmed: [],
      denied: [],
    },
    expect: "NEEDS_CONFIRMATION",
    ruleId: "RF-CARDIAC-1",
  },
  {
    id: "cardiac-phrase-confirmed",
    input: {
      answers: noAnswers,
      transcript: "Chest pain spreading to my left arm with sweating",
      confirmed: ["RF-CARDIAC-1"],
      denied: [],
    },
    expect: "RED",
    ruleId: "RF-CARDIAC-1",
  },
  {
    id: "cardiac-phrase-denied",
    input: {
      answers: noAnswers,
      transcript: "Chest pain spreading to my left arm with sweating",
      confirmed: [],
      denied: ["RF-CARDIAC-1"],
    },
    expect: "CLEAR",
  },
  {
    id: "chest-discomfort-alone",
    input: {
      answers: noAnswers,
      transcript: "I have had chest discomfort after spicy food",
      confirmed: [],
      denied: [],
    },
    expect: "CLEAR",
  },
  {
    id: "not-suicidal-phrase",
    input: {
      answers: noAnswers,
      transcript: "I am not suicidal, I just feel tired",
      confirmed: [],
      denied: [],
    },
    expect: "CLEAR",
  },
  {
    id: "suicide-plan-phrase",
    input: {
      answers: {},
      transcript: "I have a plan to kill myself tonight",
      confirmed: [],
      denied: [],
    },
    expect: "NEEDS_CONFIRMATION",
    ruleId: "RF-PSYCH-1",
  },
  {
    id: "neonate-fever-cannot-clear",
    input: {
      answers: { ...noAnswers, child: false },
      transcript: "The baby has a fever since morning",
      confirmed: [],
      denied: ["RF-PEDS-1"],
      ageBand: "0-28d",
    },
    expect: "RED",
    ruleId: "RF-PEDS-1",
  },
  {
    id: "neonate-no-fever",
    input: {
      answers: noAnswers,
      transcript: "The baby has no fever, just a small rash for a day",
      confirmed: [],
      denied: [],
      ageBand: "0-28d",
    },
    expect: "CLEAR",
  },
  {
    id: "benign-rash",
    input: {
      answers: noAnswers,
      transcript: "Itchy rash on my arms for two weeks, no fever",
      confirmed: [],
      denied: [],
    },
    expect: "CLEAR",
  },
  {
    id: "bp-roman",
    input: {
      answers: noAnswers,
      transcript: "BP high hai, halka chakkar, no chest pain",
      confirmed: [],
      denied: [],
    },
    expect: "CLEAR",
  },
];

export function runRegression(): {
  total: number;
  failed: { id: string; got: string; expect: string }[];
} {
  const failed: { id: string; got: string; expect: string }[] = [];
  for (const row of REGRESSION) {
    const got = evaluateGate(row.input);
    const pool = got.level === "RED" ? got.hits : got.pending;
    const ruleOk = !row.ruleId || pool.some((hit) => hit.ruleId === row.ruleId);
    if (got.level !== row.expect || !ruleOk) {
      failed.push({ id: row.id, got: got.level, expect: row.expect });
    }
  }
  if (mergeUrgency("RED", false, true) !== "RED") {
    failed.push({ id: "report-normal-red", got: "lowered", expect: "RED" });
  }
  if (mergeUrgency("AMBER", false, true) !== "AMBER") {
    failed.push({ id: "report-normal-amber", got: "lowered", expect: "AMBER" });
  }
  if (mergeUrgency("YELLOW", true, false) !== "AMBER") {
    failed.push({ id: "report-abnormal-raises", got: "not-amber", expect: "AMBER" });
  }
  if (mergeUrgency("AMBER", true, true) !== "AMBER") {
    failed.push({ id: "report-never-lowers", got: "lowered", expect: "AMBER" });
  }
  return { total: REGRESSION.length + 4, failed };
}
