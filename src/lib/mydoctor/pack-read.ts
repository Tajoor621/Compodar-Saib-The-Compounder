import type { Monograph } from "./pharmacy.ts";

type Family = {
  re: RegExp;
  min: number;
  atc: string;
  group: string;
  groupUr: string;
  usedEn: string;
  usedUr: string;
  avoidEn: string;
  avoidUr: string;
  adultEn: string;
  adultUr: string;
};

const FAMILIES: Family[] = [
  ...complexStems(),
  {
    re: /gliflozin$/,
    min: 8,
    atc: "A10BK",
    group: "SGLT2 diabetes family",
    groupUr: "شوگر کی ایس جی ایل ٹی 2 فیملی",
    usedEn: "A name ending in gliflozin is usually an SGLT2 tablet for type 2 diabetes, sometimes also for heart or kidney plans. It is not started from a shop glucose reading.",
    usedUr: "گلیفوزین پر ختم ہونے والا نام عام طور پر ٹائپ 2 شوگر کی ایس جی ایل ٹی 2 گولی ہے، کبھی دل یا گردے کے منصوبے کے لیے بھی۔ دکان کی شوگر ریڈنگ سے شروع نہیں ہوتی۔",
    avoidEn: "Pregnancy, type 1 diabetes unless a specialist is already using it, and a sick day with vomiting unless the team has paused it.",
    avoidUr: "حمل، ٹائپ 1 شوگر جب تک ماہر پہلے سے استعمال نہ کر رہا ہو، اور الٹی والا بیمار دن جب تک ٹیم نے اسے روکا نہ ہو۔",
    adultEn: "Usually once a day, at the strength printed on this box only. Genital thrush and dehydration are the common problems. Rare acid build-up with nausea and deep breathing is emergency care.",
    adultUr: "عام طور پر دن میں ایک بار، صرف اس ڈبے پر لکھی طاقت۔ جنسی تھرش اور پانی کی کمی عام مسائل ہیں۔ متلی اور گہرے سانس کے ساتھ نایاب تیزاب ایمرجنسی ہے۔",
  },
  {
    re: /gliptin$/,
    min: 8,
    atc: "A10BH",
    group: "DPP-4 diabetes family",
    groupUr: "شوگر کی ڈی پی پی 4 فیملی",
    usedEn: "A name ending in gliptin is usually a DPP-4 tablet added for type 2 diabetes. It does not treat thirst by itself and it is not insulin.",
    usedUr: "گلیپٹن پر ختم ہونے والا نام عام طور پر ٹائپ 2 شوگر کی ڈی پی پی 4 گولی ہے۔ پیاس خود نہیں ہٹاتا اور انسولین نہیں۔",
    avoidEn: "Pregnancy, a past pancreatitis, and a severe joint pain that started after the tablet.",
    avoidUr: "حمل، پرانا لبلبے کی سوزش، اور گولی کے بعد شروع ہونے والا شدید جوڑوں کا درد۔",
    adultEn: "Often once a day. Kidney disease changes some gliptins and not others. Do not copy another person's tablet. The milligrams on this box are the only ones that count.",
    adultUr: "اکثر دن میں ایک بار۔ گردے کی بیماری کچھ گلیپٹن بدلتی ہے کچھ نہیں۔ کسی اور کی گولی نقل نہ کریں۔ اس ڈبے کے ملی گرام ہی شمار ہوتے ہیں۔",
  },
  {
    re: /glutide$/,
    min: 8,
    atc: "A10BJ",
    group: "GLP-1 injection family",
    groupUr: "جی ایل پی 1 انجکشن فیملی",
    usedEn: "A name ending in glutide is usually a GLP-1 injection for type 2 diabetes or weight, on a clinician's plan. Pens are not shared and are not all the same strength.",
    usedUr: "گلوٹائیڈ پر ختم ہونے والا نام عام طور پر ٹائپ 2 شوگر یا وزن کا جی ایل پی 1 انجکشن ہے، کلینیشن کے منصوبے پر۔ پین شیئر نہیں ہوتے اور سب کی طاقت ایک نہیں۔",
    avoidEn: "Pregnancy, a personal or family history of medullary thyroid cancer, and pancreatitis. Not a beauty injection from a social-media dose.",
    avoidUr: "حمل، تھائرائیڈ کے ایک خاص کینسر کی ذاتی یا خاندانی تاریخ، اور لبلبے کی سوزن۔ سوشل میڈیا کی خوراک سے خوبصورتی کا انجکشن نہیں۔",
    adultEn: "Many are once a week, some once a day. Use only the pen named on the box, never a doubled click. Nausea is common at the start. Severe abdominal pain is a reason to stop and be seen.",
    adultUr: "بہت سے ہفتے میں ایک بار، کچھ دن میں ایک بار۔ صرف ڈبے والا پین، دوگنا کلک کبھی نہیں۔ شروع میں متلی عام ہے۔ شدید پیٹ درد روکنے اور دکھانے کی وجہ ہے۔",
  },
  {
    re: /prazole$/,
    min: 8,
    atc: "A02BC",
    group: "Acid-reducer family",
    groupUr: "تیزاب کم کرنے والی فیملی",
    usedEn: "A name ending in prazole is usually a proton-pump acid reducer. Brands in this family are not free swaps. Black stool is not a reason for a longer course.",
    usedUr: "پرازول پر ختم ہونے والا نام عام طور پر پروٹون پمپ تیزاب کم کرنے والی دوا ہے۔ اس فیملی کے برانڈ آزاد بدل نہیں۔ کالا پاخانہ لمبے کورس کی وجہ نہیں۔",
    avoidEn: "Trouble swallowing, weight loss, vomiting blood, and black stool. Those need a clinician, not another box.",
    avoidUr: "نگلنے میں دقت، وزن گرنا، خون کی الٹی، اور کالا پاخانہ۔ ان کے لیے کلینیشن چاہیے، دوسری ڈبی نہیں۔",
    adultEn: "A short adult course is often once a day before food. Do not continue month after month without a review. Do not open a capsule unless this pack says so.",
    adultUr: "بالغ کا مختصر کورس اکثر کھانے سے پہلے دن میں ایک بار۔ مہینوں جائزے کے بغیر جاری نہ رکھیں۔ کیپسول نہ کھولیں جب تک یہ پیک نہ کہے۔",
  },
  {
    re: /floxacin$/,
    min: 9,
    atc: "J01MA",
    group: "Fluoroquinolone antibiotic",
    groupUr: "فلوروکوینولون اینٹی بائیوٹک",
    usedEn: "A name ending in floxacin is a fluoroquinolone antibiotic. It is not a household tablet for a sore throat. Tendon and nerve injury are known risks.",
    usedUr: "فلوکساسین پر ختم ہونے والا نام فلوروکوینولون اینٹی بائیوٹک ہے۔ گلے کی گھریلو گولی نہیں۔ کنڈرا اور اعصاب کی چوٹ معلوم خطرات ہیں۔",
    avoidEn: "Pregnancy, children unless a specialist has no better choice, a past tendon tear, epilepsy, and myasthenia.",
    avoidUr: "حمل، بچے جب تک ماہر کے پاس بہتر راستہ نہ ہو، پرانا کنڈرا پھٹنا، مرگی، اور مائیستھینیا۔",
    adultEn: "Only for the days a clinician set. Swallow with water, not with milk at the same moment. Iron and antacids wait two hours. Tendon pain means stop the same day.",
    adultUr: "صرف وہ دن جو کلینیشن نے رکھے۔ پانی کے ساتھ نگلیں، اسی لمحے دودھ کے ساتھ نہیں۔ آئرن اور اینٹاسڈ دو گھنٹے رکیں۔ کنڈرا کا درد اسی دن روکنے کا مطلب ہے۔",
  },
  {
    re: /cycline$/,
    min: 8,
    atc: "J01AA",
    group: "Tetracycline antibiotic",
    groupUr: "ٹیٹراسائکلین اینٹی بائیوٹک",
    usedEn: "A name ending in cycline is usually a tetracycline antibiotic. Not a leftover capsule for the next fever.",
    usedUr: "سائکلین پر ختم ہونے والا نام عام طور پر ٹیٹراسائکلین اینٹی بائیوٹک ہے۔ اگلے بخار کے لیے بچا کیپسول نہیں۔",
    avoidEn: "Pregnancy, breastfeeding, and children under 12 unless a specialist chose it. Sit up with a full glass of water so it does not burn the gullet.",
    avoidUr: "حمل، دودھ پلانا، اور 12 سال سے کم جب تک ماہر نے نہ چنا ہو۔ بیٹھ کر پانی کا بھرا گلاس تاکہ غذائی نالی نہ جلے۔",
    adultEn: "Finish only the days prescribed. Separate milk, iron, and antacids. Sunburn comes more easily.",
    adultUr: "صرف لکھے دن پورے کریں۔ دودھ، آئرن، اور اینٹاسڈ الگ رکھیں۔ دھوپ جلد جلاتی ہے۔",
  },
  {
    re: /thromycin$/,
    min: 10,
    atc: "J01FA",
    group: "Macrolide antibiotic",
    groupUr: "میکرولائیڈ اینٹی بائیوٹک",
    usedEn: "A name ending in thromycin is usually a macrolide antibiotic. It clashes with many heart and cholesterol medicines. Not for a viral cold.",
    usedUr: "تھرومائسن پر ختم ہونے والا نام عام طور پر میکرولائیڈ اینٹی بائیوٹک ہے۔ دل اور کولیسٹرول کی بہت سی دواؤں سے ٹکراتی ہے۔ وائرل نزلے کے لیے نہیں۔",
    avoidEn: "A known long QT heart rhythm, severe liver disease, and a statin unless a pharmacist has checked the pair.",
    avoidUr: "معلوم لمبا کیو ٹی، جگر کی شدید بیماری، اور سٹیٹن جب تک فارماسسٹ نے جوڑا نہ دیکھا ہو۔",
    adultEn: "Take the course written on this pack, no extra days from a previous illness. A racing faint feeling is urgent.",
    adultUr: "اس پیک پر لکھے کورس کے دن، پچھلی بیماری کے اضافی دن نہیں۔ بے ہوشی جیسی تیز دھڑکن فوری ہے۔",
  },
  {
    re: /cillin$/,
    min: 7,
    atc: "J01C",
    group: "Penicillin antibiotic",
    groupUr: "پینسلن اینٹی بائیوٹک",
    usedEn: "A name ending in cillin is a penicillin antibiotic. It does nothing for a virus. A true penicillin allergy is a reason not to take it.",
    usedUr: "سلین پر ختم ہونے والا نام پینسلن اینٹی بائیوٹک ہے۔ وائرس پر کچھ نہیں کرتا۔ حقیقی پینسلن الرجی نہ لینے کی وجہ ہے۔",
    avoidEn: "A past rash with breathing trouble, collapse, or swelling after a penicillin. A mild stomach upset in the past is not the same story. Tell a pharmacist which one it was.",
    avoidUr: "پینسلن کے بعد سانس کی تکلیف، گرنا، یا سوجن والا پرانا دانہ۔ پہلے کی ہلکی پیٹ خراب وہی کہانی نہیں۔ فارماسسٹ کو بتائیں کون سی تھی۔",
    adultEn: "Finish the days on this pack unless a clinician stops it. Do not keep a leftover capsule. Throat swelling or a peeling rash means stop and urgent care.",
    adultUr: "اس پیک کے دن پورے کریں جب تک کلینیشن نہ روکے۔ بچا کیپسول نہ رکھیں۔ گلے کی سوجن یا اترتی جلد کا مطلب روکیں اور فوری دیکھ بھال۔",
  },
  {
    re: /^(cef|ceph)/,
    min: 6,
    atc: "J01D",
    group: "Cephalosporin antibiotic",
    groupUr: "سیفالوسپورن اینٹی بائیوٹک",
    usedEn: "A name starting with cef or ceph is usually a cephalosporin antibiotic. It is not a stronger penicillin to swap on your own.",
    usedUr: "سیف یا سیف سے شروع ہونے والا نام عام طور پر سیفالوسپورن اینٹی بائیوٹک ہے۔ یہ مضبوط پینسلن نہیں جسے آپ خود بدل لیں۔",
    avoidEn: "A severe cephalosporin allergy. A penicillin allergy needs questions before any dose, because some people cross-react.",
    avoidUr: "سیفالوسپورن کی شدید الرجی۔ پینسلن الرجی کسی خوراک سے پہلے سوال مانگتی ہے، کیونکہ کچھ لوگوں میں ردِعمل ملتا ہے۔",
    adultEn: "Use only this pack's strength and days. Kidney disease changes some of them. Bloody diarrhoea or a peeling rash means stop.",
    adultUr: "صرف اس پیک کی طاقت اور دن۔ گردے کی بیماری کچھ کو بدلتی ہے۔ خون والا دست یا اترتی جلد روکنے کا مطلب ہے۔",
  },
  {
    re: /sartan$/,
    min: 7,
    atc: "C09C",
    group: "Blood-pressure family (ARB)",
    groupUr: "فشار کی اے آر بی فیملی",
    usedEn: "A name ending in sartan is usually an angiotensin receptor blocker for blood pressure, kidney, or heart plans. A single shop reading does not start it.",
    usedUr: "سارٹن پر ختم ہونے والا نام عام طور پر فشار، گردے، یا دل کے لیے اینجیوٹینسن ریسیپٹر بلاکر ہے۔ دکان کی ایک ریڈنگ اسے شروع نہیں کرتی۔",
    avoidEn: "Pregnancy. These medicines injure a developing baby. Also a high potassium and narrowing of both kidney arteries.",
    avoidUr: "حمل۔ یہ دوائیں بڑھتے بچے کو نقصان پہنچاتی ہیں۔ زیادہ پوٹاشیم اور دونوں گردوں کی شریان کی تنگی بھی۔",
    adultEn: "Usually once a day. Do not add a potassium salt substitute. Lip or tongue swelling is urgent. Blood tests watch the kidney and potassium.",
    adultUr: "عام طور پر دن میں ایک بار۔ پوٹاشیم والا نمکین بدل نہ جوڑیں۔ ہونٹ یا زبان کی سوجن فوری ہے۔ خون کے ٹیسٹ گردہ اور پوٹاشیم دیکھتے ہیں۔",
  },
  {
    re: /statin$/,
    min: 7,
    atc: "C10AA",
    group: "Cholesterol family",
    groupUr: "کولیسٹرول فیملی",
    usedEn: "A name ending in statin is usually a cholesterol medicine. One home reading does not start it. It is not a substitute for food changes.",
    usedUr: "سٹیٹن پر ختم ہونے والا نام عام طور پر کولیسٹرول کی دوا ہے۔ گھر کی ایک ریڈنگ اسے شروع نہیں کرتی۔ کھانے کی تبدیلی کا بدل نہیں۔",
    avoidEn: "Pregnancy, active liver disease, and unexplained ongoing muscle pain.",
    avoidUr: "حمل، جگر کی فعال بیماری، اور بے سبب جاری پٹھوں کا درد۔",
    adultEn: "Once a day at the strength on this box. Dark urine with severe muscle pain needs same-day care. A new antibiotic can raise the level. Ask before starting one.",
    adultUr: "دن میں ایک بار، اس ڈبے کی طاقت پر۔ شدید پٹھوں کے درد کے ساتھ گہرا پیشاب اسی دن دیکھ بھال مانگتا ہے۔ نئی اینٹی بائیوٹک سطح بڑھا سکتی ہے۔ شروع کرنے سے پہلے پوچھیں۔",
  },
  {
    re: /dipine$/,
    min: 7,
    atc: "C08CA",
    group: "Blood-pressure family (calcium channel)",
    groupUr: "فشار کی کیلشیم چینل فیملی",
    usedEn: "A name ending in dipine is usually a calcium-channel blood-pressure tablet. Ankle swelling is a known effect, not a reason to add a water tablet on your own.",
    usedUr: "ڈپین پر ختم ہونے والا نام عام طور پر کیلشیم چینل فشار کی گولی ہے۔ ٹخنوں کی سوجن معلوم اثر ہے، خود پیشاب کی گولی جوڑنے کی وجہ نہیں۔",
    avoidEn: "Pregnancy, very low blood pressure, and severe aortic valve narrowing unless a heart clinician is directing it.",
    avoidUr: "حمل، بہت کم فشار، اور دل کے والو کی شدید تنگی جب تک دل کا کلینیشن ہدایت نہ دے رہا ہو۔",
    adultEn: "Usually once a day. Do not double a missed day. Lip swelling is an allergy and needs urgent care.",
    adultUr: "عام طور پر دن میں ایک بار۔ چھوٹا دن دوگنا نہ کریں۔ ہونٹ کی سوجن الرجی ہے اور فوری دیکھ بھال مانگتی ہے۔",
  },
  {
    re: /olol$/,
    min: 6,
    atc: "C07",
    group: "Beta-blocker family",
    groupUr: "بیٹا بلاکر فیملی",
    usedEn: "A name ending in olol is usually a beta blocker for heart rate, blood pressure, angina, or heart failure. It is not a tablet for exam nerves from someone else's strip.",
    usedUr: "اولول پر ختم ہونے والا نام عام طور پر نبض، فشار، اینجائنا، یا دل کی ناکامی کا بیٹا بلاکر ہے۔ کسی اور کے سٹرپ سے امتحان کی گھبراہٹ کی گولی نہیں۔",
    avoidEn: "Asthma unless a lung and heart clinician agreed, a very slow pulse, and sudden stopping. Stopping overnight can worsen angina.",
    avoidUr: "دمہ جب تک پھیپھڑے اور دل کا کلینیشن نہ مانے، بہت سست نبض، اور اچانک روکنا۔ راتوں رات روکنا اینجائنا بڑھا سکتا ہے۔",
    adultEn: "Once or twice a day, as this pack says. Do not stop it because a pulse feels slow. Be seen. Stand up slowly.",
    adultUr: "دن میں ایک یا دو بار، جیسے یہ پیک کہے۔ نبض سست لگنے پر بند نہ کریں۔ دکھائیں۔ آہستہ کھڑے ہوں۔",
  },
  {
    re: /pril$/,
    min: 6,
    atc: "C09A",
    group: "Blood-pressure family (ACE inhibitor)",
    groupUr: "فشار کی اے سی ای فیملی",
    usedEn: "A name ending in pril is usually an ACE inhibitor. A dry cough is common. Lip swelling is an emergency. Pregnancy must stop it, with a clinician the same week.",
    usedUr: "پرل پر ختم ہونے والا نام عام طور پر اے سی ای روکنے والی دوا ہے۔ خشک کھانسی عام ہے۔ ہونٹ کی سوجن ایمرجنسی ہے۔ حمل اسی ہفتے کلینیشن کے ساتھ اسے روکتا ہے۔",
    avoidEn: "Pregnancy, previous lip swelling with any ACE inhibitor, and a potassium that is already high.",
    avoidUr: "حمل، کسی اے سی ای دوا سے پہلے ہونٹ کی سوجن، اور پوٹاشیم جو پہلے سے زیادہ ہو۔",
    adultEn: "Usually once or twice a day. The first doses can drop the pressure. Do not add a potassium substitute. Kidney blood tests belong with the plan.",
    adultUr: "عام طور پر دن میں ایک یا دو بار۔ پہلی خوراکیں فشار گرا سکتی ہیں۔ پوٹاشیم کا بدل نہ جوڑیں۔ گردے کے خون کے ٹیسٹ منصوبے کے ساتھ ہیں۔",
  },
  {
    re: /tidine$/,
    min: 7,
    atc: "A02BA",
    group: "H2 acid reducer",
    groupUr: "ایچ 2 تیزاب کم کرنے والی",
    usedEn: "A name ending in tidine is usually an H2 acid reducer, a different family from the prazoles. It does not treat black stool.",
    usedUr: "ٹیڈین پر ختم ہونے والا نام عام طور پر ایچ 2 تیزاب کم کرنے والی دوا ہے، پرازول سے الگ فیملی۔ کالا پاخانہ کا علاج نہیں۔",
    avoidEn: "Black stool, vomiting blood, trouble swallowing, and weight loss.",
    avoidUr: "کالا پاخانہ، خون کی الٹی، نگلنے میں دقت، اور وزن گرنا۔",
    adultEn: "A short course at the strength on this box. Kidney disease may need a lower plan from a clinician.",
    adultUr: "اس ڈبے کی طاقت پر مختصر کورس۔ گردے کی بیماری کلینیشن سے کم منصوبہ مانگ سکتی ہے۔",
  },
  {
    re: /setron$/,
    min: 7,
    atc: "A04AA",
    group: "Nausea family",
    groupUr: "متلی کی فیملی",
    usedEn: "A name ending in setron is usually an anti-sickness medicine. It is not a mint for ordinary indigestion. Heart-rhythm risk matters with some other medicines.",
    usedUr: "سیٹرون پر ختم ہونے والا نام عام طور پر متلی کی دوا ہے۔ عام بدہضمی کی مِنٹ نہیں۔ کچھ دوسری دواؤں کے ساتھ دل کی دھڑکن کا خطرہ اہم ہے۔",
    avoidEn: "A known long QT, and a plan to combine it with several psychiatric or antibiotic medicines that prolong QT.",
    avoidUr: "معلوم لمبا کیو ٹی، اور کیو ٹی لمبا کرنے والی کئی نفسیاتی یا اینٹی بائیوٹک دواؤں کے ساتھ ملانے کا منصوبہ۔",
    adultEn: "Use the milligrams on this pack, not a repeated dose all day because the first one helped. Fainting is urgent.",
    adultUr: "اس پیک کے ملی گرام، سارا دن دہرائی نہیں اس لیے کہ پہلی نے مدد کی۔ بے ہوشی فوری ہے۔",
  },
  {
    re: /triptan$/,
    min: 8,
    atc: "N02CC",
    group: "Migraine family",
    groupUr: "آدھے سر کی فیملی",
    usedEn: "A name ending in triptan is usually a migraine tablet. It is not a pain tablet for a sudden worst-ever headache, weakness, or a headache with fever and a stiff neck. Those are emergency care.",
    usedUr: "ٹریپٹان پر ختم ہونے والا نام عام طور پر آدھے سر کی گولی ہے۔ اچانک زندگی کا شدید ترین سر درد، کمزوری، یا بخار اور اکڑی گردن کے ساتھ سر درد کی گولی نہیں۔ وہ ایمرجنسی ہے۔",
    avoidEn: "Heart disease, stroke, uncontrolled blood pressure, and combining two triptans. Not with an ergot medicine.",
    avoidUr: "دل کی بیماری، فالج، بے قابو فشار، اور دو ٹریپٹان ملانا۔ ارگوٹ دوا کے ساتھ نہیں۔",
    adultEn: "One tablet at the start of the migraine, and a repeat only if this pack allows it. Chest tightness means stop and be seen.",
    adultUr: "آدھے سر کے شروع پر ایک گولی، اور دہرائی صرف اگر یہ پیک اجازت دے۔ سینے کی جکڑن روکنے اور دکھانے کا مطلب ہے۔",
  },
  {
    re: /lukast$/,
    min: 7,
    atc: "R03DC",
    group: "Asthma add-on family",
    groupUr: "دمہ کے اضافے کی فیملی",
    usedEn: "A name ending in lukast is usually an asthma or allergy add-on. It does not stop an attack that is happening now.",
    usedUr: "لوکاسٹ پر ختم ہونے والا نام عام طور پر دمہ یا الرجی کا اضافہ ہے۔ اب ہو رہا دورہ نہیں روکتا۔",
    avoidEn: "Using it as the only treatment of sudden wheeze. Mood change or new aggression should be reported.",
    avoidUr: "اچانک گھرگراہٹ کا واحد علاج بنانا۔ مزاج کی تبدیلی یا نئی جارحیت بتائی جائے۔",
    adultEn: "Usually once in the evening for an adult pack. Keep the reliever inhaler. A child's chew is a different strength. Do not snap an adult tablet.",
    adultUr: "بالغ پیک کے لیے عام طور پر شام کو ایک بار۔ ریلور انہیلر ساتھ رکھیں۔ بچے کی چبانے والی گولی الگ طاقت ہے۔ بالغ گولی نہ توڑیں۔",
  },
  {
    re: /xaban$/,
    min: 6,
    atc: "B01AF",
    group: "Blood-thinner family",
    groupUr: "خون پتلا کرنے والی فیملی",
    usedEn: "A name ending in xaban is a direct blood thinner. Missing doses can clot. Extra doses can bleed. This card does not start or swap it.",
    usedUr: "زابین پر ختم ہونے والا نام براہ راست خون پتلا کرنے والی دوا ہے۔ چھوٹی خوراک لوتھڑا کر سکتی ہے۔ اضافی خوراک خون بہا سکتی ہے۔ یہ کارڈ اسے شروع یا بدل نہیں کرتا۔",
    avoidEn: "Active bleeding, pregnancy, and a head injury even if the person feels well afterwards. Do not stop it for a dental visit without asking.",
    avoidUr: "جاری خون، حمل، اور سر کی چوٹ چاہے بعد میں طبیعت ٹھیک لگے۔ دانت کی ملاقات کے لیے بغیر پوچھے بند نہ کریں۔",
    adultEn: "The milligrams and the once or twice daily pattern on this box are specific. Another xaban is not the same number of tablets. Black stool or a sudden severe headache is emergency care.",
    adultUr: "اس ڈبے کے ملی گرام اور دن میں ایک یا دو بار کا طریقہ مخصوص ہے۔ دوسرا زابین اتنی ہی گولیاں نہیں۔ کالا پاخانہ یا اچانک شدید سر درد ایمرجنسی ہے۔",
  },
  {
    re: /parin$/,
    min: 7,
    atc: "B01AB",
    group: "Heparin-type injection",
    groupUr: "ہیپرین قسم کا انجکشن",
    usedEn: "A name ending in parin is usually a heparin-type blood thinner given by injection. It is not a tablet to crush, and not a slimming injection.",
    usedUr: "پارین پر ختم ہونے والا نام عام طور پر انجکشن والا ہیپرین قسم کا خون پتلا کرنے والا ہے۔ کچلنے والی گولی نہیں، اور وزن گھٹانے کا انجکشن نہیں۔",
    avoidEn: "Active bleeding, a past drop in platelets with heparin, and injecting a dose that was drawn for someone else.",
    avoidUr: "جاری خون، ہیپرین سے پہلے پلیٹلیٹ گرنے کی تاریخ، اور کسی اور کے لیے کھینچی ہوئی خوراک لگانا۔",
    adultEn: "Use only the syringe strength already prescribed. Do not expel the air bubble if the leaflet says to leave it. Bruising at the site is common. Black stool or a collapse is emergency care.",
    adultUr: "صرف پہلے سے لکھی سرنج کی طاقت۔ ہوا کا بلبلہ نہ نکالیں اگر لیفلیٹ اسے چھوڑنے کو کہے۔ جگہ پر نیل عام ہے۔ کالا پاخانہ یا گرنا ایمرجنسی ہے۔",
  },
  {
    re: /afil$/,
    min: 6,
    atc: "G04BE",
    group: "Erectile-dysfunction family",
    groupUr: "عضو کی کمزوری کی فیملی",
    usedEn: "A name ending in afil is usually a PDE5 tablet for erectile dysfunction, or sometimes for lung pressure. The lung-pressure dose is not the sexual-function dose. Never combine with a nitrate chest medicine.",
    usedUr: "افیل پر ختم ہونے والا نام عام طور پر عضو کی کمزوری کی پی ڈی ای 5 گولی ہے، یا کبھی پھیپھڑے کے دباؤ کے لیے۔ پھیپھڑے کے دباؤ کی خوراک جنسی کام کی خوراک نہیں۔ نائٹریٹ سینے کی دوا کے ساتھ کبھی نہیں۔",
    avoidEn: "Nitrate sprays and tablets, riociguat, a recent stroke or heart attack, and a sudden loss of vision on this family before.",
    avoidUr: "نائٹریٹ سپرے اور گولیاں، ریوسیگواٹ، حالیہ فالج یا دل کا دورہ، اور اس فیملی پر پہلے اچانک نظر جانا۔",
    adultEn: "Not more than the pack allows in 24 hours. Chest pain after a dose is emergency care. Do not treat that pain with a nitrate. An erection lasting more than four hours is also urgent.",
    adultUr: "24 گھنٹے میں پیک کی اجازت سے زیادہ نہیں۔ خوراک کے بعد سینے کا درد ایمرجنسی ہے۔ اس درد کو نائٹریٹ سے نہ سہیں۔ چار گھنٹے سے زیادہ کھڑا عضو بھی فوری ہے۔",
  },
  {
    re: /caine$/,
    min: 6,
    atc: "N01B",
    group: "Local anaesthetic family",
    groupUr: "مقامی بے ہوشی کی فیملی",
    usedEn: "A name ending in caine is usually a local anaesthetic for skin, mouth, or procedures. Swallowing a topical product, or using it over a large raw area, can cause fits and heart trouble.",
    usedUr: "کین پر ختم ہونے والا نام عام طور پر جلد، منہ، یا طریقہ کار کی مقامی بے ہوشی ہے۔ سطح والی چیز نگلنا، یا بڑے کچے حصے پر لگانا، دورے اور دل کی تکلیف کر سکتا ہے۔",
    avoidEn: "Broken skin over a large area, the eye unless the pack is an eye product, and any use in a small child without a measured dose.",
    avoidUr: "بڑے حصے پر ٹوٹی جلد، آنکھ جب تک پیک آنکھ کا نہ ہو، اور چھوٹے بچے میں بغیر ناپی خوراک کے کوئی استعمال۔",
    adultEn: "Use the smallest amount on the smallest area. Do not cover it tightly unless the leaflet says so. Numbness of the mouth means no hot drinks until it wears off.",
    adultUr: "سب سے چھوٹی مقدار سب سے چھوٹے حصے پر۔ کس کر نہ ڈھانپیں جب تک لیفلیٹ نہ کہے۔ منہ کی سن کا مطلب گرم مشروب نہیں جب تک اثر رہے،",
  },
  {
    re: /coxib$/,
    min: 6,
    atc: "M01AH",
    group: "Anti-inflammatory family",
    groupUr: "سوزش والی فیملی",
    usedEn: "A name ending in coxib is a COX-2 anti-inflammatory pain tablet. Heart and stomach risk remain. Do not combine it with ibuprofen or diclofenac.",
    usedUr: "کوکسب پر ختم ہونے والا نام سی او ایکس 2 سوزش والی درد کی گولی ہے۔ دل اور پیٹ کا خطرہ رہتا ہے۔ آئبوپروفین یا ڈائکلوفینیک کے ساتھ نہ ملائیے۔",
    avoidEn: "Heart disease, stroke, ulcer, late pregnancy, kidney disease, and aspirin-sensitive asthma.",
    avoidUr: "دل کی بیماری، فالج، السر، حمل کا آخر، گردے کی بیماری، اور اسپرین سے بھڑکنے والا دمہ۔",
    adultEn: "The lowest strength for the shortest time, with food. Black stool is urgent.",
    adultUr: "کم سے کم طاقت، کم سے کم وقت، کھانے کے ساتھ۔ کالا پاخانہ فوری ہے۔",
  },
  {
    re: /profen$|fenac$/,
    min: 6,
    atc: "M01A",
    group: "Anti-inflammatory pain family",
    groupUr: "سوزش والے درد کی فیملی",
    usedEn: "This name pattern is usually an anti-inflammatory pain medicine. Two of them together add stomach and kidney harm. They are not a substitute for each other by doubling.",
    usedUr: "یہ نام کا انداز عام طور پر سوزش والی درد کی دوا ہے۔ دو اکٹھی پیٹ اور گردے کا نقص بڑھا تی ہیں۔ دوگنا کر کے ایک دوسرے کا بدل نہیں۔",
    avoidEn: "Ulcer, late pregnancy, kidney disease, heart failure, and asthma that worsened with a pain tablet.",
    avoidUr: "السر، حمل کا آخر، گردے کی بیماری، دل کی ناکامی، اور درد کی گولی سے بگڑنے والا دمہ۔",
    adultEn: "With food, for the shortest time, at the strength on this box. Do not add a second anti-inflammatory.",
    adultUr: "کھانے کے ساتھ، کم سے کم وقت، اس ڈبے کی طاقت پر۔ دوسری سوزش والی دوا نہ جوڑیں۔",
  },
  {
    re: /methasone$|olone$|onide$|cortisone$/,
    min: 7,
    atc: "H02",
    group: "Steroid family",
    groupUr: "سٹیرائیڈ فیملی",
    usedEn: "This name pattern is usually a steroid. Creams and tablets are not the same medicine. A steroid is not a fairness cream and not a strength tonic.",
    usedUr: "یہ نام کا انداز عام طور پر سٹیرائیڈ ہے۔ کریم اور گولی ایک دوا نہیں۔ سٹیرائیڈ رنگ ہلکی کریم نہیں اور طاقت کا ٹانک نہیں۔",
    avoidEn: "Using a potent cream on the face for weeks, starting a leftover tablet strip for a new rash, and stopping a long tablet course overnight.",
    avoidUr: "ہفتوں چہرے پر مضبوط کریم، نئے دانے کے لیے بچا ہوا گولی سٹرپ، اور لمبا گولی کورس راتوں رات بند کرنا۔",
    adultEn: "Follow only the area and the days on this pack. Tablets are often taken in the morning with food. A long course is tapered by a clinician. Sugar can rise.",
    adultUr: "صرف اس پیک کا حصہ اور دن۔ گولیاں اکثر صبح کھانے کے ساتھ۔ لمبا کورس کلینیشن آہستہ گھٹاتا ہے۔ شوگر بڑھ سکتی ہے۔",
  },
  {
    re: /formin$/,
    min: 7,
    atc: "A10BA",
    group: "Diabetes family related to metformin",
    groupUr: "میٹفارمن سے جڑی شوگر فیملی",
    usedEn: "A name ending in formin is in the metformin family for type 2 diabetes. It is not started for thirst alone, and it is not a weight-loss tonic.",
    usedUr: "فارمن پر ختم ہونے والا نام ٹائپ 2 شوگر کی میٹفارمن فیملی میں ہے۔ صرف پیاس پر شروع نہیں، اور وزن گھٹانے کا ٹانک نہیں۔",
    avoidEn: "Very reduced kidney function, severe dehydration, and a scan with contrast dye unless the team has a plan.",
    avoidUr: "گردے کا کام بہت کم، شدید پانی کی کمی، اور کنٹراسٹ ڈائی والا اسکین جب تک ٹیم کا منصوبہ نہ ہو۔",
    adultEn: "With food, at the dose already chosen. Do not copy someone else's number of tablets. Deep breathing with severe weakness is emergency care.",
    adultUr: "کھانے کے ساتھ، پہلے سے چنی خوراک پر۔ کسی اور کی گولیوں کی تعداد نقل نہ کریں۔ شدید کمزوری کے ساتھ گہرا سانس ایمرجنسی ہے۔",
  },
  {
    re: /zosin$/,
    min: 6,
    atc: "G04CA",
    group: "Alpha-blocker family",
    groupUr: "الفا بلاکر فیملی",
    usedEn: "A name ending in zosin is often an alpha blocker for prostate symptoms or blood pressure. The first doses can cause a faint. It is not a shared blood-pressure tablet.",
    usedUr: "زوسن پر ختم ہونے والا نام اکثر غدُودِ مَثانہ یا فشار کا الفا بلاکر ہے۔ پہلی خوراکیں بے ہوشی لا سکتی ہیں۔ بانٹی ہوئی فشار کی گولی نہیں۔",
    avoidEn: "A plan for cataract surgery unless the surgeon knows, and standing up fast after the first dose.",
    avoidUr: "موتیا کا آپریشن جب تک سرجن نہ جانتا ہو، اور پہلی خوراک کے بعد تیزی سے کھڑے ہونا۔",
    adultEn: "Once a day, swallowed whole if the pack says modified release. Sit down if faint. Tell an eye surgeon before cataract surgery.",
    adultUr: "دن میں ایک بار، پوری نگلیں اگر پیک دیر سے چھوڑنے والی کہے۔ اگر بے ہوشی لگے تو بیٹھ جائیں۔ موتیا سے پہلے آنکھ کے سرجن کو بتائیں۔",
  },
  {
    re: /thiazide$/,
    min: 9,
    atc: "C03A",
    group: "Thiazide water tablet",
    groupUr: "تھیازائیڈ پیشاب کی گولی",
    usedEn: "A name ending in thiazide is a water-and-pressure tablet. It is not a slimming tablet. Potassium and sodium need blood tests on a real plan.",
    usedUr: "تھیازائیڈ پر ختم ہونے والا نام پانی اور فشار کی گولی ہے۔ وزن گھٹانے کی گولی نہیں۔ پوٹاشیم اور سوڈیم حقیقی منصوبے پر خون کے ٹیسٹ مانگتے ہیں۔",
    avoidEn: "Severe dehydration, gout that is already flaring, and pregnancy swelling treated from a shop.",
    avoidUr: "شدید پانی کی کمی، گٹھیا جو پہلے سے بھڑکا ہو، اور دکان سے حمل کی سوجن کا علاج۔",
    adultEn: "Usually in the morning. Cramp and weakness need a blood test, not an extra tablet.",
    adultUr: "عام طور پر صبح۔ مروڑ اور کمزوری خون کا ٹیسٹ مانگتے ہیں، اضافی گولی نہیں۔",
  },
  {
    re: /zepam$|zolam$/,
    min: 6,
    atc: "N05BA",
    group: "Benzodiazepine, controlled",
    groupUr: "بینزودائیزپین، کنٹرول شدہ",
    usedEn: "A name ending in zepam or zolam is a benzodiazepine. In Pakistan and the UAE this family is controlled. It is not a sleep tablet to borrow. With alcohol or an opioid it can stop breathing.",
    usedUr: "زیپام یا زولام پر ختم ہونے والا نام بینزودائیزپین ہے۔ پاکستان اور متحدہ عرب امارات میں یہ خاندان کنٹرول شدہ ہے۔ ادھار کی نیند کی گولی نہیں۔ شراب یا اوپیائیڈ کے ساتھ سانس روک سکتا ہے۔",
    avoidEn: "Alcohol, opioid pain tablets, sleep apnoea, and stopping suddenly after regular use. Sudden stopping can cause seizures.",
    avoidUr: "شراب، اوپیائیڈ درد کی گولیاں، نیند کا سانس رُکنا، اور باقاعدہ استعمال کے بعد اچانک روکنا۔ اچانک روکنا دورے لا سکتا ہے۔",
    adultEn: "Only a prescribed short course. Do not drive. Do not drink. A clinician tapers a regular course. This card does not start one.",
    adultUr: "صرف لکھا ہوا مختصر کورس۔ گاڑی نہ چلائیں۔ شراب نہ پئیں۔ باقاعدہ کورس کلینیشن آہستہ گھٹاتا ہے۔ یہ کارڈ اسے شروع نہیں کرتا۔",
  },
  {
    re: /oxetine$|traline$/,
    min: 8,
    atc: "N06AB",
    group: "Antidepressant family",
    groupUr: "ڈپریشن کی دوا کی فیملی",
    usedEn: "This name pattern is usually an antidepressant. Mood does not change the same day. Thoughts of self-harm, especially in the first weeks in a young adult, are urgent care, not a bigger dose.",
    usedUr: "یہ نام کا انداز عام طور پر ڈپریشن کی دوا ہے۔ مزاج اسی دن نہیں بدلتا۔ خود کو نقصان کے خیالات، خاص طور پر نوجوان میں پہلے ہفتوں میں، فوری دیکھ بھال ہیں، بڑی خوراک نہیں۔",
    avoidEn: "Combining with an MAOI, tramadol, or St John's wort. Do not stop overnight.",
    avoidUr: "ایم اے او آئی، ٹرامادول، یا سینٹ جان ورٹ کے ساتھ ملانا۔ راتوں رات بند نہ کریں۔",
    adultEn: "Once a day, for weeks, at the strength a clinician set. This card does not start it and does not raise it.",
    adultUr: "دن میں ایک بار، ہفتوں تک، کلینیشن کی رکھی طاقت پر۔ یہ کارڈ اسے شروع نہیں کرتا اور بڑھاتا نہیں۔",
  },
  {
    re: /triptyline$/,
    min: 10,
    atc: "N06AA",
    group: "Older antidepressant family",
    groupUr: "پرانی ڈپریشن دوا کی فیملی",
    usedEn: "A name ending in triptyline is an older antidepressant, sometimes used for nerve pain. Overdose is dangerous. It is not a sleep tablet from a relative.",
    usedUr: "ٹریپٹائلین پر ختم ہونے والا نام پرانی ڈپریشن کی دوا ہے، کبھی اعصاب کے درد کے لیے۔ زیادتی خطرناک ہے۔ رشتہ دار کی نیند کی گولی نہیں۔",
    avoidEn: "A recent heart attack, a dose larger than prescribed, and combining with an MAOI.",
    avoidUr: "حالیہ دل کا دورہ، لکھی خوراک سے بڑی مقدار، اور ایم اے او آئی کے ساتھ ملانا۔",
    adultEn: "Usually at night, low to start. Dry mouth and morning sleepiness are common. A fast heartbeat or a fit after extra tablets is emergency care.",
    adultUr: "عام طور پر رات کو، شروع میں کم۔ خشک منہ اور صبح کی نیند عام ہیں۔ اضافی گولیوں کے بعد تیز دھڑکن یا دورہ ایمرجنسی ہے۔",
  },
  {
    re: /mab$/,
    min: 6,
    atc: "L01",
    group: "Monoclonal antibody",
    groupUr: "مونوکلونل اینٹی باڈی",
    usedEn: "A name ending in mab is a monoclonal antibody, usually a hospital or specialist injection. It is not a shop syrup and not a formula to mix at home.",
    usedUr: "میب پر ختم ہونے والا نام مونوکلونل اینٹی باڈی ہے، عام طور پر ہسپتال یا ماہر کا انجکشن۔ دکان کا شربت نہیں اور گھر پر ملانے کا فارمولا نہیں۔",
    avoidEn: "Buying it outside a cold-chain pharmacy, and injecting a pen that was not prescribed for this person.",
    avoidUr: "ٹھنڈی زنجیر والی فارمیسی کے باہر خریدنا، اور ایسا پین لگانا جو اس شخص کے لیے نہ لکھا گیا ہو۔",
    adultEn: "Store it as the carton says, often in a fridge, never a freezer. Fever, chest tightness, or a widespread rash after a dose is urgent.",
    adultUr: "جیسے ڈبہ کہے رکھیں، اکثر فرج میں، فریزر میں کبھی نہیں۔ خوراک کے بعد بخار، سینے کی تنگی، یا پھیلا دانہ فوری ہے۔",
  },
];

function complexStems(): Family[] {
  const adultEn =
    "The dose is the one written for this person on this pack. A company web page or another patient's box does not transfer. A specialist starts medicines in this family. This reading does not invent a milligram.";
  const adultUr =
    "خوراک وہ ہے جو اس شخص کے لیے اس پیک پر لکھی ہے۔ کمپنی کا ویب صفحہ یا کسی دوسرے مریض کا ڈبہ منتقل نہیں ہوتا۔ اس فیملی کی دوائیں ماہر شروع کرتا ہے۔ یہ پڑھائی ملی گرام نہیں بناتی۔";
  const row = (
    re: RegExp,
    min: number,
    atc: string,
    group: string,
    groupUr: string,
    usedEn: string,
    usedUr: string,
    avoidEn: string,
    avoidUr: string,
  ): Family => ({ re, min, atc, group, groupUr, usedEn, usedUr, avoidEn, avoidUr, adultEn, adultUr });
  return [
    row(/citinib$/, 9, "L04AF", "JAK inhibitor", "جے اے کے روکنے والی", "A name ending in citinib is a JAK inhibitor, used for some inflammatory diseases. Infection and clot risk are part of the class, so a specialist chooses it.", "سٹیٹنب پر ختم ہونے والا نام جے اے کے روکنے والی دوا ہے، کچھ سوزشی بیماریوں کے لیے۔ انفیکشن اور لوتھڑے کا خطرہ اسی کلاس کا حصہ ہے، اس لیے ماہر چنتا ہے۔", "A current serious infection, a past clot unless the specialist accepted it, and pregnancy.", "موجود سنگین انفیکشن، پرانا لوتھڑا جب تک ماہر نے قبول نہ کیا ہو، اور حمل۔"),
    row(/brutinib$/, 9, "L01EL", "BTK inhibitor", "بی ٹی کے روکنے والی", "A name ending in brutinib is a BTK inhibitor, usually for a blood cancer or a related immune disease. Bleeding and heart-rhythm effects are class problems.", "بروٹنب پر ختم ہونے والا نام بی ٹی کے روکنے والی دوا ہے، عام طور پر خون کے کینسر یا متعلقہ مدافعتی بیماری کے لیے۔ خون بہنا اور دل کی دھڑکن اسی کلاس کے مسائل ہیں۔", "A planned operation, a blood thinner already in use, and pregnancy. Do not stop it for a dental visit without the specialist.", "طے شدہ آپریشن، پہلے سے خون پتلا کرنے والی دوا، اور حمل۔ دانت کی ملاقات کے لیے ماہر کے بغیر بند نہ کریں۔"),
    row(/rafenib$/, 8, "L01EC", "RAF inhibitor", "آر اے ایف روکنے والی", "A name ending in rafenib is a RAF kinase inhibitor, used for some cancers with a specific tumour test. It is not a general pain or inflammation tablet.", "رافینب پر ختم ہونے والا نام آر اے ایف کائنیز روکنے والی دوا ہے، کچھ کینسر کے لیے جن کا مخصوص ٹیسٹ ہو۔ عام درد یا سوزش کی گولی نہیں۔", "Pregnancy, a missing tumour-marker result, and combining it with another cancer tablet from a relative.", "حمل، ٹومر مارکر کا نتیجہ نہ ہونا، اور رشتہ دار کی کینسر کی گولی کے ساتھ ملانا۔"),
    row(/lisib$/, 7, "L01EM", "PI3K inhibitor", "پی آئی 3 کے روکنے والی", "A name ending in lisib is a PI3K inhibitor, a specialist cancer or immune medicine. Serious infection is a known class risk.", "لیسب پر ختم ہونے والا نام پی آئی 3 کے روکنے والی دوا ہے، ماہر کی کینسر یا مدافعتی دوا۔ سنگین انفیکشن اسی کلاس کا معلوم خطرہ ہے۔", "Pregnancy, and a fever while taking it. Fever needs same-day care, not a shop antibiotic on top.", "حمل، اور اس کے دوران بخار۔ بخار اسی دن دیکھ بھال مانگتا ہے، اوپر دکان کی اینٹی بائیوٹک نہیں۔"),
    row(/parib$/, 7, "L01XK", "PARP inhibitor", "پارپ روکنے والی", "A name ending in parib is a PARP inhibitor for some cancers, often after a gene test. Blood counts are watched.", "پارب پر ختم ہونے والا نام کچھ کینسر کے لیے پارپ روکنے والی دوا ہے، اکثر جین ٹیسٹ کے بعد۔ خون کی گنتی دیکھی جاتی ہے۔", "Pregnancy, and a blood count that has not been checked on this plan.", "حمل، اور خون کی گنتی جو اس منصوبے پر نہ دیکھی گئی ہو۔"),
    row(/ciclib$/, 8, "L01EF", "CDK inhibitor", "سی ڈی کے روکنے والی", "A name ending in ciclib is a CDK4/6 inhibitor, used with hormone treatment for some breast cancers. It is not a hormone tablet by itself.", "سکلِب پر ختم ہونے والا نام سی ڈی کے 4/6 روکنے والی دوا ہے، کچھ چھاتی کے کینسر میں ہارمون علاج کے ساتھ۔ یہ خود ہارمون گولی نہیں۔", "Pregnancy, lung inflammation with a new cough, and a low blood count.", "حمل، نئی کھانسی کے ساتھ پھیپھڑے کی سوزش، اور کم خون کی گنتی۔"),
    row(/degib$/, 7, "L01XJ", "Hedgehog inhibitor", "ہیج ہاگ روکنے والی", "A name ending in degib blocks the hedgehog pathway, for some skin or tissue cancers. Birth defects are a class danger.", "ڈیگب پر ختم ہونے والا نام ہیج ہاگ راستہ روکتا ہے، کچھ جلد یا بافت کے کینسر کے لیے۔ پیدائشی نقص اسی کلاس کا خطرہ ہے۔", "Pregnancy, and donating blood while taking it and for the months the specialist sets.", "حمل، اور اس کے دوران اور ماہر کے مقرر مہینوں تک خون دینا۔"),
    row(/sidenib$/, 9, "L01XX", "IDH inhibitor", "آئی ڈی ایچ روکنے والی", "A name ending in sidenib is an IDH inhibitor for some leukaemias after a mutation test.", "سائیڈنب پر ختم ہونے والا نام کچھ خون کے کینسر کے لیے آئی ڈی ایچ روکنے والی دوا ہے، میوٹیشن ٹیسٹ کے بعد۔", "Pregnancy, and a differentiation syndrome: fever, swelling, and breathlessness together are urgent.", "حمل، اور ڈفرنسی ایشن سنڈروم: بخار، سوجن، اور سانس پھولنا اکٹھے فوری ہیں۔"),
    row(/tinib$/, 7, "L01E", "Kinase inhibitor", "کائنیز روکنے والی", "A name ending in tinib is a kinase inhibitor. Companies use this ending for targeted cancer or inflammatory tablets. Two tinibs are not swaps.", "ٹنب پر ختم ہونے والا نام کائنیز روکنے والی دوا ہے۔ کمپنیاں یہ انجام نشانہ بند کینسر یا سوزش کی گولیوں کے لیے استعمال کرتی ہیں۔ دو ٹنب بدل نہیں۔", "Pregnancy, grapefruit if the leaflet mentions it, and a new antibiotic until the specialist has checked the pair.", "حمل، گریپ فروٹ اگر لیفلیٹ کہے، اور نئی اینٹی بائیوٹک جب تک ماہر جوڑا نہ دیکھے۔"),
    row(/meran$/, 8, "J07BX", "mRNA medicine", "ایم آر این اے دوا", "A name ending in meran is an mRNA product, such as some vaccines. The cold chain and the dose in millilitres are part of the product, not a detail to guess.", "میران پر ختم ہونے والا نام ایم آر این اے چیز ہے، جیسے کچھ ویکسین۔ ٹھنڈی زنجیر اور ملی لیٹر کی خوراک چیز کا حصہ ہیں، اندازہ نہیں۔", "A broken cold chain, a syringe drawn for someone else, and pregnancy advice that this pack's own leaflet does not answer.", "ٹوٹی ٹھنڈی زنجیر، کسی اور کے لیے کھینچی سرنج، اور حمل کا مشورہ جس کا جواب اس پیک کا لیفلیٹ نہ دے۔"),
    row(/siran$/, 8, "L01XX", "siRNA medicine", "ایس آئی آر این اے دوا", "A name ending in siran is a small interfering RNA. These are specialist injections, often for liver, cholesterol, or rare disease. They are not vitamin shots.", "سائرن پر ختم ہونے والا نام چھوٹی مداخلت کرنے والی آر این اے ہے۔ یہ ماہر کے انجکشن ہیں، اکثر جگر، کولیسٹرول، یا نایاب بیماری کے لیے۔ وٹامن کے ٹیکے نہیں۔", "Pregnancy, and giving the injection at home unless a team has trained that exact device.", "حمل، اور گھر پر انجکشن جب تک ٹیم نے عین یہ آلہ نہ سکھایا ہو۔"),
    row(/rsen$/, 7, "L01XX", "Antisense medicine", "اینٹی سنس دوا", "A name ending in rsen is an antisense oligonucleotide for a genetic disease. The name is tied to one gene. A similar-looking rsen is a different medicine.", "رسن پر ختم ہونے والا نام جینیاتی بیماری کی اینٹی سنس دوا ہے۔ نام ایک جین سے جڑا ہے۔ ملتی جلتی رسن الگ دوا ہے۔", "Pregnancy, a different diagnosis with a similar name, and a dose calculated from body weight by anyone except the specialist team.", "حمل، ملتے جلتے نام والی الگ تشخیص، اور وزن سے خوراک جو ماہر ٹیم کے سوا کوئی اور نکالے۔"),
    row(/cabtagene$|leucel$/, 8, "L01XL", "Cell therapy", "سیل تھراپی", "This ending marks a cell therapy, often a CAR-T product prepared from a person's own cells. It cannot be borrowed, delayed casually, or replaced by a vial from another company.", "یہ انجام سیل تھراپی کی علامت ہے، اکثر شخص کے اپنے خلیوں سے بنی کار-ٹی۔ یہ ادھار نہیں لی جا سکتی، آرام سے دیر نہیں ہو سکتی، اور دوسری کمپنی کی شیشی سے نہیں بدلتی۔", "Fever after infusion, confusion, or a drop in blood pressure. Those are emergencies for the centre that gave it, not a home pain tablet.", "انفیوژن کے بعد بخار، الجھن، یا فشار گرنا۔ یہ اس مرکز کی ایمرجنسی ہیں جس نے دیا، گھریلو درد کی گولی نہیں۔"),
    row(/gene$/, 10, "Gene", "Gene therapy", "جین تھراپی", "A long name ending in gene is often a gene therapy aimed at one inherited condition. The vial is patient-specific or batch-specific.", "جین پر ختم ہونے والا لمبا نام اکثر ایک وراثتی حالت کی جین تھراپی ہوتا ہے۔ شیشی مریض یا بیچ کے لیے مخصوص ہوتی ہے۔", "Using a vial whose name differs by even one syllable, and pregnancy unless the gene-therapy team has a written plan.", "ایسی شیشی استعمال کرنا جس کے نام میں ایک حرف بھی فرق ہو، اور حمل جب تک جین تھراپی ٹیم کا لکھا منصوبہ نہ ہو۔"),
    row(/navir$/, 8, "J05AE", "HIV protease inhibitor", "ایچ آئی وی پروٹیز روکنے والی", "A name ending in navir is an HIV protease inhibitor. It is one part of a combination, not a cure to take alone, and it clashes with many ordinary medicines.", "ناویر پر ختم ہونے والا نام ایچ آئی وی پروٹیز روکنے والی دوا ہے۔ یہ جوڑے کا ایک حصہ ہے، اکیلی علاج نہیں، اور بہت سی عام دواؤں سے ٹکراتی ہے۔", "Stopping one tablet of a combination, St John's wort, and a new inhaler or statin until the HIV clinic has checked.", "جوڑے کی ایک گولی روکنا، سینٹ جان ورٹ، اور نیا انہیلر یا سٹیٹن جب تک ایچ آئی وی کلینک نہ دیکھے۔"),
    row(/gravir$/, 9, "J05AJ", "HIV integrase inhibitor", "ایچ آئی وی انٹیگریز روکنے والی", "A name ending in gravir is an HIV integrase inhibitor. Missing doses let the virus change. It is not an antibiotic for a fever.", "گریویر پر ختم ہونے والا نام ایچ آئی وی انٹیگریز روکنے والی دوا ہے۔ چھوٹی خوراک وائرس کو بدل دیتی ہے۔ بخار کی اینٹی بائیوٹک نہیں۔", "Pregnancy plans that were not agreed with the HIV clinic, and antacids at the same moment as some gravirs.", "حمل کے منصوبے جو ایچ آئی وی کلینک سے طے نہ ہوں، اور کچھ گریویر کے ساتھ اسی لمحے اینٹاسڈ۔"),
    row(/buvir$/, 8, "J05AP", "Hepatitis C NS5B inhibitor", "ہیپاٹائٹس سی این ایس 5 بی", "A name ending in buvir is usually a hepatitis C NS5B inhibitor, taken inside a fixed combination. The weeks are exact.", "بوویر پر ختم ہونے والا نام عام طور پر ہیپاٹائٹس سی کی این ایس 5 بی روکنے والی دوا ہے، مقرر جوڑے کے اندر۔ ہفتے عین ہوتے ہیں۔", "Stopping early because the person feels well, and pregnancy if ribavirin is also in the pack.", "اچھا محسوس کرنے پر جلدی روکنا، اور حمل اگر پیک میں رائباویرن بھی ہو۔"),
    row(/previr$/, 8, "J05AP", "Hepatitis C protease inhibitor", "ہیپاٹائٹس سی پروٹیز", "A name ending in previr is usually a hepatitis C protease inhibitor. It belongs with the other antivirals named on the same carton.", "پریویر پر ختم ہونے والا نام عام طور پر ہیپاٹائٹس سی پروٹیز روکنے والی دوا ہے۔ یہ اسی ڈبے کی دوسری اینٹی وائرل دواؤں کے ساتھ ہے۔", "A different hepatitis genotype than the one this pack was chosen for, and pregnancy unless the clinic agreed.", "وہ ہیپاٹائٹس جینوٹائپ جس کے لیے یہ پیک نہ چنا گیا ہو، اور حمل جب تک کلینک نے نہ مانا ہو۔"),
    row(/asvir$/, 7, "J05AP", "Hepatitis C NS5A inhibitor", "ہیپاٹائٹس سی این ایس 5 اے", "A name ending in asvir is usually a hepatitis C NS5A inhibitor. Look-alike asvir names are not interchangeable.", "ایسویر پر ختم ہونے والا نام عام طور پر ہیپاٹائٹس سی این ایس 5 اے روکنے والی دوا ہے۔ ملتی جلتی ایسویر نام ایک دوسرے کی جگہ نہیں لیتے۔", "An incomplete course, and any new heart or statin tablet without the clinic.", "ادھورا کورس، اور کلینک کے بغیر کوئی نئی دل یا سٹیٹن گولی۔"),
    row(/virine$/, 9, "J05AF", "HIV non-nucleoside inhibitor", "ایچ آئی وی نان نیوکلیوسائیڈ", "A name ending in virine is an HIV non-nucleoside reverse transcriptase inhibitor. Resistance happens quickly if doses are missed.", "ویرین پر ختم ہونے والا نام ایچ آئی وی نان نیوکلیوسائیڈ روکنے والی دوا ہے۔ خوراک چھوٹنے پر مزاحمت جلدی آتی ہے۔", "Pregnancy unless the HIV clinic chose this one, and a new tuberculosis medicine without that clinic.", "حمل جب تک ایچ آئی وی کلینک نے یہی نہ چنی ہو، اور اس کلینک کے بغیر نئی تپ دق کی دوا۔"),
    row(/gepant$/, 8, "N02CD", "CGRP migraine medicine", "سی جی آر پی آدھے سر کی دوا", "A name ending in gepant blocks CGRP, for migraine. It is not a pain tablet for a sudden worst headache, a weak arm, or a stiff neck with fever.", "گیپینٹ پر ختم ہونے والا نام سی جی آر پی روکتا ہے، آدھے سر کے لیے۔ اچانک شدید ترین سر درد، کمزور بازو، یا بخار کے ساتھ اکڑی گردن کی گولی نہیں۔", "Pregnancy, a previous stroke plan that the neurologist has not reviewed, and taking it daily when the pack is for attacks only.", "حمل، فالج کا پرانا منصوبہ جسے اعصاب کے ماہر نے نہ دیکھا ہو، اور روزانہ لینا جب پیک صرف دوروں کے لیے ہو۔"),
    row(/cept$/, 8, "L04AB", "Receptor-fusion protein", "رسیپٹر فیوژن پروٹین", "A name ending in cept is a fusion protein that traps a receptor signal, used for inflammatory disease. It is an injection with infection risk, not a painkiller.", "سیپٹ پر ختم ہونے والا نام فیوژن پروٹین ہے جو رسیپٹر کے اشارے کو پکڑتی ہے، سوزشی بیماری کے لیے۔ یہ انفیکشن کے خطرے والا انجکشن ہے، درد کی گولی نہیں۔", "Active tuberculosis or other serious infection, live vaccines, and pregnancy.", "فعال تپ دق یا دوسرا سنگین انفیکشن، زندہ ویکسین، اور حمل۔"),
    row(/poetin$/, 8, "B03XA", "Erythropoietin", "ایریتھروپوئٹن", "A name ending in poetin is an erythropoietin, raising red cells. Haemoglobin that climbs too fast causes clots. Pens of different poetins are not the same unit.", "پوئٹن پر ختم ہونے والا نام ایریتھروپوئٹن ہے، سرخ خلیے بڑھاتا ہے۔ ہیموگلوبن جو بہت تیزی سے چڑھے لوتھڑے کرتا ہے۔ مختلف پوئٹن کے پین ایک ہی یونٹ نہیں۔", "A haemoglobin already at the target the kidney team set, uncontrolled blood pressure, and pregnancy unless that team wrote it.", "ہیموگلوبن جو گردے کی ٹیم کے ہدف پر پہلے سے ہو، بے قابو فشار، اور حمل جب تک اسی ٹیم نے نہ لکھا ہو۔"),
    row(/grastim$/, 8, "L03AA", "G-CSF", "جی سی ایس ایف", "A name ending in grastim is a G-CSF, raising neutrophils after chemotherapy or for a chronic low count. Bone pain is common. It is not a tonic.", "گریسٹم پر ختم ہونے والا نام جی سی ایس ایف ہے، کیموتھراپی کے بعد یا دائمی کم گنتی میں نیوٹروفِل بڑھاتا ہے۔ ہڈی کا درد عام ہے۔ ٹانک نہیں۔", "A day the oncology calendar says not to inject, and pregnancy.", "وہ دن جس کے بارے میں کینسر کا کیلنڈر کہے کہ انجکشن نہیں، اور حمل۔"),
    row(/feron$/, 7, "L03AB", "Interferon", "انٹرفیرون", "A name ending in feron is an interferon. Mood change, low blood counts, and flu-like symptoms are class effects. It is not a shop immune booster.", "فیرون پر ختم ہونے والا نام انٹرفیرون ہے۔ مزاج کی تبدیلی، کم خون کی گنتی، اور فلو جیسے اثرات اسی کلاس کے ہیں۔ دکان کا امون بوسٹر نہیں۔", "Depression with thoughts of self-harm, autoimmune disease unless the specialist accepted it, and pregnancy.", "خود کو نقصان کے خیالات کے ساتھ ڈپریشن، خود کار مدافعتی بیماری جب تک ماہر نے قبول نہ کی ہو، اور حمل۔"),
    row(/relin$/, 7, "L02AE", "GnRH analogue", "جی این آر ایچ اینالاگ", "A name ending in relin is a GnRH analogue, for hormone-sensitive conditions. A flare at the start is possible. It is not a fertility drug to copy from a forum.", "ریلِن پر ختم ہونے والا نام جی این آر ایچ اینالاگ ہے، ہارمون والی حالتوں کے لیے۔ شروع میں بھڑکنا ممکن ہے۔ فورم سے نقل کرنے والی زرخیزی کی دوا نہیں۔", "Pregnancy, unexplained vaginal bleeding, and a specialist plan that has not been started.", "حمل، بے سبب اندام نہانی سے خون، اور ماہر کا منصوبہ جو شروع نہ ہوا ہو۔"),
    row(/reotide$/, 9, "H01CB", "Somatostatin analogue", "سومیٹوسٹیٹن اینالاگ", "A name ending in reotide is a somatostatin analogue, for some hormone tumours or bleeding plans. Gallstones and low sugar are class effects.", "ریوٹائیڈ پر ختم ہونے والا نام سومیٹوسٹیٹن اینالاگ ہے، کچھ ہارمون ٹیومر یا خون کے منصوبوں کے لیے۔ پتھری اور کم شوگر اسی کلاس کے اثرات ہیں۔", "Pregnancy, and a diabetes plan that has not been told about the injection.", "حمل، اور شوگر کا منصوبہ جسے انجکشن کے بارے میں نہ بتایا گیا ہو۔"),
    row(/entan$/, 7, "C02KX", "Endothelin antagonist", "اینڈوتھیلن روکنے والی", "A name ending in entan is an endothelin receptor antagonist, for pulmonary hypertension or some other specialist plans. It harms a pregnancy.", "اینٹان پر ختم ہونے والا نام اینڈوتھیلن رسیپٹر روکنے والی دوا ہے، پھیپھڑے کے زیادہ دباؤ یا کچھ دوسرے ماہر منصوبوں کے لیے۔ حمل کو نقصان پہنچاتی ہے۔", "Pregnancy and any chance of pregnancy. A pregnancy test and contraception are part of the plan, not an extra.", "حمل اور حمل کا کوئی امکان۔ حمل کا ٹیسٹ اور مانع حمل منصوبے کا حصہ ہیں، اضافہ نہیں۔"),
    row(/steride$/, 8, "G04CB", "5-alpha-reductase inhibitor", "5 الفا ریڈکٹیز روکنے والی", "A name ending in steride blocks 5-alpha-reductase, for prostate enlargement or some hair plans. Crushed tablets are dangerous to a pregnant person.", "سٹیرائیڈ پر ختم ہونے والا نام 5 الفا ریڈکٹیز روکتا ہے، غدُودِ مَثانہ یا کچھ بالوں کے منصوبوں کے لیے۔ کچلی گولیاں حاملہ شخص کے لیے خطرناک ہیں۔", "Pregnancy, including handling broken tablets, and donating blood while taking it.", "حمل، ٹوٹی گولیاں چھونا بھی، اور اس کے دوران خون دینا۔"),
    row(/glitazone$/, 10, "A10BG", "Thiazolidinedione", "تھیازولیڈینڈائیون", "A name ending in glitazone is a thiazolidinedione for type 2 diabetes. Fluid retention and fracture risk are class effects. It is not a shop sugar cure.", "گلیٹازون پر ختم ہونے والا نام ٹائپ 2 شوگر کی تھیازولیڈینڈائیون ہے۔ پانی رُکنا اور ہڈی ٹوٹنے کا خطرہ اسی کلاس کے اثرات ہیں۔ دکان کا شوگر علاج نہیں۔", "Heart failure, bladder symptoms that are new, and pregnancy.", "دل کی ناکامی، نئی مثانے کی علامات، اور حمل۔"),
    row(/glinide$/, 8, "A10BX", "Meglitinide", "میگلیٹنائڈ", "A name ending in glinide is a meal-time diabetes tablet that can drop sugar. A missed meal means a missed dose, not a double later.", "گلائنائیڈ پر ختم ہونے والا نام کھانے کے وقت کی شوگر گولی ہے جو شوگر گرا سکتی ہے۔ چھوٹا کھانا چھوٹی خوراک ہے، بعد میں دوگنا نہیں۔", "Type 1 diabetes, pregnancy, and a meal that was not eaten.", "ٹائپ 1 شوگر، حمل، اور کھانا جو کھایا نہ گیا ہو۔"),
    row(/platin$/, 8, "L01XA", "Platinum chemotherapy", "پلاٹینم کیموتھراپی", "A name ending in platin is platinum chemotherapy. It is prepared in an oncology unit. Kidney, hearing, and nerve damage are class effects.", "پلاٹن پر ختم ہونے والا نام پلاٹینم کیموتھراپی ہے۔ یہ کینسر یونٹ میں تیار ہوتی ہے۔ گردہ، سماعت، اور اعصاب کا نقصان اسی کلاس کے اثرات ہیں۔", "Pregnancy, a drip outside a chemo unit, and extra tablets of this class kept at home.", "حمل، کیمو یونٹ کے باہر ڈرپ، اور اس کلاس کی اضافی گولیاں جو گھر رہ جائیں۔"),
    row(/rubicin$/, 9, "L01DB", "Anthracycline chemotherapy", "اینتھراسائکلین کیموتھراپی", "A name ending in rubicin is an anthracycline. The lifetime dose is limited because of the heart. The red colour of the infusion is the drug, not blood.", "روبیسن پر ختم ہونے والا نام اینتھراسائکلین ہے۔ زندگی بھر کی خوراک دل کی وجہ سے محدود ہے۔ انفیوژن کا سرخ رنگ دوا ہے، خون نہیں۔", "Pregnancy, a heart failure history the oncology team does not know, and a leak of the infusion into the skin. A leak is urgent.", "حمل، دل کی ناکامی کی تاریخ جو کینسر ٹیم نہ جانتی ہو، اور انفیوژن کا جلد میں رِسنا۔ رِسنا فوری ہے۔"),
    row(/taxel$/, 7, "L01CD", "Taxane chemotherapy", "ٹیکسین کیموتھراپی", "A name ending in taxel is a taxane chemotherapy. Allergy during the infusion and nerve pain in the fingers are class effects.", "ٹیکسل پر ختم ہونے والا نام ٹیکسین کیموتھراپی ہے۔ انفیوژن کے دوران الرجی اور انگلیوں میں اعصاب کا درد اسی کلاس کے اثرات ہیں۔", "Pregnancy, and a reaction during a previous taxane unless the oncology team has a premedication plan.", "حمل، اور پچھلی ٹیکسین پر ردعمل جب تک کینسر ٹیم کا پہلے سے دوا کا منصوبہ نہ ہو۔"),
    row(/tecan$/, 7, "L01CE", "Topoisomerase inhibitor", "ٹوپوائیسومیریز روکنے والی", "A name ending in tecan is a topoisomerase inhibitor chemotherapy. Diarrhoea can become dangerous, not a minor stomach upset.", "ٹیکن پر ختم ہونے والا نام ٹوپوائیسومیریز روکنے والی کیموتھراپی ہے۔ دست خطرناک ہو سکتا ہے، معمولی پیٹ خراب نہیں۔", "Pregnancy, and diarrhoea that continues. That needs the oncology number the same day.", "حمل، اور دست جو جاری رہے۔ یہ اسی دن کینسر والے نمبر کو مانگتا ہے۔"),
  ];
}

function normToken(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[^\p{L}\p{N}]+/gu, "")
    .trim();
}

export function strengthOn(query: string): string | null {
  const match = query.match(/(\d+(?:\.\d+)?)\s*(mg|mcg|µg|g|ml|iu|%)(?:\s*\/\s*\d+(?:\.\d+)?\s*(?:mg|ml))?/i);
  return match ? match[0].replace(/\s+/g, " ") : null;
}

export function formOn(query: string): string | null {
  const match = query.match(/tablet|capsule|syrup|suspension|injection|cream|ointment|drops|spray|inhaler|sachet|pen/i);
  return match ? match[0].toLowerCase() : null;
}

export function familyFor(token: string): Family | null {
  const words = token
    .toLowerCase()
    .normalize("NFKC")
    .split(/[^\p{L}]+/u)
    .filter((word) => word.length >= 4);
  for (const name of words) {
    const hit = FAMILIES.find((family) => name.length >= family.min && family.re.test(name));
    if (hit) return hit;
  }
  return null;
}

export function buildReading(query: string): Monograph {
  const cleaned = query.replace(/\s+/g, " ").trim();
  const strength = strengthOn(cleaned);
  const form = formOn(cleaned);
  const parts = cleaned
    .split(/\s*(?:\+|&|\/|,|\bplus\b|\bwith\b|\band\b| و )\s*/i)
    .map((part) => part.trim())
    .filter((part) => normToken(part).length >= 3);
  const families = parts
    .map((part) => ({ part, family: familyFor(part) }))
    .filter((item): item is { part: string; family: Family } => item.family !== null);
  const unique = families.filter((item, index) => families.findIndex((other) => other.family.atc === item.family.atc) === index);
  const title = parts[0]?.replace(/\b(tablet|capsule|syrup|mg|ml)\b/gi, "").trim() || cleaned;
  const strengthLine = strength
    ? `The strength written with this name is ${strength}. That number belongs to this box only.`
    : "Read the strength beside the name. Do not borrow a milligram from a different box.";
  const strengthLineUr = strength
    ? `اس نام کے ساتھ لکھی طاقت ${strength} ہے۔ یہ نمبر صرف اسی ڈبے کا ہے۔`
    : "نام کے پاس طاقت پڑھیں۔ ملی گرام کسی دوسرے ڈبے سے نہ لیں۔";
  const familyEn = unique.length
    ? unique.map((item) => item.family.usedEn).join(" ")
    : "Read this box before any dose. Match the active-ingredient line to the name typed here, then the strength, the form, the expiry, and the manufacturer. Swallow only what this pack says.";
  const familyUr = unique.length
    ? unique.map((item) => item.family.usedUr).join(" ")
    : "کسی خوراک سے پہلے یہ ڈبہ پڑھیں۔ فعال جزو کی سطر اس لکھے نام سے ملائیں، پھر طاقت، شکل، میعاد، اور بنانے والا۔ صرف وہ نگلیں جو یہ پیک کہے۔";
  const avoidEn = unique.length
    ? unique.map((item) => item.family.avoidEn).join(" ")
    : "A broken seal, a passed expiry, a crushed slow-release tablet, and a dose meant for another person.";
  const avoidUr = unique.length
    ? unique.map((item) => item.family.avoidUr).join(" ")
    : "ٹوٹی مہر، گزری میعاد، کچلی ہوئی دیر سے چھوڑنے والی گولی، اور کسی اور کے لیے لکھی خوراک۔";
  const adultEn = `${strengthLine} ${unique.map((item) => item.family.adultEn).join(" ") || "Take only what this pack says. This reading does not invent a dose."}`.trim();
  const adultUr = `${strengthLineUr} ${unique.map((item) => item.family.adultUr).join(" ") || "صرف وہ لیں جو یہ پیک کہے۔ یہ پڑھائی خوراک نہیں بناتی۔"}`.trim();
  return {
    id: `read:${normToken(cleaned).slice(0, 48) || "pack"}`,
    inn: title.slice(0, 80),
    atc: unique[0]?.family.atc ?? "pack",
    group: unique.map((item) => item.family.group).join(" · ") || "Reading this pack",
    groupUr: unique.map((item) => item.family.groupUr).join(" · ") || "اس پیک کو پڑھنا",
    form: form
      ? `${form}. Confirm that word on the box. The ending is the international nonproprietary family regulators and companies share.`
      : "Read the dosage form on the box. The ending is the international nonproprietary family regulators and companies share.",
    brands: [
      {
        brand: title.slice(0, 48),
        maker: "Match the manufacturer line on this box",
        market: "BOTH",
        strength: strength ?? "Read the strength on this box",
      },
    ],
    aliases: [],
    usedEn: familyEn,
    usedUr: familyUr,
    forEn: unique.length
      ? `${unique.map((item) => item.family.group).join(". ")}. That is the condition class this name is used for. It is not a diagnosis for the person asking.`
      : "The condition is the indication printed on this box. This reading does not name a disease from the brand alone.",
    forUr: unique.length
      ? `${unique.map((item) => item.family.groupUr).join(". ")}. یہ وہ حالت ہے جس کے لیے یہ نام استعمال ہوتا ہے۔ پوچھنے والے کی تشخیص نہیں۔`
      : "حالت وہ ہے جو اس ڈبے پر لکھی ہو۔ یہ پڑھائی برانڈ سے بیماری کا نام نہیں دیتی۔",
    adultEn,
    adultUr,
    childEn: "Do not split an adult pack for a child. A liquid needs the syringe in that pack. This reading prints no millilitres.",
    childUr: "بالغ پیک بچے کے لیے نہ توڑیں۔ شربت کو اسی پیک کی سرنج چاہیے۔ اس پڑھائی پر ملی لیٹر نہیں۔",
    avoidEn: `${avoidEn} Stop for a spreading rash, swollen lips, tight breathing, black stool, or collapse.`,
    avoidUr: `${avoidUr} پھیلتا دانہ، سوجے ہونٹ، تنگ سانس، کالا پاخانہ، یا گرنے پر روک دیں۔`,
    effectsEn: "Any new rash, faint, severe diarrhoea, or bleeding is a reason to stop and be seen. Do not take the next dose while waiting.",
    effectsUr: "نیا دانہ، بے ہوشی، شدید دست، یا خون روکنے اور دکھانے کی وجہ ہے۔ انتظار میں اگلی خوراک نہ لیں۔",
    mixEn: "Show every other medicine, including herbal tins and pain tablets. Two packs of the same ingredient are a common overdose.",
    mixUr: "ہر دوسری دوا دکھائیں، جڑی بوٹی کے ڈبے اور درد کی گولیاں سمیت۔ ایک ہی جزو کے دو پیک عام زیادتی ہیں۔",
    pregEn: "Do not start a new pack in pregnancy or while breastfeeding. If the family note says it is avoided in pregnancy, that is a stop, not a smaller dose.",
    pregUr: "حمل یا دودھ پلاتے وقت کسی خوراک سے پہلے پوچھیں۔ رشتہ دار نے استعمال کی اس لیے نیا پیک شروع نہ کریں۔",
    storeEn: "Original pack, dry, away from children. Note the expiry and the open date on liquids and drops.",
    storeUr: "اصل پیک، خشک، بچوں سے دور۔ مائعات اور قطروں پر میعاد اور کھلنے کی تاریخ نوٹ کریں۔",
  };
}
