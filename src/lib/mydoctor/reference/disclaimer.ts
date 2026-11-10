import { browserBucket, type Bucket } from "./history.ts";

export const REFERENCE_DISCLAIMER_KEY = "mydoctor-reference-disclaimer";
/** Existing assistant gate. Accepted means the first-launch disclaimer already happened. */
export const ASSISTANT_DISCLAIMER_KEY = "mydoctor-assistant-disclaimer";

function read(bucket: Bucket, key: string): string | null {
  try {
    return bucket.getItem(key);
  } catch {
    return null;
  }
}

export function hasReferenceAccess(bucket?: Bucket): boolean {
  const store = bucket ?? browserBucket();
  return (
    read(store, REFERENCE_DISCLAIMER_KEY) === "accepted" ||
    read(store, ASSISTANT_DISCLAIMER_KEY) === "accepted"
  );
}

export function acceptReferenceDisclaimer(bucket?: Bucket): void {
  const store = bucket ?? browserBucket();
  store.setItem(REFERENCE_DISCLAIMER_KEY, "accepted");
}

export const REFERENCE_DISCLAIMER = {
  en: "Compodar Saib's reference desk quotes notes stored on this device. It is guidance, not a diagnosis, a prescription, a medical device, or a substitute for a licensed clinician. If the notes do not cover a question, the desk says so and does not guess. The pack in hand overrides the card. Do not enter names, birth dates, record numbers, or other identifiers. Questions stay in this browser. They are not sent to a server or a hosted model.",
  ur: "Compodar Saib کا حوالہ ڈیسک اسی ڈیوائس پر محفوظ نوٹس نقل کرتا ہے۔ یہ رہنمائی ہے، تشخیص، نسخہ، طبی ڈیوائس، یا لائسنس یافتہ معالج کا متبادل نہیں۔ اگر نوٹس سوال کو نہ ڈھانپیں تو ڈیسک یہی کہے گا اور اندازہ نہیں لگائے گا۔ ہاتھ والا پیک کارڈ پر فوقیت رکھتا ہے۔ نام، تاریخ پیدائش، ریکارڈ نمبر، یا دیگر شناخت درج نہ کریں۔ سوال اسی براؤزر میں رہتے ہیں۔ وہ کسی سرور یا ہوسٹڈ ماڈل کو نہیں بھیجے جاتے۔",
} as const;

export const REFERENCE_DISCLAIMER_ACCEPT = {
  en: "I understand. This is guidance on this device, and a clinician gives the final word.",
  ur: "میں سمجھتا/سمجھتی ہوں۔ یہ اسی ڈیوائس پر رہنمائی ہے، اور آخری بات معالج کی ہے۔",
} as const;

export const REFERENCE_IDENTIFIER_BANNER = {
  en: "Do not type names, birth dates, record numbers, phone numbers, or other identifiers.",
  ur: "نام، تاریخ پیدائش، ریکارڈ نمبر، فون نمبر، یا دیگر شناخت نہ لکھیں۔",
} as const;
