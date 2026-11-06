import type { Monograph } from "./pharmacy.ts";
import { formulaParts, medicineById, searchMedicines } from "./pharmacy.ts";

export const VERIFY_LINE =
  "Verify against the current prescribing information and your local formulary before clinical use.";

export const ROLE_EN =
  "Clinical pharmacist drug-information assistant for licensed healthcare professionals. This is an AI tool, not a licensed pharmacist. Answers support, and do not replace, professional judgment or the current prescribing information. Do not start, stop, or change a prescription for a specific patient from this card.";

export const ROLE_UR =
  "لائسنس یافتہ صحت کارکنوں کے لیے کلینیکل فارماسسٹ کی دوائی معلومات۔ یہ AI آلہ ہے، لائسنس یافتہ فارماسسٹ نہیں۔ جواب مدد کرتے ہیں، پیشہ ور فیصلے یا موجودہ نسخہ جاتی معلومات کی جگہ نہیں لیتے۔ اس کارڈ سے کسی مخصوص مریض کی دوا شروع، بند، یا تبدیل نہ کریں۔";

const SECTION_TITLES = [
  ["names", "Names", "نام"],
  ["uses", "Uses", "استعمال"],
  ["mechanism", "Mechanism", "طریقہ کار"],
  ["dosing", "Dosing", "خوراک"],
  ["administration", "Administration", "طریقہ استعمال"],
  ["contraindications", "Contraindications and boxed warnings", "موانع اور باکسڈ وارننگ"],
  ["interactions", "Major drug interactions", "اہم تعاملات"],
  ["adverse", "Adverse effects", "مضر اثرات"],
  ["monitoring", "Monitoring", "نگرانی"],
  ["pregnancy", "Pregnancy, breastfeeding, and special populations", "حمل، دودھ، اور خاص آبادیاں"],
  ["storage", "Storage and handling", "ذخیرہ اور سنبھال"],
  ["counseling", "Patient counseling points", "مریض کو سمجھانے کی باتیں"],
  ["overdose", "Overdose", "زیادہ مقدار"],
] as const;

export type SectionId = (typeof SECTION_TITLES)[number][0];

export type DrugSection = {
  id: SectionId;
  titleEn: string;
  titleUr: string;
  bodyEn: string;
  bodyUr: string;
};

export type DrugBrief = {
  id: string;
  inn: string;
  sections: DrugSection[];
};

export type DrugChoice = {
  id: string;
  labelEn: string;
  labelUr: string;
};

export type DrugInfoResult =
  | { kind: "harm"; en: string; ur: string }
  | { kind: "emergency"; en: string; ur: string }
  | { kind: "ask"; en: string; ur: string; options: DrugChoice[] }
  | { kind: "empty"; en: string; ur: string }
  | { kind: "briefs"; introEn: string; introUr: string; briefs: DrugBrief[]; gaps: string[] };

type Extra = {
  mechanismEn: string;
  mechanismUr: string;
  adminEn: string;
  adminUr: string;
  boxedEn: string;
  boxedUr: string;
  monitorEn: string;
  monitorUr: string;
  counselEn: string;
  counselUr: string;
  overdoseEn: string;
  overdoseUr: string;
};

const GAP_EN = "Not stated on this local card. Check the current label rather than assuming it is absent.";
const GAP_UR = "اس مقامی کارڈ پر نہیں۔ موجودہ لیبل دیکھیں، یہ نہ سمجھیں کہ بات موجود نہیں۔";

const EXTRAS: Record<string, Extra> = {
  paracetamol: {
    mechanismEn:
      "Analgesic and antipyretic. It reduces prostaglandin signaling, mainly in the central nervous system, and has little anti-inflammatory effect at usual doses.",
    mechanismUr:
      "درد اور بخار کی دوا۔ پروستاگلینڈن کا اشارہ گھٹاتی ہے، زیادہ تر مرکزی اعصاب میں، اور عام خوراک پر سوزش کم گھٹاتی ہے۔",
    adminEn:
      "Oral tablets and soluble tablets may be taken with or without food. Count every paracetamol-containing product, including cold and flu packs. Do not crush a modified-release product; ordinary immediate-release tablets are not modified-release.",
    adminUr:
      "گولی اور گھلنے والی گولی کھانے کے ساتھ یا بغیر۔ نزلہ کے پیک سمیت ہر پیراسیٹامول والی چیز گنیں۔ دیر سے چھوڑنے والی گولی نہ کچلیں؛ عام فوری گولی اس قسم کی نہیں۔",
    boxedEn:
      "US prescribing information carries a boxed warning for acute liver failure, sometimes ending in transplant or death, when the daily maximum is exceeded or several paracetamol products are combined. Confirm the warning on the product in front of you.",
    boxedUr:
      "امریکی نسخہ جاتی معلومات میں شدید جگر کی ناکامی کی باکسڈ وارننگ ہے، کبھی پیوند یا موت تک، جب روزانہ حد سے زیادہ ہو یا کئی پیراسیٹامول والے پیک مل جائیں۔ جو پیک سامنے ہے اس کی وارننگ دیکھیں۔",
    monitorEn: "No routine lab at labeled doses. After a suspected overdose, a timed plasma level and liver tests belong to emergency or poison-centre care, not a home decision.",
    monitorUr: "لیبل والی خوراک پر معمول کی لیب نہیں۔ مشتبہ زیادہ مقدار کے بعد وقت والا خون کا لیول اور جگر کے ٹیسٹ ایمرجنسی یا زہر مرکز کا کام ہیں، گھر کا فیصلہ نہیں۔",
    counselEn:
      "Tell the patient to read cold and flu labels, to space doses, and to seek urgent care if more than the daily maximum may have been taken, even if they still feel well.",
    counselUr:
      "مریض کو نزلہ کے لیبل پڑھنے، وقفہ رکھنے، اور اگر روزانہ حد سے زیادہ لگے تو فوراً مدد لینے کو کہیں، چاہے طبیعت ابھی ٹھیک لگے۔",
    overdoseEn:
      "Early on, the person may feel well or only sick and sweaty. Liver injury can show later as vomiting and pain under the right ribs. Do not wait for those signs. Contact emergency services or a poison centre and bring every pack.",
    overdoseUr:
      "شروع میں طبیعت ٹھیک یا صرف متلی اور پسینہ ہو سکتا ہے۔ جگر کا نقصان بعد میں الٹی اور دائیں پسلی کے نیچے درد سے ظاہر ہو سکتا ہے۔ ان علامات کا انتظار نہ کریں۔ ایمرجنسی یا زہر مرکز سے رابطہ کریں اور ہر پیک ساتھ لے جائیں۔",
  },
  ibuprofen: {
    mechanismEn: "Non-steroidal anti-inflammatory drug. It reversibly inhibits cyclo-oxygenase, which lowers the prostaglandins that drive pain, fever, and swelling.",
    mechanismUr: "غیر سٹیرائیڈی سوزش والی دوا۔ سائکلو آکسیجینیز کو الٹ جانے والے انداز میں روکتی ہے، جس سے درد، بخار، اور سوجن والے پروستاگلینڈن کم ہوتے ہیں۔",
    adminEn:
      "Take oral doses with food or milk. If the pack says retard, sustained-release, or modified-release, do not crush or chew it. Separate from low-dose aspirin by the plan on the label, not by guesswork.",
    adminUr:
      "کھانے یا دودھ کے ساتھ لیں۔ اگر پیک پر ریٹارڈ، دیر سے چھوڑنے والی، یا تبدیل شدہ ریلیز لکھا ہو تو نہ کچلیں نہ چبائیں۔ کم خوراک اسپرین سے وقفہ لیبل کے منصوبے سے رکھیں، اندازے سے نہیں۔",
    boxedEn:
      "NSAID labels in the United States carry boxed warnings for serious cardiovascular thrombotic events and for serious gastrointestinal bleeding, ulceration, and perforation. They are contraindicated for pain around coronary-artery bypass surgery. Confirm the local product label.",
    boxedUr:
      "امریکہ میں این ایس اے آئی ڈی لیبل پر سنگین دل کی نالی کے لوتھڑے اور سنگین معدے کی خون ریزی، السر، اور سوراخ کی باکسڈ وارننگ ہے۔ دل کی بائی پاس سرجری کے آس پاس درد کے لیے ممنوع ہیں۔ مقامی لیبل کی تصدیق کریں۔",
    monitorEn:
      "A short labeled course needs no routine lab. Longer use: kidney function, blood pressure, and signs of bleeding or ankle swelling. Stop and review black stool or reduced urine.",
    monitorUr:
      "مختصر لیبل کورس پر معمول کی لیب نہیں۔ لمبا استعمال: گردے کا کام، فشار خون، اور خون یا ٹخنوں کی سوجن۔ کالا پاخانہ یا کم پیشاب پر روک کر دیکھیں۔",
    counselEn: "Use the lowest amount for the shortest time. Do not combine two anti-inflammatory tablets. Seek care for black stool, vomiting blood, chest pain, swelling, or much less urine.",
    counselUr: "کم سے کم مقدار، کم سے کم وقت۔ دو سوزش والی گولیاں نہ ملائیں۔ کالا پاخانہ، خون کی الٹی، سینے کا درد، سوجن، یا بہت کم پیشاب پر مدد لیں۔",
    overdoseEn:
      "Early signs can be stomach pain, vomiting, drowsiness, or ringing in the ears. Kidney trouble and breathing depression can follow, especially with other medicines. This card states no toxic quantity. Contact emergency services or a poison centre and bring the pack.",
    overdoseUr:
      "شروع کی علامات پیٹ درد، الٹی، نیند، یا کان میں آواز ہو سکتی ہیں۔ گردے کی تکلیف اور سانس دبنا بعد میں آ سکتا ہے، خاص طور پر دوسری دواؤں کے ساتھ۔ اس کارڈ پر زہریلی مقدار نہیں۔ ایمرجنسی یا زہر مرکز سے رابطہ کریں اور پیک ساتھ لے جائیں۔",
  },
  aspirin: {
    mechanismEn:
      "Irreversibly acetylates cyclo-oxygenase-1. Low doses reduce platelet stickiness. Higher doses add analgesia and anti-inflammatory effect. Those jobs are not interchangeable.",
    mechanismUr:
      "سائکلو آکسیجینیز-1 کو مستقل طور پر ایسٹائل کرتی ہے۔ کم خوراک پلیٹلیٹ کی چپکاہٹ گھٹاتی ہے۔ زیادہ خوراک درد اور سوزش بھی گھٹاتی ہے۔ یہ کام ایک دوسرے کی جگہ نہیں لیتے۔",
    adminEn:
      "Swallow low-dose enteric-coated tablets whole. Soluble 300 mg tablets are dissolved as the pack says. Do not start a daily low dose from this card.",
    adminUr:
      "کم خوراک کی آنت میں گھلنے والی گولی پوری نگلیں۔ 300 ملی گرام گھلنے والی گولی پیک کے مطابق حل کریں۔ اس کارڈ سے روزانہ کم خوراک شروع نہ کریں۔",
    boxedEn:
      "A universal boxed warning is not transcribed here. Labels prominently warn against use in children and teenagers with a viral illness because of Reye's syndrome. Confirm any boxed or bold warning on the pack.",
    boxedUr:
      "یہاں کوئی عالمی باکسڈ وارننگ نقل نہیں۔ لیبل بچوں اور نوعمروں میں وائرل بیماری کے ساتھ رے سنڈروم کی وجہ سے نمایاں انتباہ دیتے ہیں۔ پیک کی باکسڈ یا موٹی وارننگ خود دیکھیں۔",
    monitorEn: "If used as an antiplatelet, the prescribing clinician sets any review. Unexpected bruising or bleeding needs a same-day check, not an extra tablet.",
    monitorUr: "اگر خون کے لوتھڑے روکنے کے لیے ہو تو جائزہ لکھنے والا کلینیشن طے کرتا ہے۔ اچانک نیل یا خون اسی دن کی جانچ مانگتا ہے، اضافی گولی نہیں۔",
    counselEn: "Do not give aspirin to a child or teenager for a viral illness. Do not use a 300 mg tablet as ordinary pain relief if a blood thinner or an ulcer is already present.",
    counselUr: "وائرل بیماری میں بچے یا نوعمر کو اسپرین نہ دیں۔ اگر خون پتلا کرنے والی دوا یا السر پہلے سے ہو تو 300 ملی گرام کو عام درد کی گولی نہ بنائیں۔",
    overdoseEn:
      "Ringing in the ears, fast breathing, confusion, or vomiting can appear. Do not state or guess a lethal amount. Contact emergency services or a poison centre now and bring the pack.",
    overdoseUr:
      "کان میں آواز، تیز سانس، الجھن، یا الٹی آ سکتی ہے۔ جان لیوا مقدار نہ بتائیں نہ اندازہ کریں۔ ابھی ایمرجنسی یا زہر مرکز سے رابطہ کریں اور پیک ساتھ لے جائیں۔",
  },
  amoxicillin: {
    mechanismEn:
      "Beta-lactam antibiotic. It blocks bacterial cell-wall synthesis. Organisms that make enough beta-lactamase are not covered unless a clinician has chosen a protected combination.",
    mechanismUr:
      "بیٹا لیکٹم اینٹی بائیوٹک۔ بیکٹیریا کی دیوار کی تعمیر روکتی ہے۔ جو جراثیم کافی بیٹا لیکٹامیز بنائیں وہ نہیں ڈھکتے جب تک کلینیشن نے محفوظ جوڑا نہ چنا ہو۔",
    adminEn:
      "Capsules can be taken with or without food. Shake a suspension and use the measure supplied. Finish the prescribed days unless a clinician stops it. Discard leftover suspension.",
    adminUr:
      "کیپسول کھانے کے ساتھ یا بغیر۔ سسپنشن ہلائیں اور دی ہوئی پیمانہ استعمال کریں۔ لکھے دن پورے کریں جب تک کلینیشن نہ روکے۔ بچا سسپنشن پھینک دیں۔",
    boxedEn: "No boxed warning is stored on this card. Allergy to penicillins is a contraindication. Confirm the current label.",
    boxedUr: "اس کارڈ پر باکسڈ وارننگ محفوظ نہیں۔ پینسلن سے الرجی مانع ہے۔ موجودہ لیبل کی تصدیق کریں۔",
    monitorEn: "No routine blood test for a short uncomplicated course. Watch for rash, throat swelling, or watery diarrhoea during and shortly after the course.",
    monitorUr: "مختصر سادہ کورس پر معمول کا خون کا ٹیسٹ نہیں۔ کورس کے دوران اور تھوڑی دیر بعد دانہ، گلے کی سوجن، یا پانی والا دست دیکھیں۔",
    counselEn: "It does not treat a cold or most coughs. Stop and get urgent care for throat swelling, collapse, or a blistering widespread rash.",
    counselUr: "یہ نزلہ یا زیادہ تر کھانسی کا علاج نہیں۔ گلے کی سوجن، گرنے، یا پھیلتے چھالوں والے دانے پر روک کر فوری مدد لیں۔",
    overdoseEn:
      "Nausea, vomiting, and diarrhoea are the usual early picture. A very large amount still needs poison-centre advice rather than a home calculation. Bring the pack.",
    overdoseUr:
      "متلی، الٹی، اور دست عام ابتدائی تصویر ہے۔ بہت بڑی مقدار پھر بھی گھر کے حساب کی بجائے زہر مرکز مانگتی ہے۔ پیک ساتھ لے جائیں۔",
  },
  coamoxiclav: {
    mechanismEn:
      "Amoxicillin plus clavulanic acid. Clavulanate blocks some bacterial beta-lactamases so amoxicillin can still bind the cell-wall target. It does not cover every resistant organism.",
    mechanismUr:
      "اموکسیسلن اور کلاوولینک ایسڈ۔ کلاوولینیٹ کچھ بیکٹیریل بیٹا لیکٹامیز روکتا ہے تاکہ اموکسیسلن دیوار کے نشانے سے جڑ سکے۔ ہر مزاحم جراثیم کو نہیں ڈھانپتا۔",
    adminEn: "Take tablets at the start of a meal to reduce stomach upset. Strengths such as 375 mg and 625 mg are not interchangeable. Shake suspension. Finish only the days prescribed.",
    adminUr: "پیٹ کی خرابی کم کرنے کے لیے گولی کھانے کے شروع میں لیں۔ 375 اور 625 ملی گرام ایک دوسرے کی جگہ نہیں۔ سسپنشن ہلائیں۔ صرف لکھے دن پورے کریں۔",
    boxedEn:
      "No boxed warning is stored here. Past jaundice or liver injury with this combination is a reason not to take it again. Penicillin allergy remains a contraindication. Confirm the label.",
    boxedUr:
      "یہاں باکسڈ وارننگ محفوظ نہیں۔ اس جوڑے سے پہلے یرقان یا جگر کا نقصان دوبارہ نہ لینے کی وجہ ہے۔ پینسلن الرجی پھر بھی مانع ہے۔ لیبل کی تصدیق کریں۔",
    monitorEn: "Watch stool frequency and any yellowing of the eyes. If the person also takes warfarin, the clinic may need an extra INR. This card does not schedule that test.",
    monitorUr: "پاخانے کی بار بارگی اور آنکھوں کا پیلا ہونا دیکھیں۔ اگر وارفرین بھی ہو تو کلینک کو اضافی آئی این آر چاہیے ہو سکتا ہے۔ یہ کارڈ وہ ٹیسٹ طے نہیں کرتا۔",
    counselEn: "Diarrhoea is common. Watery diarrhoea, a widespread rash, or jaundice means stop and be seen. Do not save tablets for a later fever.",
    counselUr: "دست عام ہے۔ پانی والا دست، پھیلتا دانہ، یا یرقان روکنے اور دکھانے کا مطلب ہے۔ بعد کے بخار کے لیے گولیاں نہ بچائیں۔",
    overdoseEn:
      "Stomach upset and diarrhoea are the early picture. Liver symptoms can be delayed. Contact a poison centre or emergency services and bring the pack. No toxic quantity is stated here.",
    overdoseUr:
      "پیٹ کی خرابی اور دست ابتدائی تصویر ہیں۔ جگر کی علامات دیر سے آ سکتی ہیں۔ زہر مرکز یا ایمرجنسی سے رابطہ کریں اور پیک ساتھ لے جائیں۔ یہاں زہریلی مقدار نہیں۔",
  },
  warfarin: {
    mechanismEn: "Vitamin K antagonist. It reduces the liver's production of clotting factors II, VII, IX, and X, and of proteins C and S. The effect is measured by INR, not by symptoms.",
    mechanismUr: "وٹامن کے مخالف۔ جگر میں جمنے والے عوامل 2، 7، 9، 10، اور پروٹین سی اور ایس کی پیداوار گھٹاتی ہے۔ اثر علامات سے نہیں، آئی این آر سے ناپا جاتا ہے۔",
    adminEn:
      "Take the day's prescribed dose at the same time. Tablet colours and milligrams are not interchangeable. Do not double a missed dose. Do not start, stop, or change the dose from this card.",
    adminUr:
      "دن کی لکھی خوراک ایک ہی وقت پر۔ رنگ اور ملی گرام ایک دوسرے کی جگہ نہیں۔ چھوٹی خوراک دوگنی نہ کریں۔ اس کارڈ سے خوراک شروع، بند، یا تبدیل نہ کریں۔",
    boxedEn: "Warfarin labels carry a boxed warning for major or fatal bleeding. Confirm the wording on the current product label before clinical use.",
    boxedUr: "وارفرین کے لیبل پر بڑا یا جان لیوا خون کی باکسڈ وارننگ ہوتی ہے۔ کلینیکل استعمال سے پہلے موجودہ لیبل کے الفاظ کی تصدیق کریں۔",
    monitorEn: "INR at the interval the anticoagulant clinic sets, plus haemoglobin if bleeding is suspected. Any new medicine is a reason to ask before the next tablet, not after a week of guessing.",
    monitorUr: "آئی این آر اس وقفے پر جو اینٹی کواگولنٹ کلینک طے کرے، اور خون کا شبہ ہو تو ہیموگلوبن۔ ہر نئی دوا اگلی گولی سے پہلے پوچھنے کی وجہ ہے، ایک ہفتہ اندازے کے بعد نہیں۔",
    counselEn:
      "Report black stool, vomiting blood, blood in urine, a sudden severe headache, or a head injury even if the person feels well. Keep vitamin K intake steady. Show every new box, including pain tablets and herbal tins.",
    counselUr:
      "کالا پاخانہ، خون کی الٹی، پیشاب میں خون، اچانک شدید سر درد، یا سر کی چوٹ بتائیں چاہے طبیعت ٹھیک لگے۔ وٹامن کے کی مقدار ایک جیسی رکھیں۔ ہر نیا ڈبہ دکھائیں، درد کی گولی اور جڑی بوٹی سمیت۔",
    overdoseEn:
      "Bleeding may be the first sign, or there may be none. Do not give vitamin K, plasma, or an extra dose from this card. Contact emergency services or the anticoagulant service now and bring the pack and the INR record.",
    overdoseUr:
      "خون پہلی علامت ہو سکتا ہے، یا کوئی علامت نہ ہو۔ اس کارڈ سے وٹامن کے، پلازما، یا اضافی خوراک نہ دیں۔ ابھی ایمرجنسی یا اینٹی کواگولنٹ سروس سے رابطہ کریں اور پیک اور آئی این آر ریکارڈ ساتھ لے جائیں۔",
  },
  metformin: {
    mechanismEn: "It lowers liver glucose production and improves insulin sensitivity. It does not push the pancreas to release insulin, so low blood sugar is uncommon when it is used alone.",
    mechanismUr: "جگر کی گلوکوز پیداوار گھٹاتی ہے اور انسولین کی حساسیت بہتر کرتی ہے۔ لبلبے سے انسولین نہیں نچوڑتی، اس لیے اکیلے استعمال پر شوگر بہت گرنا کم عام ہے۔",
    adminEn: "Take with meals to limit diarrhoea and nausea. Swallow extended-release tablets whole. Stop for the day of iodinated contrast only if the prescriber has given that instruction.",
    adminUr: "دست اور متلی کم کرنے کے لیے کھانے کے ساتھ لیں۔ دیر سے چھوڑنے والی گولی پوری نگلیں۔ آئیوڈین والے کنٹراسٹ والے دن صرف تب روکیں جب لکھنے والے نے یہی کہا ہو۔",
    boxedEn:
      "Labels carry a boxed warning for lactic acidosis, a rare but serious build-up of lactate, more likely with severe kidney disease, heavy alcohol use, or tissue hypoxia. Confirm the current wording.",
    boxedUr:
      "لیبل پر لیکٹک ایسڈوسس کی باکسڈ وارننگ ہے، لییکٹیٹ کا نایاب مگر سنگین جمع ہونا، شدید گردے کی بیماری، بہت شراب، یا ٹشو میں آکسیجن کی کمی سے زیادہ ممکن۔ موجودہ الفاظ کی تصدیق کریں۔",
    monitorEn: "Kidney function before and during treatment, B12 if use is long, and HbA1c as the diabetes clinician sets. This card does not choose those intervals.",
    monitorUr: "علاج سے پہلے اور دوران گردے کا کام، لمبے استعمال پر بی 12، اور شوگر کا کلینیشن جتنا ایچ بی اے ون سی طے کرے۔ یہ کارڈ وہ وقفے نہیں چنتا۔",
    counselEn: "Hold and call if there is vomiting, dehydration, or a procedure with contrast, rather than pushing the next tablet. Diarrhoea often settles; ongoing severe diarrhoea needs a review.",
    counselUr: "الٹی، پانی کی کمی، یا کنٹراسٹ والے طریقے پر اگلی گولی بڑھانے کی بجائے روک کر کال کریں۔ دست اکثر ٹھہر جاتا ہے؛ جاری شدید دست جائزہ مانگتا ہے۔",
    overdoseEn:
      "Nausea, vomiting, abdominal pain, and fast breathing can occur. Lactic acidosis is an emergency. Contact emergency services or a poison centre. Do not estimate a safe leftover amount.",
    overdoseUr:
      "متلی، الٹی، پیٹ درد، اور تیز سانس ہو سکتی ہے۔ لیکٹک ایسڈوسس ایمرجنسی ہے۔ ایمرجنسی یا زہر مرکز سے رابطہ کریں۔ بچتی محفوظ مقدار کا اندازہ نہ لگائیں۔",
  },
  diazepam: {
    mechanismEn: "It enhances GABA-A receptor activity, which slows central nervous system firing. That is why it sedates, relaxes muscle, and can depress breathing when combined with other depressants.",
    mechanismUr: "جی اے بی اے-اے ریسیپٹر کی سرگرمی بڑھاتی ہے، جس سے مرکزی اعصاب کی فائرنگ سست ہوتی ہے۔ اسی لیے نیند، پٹھے میں ڈھیلاؤ، اور دوسری دبانے والی دواؤں کے ساتھ سانس دب سکتی ہے۔",
    adminEn:
      "Only the prescribed amount, for the prescribed nights. Do not crush and snort or inject a tablet. Do not drink alcohol. A taper, not a sudden stop, is a clinician's plan after regular use.",
    adminUr:
      "صرف لکھی مقدار، لکھی راتوں کے لیے۔ گولی کچل کر سونگھیں یا انجیکٹ نہ کریں۔ شراب نہ پئیں۔ باقاعدہ استعمال کے بعد اچانک بند نہیں، کلینیشن کا آہستہ منصوبہ۔",
    boxedEn:
      "Benzodiazepines taken with opioids carry a boxed warning for profound sedation, respiratory depression, coma, and death. Confirm the current label. This card will not help obtain a controlled medicine.",
    boxedUr:
      "اوپیائیڈ کے ساتھ بینزودائیزپین پر گہری نیند، سانس دبنا، کوما، اور موت کی باکسڈ وارننگ ہے۔ موجودہ لیبل کی تصدیق کریں۔ یہ کارڈ کنٹرول دوا حاصل کرنے میں مدد نہیں کرے گا۔",
    monitorEn: "Watch alertness, breathing, and falls, especially in older adults. Mood and misuse also need review. No blood level is used in ordinary care.",
    monitorUr: "چوکسی، سانس، اور گرنا دیکھیں، خاص طور پر بوڑھوں میں۔ مزاج اور غلط استعمال بھی جائزہ مانگتے ہیں۔ عام دیکھ بھال میں خون کا لیول استعمال نہیں ہوتا۔",
    counselEn: "Do not drive, do not share the tablet, and do not add alcohol or opioid pain tablets. Stopping suddenly after regular use can cause tremor and seizures.",
    counselUr: "گاڑی نہ چلائیں، گولی نہ بانٹیں، اور شراب یا اوپیائیڈ درد کی گولی نہ جوڑیں۔ باقاعدہ استعمال کے بعد اچانک روکنا کپکپاہٹ اور دورے لا سکتا ہے۔",
    overdoseEn:
      "Deep sleep, slow or stopped breathing, and unresponsiveness are emergencies, especially with alcohol or opioids. Call emergency services now. Do not give a home dose of any reversal drug from this card.",
    overdoseUr:
      "گہری نیند، سست یا رکی سانس، اور جواب نہ دینا ایمرجنسی ہے، خاص طور پر شراب یا اوپیائیڈ کے ساتھ۔ ابھی ایمرجنسی بلائیں۔ اس کارڈ سے گھر پر کوئی الٹنے والی دوا نہ دیں۔",
  },
};

type Flags = {
  child: boolean;
  age: boolean;
  weight: boolean;
  renal: boolean;
  hepatic: boolean;
  pregnant: boolean;
  geriatric: boolean;
};

function flagsFor(query: string): Flags {
  return {
    child: /(child|baby|infant|neonate|toddler|paediatric|pediatric|بچہ|بچے|شیرخوار|نو مولود)/i.test(query),
    age: /\b\d+\s*(years?|yrs?|months?|mos?|weeks?|days?|سال|مہینہ|مہینے|ہفت)/i.test(query),
    weight: /\b\d+(\.\d+)?\s*(kg|kilograms?|kgs?|lb|lbs|pounds?|کلو)/i.test(query),
    renal: /(renal|kidney|e\s?gfr|\bgfr\b|creatinine|dialysis|گرد)/i.test(query),
    hepatic: /(hepatic|liver|cirrhosis|child-pugh|جگر|یرقان)/i.test(query),
    pregnant: /(pregnan|breastfeed|breast-?feed|lactation|حمل|دودھ پلا)/i.test(query),
    geriatric: /(geriatric|elderly|older adult|بوڑھ|عمر رسیدہ)/i.test(query),
  };
}

function wantsHarm(query: string): boolean {
  return /(kill myself|killing myself|end my life|want to die|suicide|suicidal|self-?harm|lethal dose|\bld50\b|how (many|much).{0,48}(die|kill|overdose)|how to overdose|khudkushi|خودکشی|مرنا چاہ|جان دینے)/i.test(
    query,
  );
}

function wantsEmergency(query: string): boolean {
  return /(took (too many|all|the whole)|swallowed (all|the|a bottle)|child (ate|swallowed)|(?:i|he|she|they|someone|patient).{0,24}overdos|has overdosed|been poisoned|\bpoisoned\b|\bpoisoning\b|unresponsive after|زیادہ گولیاں کھا|بچے نے نگل|زہر کھا)/i.test(
    query,
  );
}

const HARM_EN = `If you or someone with you may be unsafe, contact emergency services now. In the UAE call 998 or 999. In Pakistan call 1122 or 115. To talk to someone: UAE 800-HOPE (800 4673), or Dubai Itma'en 800 506. In the United States call or text 988.

I will not give a dose, a quantity, or any information about how much of a medicine could cause harm. If you are safe and need ordinary drug information later, ask again without that request.`;

const HARM_UR = `اگر آپ یا ساتھ والا غیر محفوظ ہو تو ابھی ایمرجنسی سے رابطہ کریں۔ متحدہ عرب امارات میں 998 یا 999۔ پاکستان میں 1122 یا 115۔ بات کرنے کے لیے: متحدہ عرب امارات 800-HOPE (800 4673)، یا دبئی اطمئن 800 506۔ ریاست ہائے متحدہ میں 988 کال یا میسج کریں۔

میں خوراک، مقدار، یا یہ نہیں بتاؤں گا کہ دوا کتنی نقصان کر سکتی ہے۔ اگر آپ محفوظ ہیں اور بعد میں عام دوائی معلومات چاہیے تو وہ درخواست ہٹا کر دوبارہ پوچھیں۔`;

const EMERGENCY_EN = `This sounds like a possible overdose or poisoning. Contact emergency services now (UAE 998 or 999, Pakistan 1122 or 115) or a poison centre. Bring every pack and say what was taken and when, if you know.

Do not wait for symptoms, and do not take another dose to “balance” it. This card will not say how much is dangerous.`;

const EMERGENCY_UR = `یہ ممکنہ زیادہ مقدار یا زہر لگتا ہے۔ ابھی ایمرجنسی سے رابطہ کریں (متحدہ عرب امارات 998 یا 999، پاکستان 1122 یا 115) یا زہر مرکز سے۔ ہر پیک ساتھ لے جائیں اور اگر پتا ہو تو بتائیں کیا اور کب لیا۔

علامات کا انتظار نہ کریں، اور “برابر” کرنے کے لیے اگلی خوراک نہ لیں۔ یہ کارڈ نہیں بتائے گا کتنی مقدار خطرناک ہے۔`;

function choice(row: Monograph): DrugChoice {
  const brands = row.brands
    .slice(0, 3)
    .map((brand) => brand.brand)
    .join(", ");
  return {
    id: row.id,
    labelEn: `${row.inn} — ${row.group}${brands ? ` (${brands})` : ""}`,
    labelUr: `${row.inn} — ${row.groupUr}${brands ? ` (${brands})` : ""}`,
  };
}

function folded(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

function names(row: Monograph): string[] {
  return [row.inn, row.id, ...row.aliases, ...row.brands.map((brand) => brand.brand)];
}

function pickRows(part: string): { rows: Monograph[]; ambiguous: Monograph[] } {
  const hits = searchMedicines(part, 6);
  if (hits.length === 0) return { rows: [], ambiguous: [] };
  const q = folded(part);
  const strong = hits.filter((row) =>
    names(row).some((name) => {
      const foldedName = folded(name);
      return foldedName === q || foldedName.startsWith(q) || (q.length >= 5 && q.startsWith(foldedName));
    }),
  );
  if (strong.length === 1) return { rows: strong, ambiguous: [] };
  if (strong.length > 1) return { rows: [], ambiguous: strong.slice(0, 5) };
  if (hits.length === 1) return { rows: hits, ambiguous: [] };
  return { rows: [], ambiguous: hits.slice(0, 5) };
}

function section(id: SectionId, bodyEn: string, bodyUr: string): DrugSection {
  const title = SECTION_TITLES.find((row) => row[0] === id);
  return {
    id,
    titleEn: title?.[1] ?? id,
    titleUr: title?.[2] ?? id,
    bodyEn,
    bodyUr,
  };
}

function briefFor(row: Monograph, flags: Flags, hideDoses: boolean): DrugBrief {
  const extra = EXTRAS[row.id];
  const brands = row.brands.map((brand) => `${brand.brand} (${brand.maker}, ${brand.strength}, ${brand.market})`).join("; ");
  const doseHold = hideDoses
    ? "A child's dose was asked without both age and weight. No dose is shown. Send the age and the weight in kilograms, then use the current label's age or weight table. This library still will not calculate a mg/kg dose."
    : `${row.adultEn} Adult range only, as already stored on this card. It is not a calculated dose. The current label is the final dose.

Older adults: no separate figure is stored. Check the label for a lower start, kidney function, bleeding, and falls. ${flags.geriatric ? "Older age was mentioned, so that label check matters before any dose is chosen." : ""}

Children: ${row.childEn} ${
        flags.child && flags.age && flags.weight
          ? "Age and weight were noted. They are not turned into a dose here."
          : "If this is for a child, ask for age and weight before any paediatric dose. Do not give one from the adult range."
      }

Kidney: no renal dose is calculated. ${flags.renal ? "Kidney impairment was mentioned. eGFR or creatinine clearance would change the answer. Do not estimate it here." : "If kidney function is reduced, use the label adjustment."}
Liver: no hepatic dose is calculated. ${flags.hepatic ? "Liver impairment was mentioned. The label, not this card, decides whether the medicine is avoided or reduced." : "If liver function is reduced, use the label adjustment."}`;

  const doseHoldUr = hideDoses
    ? "بچے کی خوراک پوچھی گئی مگر عمر اور وزن دونوں نہیں۔ کوئی خوراک نہیں دکھائی۔ عمر اور کلو میں وزن بھیجیں، پھر موجودہ لیبل کی عمر یا وزن کی جدول استعمال کریں۔ یہ لائبریری پھر بھی ملی گرام فی کلو حساب نہیں کرے گی۔"
    : `${row.adultUr} صرف بالغ حد، جیسی اس کارڈ پر پہلے سے ہے۔ یہ حساب شدہ خوراک نہیں۔ آخری خوراک موجودہ لیبل ہے۔

بوڑھے: الگ نمبر محفوظ نہیں۔ کم آغاز، گردے، خون، اور گرنے کے لیے لیبل دیکھیں۔ ${flags.geriatric ? "بڑی عمر کا ذکر ہوا، اس لیے خوراک سے پہلے وہ جانچ ضروری ہے۔" : ""}

بچے: ${row.childUr} ${
        flags.child && flags.age && flags.weight
          ? "عمر اور وزن نوٹ ہو گئے۔ انہیں یہاں خوراک نہیں بنایا جاتا۔"
          : "اگر بچے کے لیے ہے تو بچوں کی خوراک سے پہلے عمر اور وزن پوچھیں۔ بالغ حد سے نہ دیں۔"
      }

گردہ: گردے کی خوراک حساب نہیں۔ ${flags.renal ? "گردے کی کمزوری کا ذکر ہوا۔ ای جی ایف آر یا کریٹینن کلیئرنس جواب بدل دے گی۔ یہاں اندازہ نہ کریں۔" : "گردہ کمزور ہو تو لیبل کی ترمیم استعمال کریں۔"}
جگر: جگر کی خوراک حساب نہیں۔ ${flags.hepatic ? "جگر کی کمزوری کا ذکر ہوا۔ پرہیز یا کمی لیبل طے کرے، یہ کارڈ نہیں۔" : "جگر کمزور ہو تو لیبل کی ترمیم استعمال کریں۔"}`;

  const sections: DrugSection[] = [
    section(
      "names",
      `Generic name: ${row.inn}. Drug class: ${row.group}. ATC ${row.atc}. Examples on this card: ${brands || "none stored"}. Formulation noted here: ${row.form}. Regional names differ; match the active ingredient on the pack.`,
      `جنرک نام: ${row.inn}۔ کلاس: ${row.groupUr}۔ اے ٹی سی ${row.atc}۔ اس کارڈ کی مثالیں: ${brands || "کوئی محفوظ نہیں"}۔ یہاں لکھی شکل: ${row.form}۔ علاقائی نام بدلتے ہیں؛ پیک پر فعال جز ملا کر دیکھیں۔`,
    ),
    section(
      "uses",
      `Approved or usual uses on this card: ${row.usedEn} Off-label: none are listed. Do not treat an unlisted use as approved.`,
      `اس کارڈ پر منظور یا عام استعمال: ${row.usedUr} آف لیبل: کوئی نہیں۔ جو استعمال نہیں لکھا اسے منظور نہ سمجھیں۔`,
    ),
    section(
      "mechanism",
      extra?.mechanismEn ?? `${GAP_EN} Class on this card: ${row.group}.`,
      extra?.mechanismUr ?? `${GAP_UR} اس کارڈ کی کلاس: ${row.groupUr}۔`,
    ),
    section("dosing", doseHold, doseHoldUr),
    section(
      "administration",
      extra?.adminEn ?? `${GAP_EN} Form on this card: ${row.form}. Do not crush a modified-release, enteric-coated, or retard product unless that pack says it is safe.`,
      extra?.adminUr ?? `${GAP_UR} اس کارڈ کی شکل: ${row.form}۔ دیر سے چھوڑنے والی، آنت میں گھلنے والی، یا ریٹارڈ گولی نہ کچلیں جب تک وہ پیک محفوظ نہ کہے۔`,
    ),
    section(
      "contraindications",
      `${row.avoidEn} ${extra?.boxedEn ?? "Boxed warning: not transcribed on this card. Confirm the current label before you treat silence as reassurance."}`,
      `${row.avoidUr} ${extra?.boxedUr ?? "باکسڈ وارننگ: اس کارڈ پر نقل نہیں۔ خاموشی کو تسلی نہ سمجھیں؛ موجودہ لیبل دیکھیں۔"}`,
    ),
    section(
      "interactions",
      `${row.mixEn} Expected effect: the other medicine can change the level, the bleeding risk, or the sedation, as that sentence describes. This is not a complete interaction search.`,
      `${row.mixUr} متوقع اثر: دوسری دوا سطح، خون کا خطرہ، یا نیند بدل سکتی ہے، جیسا اس جملے میں ہے۔ یہ مکمل تعامل کی تلاش نہیں۔`,
    ),
    section(
      "adverse",
      `Common and serious effects stored here: ${row.effectsEn} Urgent care is for the serious features in that sentence, not for a mild expected effect alone.`,
      `یہاں محفوظ عام اور سنگین اثرات: ${row.effectsUr} فوری دیکھ بھال اس جملے کی سنگین باتوں کے لیے ہے، صرف ہلکے متوقع اثر کے لیے نہیں۔`,
    ),
    section(
      "monitoring",
      extra?.monitorEn ?? `${GAP_EN} Do not invent a lab schedule.`,
      extra?.monitorUr ?? `${GAP_UR} لیب کا شیڈول خود نہ بنائیں۔`,
    ),
    section(
      "pregnancy",
      `${row.pregEn} Breastfeeding and other special populations: if they are not in that sentence, safety is not established on this card. ${flags.pregnant ? "Pregnancy or breastfeeding was mentioned. Trimester and indication change the answer. This is not a decision to start or stop." : "Ask for the trimester or breastfeeding status when it would change the choice."}`,
      `${row.pregUr} دودھ پلانا اور دوسری خاص آبادیاں: اگر اس جملے میں نہیں تو اس کارڈ پر حفاظت قائم نہیں۔ ${flags.pregnant ? "حمل یا دودھ کا ذکر ہوا۔ سہ ماہی اور وجہ جواب بدلتی ہے۔ یہ شروع یا بند کرنے کا فیصلہ نہیں۔" : "جہاں انتخاب بدلے وہاں سہ ماہی یا دودھ کی حالت پوچھیں۔"}`,
    ),
    section("storage", `${row.storeEn} Keep in the original pack, away from children.`, `${row.storeUr} اصل پیک میں، بچوں سے دور رکھیں۔`),
    section(
      "counseling",
      extra?.counselEn ??
        `Explain why it was chosen, how to take the form on the pack, and which effects mean stop and seek care. Do not tell the patient to start, stop, or change a prescription from this card.`,
      extra?.counselUr ??
        `بتائیں کیوں چنی گئی، پیک کی شکل کیسے لینی ہے، اور کون سے اثرات روکنے اور مدد لینے کا مطلب ہیں۔ اس کارڈ سے مریض کو نسخہ شروع، بند، یا تبدیل کرنے کو نہ کہیں۔`,
    ),
    section(
      "overdose",
      extra?.overdoseEn ??
        `Early features are not fully stored. ${row.effectsEn} For a suspected overdose, contact emergency services or a poison centre now and bring the pack. Do not wait for symptoms. No toxic quantity is stated here.`,
      extra?.overdoseUr ??
        `ابتدائی علامات پوری محفوظ نہیں۔ ${row.effectsUr} مشتبہ زیادہ مقدار پر ابھی ایمرجنسی یا زہر مرکز سے رابطہ کریں اور پیک ساتھ لے جائیں۔ علامات کا انتظار نہ کریں۔ یہاں زہریلی مقدار نہیں۔`,
    ),
  ];

  return { id: row.id, inn: row.inn, sections };
}

export function answerDrugInfo(query: string, selectedId?: string): DrugInfoResult {
  const text = query.trim();
  if (wantsHarm(text)) return { kind: "harm", en: HARM_EN, ur: HARM_UR };
  if (wantsEmergency(text) && !selectedId) return { kind: "emergency", en: EMERGENCY_EN, ur: EMERGENCY_UR };
  if (text.length < 2 && !selectedId) {
    return {
      kind: "empty",
      en: "Name a generic or a brand. Each medicine gets its own section. If the name could be two products, you will be asked which one.",
      ur: "جنرک یا برانڈ لکھیں۔ ہر دوا کا اپنا حصہ ہوگا۔ اگر نام دو مصنوعات کا ہو سکتا ہو تو پوچھا جائے گا کون سی۔",
    };
  }

  const flags = flagsFor(text);
  const hideDoses = flags.child && /(dose|dosing|how much|how many|milligram|\bmg\b|\bml\b|خوراک|کتنا|کتنی)/i.test(text) && !(flags.age && flags.weight);

  if (selectedId) {
    const row = medicineById(selectedId);
    if (!row) {
      return {
        kind: "empty",
        en: "That product is not in this local library. Check the spelling and the active ingredient on the pack.",
        ur: "یہ مصنوعہ اس مقامی لائبریری میں نہیں۔ ہجے اور پیک پر فعال جز دیکھیں۔",
      };
    }
    return {
      kind: "briefs",
      introEn: ROLE_EN,
      introUr: ROLE_UR,
      briefs: [briefFor(row, flags, hideDoses)],
      gaps: [],
    };
  }

  const parts = formulaParts(text);
  const briefs: DrugBrief[] = [];
  const options: DrugChoice[] = [];
  const gaps: string[] = [];
  const seen = new Set<string>();

  for (const part of parts) {
    const picked = pickRows(part);
    if (picked.ambiguous.length > 0) {
      for (const row of picked.ambiguous) {
        if (!seen.has(row.id)) {
          seen.add(row.id);
          options.push(choice(row));
        }
      }
      continue;
    }
    if (picked.rows.length === 0) {
      if (part.trim().length >= 3) gaps.push(part.trim());
      continue;
    }
    for (const row of picked.rows) {
      if (seen.has(row.id)) continue;
      seen.add(row.id);
      briefs.push(briefFor(row, flags, hideDoses));
    }
  }

  if (options.length > 0) {
    return {
      kind: "ask",
      en: "That name could be more than one product. Which one do you mean? Details wait until you choose.",
      ur: "یہ نام ایک سے زیادہ مصنوعات کا ہو سکتا ہے۔ کون سی مراد ہے؟ تفصیل انتخاب کے بعد۔",
      options,
    };
  }

  if (briefs.length === 0) {
    return {
      kind: "empty",
      en: `No confident match for “${text}”. This library will not invent a monograph. Check the spelling, or give the active ingredient and the strength on the pack.`,
      ur: `“${text}” کا پکا مماثل نہیں۔ یہ لائبریری مونوگراف ایجاد نہیں کرے گی۔ ہجے دیکھیں، یا پیک کا فعال جز اور طاقت لکھیں۔`,
    };
  }

  const introEn =
    briefs.length > 1
      ? `${ROLE_EN} Each named medicine has its own section below. Do not add the doses together.`
      : ROLE_EN;

  return { kind: "briefs", introEn, introUr: ROLE_UR, briefs, gaps };
}

export function briefToText(result: DrugInfoResult, lang: "en" | "ur"): string {
  if (result.kind === "harm" || result.kind === "emergency" || result.kind === "empty") {
    return `${lang === "ur" ? result.ur : result.en}\n\n${VERIFY_LINE}`;
  }
  if (result.kind === "ask") {
    const lines = result.options.map((option) => (lang === "ur" ? option.labelUr : option.labelEn));
    return `${lang === "ur" ? result.ur : result.en}\n\n${lines.join("\n")}\n\n${VERIFY_LINE}`;
  }
  const blocks = result.briefs.map((brief) => {
    const body = brief.sections
      .map((item, index) => {
        const title = lang === "ur" ? item.titleUr : item.titleEn;
        const text = lang === "ur" ? item.bodyUr : item.bodyEn;
        return `${index + 1}. ${title}\n${text}`;
      })
      .join("\n\n");
    return `${brief.inn}\n\n${body}`;
  });
  const gap =
    result.gaps.length > 0
      ? lang === "ur"
        ? `\n\nیہ نام نہیں ملے، اس لیے ان کا مونوگراف نہیں بنا: ${result.gaps.join(", ")}۔`
        : `\n\nThese names were not matched, so no monograph was invented for them: ${result.gaps.join(", ")}.`
      : "";
  return `${lang === "ur" ? result.introUr : result.introEn}\n\n${blocks.join("\n\n---\n\n")}${gap}\n\n${VERIFY_LINE}`;
}
