/** True only in the GitHub Pages client build. The Vercel/Nitro build leaves this unset. */
export function isStaticPages(): boolean {
  return import.meta.env.VITE_STATIC_PAGES === "true";
}

export const STATIC_HOST_COPY = {
  photoConsent: {
    en: "Search by the name printed on the medicine pack. Photo reading is available on the server deployment. The pack in your hand overrides the card.",
    ur: "دوا کے پیک پر لکھا نام تلاش کریں۔ تصویر پڑھنے کی سہولت سرور والی اشاعت پر دستیاب ہے۔ ہاتھ والا پیک کارڈ پر فوقیت رکھتا ہے۔",
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
