import type { ClinicalAnswer } from "./types.ts";

const OFFLINE: Record<"en" | "ur", string> = {
  en: "This public site does not call a hosted model. No clinical answer was generated, and the question was not sent to an AI provider. Use the reference desk on this site for a cited answer from the notes stored in the app. The pack in your hand overrides the card.\n\nVerify this against the current label and a licensed clinician before any clinical use. This is guidance, not a prescription.",
  ur: "یہ عوامی سائٹ کسی ہوسٹڈ ماڈل کو نہیں بلاتی۔ کوئی کلینیکل جواب نہیں بنا، اور سوال کسی AI فراہم کنندہ کو نہیں گیا۔ اس سائٹ کے حوالہ ڈیسک سے ایپ میں محفوظ نوٹس کا حوالہ جات جواب لیں۔ ہاتھ والا پیک کارڈ پر فوقیت رکھتا ہے۔\n\nکسی بھی کلینیکل استعمال سے پہلے موجودہ لیبل اور لائسنس یافتہ معالج سے تصدیق کریں۔ یہ رہنمائی ہے، نسخہ نہیں۔",
};

/** Same call shape as the server function, without a network request. */
export async function askClinicalReference(input: {
  data: { question: string; language?: "en" | "ur" };
}): Promise<ClinicalAnswer> {
  const language = input.data.language === "ur" ? "ur" : "en";
  return {
    status: "configuration_error",
    answer: OFFLINE[language],
    sources: [],
  };
}
