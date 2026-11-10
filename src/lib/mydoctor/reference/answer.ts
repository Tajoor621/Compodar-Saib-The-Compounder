import { detectIdentifiers } from "../safety.ts";
import { referenceAssistant } from "./notes.ts";
import { isChildQuestion, isDosingQuestion, searchReferenceNotes } from "./retrieve.ts";
import type { ReferenceAnswer, ReferenceQuote, ReferenceStatus } from "./types.ts";

export const REFERENCE_VERIFY = {
  en: "Verify this against current guidelines, the label in your hand, and a pharmacist or licensed clinician before any clinical use. This is guidance, not a prescription or a diagnosis.",
  ur: "کسی بھی کلینیکل استعمال سے پہلے موجودہ رہنما اصول، ہاتھ میں موجود لیبل، اور فارماسسٹ یا لائسنس یافتہ معالج سے تصدیق کریں۔ یہ رہنمائی ہے، نسخہ یا تشخیص نہیں۔",
} as const;

export const DOSE_CONFIRM = {
  en: "Confirm any amount against the current label or a pharmacist. The pack in hand overrides the card. No numeric dose is shown unless it is quoted from a local note above.",
  ur: "کسی بھی مقدار کی تصدیق موجودہ لیبل یا فارماسسٹ سے کریں۔ ہاتھ والا پیک کارڈ پر فوقیت رکھتا ہے۔ عددی خوراک صرف اسی وقت دکھائی جاتی ہے جب وہ اوپر مقامی نوٹ سے نقل ہو۔",
} as const;

const STANCE = {
  en: "Guidance from notes stored on this device, not a diagnosis or a prescription. The pack in hand overrides the card.",
  ur: "یہ اسی ڈیوائس پر محفوظ نوٹس سے رہنمائی ہے، تشخیص یا نسخہ نہیں۔ ہاتھ والا پیک کارڈ پر فوقیت رکھتا ہے۔",
} as const;

const NOT_FOUND = {
  en: "Nothing in the on-device notes matches this question. Compodar Saib will not guess.",
  ur: "اس سوال سے ملتا ہوا کوئی نوٹ اس ڈیوائس پر نہیں۔ Compodar Saib اندازہ نہیں لگائے گا۔",
} as const;

const DOSE_WITHHELD = {
  en: "No sourced dose in the local notes can be quoted for this question. Compodar Saib will not invent a number.",
  ur: "اس سوال کے لیے مقامی نوٹس میں کوئی قابلِ حوالہ خوراک نقل نہیں ہو سکتی۔ Compodar Saib نمبر ایجاد نہیں کرے گا۔",
} as const;

const CHILD_DOSE_WITHHELD = {
  en: "A child's amount is not printed here unless a local note can be quoted without guessing age or weight. Compodar Saib will not invent a number.",
  ur: "بچے کی مقدار یہاں نہیں چھپی جب تک مقامی نوٹ عمر یا وزن کا اندازہ لگائے بغیر نقل نہ ہو سکے۔ Compodar Saib نمبر ایجاد نہیں کرے گا۔",
} as const;

const IMAGING = {
  en: "This reference desk does not interpret or generate images, including ECG, X-ray, CT, MRI, ultrasound, mammograms, or photographs of lesions. Nothing was analysed.",
  ur: "یہ حوالہ ڈیسک تصاویر کی تشریح یا تخلیق نہیں کرتا، بشمول ای سی جی، ایکس رے، سی ٹی، ایم آر آئی، الٹراساؤنڈ، میموگرام، یا زخم کی تصویر۔ کچھ تجزیہ نہیں ہوا۔",
} as const;

const IDENTIFIERS = {
  en: "Possible identifiers were detected, such as a name, birth date, record number, phone, email, or address. Remove them and ask again. The question was not searched and was not saved.",
  ur: "شناختی معلومات لگ رہی ہیں، جیسے نام، تاریخ پیدائش، ریکارڈ نمبر، فون، ای میل، یا پتہ۔ انہیں ہٹا کر دوبارہ پوچھیں۔ سوال نہ تلاش ہوا اور نہ محفوظ ہوا۔",
} as const;

const HARM = {
  en: "If you or someone with you may be unsafe, contact emergency services now. In the UAE call 998 or 999. In Pakistan call 1122 or 115. To talk to someone: UAE 800-HOPE (800 4673), or Dubai Itma'en 800 506. In the United States call or text 988. No dose, quantity, or method of harm is given here.",
  ur: "اگر آپ یا ساتھ والا غیر محفوظ ہو تو ابھی ایمرجنسی سے رابطہ کریں۔ متحدہ عرب امارات میں 998 یا 999۔ پاکستان میں 1122 یا 115۔ بات کرنے کے لیے: متحدہ عرب امارات 800-HOPE (800 4673)، یا دبئی اطمئن 800 506۔ ریاست ہائے متحدہ میں 988 کال یا میسج کریں۔ یہاں کوئی خوراک، مقدار، یا نقصان کا طریقہ نہیں۔",
} as const;

const EMERGENCY = {
  en: "This sounds like a possible overdose or poisoning. Contact emergency services now (UAE 998 or 999, Pakistan 1122 or 115) or a poison centre, and bring every pack. This desk will not say how much is dangerous.",
  ur: "یہ ممکنہ زیادہ مقدار یا زہر لگتا ہے۔ ابھی ایمرجنسی سے رابطہ کریں (متحدہ عرب امارات 998 یا 999، پاکستان 1122 یا 115) یا زہر مرکز سے، اور ہر پیک ساتھ لے جائیں۔ یہ ڈیسک نہیں بتائے گا کتنی مقدار خطرناک ہے۔",
} as const;

const DOSE_PATTERN =
  /\d[\d,]*(?:\.\d+)?\s*(?:mg|mcg|µg|micrograms?|mls?|iu|units?|g|ملی\s*گرام|گرام|ملی\s*لیٹر)/giu;

const HARM_PATTERN =
  /(kill myself|killing myself|end my life|want to die|suicide|suicidal|self-?harm|lethal dose|\bld50\b|how (?:many|much).{0,48}(?:die|kill|overdose)|how to overdose|khudkushi|خودکشی|مرنا چاہ|جان دینے)/i;

const EMERGENCY_PATTERN =
  /(took (?:too many|all|the whole)|swallowed (?:all|the|a bottle)|child (?:ate|swallowed)|(?:i|he|she|they|someone|patient).{0,24}overdos|has overdosed|been poisoned|\bpoisoned\b|\bpoisoning\b|unresponsive after|زیادہ گولیاں کھا|بچے نے نگل|زہر کھا)/i;

const IMAGING_PATTERN =
  /(\bx-?rays?\b|\bct\b|\bmri\b|\becg\b|\bekg\b|ultrasound|mammogram|histopath|microscope|radiograph|pet scan|lesion photo|generate (?:an? )?(?:medical )?image|ایکس رے|ایم آر آئی|الٹراساؤنڈ)/i;

function hasAgeAndWeight(question: string): boolean {
  const age = /\b\d+\s*(?:years?|yrs?|months?|mos?|weeks?|days?|سال|مہینہ|مہینے|ہفت)/i.test(
    question,
  );
  const weight = /\b\d+(?:\.\d+)?\s*(?:kg|kilograms?|kgs?|lb|lbs|pounds?|کلو)/i.test(question);
  return age && weight;
}

export function doseTokens(value: string): string[] {
  return [...value.matchAll(DOSE_PATTERN)].map((match) =>
    match[0].toLowerCase().replace(/[\s,]/g, ""),
  );
}

export function dosesAreSourced(text: string, passages: string[]): boolean {
  const allowed = new Set(passages.flatMap((passage) => doseTokens(passage)));
  return doseTokens(text).every((token) => allowed.has(token));
}

function finish(
  status: ReferenceStatus,
  lang: "en" | "ur",
  assistantId: string,
  parts: string[],
  quotes: ReferenceQuote[] = [],
): ReferenceAnswer {
  const text = [...parts.filter(Boolean), REFERENCE_VERIFY[lang]].join("\n\n");
  if (
    !dosesAreSourced(
      text,
      quotes.map((quote) => quote.passage),
    )
  ) {
    return {
      status: "dose_withheld",
      assistantId,
      quotes: [],
      text: [STANCE[lang], DOSE_WITHHELD[lang], DOSE_CONFIRM[lang], REFERENCE_VERIFY[lang]].join(
        "\n\n",
      ),
    };
  }
  return { status, text, quotes, assistantId };
}

export function answerReference(input: {
  question: string;
  assistantId?: string;
  lang?: "en" | "ur";
}): ReferenceAnswer {
  const lang = input.lang === "ur" ? "ur" : "en";
  const assistantId = referenceAssistant(input.assistantId ?? "all").id;
  const question = input.question.trim();
  if (question.length < 2) {
    return finish("not_in_notes", lang, assistantId, [STANCE[lang], NOT_FOUND[lang]]);
  }
  if (detectIdentifiers(question)) {
    return finish("identifiers", lang, assistantId, [IDENTIFIERS[lang]]);
  }
  if (HARM_PATTERN.test(question)) {
    return finish("harm", lang, assistantId, [HARM[lang]]);
  }
  if (EMERGENCY_PATTERN.test(question)) {
    return finish("emergency", lang, assistantId, [EMERGENCY[lang]]);
  }
  if (IMAGING_PATTERN.test(question)) {
    return finish("not_in_notes", lang, assistantId, [STANCE[lang], IMAGING[lang]]);
  }

  const dosing = isDosingQuestion(question);
  const child = isChildQuestion(question);
  const hideChildNumbers = dosing && child && !hasAgeAndWeight(question);
  let hits = searchReferenceNotes(question, assistantId);
  if (dosing) hits = hits.filter((hit) => hit.note.topic === "dosing");
  if (child) hits = hits.filter((hit) => hit.note.section !== "adult");
  if (hideChildNumbers) {
    hits = hits.filter(
      (hit) => doseTokens(lang === "ur" ? hit.note.passageUr : hit.note.passageEn).length === 0,
    );
  }
  const quotes: ReferenceQuote[] = hits.slice(0, 3).map((hit) => ({
    id: hit.note.id,
    title: lang === "ur" ? hit.note.titleUr : hit.note.titleEn,
    passage: lang === "ur" ? hit.note.passageUr : hit.note.passageEn,
    topic: hit.note.topic,
  }));

  if (quotes.length === 0) {
    return finish(dosing ? "dose_withheld" : "not_in_notes", lang, assistantId, [
      STANCE[lang],
      dosing ? (child ? CHILD_DOSE_WITHHELD[lang] : DOSE_WITHHELD[lang]) : NOT_FOUND[lang],
      dosing ? DOSE_CONFIRM[lang] : "",
    ]);
  }

  const quoted = quotes
    .map((quote) => `[${quote.id}] ${quote.title}\n"${quote.passage}"`)
    .join("\n\n");
  return finish(
    "cited",
    lang,
    assistantId,
    [STANCE[lang], quoted, dosing ? DOSE_CONFIRM[lang] : ""],
    quotes,
  );
}
