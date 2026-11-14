import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useClinic } from "@/lib/mydoctor/store";
import { CARE_REGIONS } from "@/lib/mydoctor/community/regions";
import { GUIDES } from "@/lib/mydoctor/community/triage";
import {
  CARE_TRACKS,
  TRACK_LABELS,
  FAMILY_GUIDES,
  assessFamilyCare,
  questionsFor,
  type Answer,
  type CareTrack,
} from "@/lib/mydoctor/community/family-care";
import type { Lang } from "@/lib/mydoctor/types";

const copy = {
  en: {
    title: "Children and women’s health",
    intro:
      "Check warning signs and find the right care for a child, pregnancy, or period and pelvic symptoms.",
    yes: "Yes",
    no: "No",
    unsure: "Not sure",
    reset: "Start over",
    back: "Previous question",
    emergency: "Get emergency help now",
    urgent: "Get medical care now",
    complete:
      "You reported none of the warning signs checked here. Seek care if symptoms worsen, persist, or you are worried.",
    hospital:
      "Contact the appropriate hospital or clinical team now. If the person is seriously unwell or cannot travel safely, call local emergency services.",
    where: "Patient’s current location",
    choose: "Choose your location",
    other: "Elsewhere or unsure",
    emergencyNumbers: "Find the local emergency number",
    withoutSignal: "If a call does not connect, ask someone nearby to help arrange safe transport.",
    help: "Find a local health service",
    area: "Village, town or district",
    map: "Search on Google Maps",
    mapNote:
      "Map search sends the area you type to Google. Check the service before travelling for routine care.",
    vaccination: "Pakistan routine vaccination support · call 1166",
    sources: "Sources",
    do: "What you can do",
    avoid: "What to avoid",
    follow: "When to seek help",
    caution:
      "These guides cover supportive care. A healthcare professional can examine the patient and advise on treatment.",
  },
  ur: {
    title: "بچوں اور خواتین کی صحت",
    intro:
      "بچوں، حمل، یا ماہواری اور پیڑو کی علامات میں خطرے کی نشانیاں دیکھیں اور مناسب طبی مدد تلاش کریں۔",
    yes: "ہاں",
    no: "نہیں",
    unsure: "یقین نہیں",
    reset: "دوبارہ شروع کریں",
    back: "پچھلا سوال",
    emergency: "ابھی ایمرجنسی مدد لیں",
    urgent: "ابھی طبی مدد لیں",
    complete:
      "آپ نے پوچھے گئے خطرے کی علامات میں سے کسی کی اطلاع نہیں دی۔ علامات بڑھیں، برقرار رہیں یا تشویش ہو تو طبی مدد لیں۔",
    hospital:
      "ابھی متعلقہ ہسپتال یا طبی ٹیم سے رابطہ کریں۔ طبیعت بہت خراب ہو یا سفر محفوظ نہ ہو تو مقامی ایمرجنسی کو کال کریں۔",
    where: "مریض اس وقت کہاں ہے؟",
    choose: "مقام منتخب کریں",
    other: "کوئی اور جگہ یا معلوم نہیں",
    emergencyNumbers: "مقامی ایمرجنسی نمبر تلاش کریں",
    withoutSignal: "کال نہ لگے تو کسی قریبی شخص سے محفوظ سفر کا انتظام کرنے میں مدد لیں۔",
    help: "مقامی طبی سہولت تلاش کریں",
    area: "گاؤں، شہر یا ضلع",
    map: "گوگل نقشے پر تلاش کریں",
    mapNote:
      "نقشے کی تلاش میں درج علاقہ گوگل کو بھیجا جاتا ہے۔ معمول کے معائنے کے لیے نکلنے سے پہلے سہولت کی تصدیق کریں۔",
    vaccination: "پاکستان میں بچوں کی معمول کی ویکسین · 1166 پر کال کریں",
    sources: "ذرائع",
    do: "آپ کیا کر سکتے ہیں",
    avoid: "کن چیزوں سے بچیں",
    follow: "مدد کب لیں",
    caution:
      "یہ رہنمائی گھر پر معاون دیکھ بھال کے لیے ہے۔ مریض کے معائنے اور علاج کے لیے طبی کارکن سے رابطہ کریں۔",
  },
};

const panel = "grid gap-3 rounded-xl border border-line bg-surface p-4";
const link =
  "inline-flex min-h-11 items-center font-semibold text-primary underline underline-offset-4";

export function FamilyCareLinks({ lang }: { lang: Lang }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {CARE_TRACKS.map((track) => (
        <Link
          key={track}
          to="/family-care"
          search={{ track }}
          className="min-h-11 rounded-xl border border-line bg-surface p-3 text-sm font-semibold text-primary"
        >
          {TRACK_LABELS[track][lang]}
        </Link>
      ))}
    </div>
  );
}

export function FamilyCare({ track }: { track: CareTrack }) {
  const lang = useClinic((state) => state.lang);
  const labels = copy[lang];
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [location, setLocation] = useState("");
  const [area, setArea] = useState("");
  const region = CARE_REGIONS.find((item) => item.id === location);
  const result = track === "remedies" ? null : assessFamilyCare(track, answers);
  const flagged = result?.status === "emergency" || result?.status === "urgent";
  const question =
    track !== "remedies" && result?.status === "screening"
      ? questionsFor(track)[answers.length]
      : undefined;
  const service =
    track === "children"
      ? "paediatric clinic"
      : track === "pregnancy"
        ? "maternity hospital"
        : "gynaecology clinic";
  const mapQuery = [service, area.trim(), region?.name.en].filter(Boolean).join(", ");
  const guides = FAMILY_GUIDES.filter((guide) =>
    track === "remedies" ? !guide.id.endsWith("handoff") : guide.tracks.includes(track),
  );

  return (
    <div className="grid gap-5">
      <header className="grid gap-2">
        <h1 className="text-3xl font-semibold">{labels.title}</h1>
        <p className="text-muted">{labels.intro}</p>
      </header>
      <FamilyCareLinks lang={lang} />
      <section className={panel}>
        <h2 className="text-xl font-semibold">{TRACK_LABELS[track][lang]}</h2>
        <div aria-live="polite">
          {question && track !== "remedies" && (
            <>
              <p className="text-sm text-muted">
                <bdi>
                  {answers.length + 1} / {questionsFor(track).length}
                </bdi>
              </p>
              <p className="text-lg">{question.prompt[lang]}</p>
            </>
          )}
          {flagged && (
            <p role="alert" className="text-xl font-semibold text-accent">
              {labels[result.status]}
            </p>
          )}
          {result?.status === "complete" && <p>{labels.complete}</p>}
        </div>
        {question && (
          <div className="grid grid-cols-3 gap-2">
            {(["yes", "no", "unsure"] as const).map((answer) => (
              <Button
                key={answer}
                variant="outline"
                className="px-2"
                onClick={() => setAnswers([...answers, answer])}
              >
                {labels[answer]}
              </Button>
            ))}
          </div>
        )}
        {question && answers.length > 0 && (
          <Button variant="ghost" onClick={() => setAnswers(answers.slice(0, -1))}>
            {labels.back}
          </Button>
        )}
        {result && result.status !== "screening" && (
          <Button variant="ghost" onClick={() => setAnswers([])}>
            {labels.reset}
          </Button>
        )}
        {flagged && (
          <>
            <p>{labels.hospital}</p>
            <a className={link} href={result.source.url} target="_blank" rel="noreferrer">
              {result.source.title}
            </a>
          </>
        )}
        {track === "remedies" && <p>{labels.caution}</p>}
      </section>
      {track !== "remedies" && (
        <section className={panel}>
          <label htmlFor="family-location" className="font-semibold">
            {labels.where}
          </label>
          <select
            id="family-location"
            className="min-h-11 rounded-lg border border-line bg-bg px-3"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
          >
            <option value="" disabled>
              {labels.choose}
            </option>
            {CARE_REGIONS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name[lang]}
              </option>
            ))}
            <option value="other">{labels.other}</option>
          </select>
          {region && (
            <a className={link} href={`tel:${region.emergency.phone}`}>
              {region.emergency.label[lang]} · <bdi>{region.emergency.phone}</bdi>
            </a>
          )}
          <Link className={link} to="/community-care" hash="emergency">
            {labels.emergencyNumbers}
          </Link>
          {flagged && <p className="text-sm">{labels.withoutSignal}</p>}
          {!flagged && (
            <>
              <h2 className="mt-2 text-lg font-semibold">{labels.help}</h2>
              <label htmlFor="family-area">{labels.area}</label>
              <input
                id="family-area"
                maxLength={100}
                className="min-h-11 rounded-lg border border-line bg-bg px-3"
                value={area}
                onChange={(event) => setArea(event.target.value)}
              />
              {area.trim() && (
                <a
                  className={link}
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {labels.map}
                </a>
              )}
              <p className="text-sm text-muted">{labels.mapNote}</p>
              {track === "children" && region?.id === "PK" && (
                <>
                  <a className={link} href="tel:1166">
                    {labels.vaccination}
                  </a>
                  <a
                    className={link}
                    href="https://www.epi.gov.pk/sehat-tahaffuz-helpline/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Pakistan Federal Directorate of Immunization
                  </a>
                </>
              )}
            </>
          )}
        </section>
      )}
      {(!flagged || track === "pregnancy") &&
        guides.map((guide) => (
          <section key={guide.id} className={panel}>
            <h3 className="text-lg font-semibold">{guide.title[lang]}</h3>
            <p>
              <strong className="block">{labels.do}</strong>
              {guide.do[lang]}
            </p>
            {guide.avoid && (
              <p>
                <strong className="block">{labels.avoid}</strong>
                {guide.avoid[lang]}
              </p>
            )}
            <p>
              <strong className="block">{labels.follow}</strong>
              {guide.follow[lang]}
            </p>
            <ul aria-label={labels.sources}>
              {guide.sources.map((source) => (
                <li key={source.url}>
                  <a className={link} href={source.url} target="_blank" rel="noreferrer">
                    {source.title}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))}
      {track === "remedies" &&
        GUIDES.filter((guide) => guide.id === "fever" || guide.id === "heat").map((guide) => (
          <section key={guide.id} className={panel}>
            <h3 className="text-lg font-semibold">{guide.title[lang]}</h3>
            <p>{guide.warning[lang]}</p>
            <p>{guide.support[lang]}</p>
            <p>{guide.followUp[lang]}</p>
            <ul aria-label={labels.sources}>
              {guide.sources.map((source) => (
                <li key={source.url}>
                  <a className={link} href={source.url} target="_blank" rel="noreferrer">
                    {source.name}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))}
    </div>
  );
}
