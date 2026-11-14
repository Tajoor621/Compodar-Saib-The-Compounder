import type { LocalText } from "./regions.ts";

export const CARE_TRACKS = ["children", "pregnancy", "gynaecology", "remedies"] as const;
export type CareTrack = (typeof CARE_TRACKS)[number];
export type ScreeningTrack = Exclude<CareTrack, "remedies">;
export type Answer = "yes" | "no" | "unsure";
type Source = { title: string; url: string };

const infant = {
  title: "NHS · Urgent help for babies and children",
  url: "https://www.nhs.uk/baby/health/when-to-get-urgent-medical-help-for-babies-and-children-under-5/",
};
const imci = {
  title: "WHO · Childhood danger signs",
  url: "https://cdn.who.int/media/docs/default-source/mca-documents/child/imci-integrated-management-of-childhood-illness/imci-in-service-training/imci-in_servicetraining_module_01.pdf",
};
const maternal = {
  title: "CDC · Urgent maternal warning signs",
  url: "https://www.cdc.gov/hearher/maternal-warning-signs/index.html",
};
const ectopic = {
  title: "NHS · Ectopic pregnancy",
  url: "https://www.nhs.uk/conditions/ectopic-pregnancy/",
};
const cramps = { title: "NHS · Period pain", url: "https://www.nhs.uk/symptoms/period-pain/" };
const heavy = { title: "NHS · Heavy periods", url: "https://www.nhs.uk/conditions/heavy-periods/" };
const diarrhoea = {
  title: "WHO · Diarrhoeal disease",
  url: "https://www.who.int/news-room/fact-sheets/detail/diarrhoeal-disease",
};

export const TRACK_LABELS: Record<CareTrack, LocalText> = {
  children: { en: "Child health", ur: "بچوں کی صحت" },
  pregnancy: { en: "Pregnancy and after birth", ur: "حمل اور ولادت کے بعد" },
  gynaecology: { en: "Periods and pelvic symptoms", ur: "ماہواری اور پیڑو کی علامات" },
  remedies: { en: "Home care in Pakistan", ur: "پاکستان میں گھریلو دیکھ بھال" },
};

type Question = {
  prompt: LocalText;
  action: "emergency" | "urgent";
  source: Source;
};

const QUESTIONS: Record<ScreeningTrack, Question[]> = {
  children: [
    {
      prompt: {
        en: "Is the child struggling to breathe, blue or grey around the lips, having a seizure, or hard to wake?",
        ur: "کیا بچے کو سانس لینے میں شدید دشواری ہے، ہونٹ نیلے یا سرمئی ہیں، دورہ پڑ رہا ہے، یا جگانا مشکل ہے؟",
      },
      action: "emergency",
      source: infant,
    },
    {
      prompt: {
        en: "Is the child unable to drink or breastfeed, vomiting everything, or do they have a rash that stays visible when pressed?",
        ur: "کیا بچہ پانی یا ماں کا دودھ نہیں پی سکتا، ہر چیز کی قے کر رہا ہے، یا دانے دبانے سے غائب نہیں ہوتے؟",
      },
      action: "emergency",
      source: imci,
    },
    {
      prompt: {
        en: "Is the baby younger than 3 months with a temperature of 38°C or higher, or 3 to 6 months with a temperature of 39°C or higher?",
        ur: "کیا تین ماہ سے کم عمر بچے کا بخار 38°C یا زیادہ ہے، یا تین سے چھ ماہ کے بچے کا بخار 39°C یا زیادہ ہے؟",
      },
      action: "urgent",
      source: infant,
    },
    {
      prompt: {
        en: "Is the child drinking much less or passing much less urine than usual?",
        ur: "کیا بچہ معمول سے بہت کم پی رہا ہے یا پیشاب بہت کم کر رہا ہے؟",
      },
      action: "urgent",
      source: infant,
    },
  ],
  pregnancy: [
    {
      prompt: {
        en: "During pregnancy or within a year after birth, is there heavy bleeding, chest pain, severe trouble breathing, fainting, or a seizure?",
        ur: "کیا حمل کے دوران یا ولادت کے ایک سال کے اندر بہت زیادہ خون بہہ رہا ہے، سینے میں درد، سانس کی شدید تکلیف، بے ہوشی یا دورہ ہے؟",
      },
      action: "emergency",
      source: maternal,
    },
    {
      prompt: {
        en: "Is there a severe or persistent headache, blurred vision, severe belly pain, or a temperature of 38°C or higher?",
        ur: "کیا شدید یا مسلسل سر درد، دھندلا دکھائی دینا، پیٹ میں شدید درد، یا 38°C یا زیادہ بخار ہے؟",
      },
      action: "urgent",
      source: maternal,
    },
    {
      prompt: {
        en: "During pregnancy, has the baby stopped moving or started moving less than usual? Is there vaginal bleeding or leaking fluid?",
        ur: "کیا حمل میں بچے کی حرکت رک گئی ہے یا معمول سے کم ہے؟ کیا اندام نہانی سے خون آ رہا ہے یا پانی بہہ رہا ہے؟",
      },
      action: "urgent",
      source: maternal,
    },
  ],
  gynaecology: [
    {
      prompt: {
        en: "Is there sudden severe lower belly pain with dizziness or fainting, or very heavy bleeding with faintness?",
        ur: "کیا پیٹ کے نچلے حصے میں اچانک شدید درد کے ساتھ چکر یا بے ہوشی ہے، یا بہت زیادہ خون کے ساتھ بے ہوشی محسوس ہو رہی ہے؟",
      },
      action: "emergency",
      source: ectopic,
    },
    {
      prompt: {
        en: "Could you be pregnant, even without a positive test, and have lower belly pain, vaginal bleeding, or shoulder-tip pain?",
        ur: "کیا حمل کا امکان ہے، چاہے ٹیسٹ مثبت نہ آیا ہو، اور پیٹ کے نچلے حصے میں درد، اندام نہانی سے خون یا کندھے کے سرے پر درد ہے؟",
      },
      action: "urgent",
      source: ectopic,
    },
    {
      prompt: {
        en: "Is pelvic or period pain severe or much worse than usual?",
        ur: "کیا پیڑو یا ماہواری کا درد شدید ہے یا معمول سے بہت زیادہ ہے؟",
      },
      action: "urgent",
      source: cramps,
    },
  ],
};

export function questionsFor(track: ScreeningTrack): readonly Question[] {
  return QUESTIONS[track];
}

export function assessFamilyCare(track: ScreeningTrack, answers: readonly Answer[]) {
  const questions = QUESTIONS[track];
  const flagged = questions.find(
    (_, index) => answers[index] === "yes" || answers[index] === "unsure",
  );
  if (flagged) return { status: flagged.action, source: flagged.source } as const;
  if (questions.every((_, index) => answers[index] === "no"))
    return { status: "complete" } as const;
  return { status: "screening" } as const;
}

export const FAMILY_GUIDES: readonly {
  id: string;
  tracks: ScreeningTrack[];
  title: LocalText;
  do: LocalText;
  avoid?: LocalText;
  follow: LocalText;
  sources: Source[];
}[] = [
  {
    id: "ors",
    tracks: ["children"],
    title: {
      en: "Diarrhoea and ORS when clean water is limited",
      ur: "دست، او آر ایس اور صاف پانی کی کمی",
    },
    do: {
      en: "Use a packaged ORS sachet and the exact amount of safe water printed on it. Offer small, frequent sips if the child is awake and can swallow. Continue breastfeeding and usual feeding as tolerated.",
      ur: "او آر ایس کا پیکٹ اس پر لکھی ہوئی مقدار کے مطابق محفوظ پانی میں ملائیں۔ بچہ جاگ رہا ہو اور نگل سکتا ہو تو وقفے وقفے سے تھوڑا پلائیں۔ ماں کا دودھ اور معمول کی غذا حسب برداشت جاری رکھیں۔",
    },
    avoid: {
      en: "Use safe drinking water. Keep floodwater out of drinking and food preparation. Keep the ORS mixture at the packet’s stated concentration.",
      ur: "پینے کے لیے محفوظ پانی استعمال کریں۔ سیلابی پانی کھانے پینے میں استعمال نہ کریں۔ او آر ایس پیکٹ کی ہدایت کے مطابق ہی بنائیں۔",
    },
    follow: {
      en: "Seek urgent care for blood in the stool, much less urine, or worsening symptoms. If the child cannot drink, vomits everything or is hard to wake, get emergency help.",
      ur: "پاخانے میں خون، بہت کم پیشاب یا بگڑتی علامات میں فوری طبی مدد لیں۔ بچہ پی نہیں سکتا، ہر چیز کی قے کر رہا ہے یا جگانا مشکل ہے تو ایمرجنسی مدد لیں۔",
    },
    sources: [
      diarrhoea,
      imci,
      {
        title: "UNICEF Pakistan · Safe drinking water after floods",
        url: "https://www.unicef.org/pakistan/press-releases/more-10-million-people-including-children-living-pakistans-flood-affected-areas",
      },
    ],
  },
  {
    id: "cold",
    tracks: ["children"],
    title: { en: "A mild cough or blocked nose", ur: "ہلکی کھانسی یا بند ناک" },
    do: {
      en: "Offer usual fluids or breastfeeds. Saline nose drops can loosen mucus. A warm honey drink may soothe a cough in children over 1 year old.",
      ur: "معمول کے مشروبات یا ماں کا دودھ دیں۔ نمکین پانی کے ناک کے قطرے بلغم نرم کر سکتے ہیں۔ ایک سال سے بڑے بچے کو نیم گرم شہد والا مشروب کھانسی میں سکون دے سکتا ہے۔",
    },
    avoid: {
      en: "Keep honey away from babies under 1 year. Avoid bowls of hot water for steam inhalation because spills can cause serious burns.",
      ur: "ایک سال سے کم عمر بچے کو شہد نہ دیں۔ بھاپ کے لیے گرم پانی کا برتن استعمال نہ کریں کیونکہ پانی گرنے سے شدید جلنے کا خطرہ ہے۔",
    },
    follow: {
      en: "Get emergency help for breathing difficulty or blue lips. Seek medical advice if the child is getting worse.",
      ur: "سانس میں دشواری یا نیلے ہونٹوں میں ایمرجنسی مدد لیں۔ بچے کی طبیعت بگڑے تو طبی مشورہ لیں۔",
    },
    sources: [
      {
        title: "NHS · Children’s colds and coughs",
        url: "https://www.nhs.uk/baby/health/colds-coughs-and-ear-infections-in-children/",
      },
      {
        title: "NHS and British Burn Association · Steam burns",
        url: "https://www.royaldevon.nhs.uk/news/nhs-and-british-burn-association-issue-public-safety-warning-steam-inhalation-causes-burns/",
      },
    ],
  },
  {
    id: "periods",
    tracks: ["gynaecology"],
    title: { en: "Familiar period cramps", ur: "ماہواری کا مانوس درد" },
    do: {
      en: "For your usual cramps, try gentle movement or a warm compress. Wrap a warm water bottle in a towel before applying it.",
      ur: "ماہواری کے معمول کے درد میں ہلکی چہل قدمی یا گرم پٹی آزمائیں۔ گرم پانی کی بوتل کپڑے میں لپیٹ کر رکھیں۔",
    },
    follow: {
      en: "Arrange a check if periods become heavier or more painful, you bleed between periods, or the pain disrupts daily life. If pregnancy is possible and there is pain or bleeding, seek medical care immediately.",
      ur: "ماہواری زیادہ بھاری یا دردناک ہو، درمیان میں خون آئے یا روزمرہ کام متاثر ہوں تو معائنہ کروائیں۔ حمل کا امکان ہو اور درد یا خون آئے تو فوری طبی مدد لیں۔",
    },
    sources: [cramps, heavy, ectopic],
  },
  {
    id: "child-handoff",
    tracks: ["children"],
    title: { en: "What to tell the children’s doctor", ur: "بچوں کے ڈاکٹر کو کیا بتائیں" },
    do: {
      en: "Tell the clinician the child’s age, when symptoms started, the highest measured temperature, and whether feeding or urination has changed. Bring the vaccination card and any medicine packs if they are nearby.",
      ur: "ڈاکٹر کو بچے کی عمر، علامات کب شروع ہوئیں، ناپا گیا سب سے زیادہ بخار اور دودھ، خوراک یا پیشاب میں تبدیلی بتائیں۔ ویکسین کا کارڈ اور استعمال شدہ دواؤں کے پیک پاس ہوں تو لے جائیں۔",
    },
    follow: {
      en: "For a warning sign, seek care first. Bring records only if they are easy to reach.",
      ur: "خطرے کی علامت ہو تو پہلے طبی مدد لیں۔ ریکارڈ صرف تب ساتھ لیں جب وہ فوراً مل جائے۔",
    },
    sources: [imci, infant],
  },
  {
    id: "handoff",
    tracks: ["pregnancy"],
    title: { en: "What to tell the maternity team", ur: "زچگی کی ٹیم کو کیا بتائیں" },
    do: {
      en: "Say how many weeks pregnant you are or when you gave birth. Describe when symptoms started, any bleeding or leaking fluid, and any change in the baby’s movements. Take your maternity record if it is nearby.",
      ur: "حمل کے ہفتے یا ولادت کی تاریخ بتائیں۔ علامات کے آغاز، خون یا پانی آنے، اور بچے کی حرکت میں تبدیلی کی تفصیل دیں۔ زچگی کا کارڈ پاس ہو تو لے جائیں۔",
    },
    follow: {
      en: "If a warning sign is present, contact a maternity unit or hospital immediately. Take the record only if doing so is quick and easy.",
      ur: "خطرے کی علامت ہو تو فوراً زچگی یونٹ یا ہسپتال سے رابطہ کریں۔ کارڈ صرف تب ساتھ لیں جب وہ فوراً مل جائے۔",
    },
    sources: [maternal],
  },
];
