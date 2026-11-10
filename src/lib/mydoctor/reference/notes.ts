import { DANGER_TEXT, t } from "../copy.ts";
import { LIBRARY, type Monograph } from "../pharmacy.ts";
import type { DangerKey } from "../types.ts";
import type { NoteSection, NoteTopic, ReferenceAssistant, ReferenceNote } from "./types.ts";

const SECTION_META: Record<
  Exclude<NoteSection, "guidance">,
  {
    topic: NoteTopic;
    titleEn: string;
    titleUr: string;
    en: (row: Monograph) => string;
    ur: (row: Monograph) => string;
  }
> = {
  uses: {
    topic: "label",
    titleEn: "What it is used for",
    titleUr: "استعمال",
    en: (row) => row.usedEn,
    ur: (row) => row.usedUr,
  },
  adult: {
    topic: "dosing",
    titleEn: "Usual adult line on the card",
    titleUr: "کارڈ پر بالغ کی عام سطر",
    en: (row) => row.adultEn,
    ur: (row) => row.adultUr,
  },
  child: {
    topic: "dosing",
    titleEn: "Child line on the card",
    titleUr: "کارڈ پر بچے کی سطر",
    en: (row) => row.childEn,
    ur: (row) => row.childUr,
  },
  avoid: {
    topic: "label",
    titleEn: "Do not use it when",
    titleUr: "جب استعمال نہ کریں",
    en: (row) => row.avoidEn,
    ur: (row) => row.avoidUr,
  },
  effects: {
    topic: "label",
    titleEn: "Effects people notice",
    titleUr: "جو اثرات نظر آئیں",
    en: (row) => row.effectsEn,
    ur: (row) => row.effectsUr,
  },
  mix: {
    topic: "interactions",
    titleEn: "Mixes badly with",
    titleUr: "جن کے ساتھ برا مکس",
    en: (row) => row.mixEn,
    ur: (row) => row.mixUr,
  },
  pregnancy: {
    topic: "label",
    titleEn: "Pregnancy and breastfeeding",
    titleUr: "حمل اور دودھ",
    en: (row) => row.pregEn,
    ur: (row) => row.pregUr,
  },
  storage: {
    topic: "label",
    titleEn: "How to store it",
    titleUr: "ذخیرہ",
    en: (row) => row.storeEn,
    ur: (row) => row.storeUr,
  },
};

const CHECK_TITLE: Record<DangerKey, [string, string]> = {
  chest: ["Heart safety check", "دل کی حفاظتی جانچ"],
  fast: ["Sudden neurological safety check", "اچانک اعصابی حفاظتی جانچ"],
  breath: ["Breathing safety check", "سانس کی حفاظتی جانچ"],
  sepsis: ["Serious-infection safety check", "سنگین انفیکشن کی حفاظتی جانچ"],
  anaphylaxis: ["Severe-allergy safety check", "شدید الرجی کی حفاظتی جانچ"],
  pregnancy: ["Pregnancy safety check", "حمل کی حفاظتی جانچ"],
  child: ["Child safety check", "بچے کی حفاظتی جانچ"],
  suicide: ["Immediate-safety check", "فوری حفاظت کی جانچ"],
  trauma: ["Injury safety check", "چوٹ کی حفاظتی جانچ"],
  tox: ["Poisoning safety check", "زہر کی حفاظتی جانچ"],
  metabolic: ["Sugar safety check", "شوگر کی حفاظتی جانچ"],
};

export const REFERENCE_ASSISTANTS: readonly ReferenceAssistant[] = [
  {
    id: "all",
    nameEn: "All local notes",
    nameUr: "تمام مقامی نوٹس",
    detailEn: "Shelf cards and the intake safety-check wording in this app.",
    detailUr: "اس ایپ کے شیلف کارڈ اور انٹیک کی حفاظتی جانچ کے الفاظ۔",
    topics: null,
  },
  {
    id: "interactions",
    nameEn: "Drug interactions",
    nameUr: "دوائی تعاملات",
    detailEn: "Only the mix lines copied from the shelf cards.",
    detailUr: "صرف شیلف کارڈ سے نقل شدہ مکس کی سطریں۔",
    topics: ["interactions"],
  },
  {
    id: "dosing",
    nameEn: "Labeled amounts",
    nameUr: "لیبل پر لکھی مقدار",
    detailEn: "Adult and child lines copied from the shelf cards. Nothing is calculated.",
    detailUr: "بالغ اور بچے کی سطریں شیلف کارڈ سے نقل۔ کچھ حساب نہیں کیا جاتا۔",
    topics: ["dosing"],
  },
  {
    id: "guidance",
    nameEn: "Safety-check notes",
    nameUr: "حفاظتی جانچ کے نوٹس",
    detailEn: "The red-flag questions already used at intake, and how a report changes urgency.",
    detailUr: "انٹیک کے خطرے والے سوال، اور رپورٹ فوری درجہ کیسے بدلتی ہے۔",
    topics: ["guidance"],
  },
];

function brandKeyword(brand: string): string | null {
  const cleaned = brand.trim();
  if (cleaned.length < 3 || cleaned.length > 32) return null;
  if (/pack|stock|pharmacist|shelf|issued|ask the/i.test(cleaned)) return null;
  return cleaned;
}

function keywordsFor(row: Monograph): string[] {
  const raw = [
    row.id,
    row.inn,
    row.atc,
    ...row.aliases,
    ...row.brands
      .map((item) => brandKeyword(item.brand))
      .filter((item): item is string => Boolean(item)),
  ];
  const split = raw.flatMap((item) => item.split(/[()/،,]+/g));
  const seen = new Set<string>();
  const keywords: string[] = [];
  for (const item of split) {
    const cleaned = item.trim();
    if (cleaned.length < 3) continue;
    const key = cleaned.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    keywords.push(cleaned);
  }
  return keywords;
}

function shelfNotes(): ReferenceNote[] {
  const notes: ReferenceNote[] = [];
  for (const row of LIBRARY) {
    const keywords = keywordsFor(row);
    for (const section of Object.keys(SECTION_META) as Exclude<NoteSection, "guidance">[]) {
      const meta = SECTION_META[section];
      const passageEn = meta.en(row).trim();
      const passageUr = meta.ur(row).trim();
      if (!passageEn || !passageUr) continue;
      notes.push({
        id: `local-shelf:${row.id}:${section}`,
        topic: meta.topic,
        section,
        titleEn: `${row.inn} — ${meta.titleEn}`,
        titleUr: `${row.inn} — ${meta.titleUr}`,
        passageEn,
        passageUr,
        keywords,
      });
    }
  }
  return notes;
}

function guidanceNotes(): ReferenceNote[] {
  const notes: ReferenceNote[] = (Object.keys(CHECK_TITLE) as DangerKey[]).map((key) => {
    const row = DANGER_TEXT[key];
    const [titleEn, titleUr] = CHECK_TITLE[key];
    return {
      id: `local-guidance:${key}`,
      topic: "guidance" as const,
      section: "guidance" as const,
      titleEn,
      titleUr,
      passageEn: row.en,
      passageUr: row.ur,
      keywords: [key, row.en, row.ur, row.roman],
    };
  });
  notes.push({
    id: "local-guidance:reports",
    topic: "guidance",
    section: "guidance",
    titleEn: "Reports and urgency",
    titleUr: "رپورٹ اور فوری درجہ",
    passageEn: [
      t("en", "reportRule"),
      t("en", "normalKept"),
      t("en", "abnormalRaised"),
      t("en", "reportHint"),
    ].join(" "),
    passageUr: [
      t("ur", "reportRule"),
      t("ur", "normalKept"),
      t("ur", "abnormalRaised"),
      t("ur", "reportHint"),
    ].join(" "),
    keywords: ["report", "reports", "normal", "abnormal", "urgent", "urgency", "رپورٹ"],
  });
  return notes;
}

let cached: ReferenceNote[] | null = null;

/** On-device extracts. Shelf lines are the monograph text already in this app. */
export function referenceNotes(): ReferenceNote[] {
  if (!cached) cached = [...shelfNotes(), ...guidanceNotes()];
  return cached;
}

export function referenceAssistant(id: string): ReferenceAssistant {
  return REFERENCE_ASSISTANTS.find((item) => item.id === id) ?? REFERENCE_ASSISTANTS[0];
}
