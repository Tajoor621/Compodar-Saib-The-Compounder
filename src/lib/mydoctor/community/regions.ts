export type LocalText = { en: string; ur: string };

export type Resource = {
  label: LocalText;
  url: string;
  phone?: string;
};

export type CareRegionId =
  "PK" | "IN" | "BD" | "NP" | "LK" | "BT" | "MV" | "AF-KBL" | "AE" | "SG" | "UK";

export type CareRegion = {
  id: CareRegionId;
  name: LocalText;
  emergency: Resource & { phone: string };
  access?: Resource;
};

export const CARE_REGIONS: readonly CareRegion[] = [
  {
    id: "PK",
    name: { en: "Pakistan", ur: "پاکستان" },
    emergency: {
      label: { en: "Rescue 1122 · where available", ur: "ریسکیو 1122 · جہاں دستیاب ہو" },
      phone: "1122",
      url: "https://www.rescue.gov.pk/ambulanceservice.aspx",
    },
    access: {
      label: {
        en: "Punjab directory · Basic Health Units and Rural Health Centres",
        ur: "پنجاب کی فہرست · بنیادی و دیہی مراکز صحت",
      },
      url: "https://pshealthpunjab.gov.pk/home/healthfacilities",
    },
  },
  {
    id: "IN",
    name: { en: "India", ur: "بھارت" },
    emergency: {
      label: { en: "National emergency response", ur: "قومی ایمرجنسی سروس" },
      phone: "112",
      url: "https://www.mha.gov.in/emergency-response-support-system-erss",
    },
    access: {
      label: {
        en: "eSanjeevani · government online consultations",
        ur: "ای سنجیونی · سرکاری آن لائن طبی مشاورت",
      },
      url: "https://esanjeevani.mohfw.gov.in/",
    },
  },
  {
    id: "BD",
    name: { en: "Bangladesh", ur: "بنگلہ دیش" },
    emergency: {
      label: { en: "National emergency service", ur: "قومی ایمرجنسی سروس" },
      phone: "999",
      url: "https://citizen.bd/en/seba/s/national_emergency_999",
    },
    access: {
      label: {
        en: "Shastho Batayon · speak to a doctor",
        ur: "شاستھو باتایون · ڈاکٹر سے بات کریں",
      },
      phone: "16263",
      url: "https://16263.dghs.gov.bd/",
    },
  },
  {
    id: "NP",
    name: { en: "Nepal", ur: "نیپال" },
    emergency: {
      label: { en: "Ambulance · where available", ur: "ایمبولینس · جہاں دستیاب ہو" },
      phone: "102",
      url: "https://www.gov.uk/foreign-travel-advice/nepal/getting-help",
    },
  },
  {
    id: "LK",
    name: { en: "Sri Lanka", ur: "سری لنکا" },
    emergency: {
      label: { en: "Suwa Seriya ambulance", ur: "سووا سیریا ایمبولینس" },
      phone: "1990",
      url: "https://www.1990.lk/",
    },
  },
  {
    id: "BT",
    name: { en: "Bhutan", ur: "بھوٹان" },
    emergency: {
      label: { en: "Ambulance", ur: "ایمبولینس" },
      phone: "112",
      url: "https://www.gov.uk/foreign-travel-advice/bhutan/getting-help",
    },
  },
  {
    id: "MV",
    name: { en: "Maldives", ur: "مالدیپ" },
    emergency: {
      label: { en: "Ambulance", ur: "ایمبولینس" },
      phone: "102",
      url: "https://www.gov.uk/foreign-travel-advice/maldives/getting-help",
    },
  },
  {
    id: "AF-KBL",
    name: { en: "Afghanistan · Kabul only", ur: "افغانستان · صرف کابل" },
    emergency: {
      label: {
        en: "Kabul ambulance · other provinces use local numbers",
        ur: "کابل ایمبولینس · دیگر صوبوں کے مقامی نمبر ہیں",
      },
      phone: "102",
      url: "https://www.gov.uk/foreign-travel-advice/afghanistan/health",
    },
  },
  {
    id: "AE",
    name: { en: "United Arab Emirates", ur: "متحدہ عرب امارات" },
    emergency: {
      label: { en: "Ambulance", ur: "ایمبولینس" },
      phone: "998",
      url: "https://u.ae/en/information-and-services/justice-safety-and-the-law/handling-emergencies",
    },
    access: {
      label: {
        en: "Dubai Medical Registry · facility directory",
        ur: "دبئی میڈیکل رجسٹری · طبی مراکز کی فہرست",
      },
      url: "https://dha.gov.ae/sheryan/wps/portal/home/medical-directory?facility=&locale=en",
    },
  },
  {
    id: "SG",
    name: { en: "Singapore", ur: "سنگاپور" },
    emergency: {
      label: { en: "SCDF emergency ambulance", ur: "ایس سی ڈی ایف ایمرجنسی ایمبولینس" },
      phone: "995",
      url: "https://www.scdf.gov.sg/home/about-scdf/emergency-medical-services",
    },
  },
  {
    id: "UK",
    name: { en: "United Kingdom", ur: "برطانیہ" },
    emergency: {
      label: { en: "Emergency services", ur: "ایمرجنسی سروس" },
      phone: "999",
      url: "https://www.gov.uk/guidance/999-and-112-the-uks-national-emergency-numbers",
    },
  },
];

export function careRegionForLocation(id: string | undefined): CareRegion | undefined {
  return CARE_REGIONS.find((region) => id === `country:${region.id}`);
}
