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

export { detectIdentifiers } from "./safety.ts";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  citations?: string[];
  sources?: { id: string; title: string; url: string; publisher: string; retrievedAt: string }[];
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
