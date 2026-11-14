import { appStorage, CHAT_CONSENT_KEY, REFERENCE_DISCLAIMER_KEY, type Bucket } from "../local-storage.ts";

export { CHAT_CONSENT_KEY as ASSISTANT_DISCLAIMER_KEY, REFERENCE_DISCLAIMER_KEY } from "../local-storage.ts";

function read(bucket: Bucket, key: string): string | null {
  try {
    return bucket.getItem(key);
  } catch {
    return null;
  }
}

export function hasReferenceAccess(bucket?: Bucket): boolean {
  const store = bucket ?? appStorage;
  return (
    read(store, REFERENCE_DISCLAIMER_KEY) === "accepted" ||
    read(store, CHAT_CONSENT_KEY) === "accepted"
  );
}

export function acceptReferenceDisclaimer(bucket?: Bucket): void {
  const store = bucket ?? appStorage;
  store.setItem(REFERENCE_DISCLAIMER_KEY, "accepted");
}

export const REFERENCE_DISCLAIMER = {
  en: "Compodar Saib's reference desk quotes the notes in this app. It is guidance, not a diagnosis, a prescription, a medical device, or a substitute for a licensed clinician. If the notes do not cover a question, the desk says so and does not guess. The pack in hand overrides the card. Do not enter names, birth dates, record numbers, or other identifiers. Saved questions stay in this browser unless you export them. They are not sent to a hosted model.",
  ur: "Compodar Saib کا حوالہ ڈیسک اس ایپ کے نوٹس نقل کرتا ہے۔ یہ رہنمائی ہے، تشخیص، نسخہ، طبی ڈیوائس، یا لائسنس یافتہ معالج کا متبادل نہیں۔ اگر نوٹس سوال کو نہ ڈھانپیں تو ڈیسک یہی کہے گا اور اندازہ نہیں لگائے گا۔ ہاتھ والا پیک کارڈ پر فوقیت رکھتا ہے۔ نام، تاریخ پیدائش، ریکارڈ نمبر، یا دیگر شناخت درج نہ کریں۔ محفوظ سوال اسی براؤزر میں رہتے ہیں جب تک آپ انہیں برآمد نہ کریں۔ وہ کسی ہوسٹڈ ماڈل کو نہیں بھیجے جاتے۔",
} as const;

export const REFERENCE_DISCLAIMER_ACCEPT = {
  en: "I understand. This is guidance, and a clinician gives the final word.",
  ur: "میں سمجھتا/سمجھتی ہوں۔ یہ رہنمائی ہے، اور آخری بات معالج کی ہے۔",
} as const;

export const REFERENCE_IDENTIFIER_BANNER = {
  en: "Do not type names, birth dates, record numbers, phone numbers, or other identifiers.",
  ur: "نام، تاریخ پیدائش، ریکارڈ نمبر، فون نمبر، یا دیگر شناخت نہ لکھیں۔",
} as const;
