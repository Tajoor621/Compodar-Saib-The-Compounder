import type { Intake, RoutingDecision, SpecialtyId } from "./types.ts";
import { FORMULARY_LABEL } from "./types.ts";
import { regionForCity, type Region } from "./places.ts";
import { clusterFor, type ClusterId } from "./routing.ts";

export type ShelfKey =
  | "cetirizine"
  | "emollient"
  | "clotrimazole"
  | "paracetamol"
  | "calpol"
  | "ors"
  | "metformin"
  | "amlodipine"
  | "aspirin75"
  | "omeprazole"
  | "ibuprofen"
  | "citrate"
  | "tears";

export type ShelfBrand = {
  id: string;
  brand: string;
  company: string;
  strength: string;
  packSize: string;
  mrpNote: string;
  status: string;
};

export type CareItem = {
  inn: string;
  atc: string;
  shelf: ShelfKey;
  role: "counter" | "clinician-only";
  whyEn: string;
  whyUr: string;
  cautionEn: string;
  cautionUr: string;
  brands: ShelfBrand[];
};

export type CareLine = { en: string; ur: string; rank: "most" | "also" };

export type CarePacket = {
  tests: CareLine[];
  counter: CareItem[];
  clinicianOnly: CareItem[];
  withheldEn: string;
  withheldUr: string;
};

const COUNTER = "Pharmacy-counter option. Not a prescription.";
const LATER = "Do not start this yourself. Listed so a pharmacist can match a pack a doctor already chose.";

const CETIRIZINE: CareItem = {
  inn: "cetirizine",
  atc: "R06AE07",
  shelf: "cetirizine",
  role: "counter",
  whyEn: "Often discussed for itch. It does not name the rash, and it is not a cure.",
  whyUr: "خارش کے لیے اکثر بات ہوتی ہے۔ یہ دانوں کا نام نہیں، اور علاج کی ضمانت نہیں۔",
  cautionEn:
    "The adult pack usually says 10 mg once a day. It can make you sleepy. Stop and seek emergency care if the lips, tongue, or breathing are involved.",
  cautionUr:
    "بالغ پیک پر عام طور پر دن میں ایک بار 10 ملی گرام لکھا ہوتا ہے۔ نیند آ سکتی ہے۔ ہونٹ، زبان یا سانس متاثر ہوں تو ایمرجنسی لیں۔",
  brands: [
    {
      id: "rigix-10",
      brand: "Rigix",
      company: "AGP",
      strength: "10 mg",
      packSize: "10 tablets",
      mrpNote: "AGP cetirizine 10 mg. A 2026 public list put Rigix syrup 120 ml near PKR 145 and the 15 ml drops near PKR 135. Ask today's tablet-strip price. Not an official DRAP quote.",
      status: COUNTER,
    },
    {
      id: "ronex-10",
      brand: "Ronex",
      company: "Hilton Pharma",
      strength: "10 mg",
      packSize: "tablets",
      mrpNote: "A cetirizine 10 mg tablet widely stocked in Pakistan. Older lists were lower than Rigix. Ask today's price.",
      status: COUNTER,
    },
    {
      id: "zyrtec-10",
      brand: "Zyrtec",
      company: "Ask the pharmacist for the cetirizine 10 mg pack on the shelf",
      strength: "10 mg",
      packSize: "10 tablets",
      mrpNote: "Illustrative shelf range PKR 150–400. Not today's official MRP.",
      status: COUNTER,
    },
  ],
};

const EMOLLIENT: CareItem = {
  inn: "white soft paraffin",
  atc: "D02AC",
  shelf: "emollient",
  role: "counter",
  whyEn: "A plain moisturiser for dry, itchy skin. It does not treat infection.",
  whyUr: "خشک خارشی جلد کے لیے سادہ نمی۔ یہ انفیکشن کا علاج نہیں۔",
  cautionEn: "Do not start a steroid cream from this screen. A hot, spreading patch or a fever needs a clinician, not more cream.",
  cautionUr: "اس سکرین سے سٹیرائیڈ کریم شروع نہ کریں۔ گرم، پھیلتا ہوا حصہ یا بخار کے لیے کریم نہیں، کلینیشن چاہیے۔",
  brands: [
    {
      id: "vaseline",
      brand: "Vaseline petroleum jelly",
      company: "Unilever",
      strength: "ointment",
      packSize: "jar or tube",
      mrpNote: "Shop price varies. Not a DRAP price quote.",
      status: COUNTER,
    },
  ],
};

const CLOTRIMAZOLE: CareItem = {
  inn: "clotrimazole",
  atc: "D01AC01",
  shelf: "clotrimazole",
  role: "counter",
  whyEn: "A pharmacist often shows an antifungal cream for an adult patch with a round edge. This is not a skin diagnosis.",
  whyUr: "گول کنارے والے بالغ دھبے پر فارماسسٹ اکثر اینٹی فنگل کریم دکھاتا ہے۔ یہ جلد کی تشخیص نہیں۔",
  cautionEn: "Not for the eye, and not for a child on this screen. Stop if it spreads, weeps, or you feel unwell or feverish.",
  cautionUr: "آنکھ کے لیے نہیں، اور اس سکرین پر بچے کے لیے نہیں۔ پھیلے، رسنے لگے، یا طبیعت خراب یا بخار ہو تو روک دیں۔",
  brands: [
    {
      id: "canesten-1",
      brand: "Canesten",
      company: "Bayer",
      strength: "1% cream",
      packSize: "20 g",
      mrpNote: "Illustrative shelf range. Not today's official MRP.",
      status: COUNTER,
    },
    {
      id: "clotrim-pk",
      brand: "Clotrim",
      company: "Pacific Pharmaceuticals",
      strength: "1% cream",
      packSize: "tube",
      mrpNote: "A clotrimazole cream often stocked in Pakistan. Illustrative range. Not today's official MRP.",
      status: COUNTER,
    },
  ],
};

const PARACETAMOL: CareItem = {
  inn: "paracetamol",
  atc: "N02BE01",
  shelf: "paracetamol",
  role: "counter",
  whyEn: "Often discussed for adult pain or fever when emergency rules have not fired. It is not a treatment plan.",
  whyUr: "جب ایمرجنسی قاعدہ نہ چلا ہو، بالغ درد یا بخار پر اکثر بات ہوتی ہے۔ یہ علاج کا منصوبہ نہیں۔",
  cautionEn:
    "Adult packs usually allow 500 mg to 1 g at a time, and not more than 4 g in 24 hours from every paracetamol product, including cold syrups. Do not start it if you have liver disease. Alcohol adds risk.",
  cautionUr:
    "بالغ پیک عام طور پر ایک وقت میں 500 ملی گرام تا 1 گرام، اور 24 گھنٹے میں ہر پیراسیٹامول سے 4 گرام سے زیادہ نہیں، نزلہ کے شربت سمیت۔ جگر کی بیماری ہو تو شروع نہ کریں۔ شراب خطرہ بڑھاتی ہے۔",
  brands: [
    {
      id: "panadol-500",
      brand: "Panadol",
      company: "GSK",
      strength: "500 mg",
      packSize: "20 tablets",
      mrpNote: "DRAP PharmaPrice index, effective 23 July 2026: Panadol 500 mg, pack of 200, PKR 762.93 (about PKR 38 for ten). Haleon. Ask the strip price today.",
      status: COUNTER,
    },
    {
      id: "febrol-500",
      brand: "Febrol",
      company: "Barrett Hodgson",
      strength: "500 mg",
      packSize: "20 tablets",
      mrpNote: "Illustrative shelf range. Not today's official MRP.",
      status: COUNTER,
    },
  ],
};

const CALPOL: CareItem = {
  inn: "paracetamol",
  atc: "N02BE01",
  shelf: "calpol",
  role: "counter",
  whyEn: "A children's paracetamol syrup a pharmacist can match to weight. This screen prints no dose.",
  whyUr: "بچوں کا پیراسیٹامول شربت جسے فارماسسٹ وزن سے ملاتا ہے۔ اس سکرین پر خوراک نہیں لکھی۔",
  cautionEn: "Do not guess millilitres. Do not use an adult tablet for a small child. Liver disease, or paracetamol already given in another syrup, needs the pharmacist before any more is given.",
  cautionUr: "ملی لیٹر اندازے سے نہ دیں۔ چھوٹے بچے کو بالغ گولی نہ دیں۔ جگر کی بیماری، یا دوسرے شربت میں پیراسیٹامول پہلے سے ہو، تو مزید دینے سے پہلے فارماسسٹ۔",
  brands: [
    {
      id: "calpol",
      brand: "Calpol",
      company: "GSK",
      strength: "suspension — strength is on the bottle",
      packSize: "syrup",
      mrpNote: "DRAP index, effective 23 July 2026: Children's Panadol liquid, a 60-millilitre bottle, PKR 77.63. The pharmacist matches the bottle to weight. This screen prints no dose.",
      status: COUNTER,
    },
  ],
};

const ORS: CareItem = {
  inn: "oral rehydration salts",
  atc: "A07CA",
  shelf: "ors",
  role: "counter",
  whyEn: "Useful when a child is drinking less but is still alert. It does not replace a clinician if danger signs appear.",
  whyUr: "جب بچہ کم پی رہا ہو مگر چوکنا ہو۔ خطرے کی علامات ہوں تو یہ کلینیشن کی جگہ نہیں۔",
  cautionEn: "Mix one sachet as the pack says. If the child will not drink, is hard to wake, or has a rash that does not fade, use emergency care instead of staying home.",
  cautionUr: "ایک ساشے پیک کے مطابق ملائیں۔ اگر بچہ پئے نہیں، جاگے نہیں، یا دانہ دبانے پر مٹے نہیں، تو گھر رہنے کے بجائے ایمرجنسی۔",
  brands: [
    {
      id: "peditral",
      brand: "Peditral",
      company: "The Searle Company",
      strength: "sachet",
      packSize: "WHO-style oral rehydration",
      mrpNote: "Searle oral rehydration. A 2026 public list put Peditral solution near PKR 94 a pack. Sachets are also stocked. Ask today's price. Not an official DRAP quote.",
      status: COUNTER,
    },
  ],
};

const METFORMIN: CareItem = {
  inn: "metformin",
  atc: "A10BA02",
  shelf: "metformin",
  role: "clinician-only",
  whyEn: "A tablet clinicians often use after a glucose test. Thirst alone is not a reason to begin it.",
  whyUr: "گلوکوز ٹیسٹ کے بعد کلینیشن اکثر یہ گولی سوچتے ہیں۔ صرف پیاس اس کے شروع کرنے کی وجہ نہیں۔",
  cautionEn:
    "If a doctor already prescribed metformin, a pharmacist can match the same ingredient and strength. Do not begin a first pack from this screen. Kidneys are checked first. This is not a diagnosis of diabetes.",
  cautionUr:
    "اگر ڈاکٹر میٹفارمین پہلے لکھ چکا ہو تو فارماسسٹ وہی جز اور طاقت ملا سکتا ہے۔ پہلا پیک اس سکرین سے شروع نہ کریں۔ گردے پہلے چیک ہوتے ہیں۔ یہ شوگر کی تشخیص نہیں۔",
  brands: [
    {
      id: "glucophage-500",
      brand: "Glucophage",
      company: "Merck",
      strength: "500 mg",
      packSize: "tablets",
      mrpNote: "DRAP index, effective 23 July 2026: Glucophage 500 mg, 5×10, PKR 221.45. Do not start a first pack here.",
      status: LATER,
    },
    {
      id: "neophage-500",
      brand: "Neophage",
      company: "Abbott",
      strength: "500 mg",
      packSize: "tablets",
      mrpNote: "Another metformin 500 mg pack listed on public Pakistan formularies. Only if a doctor already chose this ingredient and strength.",
      status: LATER,
    },
    {
      id: "neodipar-500",
      brand: "Neodipar",
      company: "Aventis / Sanofi",
      strength: "500 mg",
      packSize: "tablets",
      mrpNote: "Metformin, not a sulphonylurea. Punjab public lists have used this name. Only if a doctor already chose this ingredient and strength.",
      status: LATER,
    },
  ],
};

const AMLODIPINE: CareItem = {
  inn: "amlodipine",
  atc: "C08CA01",
  shelf: "amlodipine",
  role: "clinician-only",
  whyEn: "A blood-pressure tablet clinicians often continue after they have checked a reading themselves.",
  whyUr: "فشار کی گولی جو کلینیشن اپنی ریڈنگ کے بعد جاری رکھتے ہیں۔",
  cautionEn:
    "If a doctor already prescribed amlodipine, a pharmacist can match the same ingredient and strength. Do not begin it because a home reading was high. Feeling faint after a new blood-pressure tablet needs urgent care.",
  cautionUr:
    "اگر ڈاکٹر ایملوڈیپین پہلے لکھ چکا ہو تو فارماسسٹ وہی جز اور طاقت ملا سکتا ہے۔ گھر کی ہائی ریڈنگ پر شروع نہ کریں۔ نئی گولی کے بعد بے ہوشی سی کیفیت ہو تو فوری دیکھ بھال۔",
  brands: [
    {
      id: "norvasc-5",
      brand: "Norvasc",
      company: "Pfizer / Viatris",
      strength: "5 mg",
      packSize: "tablets",
      mrpNote: "Illustrative shelf range. Not today's official MRP.",
      status: LATER,
    },
    {
      id: "amdocal-5",
      brand: "Amdocal",
      company: "Hilton Pharma",
      strength: "5 mg",
      packSize: "tablets",
      mrpNote: "A local amlodipine 5 mg pack often stocked in Pakistan. Do not start a first pack from this screen.",
      status: LATER,
    },
  ],
};

const ASPIRIN75: CareItem = {
  inn: "aspirin",
  atc: "B01AC06",
  shelf: "aspirin75",
  role: "counter",
  whyEn:
    "If a heart doctor is not close, and the discomfort only comes on effort and settles with rest, many clinicians later use one 75 mg aspirin a day. This is a humble suggestion, not a signed prescription and not a diagnosis.",
  whyUr:
    "اگر دل کا ڈاکٹر قریب نہ ہو، اور تکلیف صرف محنت پر آئے اور آرام سے ٹھیک ہو، تو بہت سے کلینیشن بعد میں دن میں ایک 75 ملی گرام اسپرین رکھتے ہیں۔ یہ ادب سے تجویز ہے، دستخط شدہ نسخہ نہیں، اور تشخیص نہیں۔",
  cautionEn:
    "The usual adult pack says one 75 mg tablet a day, with food. Skip it with a stomach ulcer, aspirin allergy, bleeding, pregnancy, or if aspirin or a blood thinner is already in use. Pain at rest, sweating, or breathlessness means emergency care, not a pharmacy.",
  cautionUr:
    "بالغ پیک عام طور پر کھانے کے ساتھ دن میں ایک 75 ملی گرام گولی کہتا ہے۔ معدے کا السر، اسپرین سے الرجی، خون بہنا، حمل، یا پہلے سے اسپرین یا خون پتلی دوا ہو تو نہ شروع کریں۔ آرام پر درد، پسینہ، یا سانس پھولنا فارمیسی نہیں، ایمرجنسی ہے۔",
  brands: [
    {
      id: "loprin-75",
      brand: "Loprin",
      company: "Highnoon",
      strength: "75 mg enteric-coated",
      packSize: "30 tablets",
      mrpNote: "Medimart listed Loprin 75 mg, 30 tablets, at PKR 107 in October 2026. Other shops listed about PKR 78–165. Ask today's price. Not an official DRAP quote.",
      status: COUNTER,
    },
    {
      id: "ascard-75",
      brand: "Ascard",
      company: "Atco",
      strength: "75 mg",
      packSize: "30 tablets",
      mrpNote: "A 2026 shop list put Ascard 75, 30 tablets, near PKR 102. Ask today's price. Not an official DRAP quote.",
      status: COUNTER,
    },
  ],
};

const OMEPRAZOLE: CareItem = {
  inn: "omeprazole",
  atc: "A02BC01",
  shelf: "omeprazole",
  role: "counter",
  whyEn:
    "If no doctor is close, and the story is burning after meals without blood, a short course of omeprazole 20 mg is what many pharmacies already stock. A humble suggestion, not a signed prescription and not a cure.",
  whyUr:
    "اگر ڈاکٹر قریب نہ ہو، اور کہانی کھانے کے بعد جلن کی ہو، خون کے بغیر، تو اومیپرازول 20 ملی گرام کا مختصر کورس فارمیسیوں میں عام ہے۔ ادب سے تجویز، دستخط شدہ نسخہ نہیں، علاج نہیں۔",
  cautionEn:
    "Adult packs usually say one 20 mg capsule in the morning, for a short spell, not months. Do not start it with black stool, vomiting blood, trouble swallowing, pregnancy, or for a child. A pharmacist can refuse the pack.",
  cautionUr:
    "بالغ پیک عام طور پر صبح ایک 20 ملی گرام کیپسول کہتا ہے، مختصر مدت کے لیے، مہینوں کے لیے نہیں۔ کالا پاخانہ، خون کی الٹی، نگلنے میں مشکل، حمل، یا بچے کے لیے شروع نہ کریں۔ فارماسسٹ پیک روک سکتا ہے۔",
  brands: [
    {
      id: "risek-20",
      brand: "Risek",
      company: "Getz Pharma",
      strength: "20 mg",
      packSize: "14 capsules",
      mrpNote: "DRAP index, effective 27 July 2026: Risek 20 mg capsules, 2×7, PKR 991.14. Getz. Ask today's pack price. Not an order to buy.",
      status: COUNTER,
    },
    {
      id: "omez-20",
      brand: "Omez",
      company: "Dr. Reddy's",
      strength: "20 mg",
      packSize: "capsules",
      mrpNote: "Another omeprazole 20 mg pack often stocked beside Risek. Ask today's price.",
      status: COUNTER,
    },
  ],
};

const IBUPROFEN: CareItem = {
  inn: "ibuprofen",
  atc: "M01AE01",
  shelf: "ibuprofen",
  role: "counter",
  whyEn:
    "For an adult joint or back that is sore, and no stomach ulcer was reported, a pharmacy often shows ibuprofen with food. Comfort only. Not a diagnosis and not a cure.",
  whyUr:
    "بالغ جوڑ یا کمر کے درد پر، جب السر نہ بتایا گیا ہو، فارمیسی اکثر کھانے کے ساتھ آئبوپروفین دکھاتی ہے۔ صرف آرام۔ تشخیص نہیں اور علاج نہیں۔",
  cautionEn:
    "Adult packs usually allow 400 mg with food, up to three times in 24 hours. Skip it with a stomach ulcer, kidney disease, pregnancy, asthma set off by pain tablets, or if aspirin or a blood thinner is already in use.",
  cautionUr:
    "بالغ پیک عام طور پر کھانے کے ساتھ 400 ملی گرام، 24 گھنٹے میں تین بار تک۔ معدے کا السر، گردے کی بیماری، حمل، درد کی گولی سے دمہ، یا پہلے سے اسپرین یا خون پتلی دوا ہو تو نہ لیں۔",
  brands: [
    {
      id: "brufen-400",
      brand: "Brufen",
      company: "Abbott",
      strength: "400 mg",
      packSize: "tablets",
      mrpNote: "The usual ibuprofen 400 mg name in Pakistan. Ask today's price. Not an official DRAP quote.",
      status: COUNTER,
    },
  ],
};

const CITRATE: CareItem = {
  inn: "potassium citrate",
  atc: "G04BX",
  shelf: "citrate",
  role: "counter",
  whyEn:
    "If no doctor is close, a urinary alkaliser can ease the sting while you arrange a urine test. It is not an antibiotic and it does not clear an infection.",
  whyUr:
    "اگر ڈاکٹر قریب نہ ہو تو پیشاب کی جلن کم کرنے والا ساشے ٹیسٹ تک سہارا ہو سکتا ہے۔ یہ اینٹی بائیوٹک نہیں، اور انفیکشن ختم نہیں کرتا۔",
  cautionEn:
    "Mix one sachet as the pack says, and drink more water unless a doctor has limited fluids. Fever, one-sided back pain, or blood in the urine needs a clinician the same day, not another sachet.",
  cautionUr:
    "ایک ساشے پیک کے مطابق ملائیں، اور پانی زیادہ پئیں جب تک ڈاکٹر نے پانی محدود نہ کیا ہو۔ بخار، کمر کے ایک طرف درد، یا پیشاب میں خون اسی دن کلینیشن مانگتا ہے، مزید ساشے نہیں۔",
  brands: [
    {
      id: "citralka",
      brand: "Citralka",
      company: "Star Laboratories",
      strength: "sachet or liquid",
      packSize: "urinary alkaliser",
      mrpNote: "A potassium citrate pack widely stocked in Pakistan. Ask today's price. Not an official DRAP quote.",
      status: COUNTER,
    },
  ],
};

const TEARS: CareItem = {
  inn: "hypromellose eye drops",
  atc: "S01XA20",
  shelf: "tears",
  role: "counter",
  whyEn:
    "If the eye is itchy or dry, and vision is not worse, a lubricant drop is the usual shop pack. It is not a steroid and not a cure.",
  whyUr:
    "اگر آنکھ خارشی یا خشک ہو، اور نظر کم نہ ہوئی ہو، تو نمی والا قطرہ عام پیک ہے۔ یہ سٹیرائیڈ نہیں اور علاج نہیں۔",
  cautionEn:
    "Do not buy steroid eye drops, including betamethasone drops, from this suggestion. Stop and seek same-day care if vision drops, the eye becomes painful, or light hurts.",
  cautionUr:
    "اس تجویز سے سٹیرائیڈ آنکھ کے قطرے، بیٹامیتھاسون سمیت، نہ خریدیں۔ نظر گرے، آنکھ میں درد ہو، یا روشنی تکلیف دے تو اسی دن دیکھ بھال لیں۔",
  brands: [
    {
      id: "tears-naturale",
      brand: "Tears Naturale",
      company: "Alcon",
      strength: "lubricant drops",
      packSize: "bottle",
      mrpNote: "A common lubricant on Pakistan shelves. Ask today's price. Not an official DRAP quote.",
      status: COUNTER,
    },
    {
      id: "refresh-pk",
      brand: "Refresh Tears",
      company: "Allergan / AbbVie",
      strength: "lubricant drops",
      packSize: "bottle",
      mrpNote: "Another lubricant often stocked beside Tears Naturale. Ask today's price.",
      status: COUNTER,
    },
  ],
};

const SHELVES: Record<ShelfKey, Record<Region, ShelfBrand[]>> = {
  cetirizine: {
    PK: CETIRIZINE.brands,
    AE: [
      {
        id: "zyrtec-ae",
        brand: "Zyrtec",
        company: "Common on UAE pharmacy shelves",
        strength: "10 mg",
        packSize: "10 tablets",
        mrpNote: "Life Pharmacy, Al Manara, and Gulf Pharmacy listed Zyrtec 10 mg, 20 tablets, at AED 39.50 in 2026, VAT included. GSK. Ask today's price.",
        status: COUNTER,
      },
      {
        id: "cet-ae",
        brand: "Cetirizine 10 mg",
        company: "Ask the pharmacist which 10 mg pack is in stock",
        strength: "10 mg",
        packSize: "tablets",
        mrpNote: "Illustrative range AED 8–20. Not today's official price.",
        status: COUNTER,
      },
    ],
    UK: [
      {
        id: "cet-uk",
        brand: "Cetirizine 10 mg",
        company: "Pharmacy own brand, or Piriteze",
        strength: "10 mg",
        packSize: "tablets",
        mrpNote: "Illustrative UK shelf about £1–5 for a small pack. Not an NHS tariff.",
        status: COUNTER,
      },
    ],
    SG: [
      {
        id: "zyrtec-sg",
        brand: "Zyrtec",
        company: "UCB, stocked at Guardian and Watsons",
        strength: "10 mg",
        packSize: "10 tablets",
        mrpNote: "The usual cetirizine name in Singapore. A public shelf listing is often about SGD 12–18 for 10 tablets. Ask today's price. Not an HSA quote.",
        status: COUNTER,
      },
      {
        id: "cet-sg",
        brand: "Cetirizine 10 mg",
        company: "Unity or Guardian house brand",
        strength: "10 mg",
        packSize: "10 tablets",
        mrpNote: "Often about SGD 4–8. Ask the pharmacist to match 10 mg cetirizine. Not today's official price.",
        status: COUNTER,
      },
    ],
  },
  emollient: {
    PK: EMOLLIENT.brands,
    AE: [
      {
        id: "vaseline-ae",
        brand: "Vaseline petroleum jelly",
        company: "Unilever",
        strength: "ointment",
        packSize: "jar or tube",
        mrpNote: "Illustrative Dubai range AED 8–22. Not today's official price.",
        status: COUNTER,
      },
    ],
    UK: [
      {
        id: "paraffin-uk",
        brand: "White soft paraffin, or E45",
        company: "Pharmacy",
        strength: "ointment or cream",
        packSize: "tube",
        mrpNote: "Illustrative UK shelf about £3–10. Not an NHS tariff.",
        status: COUNTER,
      },
    ],
    SG: [
      {
        id: "qv-sg",
        brand: "QV Cream",
        company: "Ego, Guardian and Watsons",
        strength: "cream",
        packSize: "100 g",
        mrpNote: "A plain moisturiser commonly on Singapore shelves. Often about SGD 12–18 for 100 g. Ask today's price.",
        status: COUNTER,
      },
      {
        id: "cetaphil-sg",
        brand: "Cetaphil Moisturising Cream",
        company: "Galderma",
        strength: "cream",
        packSize: "tub",
        mrpNote: "Often about SGD 15–28. Not a steroid. Ask today's price.",
        status: COUNTER,
      },
    ],
  },
  clotrimazole: {
    PK: CLOTRIMAZOLE.brands,
    AE: [
      {
        id: "canesten-ae",
        brand: "Canesten",
        company: "Bayer",
        strength: "1% cream",
        packSize: "20 g",
        mrpNote: "Illustrative Dubai range AED 15–35. Not today's official price.",
        status: COUNTER,
      },
    ],
    UK: [
      {
        id: "canesten-uk",
        brand: "Canesten",
        company: "Bayer",
        strength: "1% cream",
        packSize: "20 g",
        mrpNote: "Illustrative UK shelf about £5–9. Not an NHS tariff.",
        status: COUNTER,
      },
    ],
    SG: [
      {
        id: "canesten-sg",
        brand: "Canesten",
        company: "Bayer, Guardian and Watsons",
        strength: "1% cream",
        packSize: "20 g",
        mrpNote: "The usual clotrimazole cream in Singapore. Often about SGD 9–15. Ask today's price. Not for the eye.",
        status: COUNTER,
      },
    ],
  },
  paracetamol: {
    PK: PARACETAMOL.brands,
    AE: [
      {
        id: "panadol-ae",
        brand: "Panadol",
        company: "GSK",
        strength: "500 mg",
        packSize: "tablets",
        mrpNote: "800 Pharmacy listed Panadol Advance 500 mg, 24 tablets, at AED 14 in 2026. Ask today's price. Not an official tariff.",
        status: COUNTER,
      },
      {
        id: "adol-ae",
        brand: "Adol",
        company: "Julphar",
        strength: "500 mg",
        packSize: "tablets",
        mrpNote: "Julphar paracetamol. Life Pharmacy listed Adol 500 mg, 24 caplets, at AED 4.50 in a 2026 sale (was about AED 10). Ask today's price.",
        status: COUNTER,
      },
    ],
    UK: [
      {
        id: "para-uk",
        brand: "Paracetamol 500 mg",
        company: "Pharmacy own brand, or Panadol",
        strength: "500 mg",
        packSize: "16 tablets",
        mrpNote: "Illustrative UK shelf under £2 for a small pack. Not an NHS tariff.",
        status: COUNTER,
      },
    ],
    SG: [
      {
        id: "panadol-sg",
        brand: "Panadol",
        company: "Haleon, at Guardian, Watsons, and Unity",
        strength: "500 mg",
        packSize: "20 caplets",
        mrpNote: "The usual adult paracetamol pack in Singapore. Often about SGD 6–9 for 20. Ask today's price. Not an HSA quote.",
        status: COUNTER,
      },
      {
        id: "para-sg",
        brand: "Paracetamol 500 mg",
        company: "Unity or Guardian house brand",
        strength: "500 mg",
        packSize: "tablets",
        mrpNote: "Often under SGD 4 for a small pack. Count every paracetamol product, including cold syrups.",
        status: COUNTER,
      },
    ],
  },
  calpol: {
    PK: CALPOL.brands,
    AE: [
      {
        id: "adol-syrup-ae",
        brand: "Adol suspension",
        company: "Julphar",
        strength: "strength is on the bottle",
        packSize: "syrup",
        mrpNote: "Ask for the children's bottle. Illustrative range AED 12–28. Not today's official price.",
        status: COUNTER,
      },
      {
        id: "calpol-ae",
        brand: "Calpol",
        company: "GSK",
        strength: "strength is on the bottle",
        packSize: "syrup",
        mrpNote: "Illustrative range. Not today's official price.",
        status: COUNTER,
      },
    ],
    UK: [
      {
        id: "calpol-uk",
        brand: "Calpol Infant",
        company: "GSK",
        strength: "strength is on the bottle",
        packSize: "syrup",
        mrpNote: "Illustrative UK shelf about £4–8. Not an NHS tariff.",
        status: COUNTER,
      },
    ],
    SG: [
      {
        id: "panadol-child-sg",
        brand: "Panadol Suspension for Children",
        company: "Haleon",
        strength: "strength is on the bottle",
        packSize: "syrup",
        mrpNote: "The usual children's paracetamol in Singapore. Often about SGD 8–14 a bottle. The pharmacist matches it to weight. This screen prints no dose.",
        status: COUNTER,
      },
    ],
  },
  ors: {
    PK: ORS.brands,
    AE: [
      {
        id: "ors-ae",
        brand: "ORS sachet",
        company: "Julphar or the WHO-style sachet on the shelf",
        strength: "sachet",
        packSize: "oral rehydration",
        mrpNote: "Illustrative Dubai range AED 2–8 a sachet. Not today's official price.",
        status: COUNTER,
      },
    ],
    UK: [
      {
        id: "dioralyte-uk",
        brand: "Dioralyte",
        company: "Pharmacy",
        strength: "sachet",
        packSize: "oral rehydration",
        mrpNote: "Illustrative UK shelf about £4–7. Not an NHS tariff.",
        status: COUNTER,
      },
    ],
    SG: [
      {
        id: "hydralyte-sg",
        brand: "Hydralyte",
        company: "Care Pharmaceuticals, Guardian and Watsons",
        strength: "sachet",
        packSize: "oral rehydration",
        mrpNote: "A rehydration sachet commonly stocked in Singapore. Often about SGD 12–20 for a small box. Ask today's price.",
        status: COUNTER,
      },
    ],
  },
  metformin: {
    PK: METFORMIN.brands,
    AE: [
      {
        id: "glucophage-ae",
        brand: "Glucophage",
        company: "Merck",
        strength: "500 mg",
        packSize: "tablets",
        mrpNote: "Illustrative UAE shelf. Only if a doctor already chose this ingredient and strength.",
        status: LATER,
      },
      {
        id: "dialon-ae",
        brand: "Dialon",
        company: "Julphar",
        strength: "500 mg",
        packSize: "tablets",
        mrpNote: "A metformin pack often stocked in UAE pharmacies. Do not start a first pack from this screen.",
        status: LATER,
      },
    ],
    UK: [
      {
        id: "met-uk",
        brand: "Metformin 500 mg",
        company: "NHS prescription item",
        strength: "500 mg",
        packSize: "tablets",
        mrpNote: "Do not start a first pack from this screen.",
        status: LATER,
      },
    ],
    SG: [
      {
        id: "glucophage-sg",
        brand: "Glucophage",
        company: "Merck",
        strength: "500 mg",
        packSize: "tablets",
        mrpNote: "Prescription-only in Singapore. Do not start a first pack from this screen. A small box is often about SGD 8–20 after a doctor has chosen it.",
        status: LATER,
      },
    ],
  },
  amlodipine: {
    PK: AMLODIPINE.brands,
    AE: [
      {
        id: "norvasc-ae",
        brand: "Norvasc",
        company: "Pfizer / Viatris, or a pharmacy amlodipine 5 mg",
        strength: "5 mg",
        packSize: "tablets",
        mrpNote: "Illustrative UAE shelf. Only if a doctor already chose this ingredient and strength.",
        status: LATER,
      },
    ],
    UK: [
      {
        id: "amlo-uk",
        brand: "Amlodipine 5 mg",
        company: "NHS prescription item",
        strength: "5 mg",
        packSize: "tablets",
        mrpNote: "Do not start a first pack from this screen.",
        status: LATER,
      },
    ],
    SG: [
      {
        id: "norvasc-sg",
        brand: "Norvasc",
        company: "Viatris",
        strength: "5 mg",
        packSize: "tablets",
        mrpNote: "Prescription-only in Singapore. Do not start a first pack from this screen. A pharmacist can name the generic amlodipine 5 mg only after a doctor has chosen it.",
        status: LATER,
      },
    ],
  },
  aspirin75: {
    PK: ASPIRIN75.brands,
    AE: [
      {
        id: "jusprin-81",
        brand: "Jusprin",
        company: "Julphar",
        strength: "81 mg",
        packSize: "enteric-coated tablets",
        mrpNote: "Julphar low-dose aspirin. A 2026 listing put Jusprin 81 mg, 30 tablets, near AED 29, and 90 tablets near AED 40. Ask today's price. Not an official tariff.",
        status: COUNTER,
      },
      {
        id: "aspirin-81-ae",
        brand: "Aspirin 81 mg",
        company: "Ask which enteric-coated 75 mg or 81 mg pack is on the shelf",
        strength: "75 mg or 81 mg",
        packSize: "tablets",
        mrpNote: "Match the strength on the pack. Ask today's AED price.",
        status: COUNTER,
      },
    ],
    UK: [
      {
        id: "aspirin-75-uk",
        brand: "Aspirin 75 mg",
        company: "Pharmacy dispersible or enteric-coated pack",
        strength: "75 mg",
        packSize: "tablets",
        mrpNote: "Illustrative UK shelf about £1–4 for a small pack. Not an NHS prescription.",
        status: COUNTER,
      },
    ],
    SG: [
      {
        id: "cardiprin-sg",
        brand: "Cardiprin",
        company: "Reckitt, Guardian and Watsons",
        strength: "100 mg",
        packSize: "30 enteric-coated tablets",
        mrpNote: "The usual low-dose aspirin in Singapore is 100 mg, not 75 mg. Often about SGD 7–12 for 30 tablets. Ask today's price. Not a signed prescription.",
        status: COUNTER,
      },
    ],
  },
  omeprazole: {
    PK: OMEPRAZOLE.brands,
    AE: [
      {
        id: "risek-ae",
        brand: "Risek",
        company: "Julphar",
        strength: "20 mg",
        packSize: "14 capsules",
        mrpNote: "Julphar omeprazole, the usual 20 mg name on UAE shelves (Risek, often 14 capsules). A 2026 public range was about AED 18–40. Ask today's price. Do not swap it for a different acid capsule.",
        status: COUNTER,
      },
      {
        id: "losec-ae",
        brand: "Losec",
        company: "AstraZeneca",
        strength: "20 mg",
        packSize: "capsules",
        mrpNote: "Omeprazole 20 mg, often stocked beside Risek. Illustrative range AED 22–48. Ask today's price.",
        status: COUNTER,
      },
    ],
    UK: [
      {
        id: "omep-uk",
        brand: "Omeprazole 20 mg",
        company: "Pharmacy pack, or Losec",
        strength: "20 mg",
        packSize: "capsules",
        mrpNote: "Illustrative UK shelf about £6–12 for a small pack. Not an NHS tariff.",
        status: COUNTER,
      },
    ],
    SG: [
      {
        id: "losec-sg",
        brand: "Losec",
        company: "AstraZeneca",
        strength: "20 mg",
        packSize: "14 capsules",
        mrpNote: "A pharmacist in Singapore may supply a short omeprazole pack. Often about SGD 18–30 for 14 capsules. Not a doctor's prescription. Ask today's price.",
        status: COUNTER,
      },
      {
        id: "omez-sg",
        brand: "Omez",
        company: "Dr. Reddy's",
        strength: "20 mg",
        packSize: "capsules",
        mrpNote: "Another omeprazole a pharmacist may offer. Do not swap it for a different acid capsule or strength.",
        status: COUNTER,
      },
    ],
  },
  ibuprofen: {
    PK: IBUPROFEN.brands,
    AE: [
      {
        id: "brufen-ae",
        brand: "Brufen",
        company: "Abbott",
        strength: "400 mg",
        packSize: "tablets",
        mrpNote: "Illustrative Dubai range AED 8–20. Ask today's price.",
        status: COUNTER,
      },
    ],
    UK: [
      {
        id: "ibu-uk",
        brand: "Ibuprofen 400 mg",
        company: "Pharmacy own brand, or Nurofen",
        strength: "400 mg",
        packSize: "tablets",
        mrpNote: "Illustrative UK shelf about £2–6. Not an NHS tariff.",
        status: COUNTER,
      },
    ],
    SG: [
      {
        id: "nurofen-sg",
        brand: "Nurofen",
        company: "Reckitt, Guardian and Watsons",
        strength: "as printed, often 200 mg",
        packSize: "tablets",
        mrpNote: "The usual ibuprofen name in Singapore. Match the strength on the pack. A small pack is often about SGD 8–16. Not for a stomach ulcer.",
        status: COUNTER,
      },
    ],
  },
  citrate: {
    PK: CITRATE.brands,
    AE: [
      {
        id: "citrate-ae",
        brand: "Ural",
        company: "Aspen",
        strength: "sachet",
        packSize: "urinary alkaliser",
        mrpNote: "A urinary alkaliser commonly stocked in UAE pharmacies. Illustrative range AED 15–35. Not an antibiotic. Ask today's price.",
        status: COUNTER,
      },
    ],
    UK: [
      {
        id: "cystal-uk",
        brand: "Potassium citrate mixture",
        company: "Pharmacy",
        strength: "as the pack says",
        packSize: "mixture or sachets",
        mrpNote: "Illustrative UK shelf about £5–10. Not an antibiotic and not an NHS tariff.",
        status: COUNTER,
      },
    ],
    SG: [
      {
        id: "ural-sg",
        brand: "Ural",
        company: "Aspen, Guardian",
        strength: "sachet",
        packSize: "urinary alkaliser",
        mrpNote: "A urinary alkaliser commonly stocked in Singapore. Often about SGD 12–22 a box. Not an antibiotic. Ask today's price.",
        status: COUNTER,
      },
    ],
  },
  tears: {
    PK: TEARS.brands,
    AE: [
      {
        id: "systane-ae",
        brand: "Systane",
        company: "Alcon",
        strength: "lubricant drops",
        packSize: "bottle",
        mrpNote: "Illustrative Dubai range AED 18–40. Not a steroid. Ask today's price.",
        status: COUNTER,
      },
      {
        id: "refresh-ae",
        brand: "Refresh Tears",
        company: "Allergan / AbbVie",
        strength: "lubricant drops",
        packSize: "bottle",
        mrpNote: "Another lubricant often stocked in UAE pharmacies. Not today's official price.",
        status: COUNTER,
      },
    ],
    UK: [
      {
        id: "hypromellose-uk",
        brand: "Hypromellose eye drops",
        company: "Pharmacy own brand",
        strength: "lubricant drops",
        packSize: "bottle",
        mrpNote: "Illustrative UK shelf about £2–6. Not a steroid and not an NHS tariff.",
        status: COUNTER,
      },
    ],
    SG: [
      {
        id: "systane-sg",
        brand: "Systane",
        company: "Alcon, Guardian and Watsons",
        strength: "lubricant drops",
        packSize: "bottle",
        mrpNote: "A lubricant commonly stocked in Singapore. Often about SGD 14–24 a bottle. Not a steroid. Ask today's price.",
        status: COUNTER,
      },
      {
        id: "refresh-sg",
        brand: "Refresh Tears",
        company: "AbbVie",
        strength: "lubricant drops",
        packSize: "bottle",
        mrpNote: "Another lubricant on the same shelves. Not today's official price.",
        status: COUNTER,
      },
    ],
  },
};

function line(en: string, ur: string, rank: CareLine["rank"] = "also"): CareLine {
  return { en, ur, rank };
}

const STOP = line(
  "Stop if breathing, alertness, or pain gets worse, or if a rash spreads. These are humble household steps used in many homes in Pakistan and the Gulf. They are not a prescription and not a cure.",
  "اگر سانس، ہوش، یا درد بگڑے، یا دانے پھیلیں تو روک دیں۔ یہ پاکستان اور خلیج کے بہت سے گھروں میں ادب سے گھریلو قدم ہیں۔ نسخہ نہیں اور علاج نہیں۔",
);

/** Household steps only when neither a hospital nor a dispensary can be reached. */
export function homeRemedies(routing: RoutingDecision, intake: Intake): CareLine[] {
  if (intake.reachCare !== "neither") return [];
  if (routing.urgency === "RED" || routing.halted) return [];

  if (intake.pregnant === "yes" || intake.pregnant === "unknown") {
    return [
      line(
        "No home mixture in pregnancy. Clean water, rest, and the journey to a maternity clinician when the road allows. A neighbour's tablet or herbal paste is not a safe bridge.",
        "حمل میں کوئی گھریلو مخلوط چیز نہیں۔ صاف پانی، آرام، اور جب راستہ ملے زچگی کے کلینیشن تک سفر۔ پڑوسی کی گولی یا جڑی بوٹی کا لیپ محفوظ سہارا نہیں۔",
      ),
    ];
  }
  if (intake.ageBand === "0-28d") {
    return [
      line(
        "Keep usual feeds, keep the baby warm, and do not give water, honey, gripe water, or a home mixture. A baby this young should be seen as soon as travel is possible.",
        "معمول کا دودھ جاری رکھیں، بچے کو گرم رکھیں، اور پانی، شہد، گریپ واٹر، یا گھریلو مخلوط چیز نہ دیں۔ اتنی کم عمر کے بچے کو جتنا جلد سفر ممکن ہو دکھانا چاہیے۔",
      ),
    ];
  }

  const infant = intake.ageBand === "1m-5y";
  const rows: CareLine[] = [];
  const story = storyOf(intake);

  const ors = line(
    "If stools are loose or drinking is down, and the person is awake and can swallow: one litre of water that was boiled and then cooled, six level teaspoons of sugar, and half a level teaspoon of salt. It should taste no saltier than tears. If it tastes very salty, throw it away and start again. Sip often. This is the usual home oral rehydration in Pakistan and the Gulf.",
    "اگر پاخانہ ڈھیلا ہو یا پینا کم ہو، اور شخص جاگ رہا ہو اور نگل سکتا ہو: ایک لیٹر پانی جو ابال کر ٹھنڈا کیا گیا ہو، چھ ہموار چمچ چینی، اور آدھا ہموار چمچ نمک۔ ذائقہ آنسوؤں سے زیادہ نمکین نہ ہو۔ اگر بہت نمکین لگے تو پھینک کر دوبارہ بنائیں۔ تھوڑا تھوڑا پئیں۔ یہ پاکستان اور خلیج میں گھریلو نمکیہ پانی کا عام طریقہ ہے۔",
  );

  if (routing.primarySpecialty === "dermatology") {
    rows.push(
      intake.cluster.fever === "yes" || intake.cluster.spread === "yes" || intake.cluster.skinHot === "yes" || intake.cluster.eye === "yes"
        ? line(
            "Do not put toothpaste, surma, or a neighbour's steroid cream on a hot, spreading, or eye-side rash. A clean cloth with cool boiled water, loose cotton clothes, and travel when you can.",
            "گرم، پھیلتے، یا آنکھ کے پاس دانوں پر ٹوتھ پیسٹ، سُرما، یا پڑوسی کی سٹیرائیڈ کریم نہ لگائیں۔ ٹھنڈے ابالے پانی میں صاف کپڑا، ڈھیلا سوتی کپڑا، اور جب ہو سکے سفر۔",
          )
        : line(
            "Wash with plain water only. Press a clean cloth dipped in cool boiled water on the itch for about ten minutes. Wear loose cotton. If the skin is dry and not weeping, a little plain petroleum jelly already in the house is enough. Do not use toothpaste, surma, or a steroid cream from a neighbour.",
            "صرف سادہ پانی سے دھوئیں۔ ٹھنڈے ابالے پانی میں بھگويا صاف کپڑا خارش پر تقریباً دس منٹ رکھیں۔ ڈھیلا سوتی پہنیں۔ اگر جلد خشک ہو اور نہ رس رہی ہو تو گھر میں موجود تھوڑی سادہ ویزلین کافی ہے۔ ٹوتھ پیسٹ، سُرما، یا پڑوسی کی سٹیرائیڈ کریم استعمال نہ کریں۔",
          ),
    );
  } else if (routing.primarySpecialty === "cardiology") {
    rows.push(
      line(
        "Sit and rest. Do not climb stairs to test whether it has gone. Garlic, lemon, and honey are not a heart treatment. Do not travel only to buy a tablet.",
        "بیٹھ کر آرام کریں۔ یہ جانچنے کے لیے سیڑھیاں نہ چڑھیں کہ درد گیا یا نہیں۔ لہسن، لیموں، اور شہد دل کا علاج نہیں۔ صرف گولی خریدنے کے لیے سفر نہ کریں۔",
      ),
    );
  } else if (routing.primarySpecialty === "pediatrics") {
    rows.push(
      line(
        "Keep usual feeds, including breast milk. Light clothing if there is fever. No adult tablet, no aspirin, and no honey. Do not steam a child's face.",
        "معمول کا کھانا جاری رکھیں، ماں کا دودھ سمیت۔ بخار ہو تو ہلکے کپڑے۔ بالغ گولی نہیں، اسپرین نہیں، اور شہد نہیں۔ بچے کے چہرے پر بھاپ نہ لیں۔",
      ),
    );
    if (intake.cluster.drinking === "yes" || intake.cluster.fever === "yes") rows.push(ors);
  } else if (routing.primarySpecialty === "psychiatry") {
    rows.push(
      line(
        "No herbal sedative and no tablet from a neighbour. Drink water, eat a meal, keep a regular hour for sleep, and stay with someone if you can. Thoughts of self-harm are emergency care, not a home mixture.",
        "کوئی جڑی بوٹی کی نیند کی چیز نہیں اور پڑوسی کی گولی نہیں۔ پانی پئیں، کھانا کھائیں، نیند کا ایک مقرر وقت رکھیں، اور اگر ہو سکے تو کسی کے ساتھ رہیں۔ اپنے آپ کو نقصان کے خیالات ایمرجنسی ہیں، گھریلو مخلوط چیز نہیں۔",
      ),
    );
  } else if (story === "gut" && intake.cluster.blood === "yes") {
    rows.push(
      line(
        "Blood, black stool, or vomiting blood is not a home-remedy problem. Sip clean water only if fully awake, and travel as soon as you can. Do not take baking soda.",
        "خون، کالا پاخانہ، یا خون کی الٹی گھریلو علاج کا معاملہ نہیں۔ صرف اگر پوری طرح جاگ رہے ہوں تو صاف پانی کے گھونٹ، اور جتنا جلد ہو سفر کریں۔ میٹھا سوڈا نہ لیں۔",
      ),
    );
  } else if (story === "gut") {
    if (intake.cluster.loose === "yes") {
      rows.push(ors);
      rows.push(
        line(
          "Keep eating small amounts: rice, a banana, and plain yoghurt (dahi) if it is already in the house. Boil drinking water.",
          "تھوڑی مقدار میں کھاتے رہیں: چاول، کیلا، اور سادہ دہی اگر گھر میں پہلے سے ہو۔ پینے کا پانی ابالیں۔",
        ),
      );
    }
    if (intake.cluster.burn === "yes" || intake.cluster.loose !== "yes") {
      rows.push(
        line(
          "Small meals, and stay sitting up after eating. Skip very late oily food. Plain yoghurt is fine if it suits you. Do not take baking soda as a habit.",
          "چھوٹے کھانے، اور کھانے کے بعد بیٹھے رہیں۔ بہت دیر کی تلی چیز چھوڑ دیں۔ سادہ دہی ٹھیک ہے اگر آپ کو راس آئے۔ میٹھا سوڈا عادت سے نہ لیں۔",
        ),
      );
    }
  } else if (story === "urine") {
    rows.push(
      intake.cluster.fever === "yes" || intake.cluster.flank === "yes" || intake.cluster.urineBlood === "yes"
        ? line(
            "Extra plain water is the only home step. Do not take an antibiotic from a neighbour. Blood, fever, or one-sided back pain needs a clinician as soon as you can travel.",
            "زیادہ سادہ پانی ہی واحد گھریلو قدم ہے۔ پڑوسی سے اینٹی بائیوٹک نہ لیں۔ خون، بخار، یا کمر کے ایک طرف درد کے لیے جتنا جلد سفر ہو کلینیشن چاہیے۔",
          )
        : line(
            "Drink more plain water through the day and do not hold urine. No antibiotic from a neighbour, and no herbal paste.",
            "دن بھر زیادہ سادہ پانی پئیں اور پیشاب روک کر نہ رکھیں۔ پڑوسی سے اینٹی بائیوٹک نہیں، اور جڑی بوٹی کا لیپ نہیں۔",
          ),
    );
  } else if (story === "cough") {
    rows.push(
      intake.cluster.coughBlood === "yes"
        ? line(
            "Blood in the phlegm is not a home-remedy problem. No cough syrup and no steam. Travel as soon as you can.",
            "بلغم میں خون گھریلو علاج کا معاملہ نہیں۔ کوئی کھانسی کا شربت نہیں اور بھاپ نہیں۔ جتنا جلد ہو سفر کریں۔",
          )
        : line(
            infant
              ? "Warm drinks if the child will take them. No honey under one year, no cough syrup, and do not steam the child's face."
              : "Warm drinks. One teaspoon of honey can soothe a cough in an adult or a child over one year. Adults may gargle warm salt water. Do not steam a child's face.",
            infant
              ? "اگر بچہ پی لے تو گرم مشروب۔ ایک سال سے کم عمر کو شہد نہیں، کھانسی کا شربت نہیں، اور بچے کے چہرے پر بھاپ نہیں۔"
              : "گرم مشروب۔ بالغ یا ایک سال سے بڑے بچے کی کھانسی پر ایک چمچ شہد سکون دے سکتا ہے۔ بالغ گرم نمکین پانی سے غرارہ کر سکتے ہیں۔ بچے کے چہرے پر بھاپ نہ لیں۔",
          ),
    );
  } else if (story === "joint") {
    rows.push(
      line(
        "Rest that part. If it is newly swollen, a clean cloth with cool water, not ice straight on the skin, and do not bind it tightly. No pain tablet from a neighbour.",
        "اس حصے کو آرام دیں۔ اگر نئی سوجن ہو تو ٹھنڈے پانی میں صاف کپڑا، برف سیدھی جلد پر نہیں، اور کس کر نہ باندھیں۔ پڑوسی کی درد کی گولی نہیں۔",
      ),
    );
  } else if (story === "eye") {
    rows.push(
      line(
        "Do not put surma, kohl, rose water, honey, or breast milk in the eye. Wash your hands and do not rub. If vision is worse or the eye is painful, travel as soon as you can and put nothing in it while you wait.",
        "آنکھ میں سُرما، کاجل، عرق گلاب، شہد، یا ماں کا دودھ نہ ڈالیں۔ ہاتھ دھوئیں اور مَلیں نہیں۔ اگر نظر کم ہو یا آنکھ میں درد ہو تو جتنا جلد ہو سفر کریں اور انتظار میں کچھ نہ ڈالیں۔",
      ),
    );
  } else if (sugarStory(intake)) {
    rows.push(
      line(
        "Drink plain water. Do not start bitter gourd, fenugreek, or cinnamon as a cure. If a glucose meter is already in the house, write the number down for the clinician. Collapse or very fast breathing is emergency care, not a home mixture.",
        "سادہ پانی پئیں۔ کریلے، میتھی، یا دار چینی کو علاج کے طور پر شروع نہ کریں۔ اگر گلوکوز میٹر گھر میں پہلے سے ہو تو نمبر کلینیشن کے لیے لکھ لیں۔ بے ہوشی یا بہت تیز سانس ایمرجنسی ہے، گھریلو مخلوط چیز نہیں۔",
      ),
    );
  } else if (bpStory(intake)) {
    rows.push(
      line(
        "Sit quietly for five minutes and do not start a blood-pressure tablet from a neighbour. Less salt in food is a habit, not an emergency treatment. Headache with weakness or a fainting feeling needs the emergency path.",
        "پانچ منٹ خاموش بیٹھیں اور پڑوسی سے فشار کی گولی شروع نہ کریں۔ کھانے میں کم نمک ایک عادت ہے، ایمرجنسی علاج نہیں۔ کمزوری یا بے ہوشی جیسی کیفیت کے ساتھ سر درد ایمرجنسی راستہ مانگتا ہے۔",
      ),
    );
  } else {
    rows.push(
      line(
        intake.cluster.fever === "yes"
          ? "Rest, plain water, and light clothing. No antibiotic from a neighbour. Boil drinking water."
          : "Rest and plain water. Boil drinking water. No tablet from a neighbour.",
        intake.cluster.fever === "yes"
          ? "آرام، سادہ پانی، اور ہلکے کپڑے۔ پڑوسی سے اینٹی بائیوٹک نہیں۔ پینے کا پانی ابالیں۔"
          : "آرام اور سادہ پانی۔ پینے کا پانی ابالیں۔ پڑوسی کی گولی نہیں۔",
      ),
    );
  }

  rows.push(STOP);
  return rows;
}

function localize(item: CareItem, market: Region): CareItem {
  return { ...item, brands: SHELVES[item.shelf][market] };
}

function isChild(intake: Intake): boolean {
  return (
    intake.forWhom === "child" ||
    intake.ageBand === "0-28d" ||
    intake.ageBand === "1m-5y" ||
    intake.ageBand === "6-15"
  );
}

function sugarStory(intake: Intake): boolean {
  return (
    clusterFor(intake.complaint, intake.ageBand, intake.forWhom) === "metabolic" ||
    intake.cluster.thirst === "yes" ||
    intake.cluster.knownSugar === "yes"
  );
}

function storyOf(intake: Intake): ClusterId {
  return clusterFor(intake.complaint, intake.ageBand, intake.forWhom);
}

function bpStory(intake: Intake): boolean {
  return /\bbp\b|blood pressure|فشار/i.test(intake.complaint);
}

function hold(en: string, ur: string): CarePacket {
  return { tests: [], counter: [], clinicianOnly: [], withheldEn: en, withheldUr: ur };
}

export function careFor(routing: RoutingDecision, intake: Intake): CarePacket {
  if (routing.urgency === "RED" || routing.halted) {
    return hold(
      "No medicine and no community test. Emergency care comes first.",
      "کوئی دوا نہیں اور کوئی بیرونی ٹیسٹ نہیں۔ پہلے ایمرجنسی دیکھ بھال۔",
    );
  }

  const pregnant = intake.pregnant === "yes" || intake.pregnant === "unknown";
  const child = isChild(intake);
  const specialty: SpecialtyId = routing.primarySpecialty;
  const tests: CareLine[] = [];
  const counter: CareItem[] = [];
  const clinicianOnly: CareItem[] = [];

  if (pregnant) {
    tests.push(
      line(
        "A maternity clinician should review this. Do not use a normal home result to decide it can wait.",
        "زچگی کا کلینیشن یہ دیکھے۔ گھر کے نارمل نتیجے سے یہ نہ طے کریں کہ انتظار ہو سکتا ہے۔",
      ),
    );
  }

  if (specialty === "dermatology") {
    tests.push(
      line(
        "Most useful next check: a skin doctor looks at the rash in daylight — the edge, whether it is hot, and the nails. This app does not say what a photograph shows. No blood test comes before that look.",
        "سب سے مفید اگلی جانچ: جلد کا ڈاکٹر دن کی روشنی میں دانے دیکھے — کنارہ، گرمی، اور ناخن۔ یہ ایپ نہیں بتاتی کہ تصویر میں کیا ہے۔ اس نظر سے پہلے خون کا ٹیسٹ نہیں۔",
        "most",
      ),
      line(
        intake.cluster.fever === "yes" || intake.cluster.spread === "yes"
          ? "Fever or a hot spreading patch needs same-day review. A cream at home is not the test."
          : "A simple itch without fever does not need a routine blood test from this app.",
        intake.cluster.fever === "yes" || intake.cluster.spread === "yes"
          ? "بخار یا گرم پھیلتا حصہ اسی دن دیکھنا چاہیے۔ گھر کی کریم ٹیسٹ نہیں۔"
          : "بخار کے بغیر سادہ خارش کے لیے اس ایپ سے معمول کا خون کا ٹیسٹ نہیں۔",
      ),
    );
    if (intake.cluster.round === "yes") {
      tests.push(
        line(
          "A round-edged patch: a clinician may take a skin scraping. Do not decide it is a fungus from this screen.",
          "گول کنارے والا دھبہ: کلینیشن جلد کا نمونہ لے سکتا ہے۔ اس سکرین سے یہ فنگس طے نہ کریں۔",
        ),
      );
    }
    if (intake.cluster.eye === "yes") {
      tests.push(
        line(
          "Eyes, eyelids, or lips need a same-day look. Do not put a cream near the eye from this screen.",
          "آنکھ، پلک یا ہونٹ اسی دن دکھانے ہیں۔ اس سکرین سے آنکھ کے قریب کریم نہ لگائیں۔",
          "most",
        ),
      );
    }
    if (intake.cluster.night === "yes") {
      tests.push(
        line(
          "Itch that wakes you at night needs eyes-on review before any insecticide cream. This app will not name one to buy.",
          "رات کو جگانے والی خارش کے لیے آنکھوں سے جائزہ، کسی کیڑے مار کریم سے پہلے۔ یہ ایپ خریدنے کا نام نہیں لے گی۔",
        ),
      );
    }
    if (!pregnant && !child && intake.cluster.fever !== "yes" && intake.cluster.spread !== "yes" && intake.cluster.eye !== "yes" && intake.cluster.skinHot !== "yes") {
      counter.push(CETIRIZINE, EMOLLIENT);
      if (intake.cluster.round === "yes") counter.push(CLOTRIMAZOLE);
    } else if (!pregnant && !child && intake.cluster.eye === "yes" && intake.cluster.fever !== "yes" && intake.cluster.spread !== "yes" && intake.cluster.skinHot !== "yes") {
      counter.push(CETIRIZINE);
    }
  } else if (specialty === "cardiology") {
    tests.push(
      line(
        "Most useful next check: a 12-lead ECG, read by a clinician, the same day if the discomfort is recent.",
        "سب سے مفید اگلی جانچ: بارہ لیڈ ای سی جی، جو کلینیشن پڑھے، اگر تکلیف نئی ہو تو اسی دن۔",
        "most",
      ),
      line(
        "Blood pressure in both arms. A clinician decides whether blood tests are needed. Do not book those instead of emergency care if the pain is severe.",
        "دونوں بازوؤں میں فشار۔ خون کے ٹیسٹ چاہیے یا نہیں، کلینیشن طے کرے۔ درد شدید ہو تو ان کے لیے ایمرجنسی نہ روکیں۔",
      ),
      line(
        "If this is not an emergency, a cholesterol check and a fasting glucose are reasonable screening to discuss. They are not a diagnosis.",
        "اگر ایمرجنسی نہ ہو تو کولیسٹرول اور خالی پیٹ گلوکوز بات کے قابل اسکریننگ ہے۔ یہ تشخیص نہیں۔",
      ),
    );
    if (!pregnant && !child && intake.cluster.rest !== "yes" && !aspirinBlocked(intake)) {
      counter.push(ASPIRIN75);
    }
  } else if (specialty === "pediatrics") {
    tests.push(
      line(
        intake.cluster.fever === "yes" || intake.cluster.drinking === "yes" || intake.cluster.rash === "yes"
          ? "Most useful next check: a clinician sees the child the same day."
          : "Most useful next check: a clinician sees the child, including how alert and how well they drink.",
        intake.cluster.fever === "yes" || intake.cluster.drinking === "yes" || intake.cluster.rash === "yes"
          ? "سب سے مفید اگلی جانچ: کلینیشن بچے کو اسی دن دیکھے۔"
          : "سب سے مفید اگلی جانچ: کلینیشن بچے کو دیکھے، چوکنا پن اور پینے سمیت۔",
        "most",
      ),
      line(
        "Weight comes before any children's medicine. This app does not calculate a dose.",
        "بچوں کی کسی دوا سے پہلے وزن۔ یہ ایپ خوراک نہیں نکالتی۔",
      ),
      line(
        "Ongoing fever, a rash, or poorer drinking needs same-day review. No antibiotic is suggested.",
        "جاری بخار، دانے، یا کم پینے کے لیے اسی دن جائزہ۔ کوئی اینٹی بائیوٹک تجویز نہیں۔",
      ),
    );
    if (intake.cluster.fever === "yes" && intake.cluster.feverLong === "yes") {
      tests.push(
        line(
          "Fever longer than three days: a clinician may check the urine. This app does not order that test.",
          "تین دن سے زیادہ بخار: کلینیشن پیشاب چیک کر سکتا ہے۔ یہ ایپ وہ ٹیسٹ آرڈر نہیں کرتی۔",
        ),
      );
    }
    if (!pregnant) {
      if (intake.cluster.drinking === "yes") counter.push(ORS);
      if (intake.cluster.fever === "yes" || intake.severity >= 4) counter.push(CALPOL);
    }
  } else if (specialty === "psychiatry") {
    tests.push(
      line(
        "Most useful next check: a same-day conversation about safety, sleep, and whether daily tasks are slipping.",
        "سب سے مفید اگلی جانچ: اسی دن حفاظت، نیند، اور روزانہ کاموں پر بات۔",
        "most",
      ),
      line(
        "No blood test is required before that conversation. No mental-health tablet is suggested.",
        "اس بات سے پہلے خون کا ٹیسٹ لازم نہیں۔ ذہنی صحت کی کوئی گولی تجویز نہیں۔",
      ),
    );
  } else {
    const story = storyOf(intake);
    if (story === "gut") {
      tests.push(
        line(
          "Most useful next check: a clinician examines the abdomen. Black stool or vomiting blood should not wait for a routine slot.",
          "سب سے مفید اگلی جانچ: کلینیشن پیٹ دیکھے۔ کالا پاخانہ یا خون کی الٹی معمول کی باری کا انتظار نہیں۔",
          "most",
        ),
        line(
          intake.cluster.loose === "yes"
            ? "Loose stools: a stool check only if a clinician asks, especially if there is blood. No antibiotic is suggested."
            : "Burning after meals does not need a routine blood test from this app.",
          intake.cluster.loose === "yes"
            ? "ڈھیلا پاخانہ: ٹیسٹ تب جب کلینیشن کہے، خاص طور پر خون ہو تو۔ کوئی اینٹی بائیوٹک تجویز نہیں۔"
            : "کھانے کے بعد جلن کے لیے اس ایپ سے معمول کا خون کا ٹیسٹ نہیں۔",
        ),
      );
      if (!pregnant && !child && intake.cluster.blood !== "yes") {
        if (intake.cluster.burn === "yes" || /acidity|heartburn|تیزاب/i.test(intake.complaint)) counter.push(OMEPRAZOLE);
        if (intake.cluster.loose === "yes") counter.push(ORS);
      }
    } else if (story === "urine") {
      tests.push(
        line(
          "Most useful next check: a urine dip the same day, and a culture if a clinician asks. This app does not name an infection.",
          "سب سے مفید اگلی جانچ: اسی دن پیشاب کا ڈپ، اور کلچر اگر کلینیشن کہے۔ یہ ایپ انفیکشن کا نام نہیں لیتی۔",
          "most",
        ),
        line(
          "Drink water unless a doctor has limited fluids. No antibiotic is suggested from a shop list.",
          "پانی پئیں جب تک ڈاکٹر نے پانی محدود نہ کیا ہو۔ دکان کی فہرست سے کوئی اینٹی بائیوٹک تجویز نہیں۔",
        ),
      );
      if (!pregnant && !child && intake.cluster.fever !== "yes" && intake.cluster.flank !== "yes" && intake.cluster.urineBlood !== "yes") {
        counter.push(CITRATE);
      }
    } else if (story === "cough") {
      const bloody = intake.cluster.coughBlood === "yes";
      tests.push(
        line(
          bloody
            ? "Most useful next check: a clinician listens to the chest the same day because there is blood in the phlegm. No antibiotic and no cough syrup is suggested."
            : intake.cluster.fever === "yes" || intake.cluster.longCough === "yes"
              ? "Most useful next check: a clinician listens to the chest the same day. No antibiotic is suggested."
              : "Most useful next check: a clinician listens to the chest if the cough is not settling. No antibiotic is suggested.",
          bloody
            ? "سب سے مفید اگلی جانچ: بلغم میں خون کی وجہ سے کلینیشن اسی دن سینہ سنے۔ کوئی اینٹی بائیوٹک اور کوئی کھانسی کا شربت تجویز نہیں۔"
            : intake.cluster.fever === "yes" || intake.cluster.longCough === "yes"
              ? "سب سے مفید اگلی جانچ: کلینیشن اسی دن سینہ سنے۔ کوئی اینٹی بائیوٹک تجویز نہیں۔"
              : "سب سے مفید اگلی جانچ: اگر کھانسی نہ رُکے تو کلینیشن سینہ سنے۔ کوئی اینٹی بائیوٹک تجویز نہیں۔",
          "most",
        ),
        line(
          intake.cluster.sweats === "yes"
            ? "Night sweats or unplanned weight loss with a lasting cough: a clinician should listen to the chest the same day, and usually request a chest X-ray. No antibiotic is suggested."
            : bloody
              ? "A chest X-ray is often the next screening after that examination. Do not buy a syrup instead of being seen."
              : "A chest X-ray is for the clinician to request, not a reason to skip the examination.",
          intake.cluster.sweats === "yes"
            ? "دیرینہ کھانسی کے ساتھ رات کا پسینہ یا بغیر ارادہ وزن گرنا: کلینیشن اسی دن سینہ سنے، اور عام طور پر سینے کا ایکسرے۔ کوئی اینٹی بائیوٹک تجویز نہیں۔"
            : bloody
              ? "اس معائنہ کے بعد سینے کا ایکسرے اکثر اگلی جانچ ہے۔ دیکھے جانے کے بجائے شربت نہ خریدیں۔"
              : "سینے کا ایکسرے کلینیشن منگوائے، معائنہ چھوڑنے کی وجہ نہیں۔",
          intake.cluster.sweats === "yes" ? "most" : "also",
        ),
      );
      if (!bloody && !pregnant && !child && (intake.cluster.fever === "yes" || intake.severity >= 4)) counter.push(PARACETAMOL);
    } else if (story === "joint") {
      tests.push(
        line(
          "Most useful next check: a clinician looks at the joint or the back, including whether it is hot or swollen.",
          "سب سے مفید اگلی جانچ: کلینیشن جوڑ یا کمر دیکھے، گرم یا سوجا ہے یا نہیں۔",
          "most",
        ),
        line(
          intake.cluster.fever === "yes"
            ? "Fever with a joint needs same-day review. No antibiotic is suggested."
            : "An X-ray is not the first step for a simple sore joint. The clinician decides.",
          intake.cluster.fever === "yes"
            ? "جوڑ کے ساتھ بخار اسی دن دیکھنا چاہیے۔ کوئی اینٹی بائیوٹک تجویز نہیں۔"
            : "سادہ درد کے لیے ایکسرے پہلا قدم نہیں۔ کلینیشن طے کرے۔",
        ),
      );
      if (!pregnant && !child && intake.cluster.fever !== "yes") {
        counter.push(PARACETAMOL);
        if (intake.cluster.stomach !== "yes") counter.push(IBUPROFEN);
      }
    } else if (story === "eye") {
      const urgentEye = intake.cluster.vision === "yes" || intake.cluster.eyePain === "yes" || intake.cluster.light === "yes";
      tests.push(
        line(
          urgentEye
            ? "Most useful next check: someone who can look at the eye, the same day. Do not start drops while you wait."
            : "Most useful next check: someone who can look at the eye. This app does not say what the eye shows.",
          urgentEye
            ? "سب سے مفید اگلی جانچ: آنکھ دیکھ سکنے والا شخص، اسی دن۔ انتظار میں قطرے شروع نہ کریں۔"
            : "سب سے مفید اگلی جانچ: آنکھ دیکھ سکنے والا شخص۔ یہ ایپ نہیں بتاتی آنکھ میں کیا ہے۔",
          "most",
        ),
        line(
          "Do not buy steroid eye drops from a shop. They can harm an eye that has not been examined.",
          "دکان سے سٹیرائیڈ آنکھ کے قطرے نہ خریدیں۔ بغیر معائنہ آنکھ کو نقصان ہو سکتا ہے۔",
        ),
      );
      if (!pregnant && !child && !urgentEye) counter.push(TEARS);
    } else if (sugarStory(intake)) {
      tests.push(
        line(
          "Most useful next checks: a blood glucose, fasting or random, and an HbA1c.",
          "سب سے مفید اگلی جانچ: خون میں گلوکوز، خالی پیٹ یا بے ترتیب، اور HbA1c۔",
          "most",
        ),
        line(
          "Before any diabetes tablet: blood pressure, a urine protein check, a kidney test (creatinine), and a cholesterol check.",
          "شوگر کی کسی گولی سے پہلے فشار، پیشاب میں پروٹین، گردے کا ٹیسٹ (کریٹینائن)، اور کولیسٹرول۔",
        ),
        line(
          "Screening a diabetes clinic usually adds later: the eyes for retinopathy, and the feet. Those are not shop tests, and thirst alone is not a diagnosis.",
          "شوگر کلینک بعد میں آنکھوں کی جانچ اور پاؤں دیکھتا ہے۔ یہ دکان کے ٹیسٹ نہیں، اور صرف پیاس تشخیص نہیں۔",
        ),
        line(
          "Very fast breathing, repeated vomiting, or collapse is emergency care, not a wait for HbA1c.",
          "بہت تیز سانس، بار بار الٹی، یا گر جانا ایمرجنسی ہے، HbA1c کا انتظار نہیں۔",
        ),
      );
      clinicianOnly.push(METFORMIN);
    } else if (bpStory(intake)) {
      tests.push(
        line(
          "Most useful next check: blood pressure again after five quiet minutes. A clinician may check both arms.",
          "سب سے مفید اگلی جانچ: پانچ منٹ خاموش بیٹھ کر فشار دوبارہ۔ کلینیشن دونوں بازو دیکھ سکتا ہے۔",
          "most",
        ),
        line(
          "Screening often added once: urine, a kidney test, glucose, and cholesterol. Not a shop list of tablets.",
          "اکثر ساتھ میں: پیشاب، گردے کا ٹیسٹ، گلوکوز، اور کولیسٹرول۔ دکان کی گولیوں کی فہرست نہیں۔",
        ),
        line(
          "Do not start a blood-pressure tablet from a shop list.",
          "دکان کی فہرست سے فشار کی گولی شروع نہ کریں۔",
        ),
      );
      clinicianOnly.push(AMLODIPINE);
    } else {
      tests.push(
        line(
          "Most useful next check: a clinician examines you. A shop test is not a diagnosis.",
          "سب سے مفید اگلی جانچ: کلینیشن معائنہ کرے۔ دکان کا ٹیسٹ تشخیص نہیں۔",
          "most",
        ),
        line(
          intake.cluster.fever === "yes"
            ? "Fever should be seen by a clinician before any antibiotic is even discussed."
            : "If fever appears, a clinician decides whether a test would help.",
          intake.cluster.fever === "yes"
            ? "اینٹی بائیوٹک کی بات سے پہلے بخار کلینیشن دیکھے۔"
            : "اگر بخار آئے تو ٹیسٹ مفید ہے یا نہیں، کلینیشن طے کرے۔",
        ),
      );
    }
    if (!pregnant && !child && (intake.cluster.fever === "yes" || intake.cluster.pain === "yes" || intake.severity >= 4)) {
      counter.push(PARACETAMOL);
    }
  }

  if (intake.ageBand === "65+" && specialty !== "psychiatry") {
    tests.push(
      line(
        "Screening to mention: blood pressure, if it has not been checked this year.",
        "ذکر کے قابل جانچ: فشار، اگر اس سال نہیں چیک ہوا۔",
      ),
    );
  }

  const market = regionForCity(intake.cityId, "PK");

  let withheldEn = "A pharmacist still has to agree the pack is right. This is not an order to buy a brand.";
  let withheldUr = "پیک درست ہے یا نہیں، یہ فارماسسٹ مانے گا۔ یہ کسی برانڈ کے خریدنے کا حکم نہیں۔";
  if (specialty === "cardiology") {
    if (counter.some((item) => item.inn === "aspirin")) {
      withheldEn =
        "If a heart doctor is nearby, see them before any purchase. The 75 mg note is a humble bridge only, not a signed or legal prescription. Pain at rest, sweating, or breathlessness means emergency care, not a pharmacy.";
      withheldUr =
        "اگر دل کا ڈاکٹر قریب ہو تو خریدنے سے پہلے انہیں دکھائیں۔ 75 ملی گرام کا نوٹ صرف ادب سے سہارا ہے، دستخط شدہ یا قانونی نسخہ نہیں۔ آرام پر درد، پسینہ، یا سانس پھولنا فارمیسی نہیں، ایمرجنسی ہے۔";
    } else {
      withheldEn = "No heart tablet is suggested to buy. Pain at rest, or pain with sweating or breathlessness, is emergency care.";
      withheldUr = "دل کی کوئی گولی خریدنے کو نہیں کہی گئی۔ آرام پر درد، یا پسینے اور سانس پھولنے کے ساتھ درد، ایمرجنسی ہے۔";
    }
  } else if (specialty === "psychiatry") {
    withheldEn = "No mental-health medicine is suggested. The help is a person who can talk with you today, or emergency care if you are unsafe.";
    withheldUr = "ذہنی صحت کی کوئی دوا تجویز نہیں۔ مدد وہ شخص ہے جو آج بات کر سکے، یا اگر آپ غیر محفوظ ہوں تو ایمرجنسی۔";
  } else if (pregnant) {
    withheldEn = "Pregnancy was mentioned, or you preferred not to say. This demo will not suggest a medicine to start.";
    withheldUr = "حمل کا ذکر ہوا، یا آپ نے نہیں بتایا۔ یہ نمونہ شروع کرنے کے لیے دوا تجویز نہیں کرے گا۔";
  } else if (storyOf(intake) === "gut" && intake.cluster.blood === "yes") {
    withheldEn = "Blood, black stool, or vomiting blood needs a clinician, not a stomach capsule from this screen.";
    withheldUr = "خون، کالا پاخانہ، یا خون کی الٹی کے لیے کلینیشن چاہیے، اس سکرین کی پیٹ کی کیپسول نہیں۔";
  } else if (storyOf(intake) === "urine" && (intake.cluster.fever === "yes" || intake.cluster.flank === "yes" || intake.cluster.urineBlood === "yes")) {
    withheldEn = intake.cluster.urineBlood === "yes" && intake.cluster.fever !== "yes" && intake.cluster.flank !== "yes"
      ? "Blood in the urine needs a same-day urine test and a clinician. No antibiotic and no shop alkaliser is suggested."
      : "Fever or one-sided back pain with burning urine needs a same-day clinician and a urine test. No antibiotic is named.";
    withheldUr = intake.cluster.urineBlood === "yes" && intake.cluster.fever !== "yes" && intake.cluster.flank !== "yes"
      ? "پیشاب میں خون اسی دن پیشاب کا ٹیسٹ اور کلینیشن مانگتا ہے۔ کوئی اینٹی بائیوٹک اور کوئی دکان کا الکلائزر تجویز نہیں۔"
      : "بخار یا کمر کے ایک طرف درد کے ساتھ پیشاب کی جلن اسی دن کلینیشن اور پیشاب کا ٹیسٹ مانگتی ہے۔ کوئی اینٹی بائیوٹک نہیں لکھی۔";
  } else if (storyOf(intake) === "eye" && (intake.cluster.vision === "yes" || intake.cluster.eyePain === "yes" || intake.cluster.light === "yes")) {
    withheldEn = "Worse vision, eye pain, or light hurting the eye needs a same-day look. No drop, and no steroid drop, is suggested while you wait.";
    withheldUr = "نظر کم ہونا، آنکھ کا درد، یا روشنی کی تکلیف اسی دن دیکھنے کو مانگتی ہے۔ انتظار میں کوئی قطرہ، سٹیرائیڈ بھی نہیں، تجویز نہیں۔";
  } else if (storyOf(intake) === "cough" && intake.cluster.coughBlood === "yes") {
    withheldEn = "Blood in the phlegm needs a clinician the same day, and usually a chest X-ray. No cough syrup is suggested.";
    withheldUr = "بلغم میں خون اسی دن کلینیشن مانگتا ہے، اور عام طور پر سینے کا ایکسرے۔ کوئی کھانسی کا شربت تجویز نہیں۔";
  } else if (specialty === "dermatology" && (child || intake.cluster.fever === "yes" || intake.cluster.spread === "yes" || intake.cluster.skinHot === "yes")) {
    withheldEn = "No cream or tablet is suggested while there is fever, a hot patch, or a child whose dose we will not guess.";
    withheldUr = "بخار، گرم حصے، یا بچے کی خوراک کے اندازے پر کوئی کریم یا گولی تجویز نہیں۔";
  } else if (counter.length === 0 && clinicianOnly.length === 0) {
    withheldEn = "No medicine pack fitted this story. Tests and a local clinician come first.";
    withheldUr = "اس کہانی پر کوئی دوا کا پیک نہیں بنا۔ پہلے ٹیسٹ اور مقامی کلینیشن۔";
  }

  return {
    tests,
    counter: counter.map((item) => localize(item, market)),
    clinicianOnly: clinicianOnly.map((item) => localize(item, market)),
    withheldEn,
    withheldUr,
  };
}

const AID: Record<string, CareLine> = {
  Cardiac: line(
    "Sit or lie down. Loosen tight clothes. Do not drive. If you feel faint, someone with you should make the call.",
    "بیٹھیں یا لیٹ جائیں۔ تنگ کپڑے ڈھیلے کریں۔ گاڑی خود نہ چلائیں۔ اگر بے ہوشی سی لگے تو ساتھ والا کال کرے۔",
  ),
  Neurological: line(
    "Note the time the signs started. Do not give food, drink, or a tablet. Stay with the person.",
    "علامات شروع ہونے کا وقت نوٹ کریں۔ کھانا، پانی یا گولی نہ دیں۔ شخص کے ساتھ رہیں۔",
  ),
  Respiratory: line(
    "Sit upright. Do not lie flat if that makes breathing harder. Do not look for a shop inhaler on the way.",
    "سیدھے بیٹھیں۔ اگر لیٹنے سے سانس مشکل ہو تو نہ لیٹیں۔ راستے میں دکان کا انہیلر نہ ڈھونڈیں۔",
  ),
  Anaphylaxis: line(
    "If a doctor already gave you an adrenaline pen, use it the way you were shown, then call. Do not go looking for a new medicine first.",
    "اگر ڈاکٹر پہلے ایڈرینالین پین دے چکا ہو تو سکھائے ہوئے طریقے سے استعمال کریں، پھر کال کریں۔ پہلے نئی دوا ڈھونڈنے نہ جائیں۔",
  ),
  Pediatric: line(
    "Stay with the child. Do not give an adult tablet. Do not put anything in the mouth if they are hard to wake.",
    "بچے کے ساتھ رہیں۔ بالغ گولی نہ دیں۔ اگر جاگنا مشکل ہو تو منہ میں کچھ نہ ڈالیں۔",
  ),
  Psychiatric: line(
    "Do not stay alone if you can help it. If you can safely put away anything you might use to hurt yourself, do that, then call.",
    "اگر ہو سکے تو اکیلے نہ رہیں۔ اگر محفوظ ہو تو وہ چیز ہٹا دیں جس سے نقصان ہو سکتا ہو، پھر کال کریں۔",
  ),
  Toxicology: line(
    "Do not make yourself vomit. If someone else can carry the packet or bottle, bring it. Do not taste it again.",
    "الٹی خود نہ کرائیں۔ اگر کوئی اور پیک یا بوتل لے جا سکتا ہو تو ساتھ رکھیں۔ دوبارہ چکھیں نہیں۔",
  ),
  Metabolic: line(
    "If the person is awake and can swallow, a sweet drink may help a very low sugar while you call. If they cannot swallow, do not pour anything in.",
    "اگر شخص جاگ رہا ہو اور نگل سکتا ہو تو بہت کم شوگر پر میٹھا مشروب کال کے دوران مدد کر سکتا ہے۔ اگر نگل نہ سکے تو کچھ منہ میں نہ ڈالیں۔",
  ),
  Trauma: line(
    "Do not move the neck after a bad head injury. Press a clean cloth on heavy bleeding if you can, and wait for help.",
    "بری سر کی چوٹ کے بعد گردن نہ ہلائیں۔ اگر ہو سکے تو بہت خون پر صاف کپڑا دبائیں، اور مدد کا انتظار کریں۔",
  ),
  Obstetric: line(
    "If pregnant and feeling faint, lie on the left side. Do not drive yourself.",
    "اگر حمل ہو اور بے ہوشی سی لگے تو بائیں کروٹ لیٹیں۔ خود گاڑی نہ چلائیں۔",
  ),
  Default: line(
    "Stay where help can reach you. Do not stop at a pharmacy on the way.",
    "وہیں رہیں جہاں مدد پہنچ سکے۔ راستے میں فارمیسی پر نہ رکیں۔",
  ),
};

export function emergencyHelp(domains: string[]): CareLine[] {
  const rows = domains.map((domain) => AID[domain]).filter((row): row is CareLine => Boolean(row));
  const unique = rows.filter((row, index) => rows.indexOf(row) === index);
  return (unique.length > 0 ? unique : [AID.Default]).slice(0, 3);
}

export function emergencyChecks(domains: string[]): CareLine[] {
  const checks: Record<string, CareLine> = {
    Cardiac: line(
      "Most useful check, at the hospital: a 12-lead ECG and a blood test for heart-muscle strain. Do not stop at a laboratory on the way.",
      "ہسپتال میں سب سے مفید جانچ: بارہ لیڈ ای سی جی اور دل کے پٹھے کا خون کا ٹیسٹ۔ راستے میں لیب پر نہ رکیں۔",
      "most",
    ),
    Neurological: line(
      "Most useful check, at the hospital: the time the signs started, then an urgent scan if a stroke is possible.",
      "ہسپتال میں سب سے مفید جانچ: علامات شروع ہونے کا وقت، پھر اگر فالج ممکن ہو تو فوری اسکین۔",
      "most",
    ),
    Respiratory: line(
      "Most useful check, at the hospital: oxygen level and a clinician listening to the chest. Do not hunt for an inhaler first.",
      "ہسپتال میں سب سے مفید جانچ: آکسیجن اور سینے کا معائنہ۔ پہلے انہیلر نہ ڈھونڈیں۔",
      "most",
    ),
    Sepsis: line(
      "Most useful check, at the hospital: temperature, pulse, blood pressure, and blood tests. A shop test cannot replace that.",
      "ہسپتال میں سب سے مفید جانچ: درجہ حرارت، نبض، فشار، اور خون کے ٹیسٹ۔ دکان کا ٹیسٹ اس کی جگہ نہیں۔",
      "most",
    ),
    Anaphylaxis: line(
      "Most useful check, at the hospital: the airway and an adrenaline injection if the team agrees. An antihistamine tablet is not a substitute.",
      "ہسپتال میں سب سے مفید جانچ: سانس کی نالی، اور اگر ٹیم مانے تو ایڈرینالین۔ اینٹی ہسٹامائن گولی اس کی جگہ نہیں۔",
      "most",
    ),
    Pediatric: line(
      "Most useful check: a clinician sees the child now, including alertness, breathing, and a rash that does not fade.",
      "سب سے مفید جانچ: کلینیشن بچے کو ابھی دیکھے، چوکنا پن، سانس، اور وہ دانہ جو دبانے پر نہ مٹے۔",
      "most",
    ),
    Psychiatric: line(
      "Most useful check: a person stays with you and a clinician talks about safety now. No tablet is suggested.",
      "سب سے مفید جانچ: کوئی ساتھ رہے اور کلینیشن اب حفاظت پر بات کرے۔ کوئی گولی تجویز نہیں۔",
      "most",
    ),
    Obstetric: line(
      "Most useful check, at the hospital: pulse, blood pressure, and a maternity clinician. Do not wait for a clinic appointment.",
      "ہسپتال میں سب سے مفید جانچ: نبض، فشار، اور زچگی کا کلینیشن۔ کلینک کی اپائنٹمنٹ کا انتظار نہ کریں۔",
      "most",
    ),
    Metabolic: line(
      "Most useful check, at the hospital: a finger-prick glucose, then blood tests. If the person cannot swallow, do not pour a drink in.",
      "ہسپتال میں سب سے مفید جانچ: انگلی سے شوگر، پھر خون کے ٹیسٹ۔ اگر نگلنا نہ ہو تو مشروب منہ میں نہ ڈالیں۔",
      "most",
    ),
    Toxicology: line(
      "Most useful check, at the hospital: the packet or bottle name, then observations. Do not cause vomiting.",
      "ہسپتال میں سب سے مفید جانچ: پیک یا بوتل کا نام، پھر نگرانی۔ الٹی نہ کرائیں۔",
      "most",
    ),
    Trauma: line(
      "Most useful check, at the hospital: the neck and the wound, before any tablet. Do not move the neck after a bad head injury.",
      "ہسپتال میں سب سے مفید جانچ: گردن اور زخم، کسی گولی سے پہلے۔ بری سر کی چوٹ کے بعد گردن نہ ہلائیں۔",
      "most",
    ),
  };
  const rows = domains.map((domain) => checks[domain]).filter((row): row is CareLine => Boolean(row));
  return (rows.length > 0 ? rows : [checks.Sepsis]).slice(0, 2);
}

function aspirinBlocked(intake: Intake): boolean {
  if (isChild(intake) || intake.pregnant === "yes" || intake.pregnant === "unknown") return true;
  if (intake.cluster.alreadyAspirin === "yes") return true;
  const blob = `${intake.allergies} ${intake.medications}`;
  return /aspirin|disprin|nsaid|ibuprofen|warfarin|blood thinner|bleed|ulcer|ascard|loprin/i.test(blob);
}

function aspirinBrands(market: Region): ShelfBrand[] {
  if (market === "AE") {
    return [
      {
        id: "disprin-ae",
        brand: "Disprin",
        company: "Reckitt, common on UAE shelves",
        strength: "300 mg soluble",
        packSize: "one tablet to chew, only if it is already in the house",
        mrpNote: "Illustrative Dubai range. Not a price to go and pay, and not a prescription.",
        status: "Only if already with you. Not a prescription.",
      },
    ];
  }
  if (market === "UK") {
    return [
      {
        id: "aspirin-uk",
        brand: "Aspirin",
        company: "Pharmacy dispersible 300 mg",
        strength: "300 mg",
        packSize: "one tablet to chew, only if it is already in the house",
        mrpNote: "Not an NHS prescription. Do not travel to buy it.",
        status: "Only if already with you. Not a prescription.",
      },
    ];
  }
  if (market === "SG") {
    return [
      {
        id: "aspirin-sg",
        brand: "Soluble aspirin 300 mg",
        company: "Only if a 300 mg tablet is already in the house",
        strength: "300 mg",
        packSize: "one tablet to chew, only if it is already with you",
        mrpNote: "Cardiprin on Singapore shelves is 100 mg and is not this chew-now dose. Do not stop at a pharmacy to buy it. Call 995.",
        status: "Only if already with you. Not a prescription.",
      },
    ];
  }
  return [
    {
      id: "disprin-pk",
      brand: "Disprin",
      company: "Reckitt",
      strength: "300 mg soluble",
      packSize: "one tablet to chew, only if it is already in the house",
      mrpNote: "DRAP index, effective 23 July 2026: Disprin 300 mg, 100 tablets, PKR 334.13. Only if a tablet is already with you. Not a reason to stop at a pharmacy.",
      status: "Only if already with you. Not a prescription.",
    },
  ];
}

/** Humble bridge while emergency help is coming. Never a reason to delay the call. */
export function emergencyBridge(domains: string[], intake: Intake): CareItem[] {
  const market = regionForCity(intake.cityId, "PK");
  const items: CareItem[] = [];
  if (domains.includes("Cardiac") && !aspirinBlocked(intake)) {
    items.push({
      inn: "aspirin",
      atc: "B01AC06",
      shelf: "paracetamol",
      role: "counter",
      whyEn:
        "While you wait for the ambulance, emergency guides sometimes suggest one 300 mg aspirin chewed, for an adult who is not allergic and not bleeding. Only if that pack is already with you.",
      whyUr:
        "ایمبولینس کا انتظار کرتے ہوئے، ہدایات کبھی بالغ کے لیے ایک 300 ملی گرام اسپرین چبانے کی بات کرتی ہیں، اگر الرجی اور خون بہنا نہ ہو۔ صرف اگر پیک پہلے سے گھر میں ہو۔",
      cautionEn:
        "Not a legal prescription and not a cure. Do not go to a shop first. Do not give this to a child. Skip it if there is allergy, a bleeding ulcer, or a blood-thinner already in use. Still call.",
      cautionUr:
        "یہ قانونی نسخہ نہیں اور علاج نہیں۔ پہلے دکان نہ جائیں۔ بچے کو نہ دیں۔ الرجی، خون بہنے والا السر، یا خون پتلی دوا پہلے سے ہو تو چھوڑ دیں۔ کال پھر بھی کریں۔",
      brands: aspirinBrands(market),
    });
  }
  if (domains.includes("Metabolic")) {
    items.push({
      inn: "glucose by mouth",
      atc: "V06DC",
      shelf: "ors",
      role: "counter",
      whyEn:
        "If the person is awake and can swallow, a sweet drink or a glucose sachet already in the house can bridge a very low sugar while you call.",
      whyUr:
        "اگر شخص جاگ رہا ہو اور نگل سکتا ہو تو گھر میں موجود میٹھا مشروب یا گلوکوز کا ساشے بہت کم شوگر پر کال کے دوران سہارا بن سکتا ہے۔",
      cautionEn:
        "Not a legal prescription. If they cannot swallow, or are not awake, do not pour anything in. Do not detour to buy it. Still call.",
      cautionUr:
        "یہ قانونی نسخہ نہیں۔ اگر نگل نہ سکیں، یا جاگ نہ رہے ہوں، تو کچھ منہ میں نہ ڈالیں۔ خریدنے کا چکر نہ لگائیں۔ کال پھر بھی کریں۔",
      brands: glucoseBrands(market),
    });
  }
  if (domains.includes("Respiratory") && ownInhaler(intake)) {
    items.push({
      inn: "salbutamol inhaler already prescribed",
      atc: "R03AC02",
      shelf: "ors",
      role: "counter",
      whyEn:
        "If a doctor already gave a reliever inhaler, use it the way you were shown while you call. Do not hunt for a new inhaler first.",
      whyUr:
        "اگر ڈاکٹر پہلے ریلیور انہیلر دے چکا ہو تو کال کرتے ہوئے وہی سکھایا ہوا طریقہ استعمال کریں۔ پہلے نیا انہیلر نہ ڈھونڈیں۔",
      cautionEn:
        "Not a new prescription and not a cure. One or two puffs as previously shown, then still get emergency care. A shop inhaler is not a substitute.",
      cautionUr:
        "یہ نیا نسخہ نہیں اور علاج نہیں۔ پہلے سکھائے ہوئے ایک یا دو پف، پھر بھی ایمرجنسی۔ دکان کا انہیلر اس کی جگہ نہیں۔",
      brands: [
        {
          id: "own-inhaler",
          brand: "The reliever already in the house",
          company: "Only a salbutamol inhaler a doctor gave before, such as Ventolin or Asthalin",
          strength: "as labelled on that inhaler",
          packSize: "do not buy a new one now",
          mrpNote: "Not a price and not a new prescription.",
          status: "Only if already with you. Not a prescription.",
        },
      ],
    });
  }
  return items;
}

function ownInhaler(intake: Intake): boolean {
  return /inhaler|ventolin|salbutamol|asthalin|salbo/i.test(`${intake.medications} ${intake.complaint}`);
}

function glucoseBrands(market: Region): ShelfBrand[] {
  if (market === "AE") {
    return [
      {
        id: "glucose-ae",
        brand: "Glucose powder, or ordinary sugar in water",
        company: "Only if it is already in the house",
        strength: "a sip, not a bottle to finish",
        packSize: "if awake and able to swallow",
        mrpNote: "Not a reason to stop at a shop. Not today's price.",
        status: "Only if already with you. Not a prescription.",
      },
    ];
  }
  if (market === "UK") {
    return [
      {
        id: "glucose-uk",
        brand: "Glucose tablets or a sugary drink already open",
        company: "Only if it is already in the house",
        strength: "a sip or a few tablets, if awake",
        packSize: "do not travel to buy",
        mrpNote: "Not an NHS prescription.",
        status: "Only if already with you. Not a prescription.",
      },
    ];
  }
  if (market === "SG") {
    return [
      {
        id: "glucolin-sg",
        brand: "Glucolin, or ordinary sugar in water",
        company: "Only if it is already in the house",
        strength: "a sip, if awake and able to swallow",
        packSize: "do not stop at a shop",
        mrpNote: "Glucolin is a glucose drink many homes in Singapore keep. Not a reason to buy it first, and not a prescription. Call 995.",
        status: "Only if already with you. Not a prescription.",
      },
    ];
  }
  return [
    {
      id: "glucon-d",
      brand: "Glucon-D, or ordinary sugar in water",
      company: "Only if it is already in the house",
      strength: "a sip, if awake and able to swallow",
      packSize: "do not stop at a shop",
      mrpNote: "Glucon-D is a glucose powder people in Pakistan often keep. Not today's price, and not a prescription.",
      status: "Only if already with you. Not a prescription.",
    },
  ];
}

export function inspectionNotes(routing: RoutingDecision, intake: Intake): CareLine[] {
  const notes: CareLine[] = [];
  if (routing.primarySpecialty === "dermatology") {
    notes.push(
      line(
        "A skin specialist would still look at the skin. These words are not a diagnosis.",
        "جلد کا ماہر پھر بھی جلد خود دیکھے گا۔ یہ الفاظ تشخیص نہیں۔",
        "most",
      ),
    );
    if (intake.cluster.eye === "yes") {
      notes.push(
        line(
          "Eyes, eyelids, or lips were mentioned. A clinician should see that today. No cream from this screen goes near the eye.",
          "آنکھ، پلک یا ہونٹ کا ذکر ہوا۔ کلینیشن آج دیکھے۔ اس سکرین کی کوئی کریم آنکھ کے قریب نہیں۔",
        ),
      );
    }
    if (intake.cluster.round === "yes") {
      notes.push(
        line(
          "You described a round-edged patch. A specialist may add a skin scraping. That is a check, not a name for the rash.",
          "آپ نے گول کنارے والا دھبہ بتایا۔ ماہر جلد کا نمونہ لے سکتا ہے۔ یہ جانچ ہے، دانوں کا نام نہیں۔",
        ),
      );
    }
    if (intake.cluster.night === "yes") {
      notes.push(
        line(
          "Itch that wakes you at night needs eyes-on review before any special cream.",
          "رات کو جگانے والی خارش کے لیے آنکھوں سے جائزہ، کسی خاص کریم سے پہلے۔",
        ),
      );
    }
    if (intake.cluster.fever === "yes" || intake.cluster.spread === "yes") {
      notes.push(
        line(
          "Fever or a hot spreading area should be seen the same day. A cream is not that check.",
          "بخار یا گرم پھیلتا حصہ اسی دن دیکھنا چاہیے۔ کریم وہ جانچ نہیں۔",
        ),
      );
    } else {
      notes.push(
        line(
          "No fever and no hot spreading area were reported. If a skin doctor is not close, the adult shelf notes below are only a bridge.",
          "بخار اور گرم پھیلتا حصہ نہیں بتایا گیا۔ اگر جلد کا ڈاکٹر قریب نہ ہو تو نیچے بالغ شیلف صرف اس وقت تک کا سہارا ہے۔",
        ),
      );
    }
  } else if (routing.primarySpecialty === "cardiology") {
    notes.push(
      line(
        "A heart specialist would not clear this from a conversation. The most useful next check is a same-day ECG.",
        "دل کا ماہر بات چیت سے اسے صاف نہیں کہے گا۔ سب سے مفید اگلی جانچ اسی دن کی ای سی جی ہے۔",
        "most",
      ),
    );
    if (intake.cluster.rest === "yes") {
      notes.push(
        line(
          "Discomfort at rest should not wait on a routine list. If sweating or breathlessness joins it, use emergency care.",
          "آرام کے دوران تکلیف معمول کی فہرست پر نہیں رکنی۔ پسینہ یا سانس پھولنا شامل ہو تو ایمرجنسی۔",
        ),
      );
    } else if (intake.cluster.exertion === "yes") {
      notes.push(
        line(
          "You said it comes on with effort and settles with rest. The most useful check is still a same-day ECG. If no heart doctor is close, a humble 75 mg note may appear below. It is not a signed prescription.",
          "آپ نے بتایا محنت پر آتا ہے اور آرام سے ٹھیک ہوتا ہے۔ سب سے مفید جانچ پھر بھی اسی دن کی ای سی جی ہے۔ اگر دل کا ڈاکٹر قریب نہ ہو تو نیچے 75 ملی گرام کا ادب سے نوٹ آ سکتا ہے۔ یہ دستخط شدہ نسخہ نہیں۔",
        ),
      );
    }
    if (intake.cluster.ankles === "yes") {
      notes.push(
        line(
          "Swollen ankles are something the heart doctor should see. This screen will not start a water tablet.",
          "ٹخنوں کی سوجن دل کے ڈاکٹر کو دکھانی ہے۔ یہ سکرین پانی کی گولی شروع نہیں کرے گی۔",
        ),
      );
    }
    if (intake.cluster.alreadyAspirin === "yes") {
      notes.push(
        line(
          "Aspirin or a blood thinner is already in use. Do not add another dose from this screen.",
          "اسپرین یا خون پتلی دوا پہلے سے چل رہی ہے۔ اس سکرین سے مزید خوراک نہ شامل کریں۔",
        ),
      );
    }
  } else if (routing.primarySpecialty === "pediatrics") {
    notes.push(
      line(
        "A children's doctor would look at alertness, drinking, and the skin before any medicine. No dose is calculated here.",
        "بچوں کا ڈاکٹر دوا سے پہلے چوکنا پن، پینے، اور جلد دیکھے گا۔ یہاں خوراک نہیں نکلتی۔",
        "most",
      ),
    );
    if (intake.cluster.drinking === "yes") {
      notes.push(
        line(
          "Drinking less is a reason for same-day review. A rehydration sachet is only a bridge if the child is still alert and will drink.",
          "کم پینے کی وجہ اسی دن جائزہ ہے۔ نمکیات کا ساشے صرف اس وقت سہارا ہے جب بچہ چوکنا ہو اور پی لے۔",
        ),
      );
    }
    if (intake.cluster.weightKg && intake.cluster.weightKg !== "yes" && intake.cluster.weightKg !== "no") {
      notes.push(
        line(
          `You mentioned a weight (${intake.cluster.weightKg}). A pharmacist may use it. This screen still calculates no dose.`,
          `آپ نے وزن بتایا (${intake.cluster.weightKg})۔ فارماسسٹ اسے استعمال کر سکتا ہے۔ یہ سکرین پھر بھی خوراک نہیں نکالتی۔`,
        ),
      );
    }
    if (intake.cluster.feverLong === "yes") {
      notes.push(
        line(
          "Fever longer than three days: a clinician may check the urine. This app does not order that test.",
          "تین دن سے زیادہ بخار: کلینیشن پیشاب چیک کر سکتا ہے۔ یہ ایپ وہ ٹیسٹ آرڈر نہیں کرتی۔",
        ),
      );
    }
  } else if (routing.primarySpecialty === "psychiatry") {
    notes.push(
      line(
        "A mental health doctor would ask about safety, sleep, and daily tasks before any tablet. No mental-health medicine is suggested here.",
        "ذہنی صحت کا ڈاکٹر کسی گولی سے پہلے حفاظت، نیند، اور روزانہ کام پوچھے گا۔ یہاں ذہنی صحت کی دوا تجویز نہیں۔",
        "most",
      ),
    );
    if (intake.cluster.tasks === "no") {
      notes.push(
        line(
          "Daily tasks are slipping. That should be said to a clinician today, not treated with a shop tablet.",
          "روزانہ کے کام رہ گئے ہیں۔ یہ آج کلینیشن کو بتانا ہے، دکان کی گولی سے نہیں۔",
        ),
      );
    }
    if (intake.cluster.sleep === "yes" || intake.cluster.weeks === "yes") {
      notes.push(
        line(
          "Sleep or a mood lasting more than two weeks belongs in the conversation with a mental health doctor. No tablet is named, because the first weeks need a person watching, not a shop pack.",
          "نیند، یا دو ہفتے سے زیادہ کی کیفیت، ذہنی صحت کے ڈاکٹر کے ساتھ بات میں آتی ہے۔ کوئی گولی نہیں، کیونکہ پہلے ہفتوں میں دکان کا پیک نہیں، ایک دیکھنے والا شخص چاہیے۔",
        ),
      );
    }
  } else if (storyOf(intake) === "gut") {
    notes.push(
      line(
        "A general doctor would press on the abdomen and ask about blood before any capsule. These words are not a diagnosis.",
        "جنرل ڈاکٹر کسی کیپسول سے پہلے پیٹ دبائے گا اور خون کے بارے میں پوچھے گا۔ یہ الفاظ تشخیص نہیں۔",
        "most",
      ),
    );
    if (intake.cluster.blood === "yes") {
      notes.push(
        line(
          "Blood, black stool, or vomiting blood should be seen within one to two days, sooner if you feel faint.",
          "خون، کالا پاخانہ، یا خون کی الٹی ایک سے دو دن میں دکھانی چاہیے، بے ہوشی سی لگے تو جلد۔",
        ),
      );
    } else if (intake.cluster.burn === "yes") {
      notes.push(
        line(
          "Burning after meals, without blood, is where a humble omeprazole note may appear. It is not a signed prescription.",
          "خون کے بغیر کھانے کے بعد جلن پر اومیپرازول کا ادب سے نوٹ آ سکتا ہے۔ یہ دستخط شدہ نسخہ نہیں۔",
        ),
      );
    }
  } else if (storyOf(intake) === "urine") {
    notes.push(
      line(
        "A doctor would send a urine sample before naming an infection. No antibiotic is suggested.",
        "ڈاکٹر انفیکشن کا نام لینے سے پہلے پیشاب کا نمونہ بھیجے گا۔ کوئی اینٹی بائیوٹک تجویز نہیں۔",
        "most",
      ),
    );
  } else if (storyOf(intake) === "cough") {
    notes.push(
      line(
        "A doctor would listen to the chest. A cough pack from this screen is not an antibiotic.",
        "ڈاکٹر سینہ سنے گا۔ اس سکرین کا کھانسی والا پیک اینٹی بائیوٹک نہیں۔",
        "most",
      ),
    );
  } else if (storyOf(intake) === "joint") {
    notes.push(
      line(
        "A doctor would look at the joint or the back before any pain tablet. Swelling with fever should be seen the same day.",
        "ڈاکٹر درد کی گولی سے پہلے جوڑ یا کمر دیکھے۔ سوجن کے ساتھ بخار اسی دن دکھانا چاہیے۔",
        "most",
      ),
    );
  } else if (storyOf(intake) === "eye") {
    notes.push(
      line(
        "Someone who can look at the eye comes before any drop. Steroid eye drops are not suggested.",
        "کسی قطرے سے پہلے آنکھ دیکھ سکنے والا شخص۔ سٹیرائیڈ آنکھ کے قطرے تجویز نہیں۔",
        "most",
      ),
    );
  } else if (sugarStory(intake)) {
    notes.push(
      line(
        "A general doctor would not call this diabetes from thirst alone. The most useful checks are glucose and HbA1c.",
        "جنرل ڈاکٹر صرف پیاس سے اسے شوگر نہیں کہے گا۔ سب سے مفید جانچ گلوکوز اور HbA1c ہیں۔",
        "most",
      ),
    );
    if (intake.cluster.knownSugar === "yes") {
      notes.push(
        line(
          "A doctor has already used the word diabetes. Do not start or change a tablet from this screen. A pharmacist can match a pack only after that doctor chose the ingredient and strength.",
          "ڈاکٹر پہلے شوگر کہہ چکا ہے۔ اس سکرین سے گولی شروع یا تبدیل نہ کریں۔ فارماسسٹ پیک تب ملائے جب ڈاکٹر جز اور طاقت چن چکا ہو۔",
        ),
      );
    }
    if (intake.cluster.vomit === "yes") {
      notes.push(
        line(
          "Vomiting or deep fast breathing is not a wait for a routine sugar test. Use emergency care.",
          "الٹی یا گہری تیز سانس معمول کے شوگر ٹیسٹ کا انتظار نہیں۔ ایمرجنسی استعمال کریں۔",
        ),
      );
    }
  } else if (bpStory(intake)) {
    notes.push(
      line(
        "A general doctor would repeat the blood pressure after five quiet minutes, often in both arms, before any new tablet.",
        "جنرل ڈاکٹر نئی گولی سے پہلے پانچ منٹ خاموشی کے بعد فشار دہرائے، اکثر دونوں بازوؤں میں۔",
        "most",
      ),
    );
  } else {
    notes.push(
      line(
        "A general doctor is the safe specialty when the story does not point clearly. An examination comes before a shop test.",
        "جب کہانی صاف نہ ہو تو جنرل ڈاکٹر محفوظ راستہ ہے۔ دکان کے ٹیسٹ سے پہلے معائنہ۔",
        "most",
      ),
    );
    if (intake.cluster.pain === "yes" || intake.severity >= 4) {
      notes.push(
        line(
          "Pain is part of the story. An adult paracetamol pack may be discussed below. It is comfort, not a plan, and not a cure.",
          "درد کہانی کا حصہ ہے۔ نیچے بالغ پیراسیٹامول کی بات ہو سکتی ہے۔ یہ آرام ہے، منصوبہ نہیں، علاج نہیں۔",
        ),
      );
    }
  }
  return notes.slice(0, 5);
}

export function careCorpus(): string {
  const sample = emptySamples();
  return JSON.stringify(sample);
}

function emptySamples(): CarePacket[] {
  const base = {
    forWhom: "self" as const,
    ageBand: "16-64" as const,
    pregnant: "no" as const,
    complaint: "",
    duration: "",
    severity: 3,
    voiceUsed: false,
    asrNote: "",
    danger: {},
    confirmed: [],
    denied: [],
    cluster: {},
    medications: "",
    allergies: "",
    medsConfirmed: false,
    reportName: "",
    reportNormal: false,
    reportAbnormal: false,
    cityId: "karachi",
    reachCare: "",
  } satisfies Intake;
  const routing = {
    secondary: [],
    confidence: "high" as const,
    reasoning: "sample",
    halted: false,
  };
  return [
    careFor({ ...routing, primarySpecialty: "dermatology", urgency: "YELLOW" }, { ...base, complaint: "Itchy rash on my arms", cluster: { round: "yes", fever: "no", spread: "no" } }),
    careFor({ ...routing, primarySpecialty: "cardiology", urgency: "AMBER" }, { ...base, complaint: "Chest discomfort on stairs" }),
    careFor({ ...routing, primarySpecialty: "pediatrics", urgency: "YELLOW" }, { ...base, forWhom: "child", ageBand: "1m-5y", pregnant: "na", cluster: { fever: "yes" }, severity: 3, complaint: "fever" }),
    careFor({ ...routing, primarySpecialty: "psychiatry", urgency: "YELLOW" }, { ...base, complaint: "low mood" }),
    careFor({ ...routing, primarySpecialty: "general_internal_medicine", urgency: "AMBER" }, { ...base, complaint: "BP high hai" }),
    careFor({ ...routing, primarySpecialty: "general_internal_medicine", urgency: "AMBER" }, { ...base, complaint: "sugar and thirst" }),
    careFor({ ...routing, primarySpecialty: "dermatology", urgency: "RED", halted: true }, base),
    careFor({ ...routing, primarySpecialty: "dermatology", urgency: "YELLOW" }, { ...base, pregnant: "yes", complaint: "Itchy rash" }),
  ];
}

export const CARE_LABEL = FORMULARY_LABEL;
