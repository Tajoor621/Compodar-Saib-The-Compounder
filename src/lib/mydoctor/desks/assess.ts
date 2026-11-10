import { DANGER_TEXT, DOMAIN_PLAIN } from "../copy.ts";
import { lookupPharmacy } from "../pharmacy.ts";
import { clusterFor, routeComplaint } from "../routing.ts";
import { evaluateGate } from "../rules.ts";
import { RULE_META, type AgeBand, type DangerKey, type RuleId } from "../types.ts";
import { DESK_NOTES, type FlagSet } from "./notes.ts";
import type { Assessment, CareLevel, DeskId, Sex } from "./types.ts";

export const DESKS: { id: DeskId; en: string; ur: string; blurbEn: string; blurbUr: string }[] = [
  {
    id: "gp",
    en: "Family doctor",
    ur: "فیملی ڈاکٹر",
    blurbEn: "First conversation. Broad symptoms, then which desk fits.",
    blurbUr: "پہلی بات۔ عام علامات، پھر کون سا ڈیسک بنتا ہے۔",
  },
  {
    id: "dermatology",
    en: "Skin desk",
    ur: "جلد کا ڈیسک",
    blurbEn: "Skin, hair, nails, rash, itch. No picture is read.",
    blurbUr: "جلد، بال، ناخن، دانہ، خارش۔ کوئی تصویر نہیں پڑھی جاتی۔",
  },
  {
    id: "gastroenterology",
    en: "Gut desk",
    ur: "پیٹ کا ڈیسک",
    blurbEn: "Stomach, digestion, acid, loose stools.",
    blurbUr: "پیٹ، ہاضمہ، تیزاب، پتلے پاخانے۔",
  },
  {
    id: "neurology",
    en: "Nerve desk",
    ur: "اعصاب کا ڈیسک",
    blurbEn: "Headache, dizziness, nerve pain. Not a stroke clearance.",
    blurbUr: "سر درد، چکر، اعصاب کا درد۔ فالج کی کلیئرنس نہیں۔",
  },
  {
    id: "cardiology",
    en: "Heart desk",
    ur: "دل کا ڈیسک",
    blurbEn: "Chest discomfort, blood pressure, effort symptoms.",
    blurbUr: "سینے کی تکلیف، فشار خون، محنت پر علامات۔",
  },
  {
    id: "pulmonology_ent",
    en: "Breathing and ENT desk",
    ur: "سانس اور کان ناک گلا",
    blurbEn: "Cough, breathing that is not an emergency, ear, nose, throat.",
    blurbUr: "کھانسی، غیر ایمرجنسی سانس، کان، ناک، گلا۔",
  },
  {
    id: "endocrinology",
    en: "Hormone desk",
    ur: "ہارمون ڈیسک",
    blurbEn: "Sugar words, thirst, thyroid words. Not a diabetes diagnosis.",
    blurbUr: "شوگر کے الفاظ، پیاس، تھائرائیڈ کے الفاظ۔ شوگر کی تشخیص نہیں۔",
  },
];

const SKIN = /rash|itch|kharish|mole|acne|nail|hair|خارش|دان|تل|مہاسے/i;
const HEART = /chest|palpitat|heart|seena|سین|دل/i;
const GUT = /stomach|acidity|heartburn|loose stool|diarrhoea|diarrhea|vomit|pet|پیٹ|تیزاب|دست|الٹی/i;
const NEURO = /headache|migraine|dizzi|vertigo|nerve|numb|tingl|سر درد|چکر|سن/i;
const LUNG = /cough|wheez|phlegm|asthma|breath|کھانسی|سانس|بلغم/i;
const ENT = /ear|throat|sinus|nose|کان|گلا|ناک/i;
const SUGAR = /sugar|diabet|thirst|hormone|شوگر|پیاس|ہارمون/i;
const THYROID = /thyroid|تھائرائیڈ/i;
const BP = /\bbp\b|blood pressure|فشار/i;

export type FollowMap = Record<string, string>;

export function deskById(id: DeskId) {
  return DESKS.find((desk) => desk.id === id) ?? DESKS[0];
}

export function suggestDesk(complaint: string, ageBand: AgeBand, child: boolean): {
  desk: DeskId;
  childReview: boolean;
  mentalReview: boolean;
} {
  const cluster = clusterFor(complaint, ageBand, child ? "child" : "self");
  if (cluster === "child" || child) return { desk: "gp", childReview: true, mentalReview: false };
  if (cluster === "mood") return { desk: "gp", childReview: false, mentalReview: true };
  if (cluster === "skin" || SKIN.test(complaint)) return { desk: "dermatology", childReview: false, mentalReview: false };
  if (cluster === "heart" || HEART.test(complaint)) return { desk: "cardiology", childReview: false, mentalReview: false };
  if (NEURO.test(complaint)) return { desk: "neurology", childReview: false, mentalReview: false };
  if (THYROID.test(complaint) || SUGAR.test(complaint) || cluster === "metabolic") {
    return { desk: "endocrinology", childReview: false, mentalReview: false };
  }
  if (GUT.test(complaint) || cluster === "gut") return { desk: "gastroenterology", childReview: false, mentalReview: false };
  if (LUNG.test(complaint) || ENT.test(complaint) || cluster === "cough") {
    return { desk: "pulmonology_ent", childReview: false, mentalReview: false };
  }
  if (BP.test(complaint)) return { desk: "cardiology", childReview: false, mentalReview: false };
  return { desk: "gp", childReview: false, mentalReview: false };
}

function yes(follow: FollowMap, key: string): boolean {
  return follow[key] === "yes";
}

function flagsFor(complaint: string, follow: FollowMap): FlagSet {
  return {
    skin: SKIN.test(complaint),
    gut: GUT.test(complaint),
    heart: HEART.test(complaint),
    neuro: NEURO.test(complaint),
    lung: LUNG.test(complaint),
    ent: ENT.test(complaint),
    sugar: SUGAR.test(complaint),
    thyroid: THYROID.test(complaint) || yes(follow, "thyroid"),
    bp: BP.test(complaint) || yes(follow, "bp"),
    fever: yes(follow, "fever") || yes(follow, "coughFever") || yes(follow, "headFever"),
    spread: yes(follow, "spread"),
    mole: yes(follow, "mole"),
    itch: yes(follow, "itch") || /itch|خارش/i.test(complaint),
    acid: yes(follow, "acid") || /acid|heartburn|تیزاب/i.test(complaint),
    loose: yes(follow, "loose") || /diarrhoea|diarrhea|loose stool|دست/i.test(complaint),
    blood: yes(follow, "blood"),
    weight: yes(follow, "weight"),
    exert: yes(follow, "exert"),
    rest: yes(follow, "rest"),
    longCough: yes(follow, "longCough"),
    coughBlood: yes(follow, "coughBlood"),
    thirst: yes(follow, "thirst") || /thirst|پیاس/i.test(complaint),
    knownSugar: yes(follow, "knownSugar"),
  };
}

function deniedFrom(danger: Partial<Record<DangerKey, boolean>>): RuleId[] {
  return (Object.entries(RULE_META) as [RuleId, (typeof RULE_META)[RuleId]][])
    .filter(([, meta]) => danger[meta.dangerKey] === false)
    .map(([id]) => id);
}

export function assessDesk(input: {
  started: DeskId;
  complaint: string;
  ageBand: AgeBand;
  sex: Sex;
  child: boolean;
  pregnant: "yes" | "no" | "unknown" | "na";
  danger: Partial<Record<DangerKey, boolean>>;
  follow: FollowMap;
  medicines: string;
}): Assessment {
  const danger = { ...input.danger };
  if (input.follow.sudden === "yes") danger.fast = true;
  const transcript = [input.complaint, ...Object.entries(input.follow).map(([key, value]) => `${key} ${value}`)].join(". ");
  const gate = evaluateGate({
    answers: danger,
    transcript,
    confirmed: [],
    denied: deniedFrom(danger),
    ageBand: input.ageBand,
  });
  if (gate.level === "RED") {
    return {
      emergency: true,
      ruleIds: gate.hits.map((hit) => hit.ruleId),
      started: input.started,
      suggested: "gp",
      childReview: false,
      mentalReview: false,
      uncovered: false,
      care: "emergency",
      causes: [],
      watchEn: "Contact local emergency services now. Do not wait for this desk.",
      watchUr: "ابھی مقامی ایمرجنسی سے رابطہ کریں۔ اس ڈیسک کا انتظار نہ کریں۔",
      askEn: [],
      askUr: [],
      medicineIds: [],
    };
  }

  const suggestion = suggestDesk(input.complaint, input.ageBand, input.child);
  const suggested = input.started === "gp" ? suggestion.desk : input.started;
  const flags = flagsFor(input.complaint, input.follow);
  const routed = routeComplaint({
    complaint: input.complaint,
    ageBand: input.ageBand,
    forWhom: input.child ? "child" : "self",
    pregnant: input.sex === "female" ? input.pregnant : "na",
    cluster: {
      fever: flags.fever ? "yes" : "no",
      spread: flags.spread ? "yes" : "no",
      blood: flags.blood ? "yes" : "no",
      weightLoss: flags.weight ? "yes" : "no",
      exertion: flags.exert ? "yes" : "no",
      rest: flags.rest ? "yes" : "no",
      longCough: flags.longCough ? "yes" : "no",
      coughBlood: flags.coughBlood ? "yes" : "no",
    },
  });

  let care: CareLevel = routed.urgency === "AMBER" ? "urgent" : "doctor";
  if (flags.mole) care = "urgent";
  const selfCare = flags.itch && flags.skin && !flags.fever && !flags.spread && !flags.mole && !input.child && care === "doctor";
  if (selfCare) care = "self_care";

  const causes = DESK_NOTES.filter((note) => note.desks.includes(suggested) && note.when(flags)).map((note) => ({
    id: note.id,
    titleEn: note.titleEn,
    titleUr: note.titleUr,
    detailEn: note.detailEn,
    detailUr: note.detailUr,
    sourceId: note.sourceId,
    sourceEn: note.sourceEn,
    sourceUr: note.sourceUr,
  }));

  const uncovered = causes.length === 0;
  const medicineIds = input.medicines
    .split(/[,+/]|\band\b/i)
    .map((part) => lookupPharmacy(part).matches[0]?.row.id)
    .filter((id): id is string => Boolean(id))
    .filter((id, index, all) => all.indexOf(id) === index);

  return {
    emergency: false,
    ruleIds: [],
    started: input.started,
    suggested: uncovered && input.started !== "gp" ? "gp" : suggested,
    childReview: suggestion.childReview,
    mentalReview: suggestion.mentalReview,
    uncovered,
    care: uncovered && care === "self_care" ? "doctor" : care,
    causes,
    watchEn: "If this gets worse, seek emergency care rather than waiting.",
    watchUr: "اگر یہ بڑھے تو انتظار کی بجائے ایمرجنسی لیں۔",
    askEn: [
      "What should be examined in person?",
      "Does this story need a test, or a review only?",
      "Which desk should see this if it continues?",
    ],
    askUr: [
      "روبرو کیا دیکھنا چاہیے؟",
      "کیا اس کہانی کو ٹیسٹ چاہیے، یا صرف جائزہ؟",
      "اگر یہ جاری رہے تو کون سا ڈیسک دیکھے؟",
    ],
    medicineIds,
  };
}

export function dangerPrompt(key: DangerKey, lang: "en" | "ur"): string {
  const row = DANGER_TEXT[key];
  return lang === "ur" ? row.ur : row.en;
}

export function domainLine(ruleId: RuleId, lang: "en" | "ur"): string {
  const domain = RULE_META[ruleId].domain;
  return DOMAIN_PLAIN[lang][domain] ?? DOMAIN_PLAIN[lang].Cardiac;
}
