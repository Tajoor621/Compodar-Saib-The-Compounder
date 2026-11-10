/** True only in the GitHub Pages client build. The Vercel/Nitro build leaves this unset. */
export function isStaticPages(): boolean {
  return import.meta.env.VITE_STATIC_PAGES === "true";
}

export const STATIC_HOST_COPY = {
  assistantDisclaimer: {
    en: "This public website runs in your browser. Intake, the clinician desk, pharmacy cards, drug information, and the reference desk all work here and stay on this device. This page does not send a question to a hosted model. Guidance is not a prescription. Do not enter names, birth dates, record numbers, or other identifiers. The pack in your hand overrides the card.",
    ur: "یہ عوامی ویب سائٹ آپ کے براؤزر میں چلتی ہے۔ انٹیک، معالج کا ڈیسک، فارمیسی کارڈ، دوائی معلومات، اور حوالہ ڈیسک یہیں کام کرتے ہیں اور اسی ڈیوائس پر رہتے ہیں۔ یہ صفحہ سوال کسی ہوسٹڈ ماڈل کو نہیں بھیجتا۔ رہنمائی نسخہ نہیں۔ نام، تاریخ پیدائش، ریکارڈ نمبر، یا دیگر شناخت درج نہ کریں۔ ہاتھ والا پیک کارڈ پر فوقیت رکھتا ہے۔",
  },
  assistantAccept: {
    en: "I understand. This public site stays in my browser, and a clinician gives the final word.",
    ur: "میں سمجھتا/سمجھتی ہوں۔ یہ عوامی سائٹ میرے براؤزر میں رہتی ہے، اور آخری بات معالج کی ہے۔",
  },
  assistantBanner: {
    en: "Do not type names, birth dates, record numbers, or other identifiers. On this public site a question is not sent to an AI provider.",
    ur: "نام، تاریخ پیدائش، ریکارڈ نمبر، یا دیگر شناخت نہ لکھیں۔ اس عوامی سائٹ پر سوال کسی AI فراہم کنندہ کو نہیں جاتا۔",
  },
  photoConsent: {
    en: "On this public site the photo is not uploaded. Type the name printed on the pack. The pack in your hand overrides the card.",
    ur: "اس عوامی سائٹ پر تصویر اپ لوڈ نہیں ہوتی۔ پیک پر لکھا نام ٹائپ کریں۔ ہاتھ والا پیک کارڈ پر فوقیت رکھتا ہے۔",
  },
  privacySent: {
    en: "This public website does not send questions or photos to an AI provider. The reference desk quotes notes stored in the app. Hosted model answers, pack-photo reading, sign-in, and the database run on the server deployment, not on this page.",
    ur: "یہ عوامی ویب سائٹ سوال یا تصویر کسی AI فراہم کنندہ کو نہیں بھیجتی۔ حوالہ ڈیسک ایپ میں محفوظ نوٹس نقل کرتا ہے۔ ہوسٹڈ ماڈل کے جواب، پیک کی تصویر پڑھنا، سائن اِن، اور ڈیٹا بیس سرور والی اشاعت پر چلتے ہیں، اس صفحے پر نہیں۔",
  },
  privacyPhoto: {
    en: "Pack photos are not uploaded from this public site. On the server deployment, a photo is sent only after the consent checkbox, and patient scans or identifier documents must not be uploaded.",
    ur: "اس عوامی سائٹ سے پیک کی تصویر اپ لوڈ نہیں ہوتی۔ سرور والی اشاعت پر تصویر صرف رضامندی کے چیک کے بعد جاتی ہے، اور مریض کے اسکین یا شناختی کاغذات نہیں بھیجنے۔",
  },
} as const;
