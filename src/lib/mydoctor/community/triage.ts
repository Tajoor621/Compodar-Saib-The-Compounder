import type { LocalText } from "./regions.ts";

type Source = { name: string; url: string };

export const TRIAGE_SOURCES: Source[] = [
  {
    name: "WHO / ICRC · Basic Emergency Care",
    url: "https://www.who.int/publications/i/item/9789241513081",
  },
  {
    name: "WHO · Childhood danger signs",
    url: "https://iris.who.int/bitstream/handle/10665/104772/9789241506823_Module-1_eng.pdf",
  },
  {
    name: "NHS · Urgent care for babies and children",
    url: "https://www.nhs.uk/baby/health/when-to-get-urgent-medical-help-for-babies-and-children-under-5/",
  },
  {
    name: "CDC · Urgent maternal warning signs",
    url: "https://www.cdc.gov/hearher/maternal-warning-signs/index.html",
  },
];

export const DANGER_SIGNS: LocalText[] = [
  {
    en: "Struggling to breathe, choking, or blue or grey lips",
    ur: "سانس لینے میں شدید مشکل، دم گھٹنا، یا ہونٹ نیلے یا سرمئی ہونا",
  },
  {
    en: "New chest pressure, or sudden face droop, arm weakness or trouble speaking",
    ur: "سینے میں نیا دباؤ، چہرہ اچانک ٹیڑھا ہونا، بازو کمزور ہونا یا بولنے میں مشکل",
  },
  {
    en: "Unconscious, hard to wake, suddenly confused, or having a seizure",
    ur: "بے ہوشی، جگانے میں مشکل، اچانک الجھن یا دورہ پڑنا",
  },
  {
    en: "Heavy bleeding, serious injury, suspected poisoning or snakebite",
    ur: "بہت زیادہ خون بہنا، شدید چوٹ، زہر کا شبہ یا سانپ کا کاٹنا",
  },
  {
    en: "A child who cannot drink or breastfeed, vomits everything, or has a rash that stays visible when pressed",
    ur: "بچہ پانی یا دودھ نہ پی سکے، ہر چیز کی قے کرے، یا دانے دبانے سے غائب نہ ہوں",
  },
  {
    en: "A baby under 3 months with a temperature of 38°C or higher",
    ur: "تین ماہ سے کم عمر بچے کا بخار 38 ڈگری سینٹی گریڈ یا زیادہ ہو",
  },
  {
    en: "Heavy bleeding during pregnancy or in the year after delivery",
    ur: "حمل کے دوران یا بچے کی پیدائش کے ایک سال کے اندر بہت زیادہ خون بہنا",
  },
];

type Guide = {
  id: string;
  title: LocalText;
  warning: LocalText;
  support: LocalText;
  followUp: LocalText;
  sources: Source[];
};

export const GUIDES: readonly Guide[] = [
  {
    id: "fever",
    title: { en: "Fever in a dengue or malaria area", ur: "ڈینگی یا ملیریا والے علاقے میں بخار" },
    warning: {
      en: "Get urgent care now for severe belly pain, repeated vomiting or bleeding from the nose or gums, even if the fever has gone down.",
      ur: "پیٹ میں شدید درد، بار بار قے، یا ناک یا مسوڑھوں سے خون آئے تو فوری طبی مدد لیں، چاہے بخار اتر گیا ہو۔",
    },
    support: {
      en: "If you can drink safely, sip fluids while arranging care. If dengue is possible, avoid aspirin and ibuprofen.",
      ur: "اگر آسانی سے پی سکتے ہیں تو مدد کا انتظام کرتے ہوئے تھوڑا تھوڑا پانی یا دوسرے مائعات پئیں۔ ڈینگی کا امکان ہو تو اسپرین اور آئیبوپروفین سے پرہیز کریں۔",
    },
    followUp: {
      en: "Contact a health worker today. Say where you live or have travelled recently so they can decide which tests you need.",
      ur: "آج ہی طبی کارکن سے رابطہ کریں۔ اپنا علاقہ اور حالیہ سفر بتائیں تاکہ وہ ضروری ٹیسٹ کا فیصلہ کر سکے۔",
    },
    sources: [
      { name: "WHO · Malaria", url: "https://www.who.int/news-room/fact-sheets/detail/malaria" },
      { name: "CDC · Dengue warning signs", url: "https://www.cdc.gov/dengue/signs-symptoms/" },
      { name: "CDC · Dengue care", url: "https://www.cdc.gov/dengue/treatment/" },
    ],
  },
  {
    id: "diarrhoea",
    title: { en: "Diarrhoea or vomiting", ur: "دست یا قے" },
    warning: {
      en: "Get urgent medical advice if there is blood in the stool, very little urine, or fluids keep coming back up. If the person is hard to wake or the child cannot drink, get emergency help.",
      ur: "پاخانے میں خون آئے، پیشاب بہت کم ہو یا پیا ہوا پانی بار بار قے میں نکل جائے تو فوری طبی مشورہ لیں۔ اگر مریض کو جگانا مشکل ہو یا بچہ پانی نہ پی سکے تو ایمرجنسی مدد لیں۔",
    },
    support: {
      en: "If the person is awake and can swallow, offer small, frequent sips of oral rehydration solution (ORS). Mix the sachet with the exact amount of safe water on the packet. Continue breastfeeding.",
      ur: "اگر مریض ہوش میں ہے اور نگل سکتا ہے تو او آر ایس کے تھوڑے تھوڑے گھونٹ بار بار دیں۔ پیکٹ کو اتنے ہی صاف پانی میں ملائیں جتنا اس پر لکھا ہے۔ ماں کا دودھ جاری رکھیں۔",
    },
    followUp: {
      en: "Get advice sooner for babies, older adults or anyone who continues to show signs of dehydration after ORS.",
      ur: "شیرخوار بچوں، بزرگوں، یا او آر ایس کے بعد بھی پانی کی کمی والے افراد کے لیے جلد طبی مشورہ لیں۔",
    },
    sources: [
      {
        name: "WHO · Diarrhoeal disease",
        url: "https://www.who.int/news-room/fact-sheets/detail/diarrhoeal-disease",
      },
      {
        name: "NHS · Diarrhoea and vomiting",
        url: "https://www.nhs.uk/symptoms/diarrhoea-and-vomiting/",
      },
    ],
  },
  {
    id: "heat",
    title: { en: "Feeling unwell after heat exposure", ur: "گرمی میں رہنے کے بعد طبیعت خراب ہونا" },
    warning: {
      en: "Confusion, a seizure or loss of consciousness after heat exposure is an emergency. Call for help and start cooling the person with cool water or wet cloths.",
      ur: "گرمی کے بعد الجھن، دورہ یا بے ہوشی ایمرجنسی ہے۔ مدد کے لیے کال کریں اور ٹھنڈے پانی یا گیلے کپڑوں سے جسم کو ٹھنڈا کرنا شروع کریں۔",
    },
    support: {
      en: "Move to shade or a cool room, loosen extra clothing, and cool the skin with wet cloths. If fully alert and able to swallow, sip cool water.",
      ur: "سائے یا ٹھنڈے کمرے میں جائیں، اضافی کپڑے ڈھیلے کریں اور گیلے کپڑوں سے جسم ٹھنڈا کریں۔ مکمل ہوش میں ہوں اور نگل سکیں تو ٹھنڈے پانی کے گھونٹ لیں۔",
    },
    followUp: {
      en: "Seek medical help right away if symptoms get worse, vomiting starts, or symptoms last longer than an hour.",
      ur: "علامات بڑھیں، قے شروع ہو یا علامات ایک گھنٹے سے زیادہ رہیں تو فوراً طبی مدد لیں۔",
    },
    sources: [
      {
        name: "CDC · Heat illness first aid",
        url: "https://www.cdc.gov/niosh/heat-stress/about/illnesses.html",
      },
      { name: "CDC · Heat illness symptoms", url: "https://stacks.cdc.gov/view/cdc/59395" },
    ],
  },
  {
    id: "snakebite",
    title: { en: "Suspected snakebite", ur: "سانپ کے کاٹنے کا شبہ" },
    warning: {
      en: "Seek emergency care immediately, even if the person feels well. Ask someone to call or arrange transport.",
      ur: "فوراً ایمرجنسی مدد لیں، چاہے مریض ٹھیک محسوس کرے۔ کسی سے کال کرنے یا سفر کا انتظام کرنے کو کہیں۔",
    },
    support: {
      en: "Keep the person still, support the bitten limb so it does not move, and remove rings or other tight items near the bite. Avoid cutting the bite, sucking it or tying a tight band.",
      ur: "مریض کو حرکت نہ کرنے دیں، کاٹے گئے ہاتھ یا پاؤں کو سہارا دے کر ساکن رکھیں اور کاٹنے کی جگہ کے قریب انگوٹھی یا تنگ چیز ہٹا دیں۔ زخم کو کاٹنے، چوسنے یا کس کر پٹی باندھنے سے گریز کریں۔",
    },
    followUp: {
      en: "Tell the health worker when the bite happened. Leave the snake alone.",
      ur: "طبی کارکن کو بتائیں کہ سانپ نے کب کاٹا۔ سانپ کو پکڑنے کی کوشش نہ کریں۔",
    },
    sources: [
      {
        name: "WHO South-East Asia · Snakebite first aid",
        url: "https://cdn.who.int/media/docs/default-source/searo/india/health-topic-pdf/who-guidance-on-management-of-snakebites.pdf",
      },
    ],
  },
];

export function nextCareStep(
  answers: readonly ("yes" | "no" | "unsure")[],
): "emergency" | "guides" | "unanswered" {
  if (answers.includes("yes") || answers.includes("unsure")) return "emergency";
  return answers.length === DANGER_SIGNS.length && answers.every((answer) => answer === "no")
    ? "guides"
    : "unanswered";
}
