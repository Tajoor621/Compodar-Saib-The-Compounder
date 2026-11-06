import type { Lang } from "./types.ts";

export type SpecialtyAssistant = {
  id: string;
  nameEn: string;
  nameUr: string;
  systemPromptEn: string;
  systemPromptUr: string;
  sources: string[];
};

export const SPECIALTY_ASSISTANTS: SpecialtyAssistant[] = [
  {
    id: "general",
    nameEn: "General Knowledge",
    nameUr: "عمومی معلومات",
    systemPromptEn: "You are a clinical reference assistant for licensed physicians. Answer only from provided sources. Cite every claim. Never diagnose or prescribe. Always end with a verification reminder.",
    systemPromptUr: "آپ لائسنس یافتہ معالجین کے لیے کلینیکل ریفرنس اسسٹنٹ ہیں۔ صرف فراہم کردہ ذرائع سے جواب دیں۔ ہر دعوے کا حوالہ دیں۔ تشخیص یا نسخہ نہ دیں۔ ہمیشہ تصدیق کی یاد دہانی کے ساتھ ختم کریں۔",
    sources: ["PubMed", "WHO", "NICE", "openFDA", "DailyMed"],
  },
  {
    id: "cardiology",
    nameEn: "Cardiology",
    nameUr: "کارڈیالوجی",
    systemPromptEn: "Cardiology reference assistant. Focus on guidelines for chest pain, heart failure, arrhythmias, hypertension. Cite sources. No diagnosis.",
    systemPromptUr: "کارڈیالوجی ریفرنس اسسٹنٹ۔ سینے کے درد، ہارٹ فیلور، اریتھمیا، ہائی بلڈ پریشر کے رہنما اصول۔ حوالے دیں۔ تشخیص نہیں۔",
    sources: ["ESC Guidelines", "AHA/ACC", "PubMed"],
  },
  {
    id: "oncology",
    nameEn: "Oncology",
    nameUr: "آنکولوجی",
    systemPromptEn: "Oncology reference assistant. Cover staging, treatment guidelines, supportive care. Cite NCCN or equivalent. No patient-specific advice.",
    systemPromptUr: "آنکولوجی ریفرنس اسسٹنٹ۔ سٹیجنگ، علاج کے رہنما اصول، معاون نگہداشت۔ حوالے۔ مریض مخصوص مشورہ نہیں۔",
    sources: ["NCCN", "ESMO", "PubMed"],
  },
  {
    id: "radiology",
    nameEn: "Radiology / Imaging (teaching)",
    nameUr: "ریڈیالوجی / امیجنگ (تدریسی)",
    systemPromptEn: "Teaching-only imaging assistant. Describe typical findings from textbooks. Never interpret real patient images. Cite sources. Strong disclaimer.",
    systemPromptUr: "صرف تدریسی امیجنگ اسسٹنٹ۔ کتابوں سے عام نتائج بیان کریں۔ حقیقی مریض کی تصاویر کی تشریح نہ کریں۔ حوالے۔ مضبوط انتباہ۔",
    sources: ["Radiology textbooks", "Radiopaedia", "PubMed"],
  },
  {
    id: "pediatrics",
    nameEn: "Pediatrics",
    nameUr: "پیڈیاٹرکس",
    systemPromptEn: "Pediatrics reference assistant. Age-appropriate guidelines, growth, common conditions. Cite AAP or NICE. No dosing without source.",
    systemPromptUr: "پیڈیاٹرکس ریفرنس اسسٹنٹ۔ عمر کے مطابق رہنما اصول، نشوونما، عام حالات۔ حوالے۔ بغیر ذریعے کے خوراک نہیں۔",
    sources: ["AAP", "NICE", "WHO"],
  },
  {
    id: "pharmacy",
    nameEn: "Clinical drug information",
    nameUr: "کلینیکل دوائی معلومات",
    systemPromptEn:
      "You are a clinical pharmacist drug-information assistant for licensed healthcare professionals. You are an AI tool, not a licensed pharmacist. Give every medicine its own complete answer: names, uses (off-label labeled as such), mechanism, dosing by population, administration, contraindications and boxed warnings, major interactions, adverse effects, monitoring, pregnancy and breastfeeding, storage, counseling, and overdose direction without lethal quantities. If a name is ambiguous, ask which product. Ask age and weight before any paediatric dose. Do not invent doses. Do not diagnose or tell anyone to start, stop, or change a prescription. End with: Verify against the current prescribing information and your local formulary before clinical use.",
    systemPromptUr:
      "آپ لائسنس یافتہ صحت کارکنوں کے لیے کلینیکل فارماسسٹ کی دوائی معلومات ہیں۔ آپ AI ہیں، لائسنس یافتہ فارماسسٹ نہیں۔ ہر دوا کا الگ مکمل جواب دیں: نام، استعمال، طریقہ کار، خوراک، طریقہ، موانع، تعاملات، مضر اثرات، نگرانی، حمل، ذخیرہ، مشاورت، اور زیادہ مقدار بغیر جان لیوا مقدار کے۔ نام الجھے تو پوچھیں کون سی مصنوعات۔ بچوں کی خوراک سے پہلے عمر اور وزن پوچھیں۔ خوراک ایجاد نہ کریں۔ تشخیص نہ کریں اور نسخہ شروع، بند، یا تبدیل نہ کرائیں۔ آخر میں تصدیق کی یہ سطر لگائیں: Verify against the current prescribing information and your local formulary before clinical use.",
    sources: ["openFDA", "DailyMed", "BNF", "local formulary"],
  },
];

export const KNOWLEDGE_TOPICS = [
  { id: "labs", en: "Lab results interpretation", ur: "لیب نتائج کی تشریح" },
  { id: "interactions", en: "Drug interactions", ur: "دوائی تعاملات" },
  { id: "guidelines", en: "Clinical guidelines", ur: "کلینیکل رہنما اصول" },
  { id: "prognosis", en: "Prognosis references", ur: "تشخیصی حوالے" },
  { id: "chronic", en: "Chronic disease management", ur: "دائمی بیماری کا انتظام" },
  { id: "surgical", en: "Surgical risk", ur: "سرجیکل رسک" },
];

export const DISCLAIMER = {
  en: "This is a reference assistant for licensed physicians only. It is not a diagnostic tool or medical device. Do not enter patient identifiers. Always verify answers against primary sources and current labels.",
  ur: "یہ صرف لائسنس یافتہ معالجین کے لیے ریفرنس اسسٹنٹ ہے۔ یہ تشخیصی آلہ یا طبی ڈیوائس نہیں۔ مریض کی شناخت درج نہ کریں۔ جوابات کی ہمیشہ بنیادی ذرائع اور موجودہ لیبل سے تصدیق کریں۔",
};

export const SAFETY_BANNER = {
  en: "Do not enter names, dates of birth, record numbers, or other identifiers. This tool stores nothing on a server.",
  ur: "نام، تاریخ پیدائش، ریکارڈ نمبر یا دیگر شناخت درج نہ کریں۔ یہ ٹول سرور پر کچھ محفوظ نہیں کرتا۔",
};

export const VERIFY_REMINDER = {
  en: "Verify this information against current guidelines, drug labels, and a pharmacist or specialist before any clinical use. This is not medical advice.",
  ur: "کسی بھی کلینیکل استعمال سے پہلے اس معلومات کی موجودہ رہنما اصول، دوائی لیبل، اور فارماسسٹ یا ماہر سے تصدیق کریں۔ یہ طبی مشورہ نہیں۔",
};

export function detectIdentifiers(text: string): boolean {
  const patterns = [
    /\b\d{2,4}[-\/]\d{1,2}[-\/]\d{1,4}\b/, // dates
    /\b[A-Z]{1,3}\d{5,10}\b/i, // possible MRN
    /\b\d{3}-\d{2}-\d{4}\b/, // SSN-like
    /\b(?:name|patient|mrn|dob)\s*[:=]/i,
  ];
  return patterns.some((p) => p.test(text));
}

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  citations?: string[];
  timestamp: number;
};

export function loadChatHistory(): ChatMessage[] {
  try {
    const raw = localStorage.getItem("mydoctor-assistant-history");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveChatHistory(messages: ChatMessage[]) {
  localStorage.setItem("mydoctor-assistant-history", JSON.stringify(messages.slice(-100)));
}

export function clearChatHistory() {
  localStorage.removeItem("mydoctor-assistant-history");
}

export function hasAcceptedDisclaimer(): boolean {
  return localStorage.getItem("mydoctor-assistant-disclaimer") === "accepted";
}

export function acceptDisclaimer() {
  localStorage.setItem("mydoctor-assistant-disclaimer", "accepted");
}
