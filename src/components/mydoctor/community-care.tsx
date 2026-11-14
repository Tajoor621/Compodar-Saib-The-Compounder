import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, HeartPulse, MapPin, Phone } from "lucide-react";
import { CARE_REGIONS } from "@/lib/mydoctor/community/regions";
import {
  DANGER_SIGNS,
  GUIDES,
  nextCareStep,
  TRIAGE_SOURCES,
} from "@/lib/mydoctor/community/triage";
import { useClinic } from "@/lib/mydoctor/store";

const COPY = {
  en: {
    title: "Community care",
    intro: "Check danger signs, find local help and learn what you can do while arranging care.",
    emergency: "Emergency help",
    location: "Where is the patient now?",
    pick: "Select country or territory",
    other: "Other country or not sure",
    fallback:
      "Call the emergency number for your current location. If a call does not connect, ask someone nearby to call or help arrange safe transport to the nearest emergency department.",
    call: "Call",
    source: "Source and coverage",
    dangerTitle: "Check for danger signs",
    dangerPrompt: "Does the person have any of these signs?",
    yes: "Yes",
    no: "No",
    unsure: "Not sure",
    emergencyResult: "Get emergency help now",
    uncertainty: "If you cannot tell whether a danger sign is present, seek urgent help now.",
    reset: "Check again",
    noSigns:
      "You reported none of the listed signs. Seek medical care if symptoms worsen or you are worried.",
    sources: "Guidance sources",
    guides: "Care while arranging help",
    signs: "When to seek help",
    support: "What you can do",
    follow: "Follow-up",
    find: "Find a health service",
    area: "Village, town or district",
    service: "Type of service",
    map: "Search on Google Maps",
    mapNote:
      "Map search needs internet and shares the area you enter with Google. Check hours and services before travelling for routine care.",
    firstContact:
      "For routine care, ask a community health worker or local primary care centre. If the person needs emergency care, call for help before looking for a clinic.",
    scope:
      "This quick check supports care decisions. A health professional can assess symptoms, confirm the cause and advise on treatment.",
    intake: "Open the detailed symptom intake",
  },
  ur: {
    title: "مقامی طبی رہنمائی",
    intro:
      "خطرے کی علامات دیکھیں، مقامی مدد تلاش کریں اور جانیں کہ مدد کے انتظام کے دوران کیا کر سکتے ہیں۔",
    emergency: "ایمرجنسی مدد",
    location: "مریض اس وقت کہاں ہے؟",
    pick: "ملک یا علاقہ منتخب کریں",
    other: "دوسرا ملک یا معلوم نہیں",
    fallback:
      "اپنے موجودہ علاقے کا ایمرجنسی نمبر ملائیں۔ کال نہ لگے تو کسی قریبی شخص سے کہیں کہ فون کرے یا قریبی ایمرجنسی تک محفوظ سفر کا انتظام کرنے میں مدد کرے۔",
    call: "کال کریں",
    source: "نمبر کا ذریعہ اور دستیابی",
    dangerTitle: "خطرے کی علامات دیکھیں",
    dangerPrompt: "کیا مریض میں ان میں سے کوئی علامت ہے؟",
    yes: "ہاں",
    no: "نہیں",
    unsure: "یقین نہیں",
    emergencyResult: "ابھی ایمرجنسی مدد لیں",
    uncertainty: "اگر معلوم نہ ہو کہ خطرے کی کوئی علامت موجود ہے یا نہیں، تو ابھی فوری مدد لیں۔",
    reset: "دوبارہ دیکھیں",
    noSigns:
      "آپ نے درج علامات میں سے کسی کی اطلاع نہیں دی۔ علامات بڑھیں یا تشویش ہو تو طبی مدد لیں۔",
    sources: "طبی رہنمائی کے ذرائع",
    guides: "مدد کے انتظام کے دوران دیکھ بھال",
    signs: "مدد کب لیں",
    support: "آپ کیا کر سکتے ہیں",
    follow: "مزید دیکھ بھال",
    find: "طبی سہولت تلاش کریں",
    area: "گاؤں، شہر یا ضلع",
    service: "سہولت کی قسم",
    map: "گوگل نقشے پر تلاش کریں",
    mapNote:
      "نقشے کے لیے انٹرنیٹ چاہیے اور درج کیا ہوا علاقہ گوگل کو بھیجا جاتا ہے۔ معمول کی دیکھ بھال کے لیے نکلنے سے پہلے اوقات اور سہولیات معلوم کریں۔",
    firstContact:
      "معمول کی دیکھ بھال کے لیے مقامی طبی کارکن یا بنیادی مرکز صحت سے پوچھیں۔ ایمرجنسی میں کلینک ڈھونڈنے سے پہلے مدد کے لیے کال کریں۔",
    scope:
      "یہ مختصر جائزہ اگلا قدم چننے میں مدد دیتا ہے۔ علامات، وجہ اور علاج کا فیصلہ طبی کارکن کر سکتا ہے۔",
    intake: "علامات کا تفصیلی جائزہ کھولیں",
  },
};

const SERVICES = [
  { en: "Primary care clinic", ur: "بنیادی طبی مرکز" },
  { en: "Public hospital", ur: "سرکاری ہسپتال" },
  { en: "Maternity clinic", ur: "زچہ و بچہ مرکز" },
  { en: "Pharmacy", ur: "فارمیسی" },
];

const panel = "rounded-2xl border border-line bg-surface p-4 sm:p-6";
const action = "inline-flex min-h-11 items-center gap-2 rounded-xl px-4 py-2 font-semibold";
const field = "min-h-11 w-full rounded-lg border border-line bg-bg px-3 text-ink";
const sourceLink =
  "inline-flex min-h-11 items-center gap-1 text-sm font-semibold underline underline-offset-4";

export function CommunityCare() {
  const lang = useClinic((state) => state.lang);
  const copy = COPY[lang];
  const [country, setCountry] = useState("");
  const [answers, setAnswers] = useState<("yes" | "no" | "unsure")[]>([]);
  const [area, setArea] = useState("");
  const [service, setService] = useState(SERVICES[0].en);
  const region = CARE_REGIONS.find((item) => item.id === country);
  const status = nextCareStep(answers);
  const needsHelp = status === "emergency";
  const localService =
    country === "PK" && service === SERVICES[0].en
      ? "Basic Health Unit or Rural Health Centre"
      : service;
  const query = [localService, area.trim(), region?.name.en].filter(Boolean).join(", ");
  const map = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  const index = answers.length;

  return (
    <div className="grid gap-5">
      <div className="grid gap-2">
        <h1 className="text-4xl font-semibold leading-tight">{copy.title}</h1>
        <p className="text-lg text-muted">{copy.intro}</p>
      </div>

      <section
        id="emergency"
        className="scroll-mt-28 rounded-2xl border border-accent/40 bg-accent/5 p-4 sm:p-6"
      >
        <h2 className="flex items-center gap-2 text-xl font-semibold text-accent">
          <Phone aria-hidden="true" className="size-5" />
          {copy.emergency}
        </h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1 font-semibold">
            {copy.location}
            <select
              className={field}
              value={country}
              onChange={(event) => setCountry(event.target.value)}
            >
              <option value="" disabled>
                {copy.pick}
              </option>
              {CARE_REGIONS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name[lang]}
                </option>
              ))}
              <option value="other">{copy.other}</option>
            </select>
          </label>
          {region && (
            <div className="grid justify-items-start">
              <a
                className={`${action} bg-accent text-accent-fg`}
                href={`tel:${region.emergency.phone}`}
              >
                {copy.call} <bdi>{region.emergency.phone}</bdi>
              </a>
              <span className="mt-1 text-sm">{region.emergency.label[lang]}</span>
              <a
                className={sourceLink}
                href={region.emergency.url}
                target="_blank"
                rel="noreferrer"
              >
                {copy.source}
              </a>
            </div>
          )}
        </div>
        <p className="mt-2 text-sm">{copy.fallback}</p>
      </section>

      <section className={panel}>
        <h2 className="flex items-center gap-2 text-xl font-semibold">
          <HeartPulse aria-hidden="true" className="size-5 text-primary" />
          {copy.dangerTitle}
        </h2>
        <div className="mt-3" aria-live="polite">
          {needsHelp && (
            <div className="rounded-xl border border-accent/40 bg-accent/5 p-4">
              <p className="text-xl font-semibold text-accent">{copy.emergencyResult}</p>
              {answers.includes("unsure") && <p>{copy.uncertainty}</p>}
              <a
                className={`${action} mt-2 bg-accent text-accent-fg`}
                href={region ? `tel:${region.emergency.phone}` : "#emergency"}
              >
                {region ? (
                  <>
                    {copy.call} <bdi>{region.emergency.phone}</bdi>
                  </>
                ) : (
                  copy.emergency
                )}
              </a>
              <p className="mt-2 text-sm">{copy.fallback}</p>
            </div>
          )}
          {status === "guides" && <p>{copy.noSigns}</p>}
          {status === "unanswered" && (
            <p className="text-lg">
              <span className="block text-sm text-muted">
                {copy.dangerPrompt}{" "}
                <bdi>
                  {index + 1} / {DANGER_SIGNS.length}
                </bdi>
              </span>
              {DANGER_SIGNS[index][lang]}
            </p>
          )}
        </div>
        {status === "unanswered" ? (
          <div className="mt-3 grid grid-cols-3 gap-2">
            {(["yes", "no", "unsure"] as const).map((value) => (
              <button
                key={value}
                type="button"
                className="min-h-11 rounded-xl border border-line bg-bg px-2 font-semibold hover:border-primary"
                onClick={() => setAnswers([...answers, value])}
              >
                {copy[value]}
              </button>
            ))}
          </div>
        ) : (
          <button type="button" className={sourceLink} onClick={() => setAnswers([])}>
            {copy.reset}
          </button>
        )}
        <details className="mt-2">
          <summary className="min-h-11 cursor-pointer py-3 text-sm font-semibold">
            {copy.sources}
          </summary>
          <ul className="grid gap-1">
            {TRIAGE_SOURCES.map((source) => (
              <li key={source.url}>
                <a className={sourceLink} href={source.url} target="_blank" rel="noreferrer">
                  {source.name}
                </a>
              </li>
            ))}
          </ul>
        </details>
      </section>

      {!needsHelp && (
        <>
          <section className={panel}>
            <h2 className="flex items-center gap-2 text-xl font-semibold">
              <MapPin aria-hidden="true" className="size-5 text-primary" />
              {copy.find}
            </h2>
            <p className="mt-2 text-sm text-muted">{copy.firstContact}</p>
            {region?.access && (
              <div className="mt-2 flex flex-wrap items-center gap-x-3">
                <a className={sourceLink} href={region.access.url} target="_blank" rel="noreferrer">
                  {region.access.label[lang]} <ArrowUpRight aria-hidden="true" className="size-4" />
                </a>
                {region.access.phone && (
                  <a className={sourceLink} href={`tel:${region.access.phone}`}>
                    {copy.call} <bdi>{region.access.phone}</bdi>
                  </a>
                )}
              </div>
            )}
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1 font-semibold">
                {copy.area}
                <input
                  className={field}
                  value={area}
                  maxLength={100}
                  onChange={(event) => setArea(event.target.value)}
                />
              </label>
              <label className="grid gap-1 font-semibold">
                {copy.service}
                <select
                  className={field}
                  value={service}
                  onChange={(event) => setService(event.target.value)}
                >
                  {SERVICES.map((item) => (
                    <option key={item.en} value={item.en}>
                      {item[lang]}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            {area.trim() && (
              <a
                className={`${action} mt-3 bg-primary text-primary-fg`}
                href={map}
                target="_blank"
                rel="noreferrer"
              >
                {copy.map} <ArrowUpRight aria-hidden="true" className="size-4" />
              </a>
            )}
            <p className="mt-2 text-sm text-muted">{copy.mapNote}</p>
          </section>

          <section className={panel}>
            <h2 className="text-xl font-semibold">{copy.guides}</h2>
            <div className="mt-3 divide-y divide-line border-y border-line">
              {GUIDES.map((guide) => (
                <details key={guide.id}>
                  <summary className="min-h-11 cursor-pointer py-3 font-semibold">
                    {guide.title[lang]}
                  </summary>
                  <dl className="grid gap-2 pb-2 text-sm">
                    <div className="rounded-lg bg-accent/5 p-3">
                      <dt className="font-semibold text-accent">{copy.signs}</dt>
                      <dd>{guide.warning[lang]}</dd>
                    </div>
                    <div className="p-2">
                      <dt className="font-semibold">{copy.support}</dt>
                      <dd>{guide.support[lang]}</dd>
                    </div>
                    <div className="p-2">
                      <dt className="font-semibold">{copy.follow}</dt>
                      <dd>{guide.followUp[lang]}</dd>
                    </div>
                  </dl>
                  <ul className="grid pb-2">
                    {guide.sources.map((source) => (
                      <li key={source.url}>
                        <a
                          className={sourceLink}
                          href={source.url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {source.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </details>
              ))}
            </div>
          </section>
        </>
      )}
      <p className="text-sm text-muted">{copy.scope}</p>
      {!needsHelp && (
        <Link to="/intake" className={sourceLink}>
          {copy.intake}
        </Link>
      )}
    </div>
  );
}
