import { DOMAIN_PLAIN, REVIEW_LINE, t, urgencyPlain, type CopyKey } from "./copy.ts";
import { emergencyContacts } from "./facilities.ts";
import { cityName, regionForCity, suggestPlaces, type PlaceCard } from "./places.ts";
import { clusterFor, type ClusterId } from "./routing.ts";
import { careFor, emergencyBridge, emergencyChecks, emergencyHelp, homeRemedies, inspectionNotes, type CareItem } from "./suggestions.ts";
import type { CaseRecord, Lang } from "./types.ts";

export type ShownItem = {
  inn: string;
  why: string;
  caution: string;
  brands: { id: string; brand: string; detail: string }[];
};

export type PatientView = {
  showEmergency: boolean;
  paragraphs: string[];
  roman: string[];
  phones: { name: string; detail: string; phone: string; display: string }[];
  waiting: boolean;
  verdict: string | null;
  signer: string | null;
  brandNote: boolean;
  normalKept: boolean;
  abnormalRaised: boolean;
  tests: string[];
  testsMost: string[];
  testsAlso: string[];
  inspection: string[];
  heard: string[];
  hospitalChecks: string[];
  firstAid: string[];
  counter: ShownItem[];
  emergencyMeds: ShownItem[];
  clinicianOnly: ShownItem[];
  withheld: string;
  places: PlaceCard[];
  city: string;
  doctorNear: boolean;
  farFromCare: boolean;
  home: string[];
};

function opener(record: CaseRecord): string {
  const lang = record.lang;
  const story = clusterFor(record.intake.complaint, record.intake.ageBand, record.intake.forWhom);
  const specific: Partial<Record<ClusterId, CopyKey>> = {
    gut: "storyGut",
    urine: "storyUrine",
    cough: "storyCough",
    joint: "storyJoint",
    eye: "storyEye",
  };
  const key = specific[story];
  if (key && record.routing.primarySpecialty === "general_internal_medicine") return t(lang, key);
  return REVIEW_LINE[lang][record.routing.primarySpecialty];
}

function heardLines(record: CaseRecord): string[] {
  const lang = record.lang;
  const specialty = record.routing.primarySpecialty;
  const labels: Record<string, CopyKey> = {
    where: "where",
    spread: "spread",
    round: "roundEdge",
    night: "nightItch",
    eye: "eyeInvolved",
    exertion: "exertion",
    known: "knownHeart",
    rest: "restPain",
    ankles: "ankles",
    alreadyAspirin: "alreadyAspirin",
    note: "moodHow",
    safety: "othersUnsafe",
    tasks: "tasks",
    sleep: "sleepWorse",
    weeks: "moodWeeks",
    drinking: "drinking",
    alert: "alert",
    rash: "childRash",
    feverLong: "feverLong",
    weightKg: "childWeight",
    thirst: "thirst",
    weight: "weight",
    knownSugar: "knownSugar",
    vomit: "vomit",
    worry: "worry",
    pain: "painMain",
    burn: "gutBurn",
    loose: "looseStool",
    blood: "gutBlood",
    weightLoss: "weightLoss",
    urineBurn: "urineBurn",
    flank: "flank",
    lessWater: "lessWater",
    longCough: "longCough",
    sputum: "sputum",
    coughBlood: "coughBlood",
    coughWake: "coughWake",
    jointWhere: "jointWhere",
    jointSwell: "jointSwell",
    stomach: "stomachUlcer",
    vision: "visionWorse",
    eyePain: "eyePain",
    light: "lightHurts",
    discharge: "eyeDischarge",
    oneEye: "oneEye",
    nightUrine: "nightUrine",
    painWhere: "painWhere",
    site: "skinSite",
    skinHot: "skinHot",
    settle: "painSettles",
    jawNow: "jawNow",
    recentHarm: "recentHarm",
    fewerWet: "fewerWet",
    burnNight: "burnNight",
    urineBlood: "urineBlood",
    sweats: "nightSweats",
    cannotBear: "cannotBear",
    fever: specialty === "pediatrics" ? "childFever" : "feverWith",
  };
  const lines: string[] = [];
  for (const [id, value] of Object.entries(record.intake.cluster)) {
    if (!value || id === "clusterId") continue;
    const key = labels[id];
    if (!key) continue;
    const answer = value === "yes" ? t(lang, "yes") : value === "no" ? t(lang, "no") : value;
    lines.push(`${t(lang, key)} ${answer}`);
  }
  return lines;
}

function showItem(item: CareItem, lang: Lang): ShownItem {
  return {
    inn: item.inn,
    why: lang === "ur" ? item.whyUr : item.whyEn,
    caution: lang === "ur" ? item.cautionUr : item.cautionEn,
    brands: item.brands.map((brand) => ({
      id: brand.id,
      brand: `${brand.brand} · ${brand.strength}`,
      detail: `${brand.company} · ${brand.packSize} · ${brand.mrpNote}`,
    })),
  };
}

export function patientView(record: CaseRecord): PatientView {
  const lang: Lang = record.lang;
  const paragraphs: string[] = [];
  const roman: string[] = [];
  const emergency = record.status === "red" || record.routing.urgency === "RED";
  const cityId = record.intake.cityId;
  if (emergency) {
    paragraphs.push(t(lang, "urgentNow"));
    roman.push(t(lang, "urgentRoman"));
    const domain = record.gate.hits[0]?.domain;
    if (domain && DOMAIN_PLAIN[lang][domain]) paragraphs.push(DOMAIN_PLAIN[lang][domain]);
  } else {
    paragraphs.push(opener(record));
    if (record.routing.confidence === "low") paragraphs.push(t(lang, "uncertain"));
    const pace = urgencyPlain(lang, record.routing.urgency);
    if (pace) paragraphs.push(pace);
    paragraphs.push(t(lang, "worse"));
  }
  paragraphs.push(t(lang, "prepared"));
  roman.push(t(lang, "preparedRoman"));

  const psych = record.gate.hits.some((hit) => hit.domain === "Psychiatric");
  const care = careFor(record.routing, record.intake);
  const domains = record.gate.hits.map((hit) => hit.domain);
  const region = regionForCity(cityId);
  const text = (item: { en: string; ur: string }) => (lang === "ur" ? item.ur : item.en);
  const visibleTests = emergency ? [] : care.tests;
  const places = suggestPlaces(
    cityId,
    record.routing.primarySpecialty,
    emergency,
    lang,
    clusterFor(record.intake.complaint, record.intake.ageBand, record.intake.forWhom),
  );
  return {
    showEmergency: emergency,
    paragraphs,
    roman,
    phones: emergency && region ? emergencyContacts(record.jurisdiction, psych, region) : [],
    waiting: record.status !== "signed",
    verdict: record.verdict?.text ?? null,
    signer: record.verdict?.signerLabel ?? null,
    brandNote: (record.verdict?.selectedBrandIds.length ?? 0) > 0,
    normalKept: record.intake.reportNormal,
    abnormalRaised: record.intake.reportAbnormal,
    tests: visibleTests.map(text),
    testsMost: visibleTests.filter((item) => item.rank === "most").map(text),
    testsAlso: visibleTests.filter((item) => item.rank !== "most").map(text),
    inspection: emergency ? [] : inspectionNotes(record.routing, record.intake).map(text),
    heard: emergency ? [] : heardLines(record),
    hospitalChecks: emergency ? emergencyChecks(domains).map(text) : [],
    firstAid: emergency ? emergencyHelp(domains).map(text) : [],
    counter: emergency ? [] : care.counter.map((item) => showItem(item, lang)),
    emergencyMeds: emergency ? emergencyBridge(domains, record.intake).map((item) => showItem(item, lang)) : [],
    clinicianOnly: emergency ? [] : care.clinicianOnly.map((item) => showItem(item, lang)),
    withheld: lang === "ur" ? care.withheldUr : care.withheldEn,
    places,
    city: cityName(cityId, lang),
    doctorNear: !emergency && places.length > 0,
    farFromCare: !emergency && record.intake.reachCare === "neither",
    home: emergency ? [] : homeRemedies(record.routing, record.intake).map(text),
  };
}
