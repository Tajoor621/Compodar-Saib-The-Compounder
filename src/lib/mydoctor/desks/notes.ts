import type { DeskId } from "./types.ts";

/** Passages already stated by this app's routing notes or shelf cards. Not a diagnosis list. */
export type DeskNote = {
  id: string;
  desks: DeskId[];
  titleEn: string;
  titleUr: string;
  detailEn: string;
  detailUr: string;
  sourceId: string;
  sourceEn: string;
  sourceUr: string;
  when: (flags: FlagSet) => boolean;
};

export type FlagSet = {
  skin: boolean;
  gut: boolean;
  heart: boolean;
  neuro: boolean;
  lung: boolean;
  ent: boolean;
  sugar: boolean;
  thyroid: boolean;
  bp: boolean;
  fever: boolean;
  spread: boolean;
  mole: boolean;
  itch: boolean;
  acid: boolean;
  loose: boolean;
  blood: boolean;
  weight: boolean;
  exert: boolean;
  rest: boolean;
  longCough: boolean;
  coughBlood: boolean;
  thirst: boolean;
  knownSugar: boolean;
};

export const DESK_NOTES: DeskNote[] = [
  {
    id: "skin-plain",
    desks: ["dermatology", "gp"],
    titleEn: "A skin complaint to discuss",
    titleUr: "جلد کی شکایت، بات کرنے کے لیے",
    detailEn: "A skin complaint without red-flag features. Image diagnosis is not performed.",
    detailUr: "جلد کی شکایت بغیر خطرے کے نشان کے۔ تصویر سے تشخیص نہیں ہوتی۔",
    sourceId: "routing:dermatology",
    sourceEn: "Compodar Saib routing note for a skin complaint",
    sourceUr: "Compodar Saib کی جلد کی شکایت کا روٹنگ نوٹ",
    when: (flags) => flags.skin && !flags.fever && !flags.spread && !flags.mole,
  },
  {
    id: "skin-urgent",
    desks: ["dermatology", "gp"],
    titleEn: "Fever or a hot spreading patch",
    titleUr: "بخار یا گرم پھیلتا حصہ",
    detailEn: "Fever or a hot spreading patch raises urgency and adds a general doctor. This is not a named skin disease.",
    detailUr: "بخار یا گرم پھیلتا حصہ فوری درجہ بڑھاتا ہے اور جنرل ڈاکٹر شامل کرتا ہے۔ یہ کسی جلد کی بیماری کا نام نہیں۔",
    sourceId: "routing:dermatology-fever",
    sourceEn: "Compodar Saib routing note when a skin complaint has fever or spread",
    sourceUr: "Compodar Saib کا روٹنگ نوٹ جب جلد کی شکایت میں بخار یا پھیلاؤ ہو",
    when: (flags) => flags.skin && (flags.fever || flags.spread),
  },
  {
    id: "skin-mole",
    desks: ["dermatology", "gp"],
    titleEn: "A changing mole is not named here",
    titleUr: "بدلتا تل یہاں نام نہیں پاتا",
    detailEn: "Image diagnosis is not performed. A mole that is changing, bleeding, or new is not given a cause on this desk. A doctor should see it.",
    detailUr: "تصویر سے تشخیص نہیں ہوتی۔ جو تل بدل رہا ہو، خون بہا رہا ہو، یا نیا ہو، اس ڈیسک پر اس کا سبب نہیں بتایا جاتا۔ ڈاکٹر کو دیکھنا چاہیے۔",
    sourceId: "routing:dermatology-image",
    sourceEn: "Compodar Saib routing note: image diagnosis is not performed",
    sourceUr: "Compodar Saib کا روٹنگ نوٹ: تصویر سے تشخیص نہیں ہوتی",
    when: (flags) => flags.mole,
  },
  {
    id: "gut-discuss",
    desks: ["gastroenterology", "gp"],
    titleEn: "Stomach or bowel words to discuss",
    titleUr: "پیٹ یا آنت کی بات، بحث کے لیے",
    detailEn: "Stomach or bowel words. A doctor would ask about acid, loose stools, and blood before any pack. Not a diagnosis.",
    detailUr: "پیٹ یا آنت کے الفاظ۔ ڈاکٹر پیک سے پہلے تیزاب، پتلے پاخانے، اور خون پوچھے گا۔ تشخیص نہیں۔",
    sourceId: "routing:gut",
    sourceEn: "Compodar Saib routing note for stomach or bowel words",
    sourceUr: "Compodar Saib کا پیٹ یا آنت کے الفاظ کا روٹنگ نوٹ",
    when: (flags) => flags.gut && !flags.blood && !flags.weight,
  },
  {
    id: "gut-blood",
    desks: ["gastroenterology", "gp"],
    titleEn: "Blood, black stool, or weight loss",
    titleUr: "خون، کالا پاخانہ، یا وزن گرنا",
    detailEn: "Blood, black stool, or weight loss should be seen within one to two days. Not a diagnosis.",
    detailUr: "خون، کالا پاخانہ، یا وزن گرنا ایک دو دن میں دکھانا چاہیے۔ تشخیص نہیں۔",
    sourceId: "routing:gut-blood",
    sourceEn: "Compodar Saib routing note for blood, black stool, or weight loss",
    sourceUr: "Compodar Saib کا خون، کالے پاخانے، یا وزن گرنے کا روٹنگ نوٹ",
    when: (flags) => flags.gut && (flags.blood || flags.weight),
  },
  {
    id: "heart-discuss",
    desks: ["cardiology", "gp"],
    titleEn: "Chest or heart words, not a clearance",
    titleUr: "سینے یا دل کے الفاظ، کلیئرنس نہیں",
    detailEn: "Chest or heart words without a red-flag combination. This is not a clearance.",
    detailUr: "سینے یا دل کے الفاظ بغیر خطرے کے جوڑے کے۔ یہ کلیئرنس نہیں۔",
    sourceId: "routing:cardiology",
    sourceEn: "Compodar Saib routing note for chest or heart words",
    sourceUr: "Compodar Saib کا سینے یا دل کے الفاظ کا روٹنگ نوٹ",
    when: (flags) => flags.heart && !flags.exert && !flags.rest,
  },
  {
    id: "heart-effort",
    desks: ["cardiology", "gp"],
    titleEn: "Symptoms on effort or while resting",
    titleUr: "محنت پر یا آرام کے دوران علامات",
    detailEn: "Symptoms on effort, or pain while resting, should be seen within one to two days and sooner if they are happening now. This is not a clearance.",
    detailUr: "محنت پر علامات، یا آرام کے دوران درد، ایک دو دن میں دکھانا چاہیے، اور اگر ابھی ہو رہے ہوں تو جلد۔ یہ کلیئرنس نہیں۔",
    sourceId: "routing:cardiology-effort",
    sourceEn: "Compodar Saib routing note for effort or rest symptoms",
    sourceUr: "Compodar Saib کا محنت یا آرام کی علامات کا روٹنگ نوٹ",
    when: (flags) => flags.heart && (flags.exert || flags.rest),
  },
  {
    id: "heart-bp",
    desks: ["cardiology", "gp"],
    titleEn: "Blood pressure mentioned",
    titleUr: "فشار خون کا ذکر",
    detailEn: "Blood pressure is mentioned without chest-pain red flags. A general doctor should review this. Not a diagnosis.",
    detailUr: "فشار خون کا ذکر ہے، سینے کے درد کا خطرہ نہیں۔ جنرل ڈاکٹر کو دیکھنا چاہیے۔ تشخیص نہیں۔",
    sourceId: "routing:blood-pressure",
    sourceEn: "Compodar Saib routing note when blood pressure is mentioned",
    sourceUr: "Compodar Saib کا نوٹ جب فشار خون کا ذکر ہو",
    when: (flags) => flags.bp && !flags.heart,
  },
  {
    id: "neuro-uncovered",
    desks: ["neurology", "gp"],
    titleEn: "No named nerve or headache cause",
    titleUr: "سر درد یا اعصاب کا کوئی نام نہیں",
    detailEn: "The safety check did not find sudden neurological danger signs. The notes do not name a cause for a chronic headache, nerve pain, or dizziness.",
    detailUr: "حفاظتی جانچ نے اچانک اعصابی خطرہ نہیں دیکھا۔ نوٹس دائمی سر درد، اعصاب کے درد، یا چکر کا سبب نہیں بتاتے۔",
    sourceId: "routing:neuro-clear",
    sourceEn: "Compodar Saib safety check plus the limit of the local notes",
    sourceUr: "Compodar Saib کی حفاظتی جانچ اور مقامی نوٹس کی حد",
    when: (flags) => flags.neuro && !flags.fever,
  },
  {
    id: "lung-discuss",
    desks: ["pulmonology_ent", "gp"],
    titleEn: "Cough or throat words",
    titleUr: "کھانسی یا گلے کے الفاظ",
    detailEn: "Cough or throat words without a breathing emergency. No antibiotic is chosen from this story. Not a diagnosis.",
    detailUr: "کھانسی یا گلے کے الفاظ بغیر سانس کی ایمرجنسی کے۔ اس کہانی سے اینٹی بائیوٹک نہیں چنی جاتی۔ تشخیص نہیں۔",
    sourceId: "routing:cough",
    sourceEn: "Compodar Saib routing note for cough or throat words",
    sourceUr: "Compodar Saib کا کھانسی یا گلے کا روٹنگ نوٹ",
    when: (flags) => (flags.lung || flags.ent) && !flags.fever && !flags.longCough && !flags.coughBlood,
  },
  {
    id: "lung-review",
    desks: ["pulmonology_ent", "gp"],
    titleEn: "Fever, blood in the phlegm, or a longer cough",
    titleUr: "بخار، بلغم میں خون، یا لمبی کھانسی",
    detailEn: "Fever, blood in the phlegm, or a cough lasting more than a week should be listened to by a clinician. Not a diagnosis.",
    detailUr: "بخار، بلغم میں خون، یا ایک ہفتے سے لمبی کھانسی کلینیشن کو سننی چاہیے۔ تشخیص نہیں۔",
    sourceId: "routing:cough-review",
    sourceEn: "Compodar Saib routing note for fever, blood in the phlegm, or a longer cough",
    sourceUr: "Compodar Saib کا بخار، بلغم میں خون، یا لمبی کھانسی کا روٹنگ نوٹ",
    when: (flags) => (flags.lung || flags.ent) && (flags.fever || flags.longCough || flags.coughBlood),
  },
  {
    id: "sugar-discuss",
    desks: ["endocrinology", "gp"],
    titleEn: "Thirst, urine, or sugar words",
    titleUr: "پیاس، پیشاب، یا شوگر کے الفاظ",
    detailEn: "Thirst, urine, or sugar words can worsen. Seen soon, not filed as routine. Not a diagnosis of diabetes.",
    detailUr: "پیاس، پیشاب، یا شوگر کے الفاظ بگڑ سکتے ہیں۔ جلد دکھائیں، معمول کی فہرست نہیں۔ شوگر کی تشخیص نہیں۔",
    sourceId: "routing:metabolic",
    sourceEn: "Compodar Saib routing note for thirst, urine, or sugar words",
    sourceUr: "Compodar Saib کا پیاس، پیشاب، یا شوگر کے الفاظ کا روٹنگ نوٹ",
    when: (flags) => flags.sugar || flags.thirst || flags.knownSugar,
  },
  {
    id: "thyroid-uncovered",
    desks: ["endocrinology", "gp"],
    titleEn: "Thyroid words are not covered",
    titleUr: "تھائرائیڈ کے الفاظ نوٹس میں نہیں",
    detailEn: "The local notes do not name a thyroid or hormone cause. A doctor should review the story. Not a diagnosis.",
    detailUr: "مقامی نوٹس تھائرائیڈ یا ہارمون کا سبب نہیں بتاتے۔ ڈاکٹر کو کہانی دیکھنی چاہیے۔ تشخیص نہیں۔",
    sourceId: "notes:thyroid-limit",
    sourceEn: "Limit of the Compodar Saib local notes",
    sourceUr: "Compodar Saib کے مقامی نوٹس کی حد",
    when: (flags) => flags.thyroid,
  },
];

export const NOTE_COUNT = DESK_NOTES.length;
