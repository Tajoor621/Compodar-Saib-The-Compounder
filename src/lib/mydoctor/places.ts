import type { Lang, SpecialtyId } from "./types.ts";
import { careRegionForLocation } from "./community/regions.ts";
import type { ClusterId } from "./routing.ts";

export type Region = "PK" | "UK" | "AE" | "SG";

export type City = {
  id: string;
  region: Region;
  en: string;
  ur: string;
  group: "PK" | "AE" | "UK" | "SG";
  lat: number;
  lng: number;
};

export const CITIES: City[] = [
  { id: "karachi", region: "PK", group: "PK", en: "Karachi", ur: "کراچی", lat: 24.86, lng: 67.01 },
  { id: "lahore", region: "PK", group: "PK", en: "Lahore", ur: "لاہور", lat: 31.52, lng: 74.36 },
  { id: "islamabad", region: "PK", group: "PK", en: "Islamabad", ur: "اسلام آباد", lat: 33.68, lng: 73.05 },
  { id: "rawalpindi", region: "PK", group: "PK", en: "Rawalpindi", ur: "راولپنڈی", lat: 33.57, lng: 73.02 },
  { id: "peshawar", region: "PK", group: "PK", en: "Peshawar", ur: "پشاور", lat: 34.02, lng: 71.58 },
  { id: "quetta", region: "PK", group: "PK", en: "Quetta", ur: "کوئٹہ", lat: 30.18, lng: 66.98 },
  { id: "multan", region: "PK", group: "PK", en: "Multan", ur: "ملتان", lat: 30.16, lng: 71.52 },
  { id: "faisalabad", region: "PK", group: "PK", en: "Faisalabad", ur: "فیصل آباد", lat: 31.42, lng: 73.09 },
  { id: "hyderabad", region: "PK", group: "PK", en: "Hyderabad", ur: "حیدرآباد", lat: 25.4, lng: 68.37 },
  { id: "dubai", region: "AE", group: "AE", en: "Dubai", ur: "دبئی", lat: 25.2, lng: 55.27 },
  { id: "abudhabi", region: "AE", group: "AE", en: "Abu Dhabi", ur: "ابو ظہبی", lat: 24.45, lng: 54.38 },
  { id: "sharjah", region: "AE", group: "AE", en: "Sharjah", ur: "شارجہ", lat: 25.36, lng: 55.39 },
  { id: "singapore", region: "SG", group: "SG", en: "Singapore", ur: "سنگاپور", lat: 1.35, lng: 103.82 },
  { id: "london", region: "UK", group: "UK", en: "London", ur: "لندن", lat: 51.51, lng: -0.13 },
  { id: "manchester", region: "UK", group: "UK", en: "Manchester", ur: "مانچسٹر", lat: 53.48, lng: -2.24 },
  { id: "birmingham", region: "UK", group: "UK", en: "Birmingham", ur: "برمنگھم", lat: 52.49, lng: -1.89 },
  { id: "other", region: "PK", group: "PK", en: "Another place", ur: "کوئی اور جگہ", lat: 0, lng: 0 },
];

export function cityById(id: string | undefined): City | undefined {
  return CITIES.find((city) => city.id === id);
}

export function cityName(id: string | undefined, lang: Lang): string {
  const city = cityById(id);
  if (!city || city.id === "other") return careRegionForLocation(id)?.name[lang] ?? "";
  return lang === "ur" ? city.ur : city.en;
}

function distanceKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const lat1 = toRad(aLat);
  const lat2 = toRad(bLat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

/** Nearest listed city. Used only on this device to match hospitals and shelf names. */
export function nearestCity(lat: number, lng: number): City {
  const listed = CITIES.filter((city) => city.id !== "other");
  let best = listed[0];
  let bestKm = Number.POSITIVE_INFINITY;
  for (const city of listed) {
    const km = distanceKm(lat, lng, city.lat, city.lng);
    if (km < bestKm) {
      best = city;
      bestKm = km;
    }
  }
  return best;
}

export function regionForCity(id: string | undefined) {
  if (!id || id === "other") return undefined;
  return careRegionForLocation(id)?.id ?? cityById(id)?.region;
}

export function medicineMarket(id: string | undefined): Region | undefined {
  const region = regionForCity(id);
  return region === "PK" || region === "AE" || region === "SG" || region === "UK" ? region : undefined;
}

export type Facility = {
  id: string;
  cityId: string;
  name: string;
  area: string;
  specialties: SpecialtyId[];
  emergency: boolean;
  phone?: string;
  display?: string;
  noteEn: string;
  noteUr: string;
  focus?: ClusterFocus[];
};

export type ClusterFocus = "eye" | "gut" | "urine" | "cough" | "joint";

const GENERAL: SpecialtyId[] = ["general_internal_medicine"];

export const FACILITIES: Facility[] = [
  {
    id: "khi-nicvd",
    cityId: "karachi",
    name: "National Institute of Cardiovascular Diseases (NICVD)",
    area: "Karachi",
    specialties: ["cardiology"],
    emergency: true,
    noteEn: "Public cardiac centre. If pain comes with sweating or breathlessness, call 1122 instead of travelling alone.",
    noteUr: "سرکاری دل کا مرکز۔ اگر درد کے ساتھ پسینہ یا سانس پھولے تو اکیلے سفر کے بجائے 1122 کال کریں۔",
  },
  {
    id: "khi-lrbt",
    cityId: "karachi",
    name: "LRBT Free Eye Hospital, Korangi",
    area: "Korangi",
    specialties: ["general_internal_medicine"],
    emergency: false,
    focus: ["eye"],
    noteEn: "Free eye hospital. Ask for the eye clinic. If vision has dropped or the eye is painful, do not wait on a routine list. Confirm today's gate before a long trip.",
    noteUr: "مفت آنکھ کا ہسپتال۔ آنکھ کا کلینک پوچھیں۔ نظر گر گئی ہو یا درد ہو تو معمول کی فہرست پر انتظار نہ کریں۔ لمبے سفر سے پہلے آج کا گیٹ تصدیق کریں۔",
  },
  {
    id: "khi-nich",
    cityId: "karachi",
    name: "National Institute of Child Health (NICH)",
    area: "Rafiqui Shaheed Road",
    specialties: ["pediatrics"],
    emergency: true,
    noteEn: "Public children's hospital. Ask for the emergency desk if the child is drowsy or not drinking.",
    noteUr: "سرکاری بچوں کا ہسپتال۔ اگر بچہ سست ہو یا پی نہ رہا ہو تو ایمرجنسی ڈیسک پوچھیں۔",
  },
  {
    id: "khi-jpmc",
    cityId: "karachi",
    name: "Jinnah Postgraduate Medical Centre (JPMC)",
    area: "Rafiqui Shaheed Road",
    specialties: ["general_internal_medicine", "dermatology", "psychiatry"],
    emergency: true,
    noteEn: "Large public hospital. Ask for emergency, or for skin or mental-health outpatients.",
    noteUr: "بڑا سرکاری ہسپتال۔ ایمرجنسی، یا جلد اور ذہنی صحت کے بیرونی مریض پوچھیں۔",
  },
  {
    id: "khi-aku",
    cityId: "karachi",
    name: "Aga Khan University Hospital",
    area: "Stadium Road",
    specialties: ["general_internal_medicine", "cardiology", "dermatology", "pediatrics", "psychiatry"],
    emergency: true,
    noteEn: "Private teaching hospital. Ask for the on-duty consultant in this specialty. A public emergency door may be faster if this is urgent.",
    noteUr: "نجی تدریسی ہسپتال۔ اس شعبے کے ڈیوٹی کنسلٹنٹ کو پوچھیں۔ اگر فوری ہو تو سرکاری ایمرجنسی جلد مل سکتی ہے۔",
  },
  {
    id: "khi-civil",
    cityId: "karachi",
    name: "Civil Hospital Karachi (Dr Ruth Pfau)",
    area: "Saddar",
    specialties: GENERAL,
    emergency: true,
    noteEn: "Public emergency department when you are not sure which specialty building to try first.",
    noteUr: "جب پتا نہ ہو پہلے کون سی عمارت، سرکاری ایمرجنسی۔",
  },
  {
    id: "lhe-pic",
    cityId: "lahore",
    name: "Punjab Institute of Cardiology",
    area: "Jail Road",
    specialties: ["cardiology"],
    emergency: true,
    noteEn: "Public cardiac hospital. Active chest pain with sweat still starts with 1122.",
    noteUr: "سرکاری دل کا ہسپتال۔ پسینے کے ساتھ موجود سینے کا درد پھر بھی 1122 سے شروع ہو۔",
  },
  {
    id: "lhe-ch",
    cityId: "lahore",
    name: "The Children's Hospital, Lahore",
    area: "Ferozepur Road",
    specialties: ["pediatrics"],
    emergency: true,
    noteEn: "Public children's hospital and emergency.",
    noteUr: "سرکاری بچوں کا ہسپتال اور ایمرجنسی۔",
  },
  {
    id: "lhe-mayo",
    cityId: "lahore",
    name: "Mayo Hospital",
    area: "Anarkali",
    specialties: ["general_internal_medicine", "dermatology", "psychiatry"],
    emergency: true,
    noteEn: "Large public hospital. Ask for the specialty outpatient desk that matches the problem.",
    noteUr: "بڑا سرکاری ہسپتال۔ مسئلے کے مطابق بیرونی ڈیسک پوچھیں۔",
  },
  {
    id: "isb-pims",
    cityId: "islamabad",
    name: "Pakistan Institute of Medical Sciences (PIMS)",
    area: "G-8",
    specialties: ["general_internal_medicine", "pediatrics", "dermatology", "psychiatry"],
    emergency: true,
    noteEn: "Public hospital for emergency care and most specialty desks.",
    noteUr: "ایمرجنسی اور زیادہ تر خصوصی ڈیسک کے لیے سرکاری ہسپتال۔",
  },
  {
    id: "isb-shifa",
    cityId: "islamabad",
    name: "Shifa International Hospital",
    area: "H-8",
    specialties: ["general_internal_medicine", "cardiology", "dermatology", "pediatrics", "psychiatry"],
    emergency: true,
    noteEn: "Private hospital. Ask for the on-duty consultant. PIMS remains the main public emergency door.",
    noteUr: "نجی ہسپتال۔ ڈیوٹی کنسلٹنٹ پوچھیں۔ پمز بڑی سرکاری ایمرجنسی رہتی ہے۔",
  },
  {
    id: "rwp-afic",
    cityId: "rawalpindi",
    name: "Armed Forces Institute of Cardiology (AFIC)",
    area: "The Mall",
    specialties: ["cardiology"],
    emergency: true,
    noteEn: "Cardiac centre. Ask at the gate how civilian emergency cases are received today.",
    noteUr: "دل کا مرکز۔ گیٹ پر پوچھیں آج سویلین ایمرجنسی کیسے دیکھے جاتے ہیں۔",
  },
  {
    id: "rwp-holy",
    cityId: "rawalpindi",
    name: "Holy Family Hospital",
    area: "Satellite Town",
    specialties: ["general_internal_medicine", "pediatrics", "dermatology"],
    emergency: true,
    noteEn: "Public teaching hospital with an emergency department.",
    noteUr: "سرکاری تدریسی ہسپتال، ایمرجنسی کے ساتھ۔",
  },
  {
    id: "pew-lrh",
    cityId: "peshawar",
    name: "Lady Reading Hospital",
    area: "Peshawar",
    specialties: ["general_internal_medicine", "cardiology", "pediatrics", "psychiatry"],
    emergency: true,
    noteEn: "Main public hospital. Ask for emergency or the specialty desk.",
    noteUr: "بڑا سرکاری ہسپتال۔ ایمرجنسی یا خصوصی ڈیسک پوچھیں۔",
  },
  {
    id: "uet-sandeman",
    cityId: "quetta",
    name: "Sandeman Provincial Hospital",
    area: "Quetta",
    specialties: ["general_internal_medicine", "pediatrics", "cardiology"],
    emergency: true,
    noteEn: "Also called Civil Hospital. Start at emergency if the person is very unwell.",
    noteUr: "سول ہسپتال بھی کہلاتا ہے۔ اگر طبیعت بہت خراب ہو تو ایمرجنسی سے شروع کریں۔",
  },
  {
    id: "mux-nishtar",
    cityId: "multan",
    name: "Nishtar Hospital",
    area: "Multan",
    specialties: ["general_internal_medicine", "cardiology", "pediatrics", "dermatology"],
    emergency: true,
    noteEn: "Public teaching hospital. Ask for the desk that matches the problem.",
    noteUr: "سرکاری تدریسی ہسپتال۔ مسئلے والا ڈیسک پوچھیں۔",
  },
  {
    id: "fsd-allied",
    cityId: "faisalabad",
    name: "Allied Hospital",
    area: "Faisalabad",
    specialties: ["general_internal_medicine", "pediatrics", "cardiology", "dermatology"],
    emergency: true,
    noteEn: "Public hospital with emergency and specialty clinics.",
    noteUr: "سرکاری ہسپتال، ایمرجنسی اور خصوصی کلینک کے ساتھ۔",
  },
  {
    id: "hyd-luh",
    cityId: "hyderabad",
    name: "Liaquat University Hospital",
    area: "Hyderabad",
    specialties: ["general_internal_medicine", "pediatrics", "cardiology", "dermatology"],
    emergency: true,
    noteEn: "Public hospital. Use emergency if danger signs are present.",
    noteUr: "سرکاری ہسپتال۔ خطرے کی علامات ہوں تو ایمرجنسی استعمال کریں۔",
  },
  {
    id: "dxb-rashid",
    cityId: "dubai",
    name: "Rashid Hospital",
    area: "Bur Dubai",
    specialties: ["general_internal_medicine", "cardiology"],
    emergency: true,
    noteEn: "Major public emergency and trauma hospital. Ambulance is 998.",
    noteUr: "بڑا سرکاری ایمرجنسی ہسپتال۔ ایمبولینس 998 ہے۔",
  },
  {
    id: "dxb-moorfields",
    cityId: "dubai",
    name: "Moorfields Eye Hospital Dubai",
    area: "Dubai Healthcare City",
    specialties: ["general_internal_medicine"],
    emergency: false,
    focus: ["eye"],
    noteEn: "Eye hospital. Ask for the urgent eye service if vision is worse or the eye is painful. Rashid Hospital remains the public emergency door. Confirm today's clinic before you travel.",
    noteUr: "آنکھ کا ہسپتال۔ نظر کم ہو یا درد ہو تو فوری آنکھ کی سروس پوچھیں۔ سرکاری ایمرجنسی راشد ہسپتال ہے۔ سفر سے پہلے آج کا کلینک تصدیق کریں۔",
  },
  {
    id: "dxb-jalila",
    cityId: "dubai",
    name: "Al Jalila Children's Specialty Hospital",
    area: "Al Jaddaf",
    specialties: ["pediatrics"],
    emergency: true,
    noteEn: "Children's specialty hospital. A very unwell child should still come through emergency, via 998 if you cannot travel safely.",
    noteUr: "بچوں کا خصوصی ہسپتال۔ بہت بیمار بچے کے لیے ایمرجنسی، اور اگر محفوظ سفر نہ ہو تو 998۔",
  },
  {
    id: "dxb-latifa",
    cityId: "dubai",
    name: "Latifa Hospital",
    area: "Oud Metha",
    specialties: ["general_internal_medicine", "pediatrics"],
    emergency: true,
    noteEn: "Public hospital often used for women and children. Confirm the right entrance on arrival.",
    noteUr: "خواتین اور بچوں کے لیے استعمال ہونے والا سرکاری ہسپتال۔ داخلہ پہنچ کر تصدیق کریں۔",
  },
  {
    id: "dxb-amal",
    cityId: "dubai",
    name: "Al Amal Psychiatric Hospital",
    area: "Dubai",
    specialties: ["psychiatry"],
    emergency: false,
    noteEn: "Public psychiatric hospital. If someone may act on suicidal thoughts, call 998 first. Confirm today's listing with the hospital before a long trip.",
    noteUr: "سرکاری نفسیاتی ہسپتال۔ اگر خودکشی پر عمل کا خطرہ ہو تو پہلے 998۔ لمبے سفر سے پہلے ہسپتال سے آج کی فہرست تصدیق کریں۔",
  },
  {
    id: "dxb-dubaih",
    cityId: "dubai",
    name: "Dubai Hospital",
    area: "Deira",
    specialties: ["general_internal_medicine", "dermatology"],
    emergency: true,
    noteEn: "Public general hospital. Ask for emergency or the specialty clinic.",
    noteUr: "سرکاری جنرل ہسپتال۔ ایمرجنسی یا خصوصی کلینک پوچھیں۔",
  },
  {
    id: "dxb-ahd",
    cityId: "dubai",
    name: "American Hospital Dubai",
    area: "Oud Metha",
    specialties: ["general_internal_medicine", "cardiology", "dermatology", "pediatrics"],
    emergency: true,
    noteEn: "Private hospital. Ask for the on-duty specialist. If you cannot travel safely, call 998. Rashid Hospital is the main public emergency door.",
    noteUr: "نجی ہسپتال۔ ڈیوٹی ماہر پوچھیں۔ اگر محفوظ سفر نہ ہو تو 998۔ راشد ہسپتال بڑی سرکاری ایمرجنسی ہے۔",
  },
  {
    id: "auh-skmc",
    cityId: "abudhabi",
    name: "Sheikh Khalifa Medical City",
    area: "Abu Dhabi",
    specialties: ["general_internal_medicine", "cardiology", "pediatrics"],
    emergency: true,
    noteEn: "Major public hospital. Ambulance is 998.",
    noteUr: "بڑا سرکاری ہسپتال۔ ایمبولینس 998 ہے۔",
  },
  {
    id: "shj-qassimi",
    cityId: "sharjah",
    name: "Al Qassimi Hospital",
    area: "Sharjah",
    specialties: ["general_internal_medicine", "cardiology", "pediatrics", "dermatology"],
    emergency: true,
    noteEn: "Public hospital. Ambulance is 998.",
    noteUr: "سرکاری ہسپتال۔ ایمبولینس 998 ہے۔",
  },
  {
    id: "lon-111",
    cityId: "london",
    name: "NHS 111",
    area: "England",
    specialties: ["general_internal_medicine", "dermatology", "cardiology", "pediatrics", "psychiatry"],
    emergency: false,
    phone: "111",
    display: "111",
    noteEn: "Urgent help when it is not a 999 emergency. They direct you to the nearest open service.",
    noteUr: "جب 999 والی ایمرجنسی نہ ہو، فوری مدد۔ وہ قریب ترین کھلی سروس بتاتے ہیں۔",
  },
  {
    id: "lon-stt",
    cityId: "london",
    name: "St Thomas' Hospital emergency department",
    area: "Westminster",
    specialties: ["general_internal_medicine", "cardiology"],
    emergency: true,
    noteEn: "One A&E, not the only one. If you cannot travel safely, call 999.",
    noteUr: "ایک ای اینڈ ای، واحد نہیں۔ اگر محفوظ سفر نہ ہو تو 999 کال کریں۔",
  },
  {
    id: "man-111",
    cityId: "manchester",
    name: "NHS 111",
    area: "England",
    specialties: ["general_internal_medicine", "dermatology", "cardiology", "pediatrics", "psychiatry"],
    emergency: false,
    phone: "111",
    display: "111",
    noteEn: "Urgent help when it is not a 999 emergency.",
    noteUr: "جب 999 والی ایمرجنسی نہ ہو، فوری مدد۔",
  },
  {
    id: "man-mri",
    cityId: "manchester",
    name: "Manchester Royal Infirmary",
    area: "Oxford Road",
    specialties: ["general_internal_medicine", "cardiology", "dermatology"],
    emergency: true,
    noteEn: "Large emergency department. Call 999 if travelling is unsafe.",
    noteUr: "بڑی ایمرجنسی۔ اگر سفر محفوظ نہ ہو تو 999۔",
  },
  {
    id: "bhm-111",
    cityId: "birmingham",
    name: "NHS 111",
    area: "England",
    specialties: ["general_internal_medicine", "dermatology", "cardiology", "pediatrics", "psychiatry"],
    emergency: false,
    phone: "111",
    display: "111",
    noteEn: "Urgent help when it is not a 999 emergency.",
    noteUr: "جب 999 والی ایمرجنسی نہ ہو، فوری مدد۔",
  },
  {
    id: "bhm-qe",
    cityId: "birmingham",
    name: "Queen Elizabeth Hospital Birmingham",
    area: "Edgbaston",
    specialties: ["general_internal_medicine", "cardiology"],
    emergency: true,
    noteEn: "Major emergency department. Call 999 if travelling is unsafe.",
    noteUr: "بڑی ایمرجنسی۔ اگر سفر محفوظ نہ ہو تو 999۔",
  },
  {
    id: "sg-nhcs",
    cityId: "singapore",
    name: "National Heart Centre Singapore",
    area: "Outram Road, beside SGH",
    specialties: ["cardiology"],
    emergency: true,
    noteEn: "Public heart centre. If pain comes with sweating or breathlessness, call 995 instead of travelling alone.",
    noteUr: "سرکاری دل کا مرکز۔ اگر درد کے ساتھ پسینہ یا سانس پھولے تو اکیلے سفر کے بجائے 995 کال کریں۔",
  },
  {
    id: "sg-nsc",
    cityId: "singapore",
    name: "National Skin Centre",
    area: "Moulmein Road, Novena",
    specialties: ["dermatology"],
    emergency: false,
    noteEn: "Public skin specialist centre. Same-day slots are limited. If the rash spreads with fever, or lips or breathing are involved, call 995.",
    noteUr: "سرکاری جلد کا مرکز۔ اسی دن کی جگہ محدود ہو سکتی ہے۔ بخار کے ساتھ پھیلے، یا ہونٹ یا سانس متاثر ہوں تو 995۔",
  },
  {
    id: "sg-kkh",
    cityId: "singapore",
    name: "KK Women's and Children's Hospital",
    area: "Bukit Timah Road",
    specialties: ["pediatrics"],
    emergency: true,
    noteEn: "Public children's emergency. A very unwell child should come here, or by 995 if travel is unsafe.",
    noteUr: "بچوں کی سرکاری ایمرجنسی۔ بہت بیمار بچہ یہاں آئے، یا اگر سفر محفوظ نہ ہو تو 995۔",
  },
  {
    id: "sg-imh",
    cityId: "singapore",
    name: "Institute of Mental Health",
    area: "Buangkok Green",
    specialties: ["psychiatry"],
    emergency: true,
    phone: "63892222",
    display: "6389 2222",
    noteEn: "Public psychiatric hospital. Helpline 6389 2222. If someone may act on suicidal thoughts, call 995 first.",
    noteUr: "سرکاری نفسیاتی ہسپتال۔ ہیلپ لائن 6389 2222۔ خودکشی پر عمل کا خطرہ ہو تو پہلے 995۔",
  },
  {
    id: "sg-sgh",
    cityId: "singapore",
    name: "Singapore General Hospital emergency department",
    area: "Outram",
    specialties: ["general_internal_medicine", "cardiology", "dermatology"],
    emergency: true,
    noteEn: "Major public emergency department. Ambulance is 995. Ask for the on-duty specialist after you arrive.",
    noteUr: "بڑی سرکاری ایمرجنسی۔ ایمبولینس 995 ہے۔ پہنچ کر ڈیوٹی ماہر پوچھیں۔",
  },
  {
    id: "sg-nuh",
    cityId: "singapore",
    name: "National University Hospital emergency department",
    area: "Kent Ridge",
    specialties: ["general_internal_medicine", "pediatrics"],
    emergency: true,
    noteEn: "Public emergency department in the west. Ambulance is 995.",
    noteUr: "مغرب کی سرکاری ایمرجنسی۔ ایمبولینس 995 ہے۔",
  },
  {
    id: "sg-snec",
    cityId: "singapore",
    name: "Singapore National Eye Centre",
    area: "Outram, beside SGH",
    specialties: ["general_internal_medicine"],
    emergency: true,
    focus: ["eye"],
    noteEn: "Public eye centre. A sudden drop in vision or a painful eye should not wait on a routine list. Call 995 if travel is unsafe.",
    noteUr: "سرکاری آنکھ کا مرکز۔ اچانک نظر گرنا یا درد والی آنکھ معمول کی فہرست کا انتظار نہیں۔ سفر محفوظ نہ ہو تو 995۔",
  },
];

export type PlaceCard = {
  id: string;
  name: string;
  area: string;
  note: string;
  direct: boolean;
  phone?: string;
  display?: string;
};

export function suggestPlaces(
  cityId: string | undefined,
  specialty: SpecialtyId,
  emergency: boolean,
  lang: Lang,
  focus?: ClusterFocus | ClusterId,
): PlaceCard[] {
  if (!cityId || cityId === "other") return [];
  const inCity = FACILITIES.filter((place) => place.cityId === cityId);
  const focused = focus ? inCity.filter((place) => place.focus?.includes(focus as ClusterFocus)) : [];
  const ranked = emergency
    ? [
        ...inCity.filter((place) => place.emergency && place.specialties.includes(specialty)),
        ...inCity.filter((place) => place.emergency && !place.specialties.includes(specialty)),
      ]
    : focused.length > 0
      ? [
          ...focused,
          ...inCity.filter((place) => !focused.includes(place) && (place.specialties.includes(specialty) || place.specialties.includes("general_internal_medicine"))),
        ]
      : [
          ...inCity.filter((place) => place.specialties.includes(specialty)),
          ...inCity.filter(
            (place) =>
              !place.specialties.includes(specialty) &&
              (place.specialties.includes("general_internal_medicine") || place.phone === "111"),
          ),
        ];
  const seen = new Set<string>();
  const unique = ranked.filter((place) => {
    if (seen.has(place.id)) return false;
    seen.add(place.id);
    return true;
  });
  return unique.slice(0, 3).map((place, index) => ({
    id: place.id,
    name: place.name,
    area: place.area,
    note: lang === "ur" ? place.noteUr : place.noteEn,
    direct: index === 0,
    phone: place.phone,
    display: place.display,
  }));
}
