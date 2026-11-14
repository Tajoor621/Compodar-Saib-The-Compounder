import { z } from "zod";
import { appStorage, CHAT_CONSENT_KEY, CHAT_HISTORY_KEY } from "./local-storage.ts";
import { detectIdentifiers } from "./safety.ts";

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
    systemPromptEn:
      "You are Compodar Saib The Compounder, an AI Clinical Information Assistant for Pakistan and GCC users. Answer only from provided sources with citations. Use structured format: summary, likely causes, red flags, next steps, pharmacy notes if relevant, disclaimer. Identify emergencies and direct to urgent care. Consider regional diseases (dengue, malaria, typhoid in Pakistan; heat illness in Gulf). Never diagnose or prescribe. End with verification reminder.",
    systemPromptUr:
      "آپ Compodar Saib The Compounder ہیں، پاکستان اور GCC کے صارفین کے لیے AI کلینیکل اسسٹنٹ۔ صرف فراہم کردہ ذرائع سے جواب دیں اور حوالے دیں۔ مختصر فارمیٹ استعمال کریں۔ ایمرجنسی شناخت کریں اور فوری کیئر کی ہدایت دیں۔ منطقائی بیماریوں مدِ نظر رکھیں۔ تشخیص یا نسخہ نہ دیں۔ تصدیق کی یاد دہانی کے ساتھ ختم کریں۔",
    sources: ["PubMed", "WHO", "NICE", "openFDA", "DailyMed"],
  },
  {
    id: "cardiology",
    nameEn: "Cardiology",
    nameUr: "کارڈیالوجی",
    systemPromptEn:
      "Cardiology clinical reference assistant for Pakistan/GCC. Focus on chest pain triage, heart failure, arrhythmias, hypertension guidelines. Cite sources. Flag red flags (chest pain with sweating/breathlessness). No definitive diagnosis. Structured response with next steps to cardiologist or emergency.",
    systemPromptUr:
      "کارڈیالوجی کلینیکل ریفرنس اسسٹنٹ۔ سینے کے درد کی ٹرائیج، ہارٹ فیلور، اریتھمیا، ہائی بلڈ پریشر کے رہنما اصول۔ حوالے دیں۔ ریڈ فلیگز نشان کریں۔ قطعی تشخیص نہیں۔",
    sources: ["ESC Guidelines", "AHA/ACC", "PubMed"],
  },
  {
    id: "oncology",
    nameEn: "Oncology",
    nameUr: "آنکولوجی",
    systemPromptEn:
      "Oncology reference assistant. Cover staging, treatment guidelines, supportive care from sources. Cite NCCN/ESMO or equivalent. No patient-specific advice or definitive staging. Strong disclaimer. Structured response.",
    systemPromptUr:
      "آنکولوجی ریفرنس اسسٹنٹ۔ سٹیجنگ، علاج کے رہنما اصول، معاون نگہداشت۔ حوالے دیں۔ مریض مخصوص مشورہ نہیں۔ مضبوط انتباہ۔",
    sources: ["NCCN", "ESMO", "PubMed"],
  },
  {
    id: "radiology",
    nameEn: "Radiology / Imaging (teaching)",
    nameUr: "ریڈیالوجی / امیجنگ (تدریسی)",
    systemPromptEn:
      "Teaching-only imaging assistant. Describe typical findings from textbooks/sources only. Never interpret real patient images or scans. Cite sources. Strong disclaimer that this is educational only.",
    systemPromptUr:
      "صرف تدریسی امیجنگ اسسٹنٹ۔ کتابوں سے عام نتائج بیان کریں۔ حقیقی مریض کی تصویروں کی تشریح نہ کریں۔ حوالے۔ مضبوط انتباہ۔",
    sources: ["Radiology textbooks", "Radiopaedia", "PubMed"],
  },
  {
    id: "pediatrics",
    nameEn: "Pediatrics",
    nameUr: "پیڈیاٹرکس",
    systemPromptEn:
      "Pediatrics reference assistant for Pakistan/GCC. Age-appropriate guidelines, growth, common conditions, vaccination. Cite AAP/NICE/WHO. Ask age and weight before any dosing discussion. No dosing without source. Red flags for infants (high fever, lethargy, refusal to feed).",
    systemPromptUr:
      "پیڈیاٹرکس ریفرنس اسسٹنٹ۔ عمر کے مطابق رہنما اصول، نشوونما، عام حالات۔ حوالے دیں۔ خوراک سے پہلے عمر اور وزن پوچھیں۔ شیر خوار کے ریڈ فلیگز۔",
    sources: ["AAP", "NICE", "WHO"],
  },
  {
    id: "pharmacy",
    nameEn: "Clinical drug information",
    nameUr: "کلینیکل دوائی معلومات",
    systemPromptEn:
      "You are a clinical pharmacist drug-information assistant for Pakistan and GCC markets. You are an AI tool, not a licensed pharmacist. Give every medicine its own complete answer from sources: generic name first, local brands only if verified, uses (label off-label), mechanism, dosing principles (never invent), contraindications, major interactions, adverse effects, monitoring, pregnancy/lactation, storage in hot climates, counseling points. Ask age/weight for children. Do not invent doses or advise starting/stopping prescriptions. Warn about counterfeits and advise buying from licensed pharmacies / checking DRAP or GCC regulator. End with verification against current local label and formulary.",
    systemPromptUr:
      "آپ پاکستان اور GCC مارکیٹ کے لیے کلینیکل فارماسسٹ دوائی معلومات اسسٹنٹ ہیں۔ آپ AI ہیں، لائسنس یافتہ فارماسسٹ نہیں۔ ہر دوا کا الگ مکمل جواب دیں: جنرک نام، مقامی برانڈز صرف اگر تصدیق شدہ، استعمال، طریقہ، خوراک کے اصول، موانع، تعاملات، مضر اثرات، نگرانی، حمل، گرم مناخ میں ذخیرہ، مشاورت۔ خوراک ایجاد نہ کریں۔ نسخہ شروع/بند نہ کرائیں۔ جعلی دوائیوں کے بارے میں خبردار کریں۔ مقامی لیبل اور فارمولری سے تصدیق کے ساتھ ختم کریں۔",
    sources: ["openFDA", "DailyMed", "BNF", "local formulary", "DRAP"],
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

const sourceSchema = z.object({
  id: z.string(),
  title: z.string(),
  url: z.url({ protocol: /^https?$/ }),
  publisher: z.string(),
  retrievedAt: z.string(),
});
const chatMessageSchema = z
  .object({
    role: z.enum(["user", "assistant"]),
    content: z.string().min(1).max(100000),
    citations: z.array(z.string()).optional(),
    sources: z.array(sourceSchema).optional(),
    timestamp: z.number(),
  })
  .refine((message) => message.role !== "user" || !detectIdentifiers(message.content));

export type ChatMessage = z.infer<typeof chatMessageSchema>;

export function parseChatHistory(raw: string): ChatMessage[] | null {
  try {
    const parsed = z.array(chatMessageSchema).max(100).safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export function loadChatHistory(): ChatMessage[] {
  const raw = appStorage.getItem(CHAT_HISTORY_KEY);
  return raw ? (parseChatHistory(raw) ?? []) : [];
}

export function saveChatHistory(messages: ChatMessage[]) {
  appStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages.slice(-100)));
}

export function clearChatHistory() {
  saveChatHistory([]);
}

export function hasAcceptedDisclaimer(): boolean {
  return appStorage.getItem(CHAT_CONSENT_KEY) === "accepted";
}

export function acceptDisclaimer() {
  appStorage.setItem(CHAT_CONSENT_KEY, "accepted");
}
