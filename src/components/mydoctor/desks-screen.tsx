import { FamilyCareLinks } from "@/components/mydoctor/family-care";
import { Link } from "@tanstack/react-router";
import { detectIdentifiers } from "@/lib/mydoctor/safety";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/mydoctor/copy";
import { assessDesk, dangerPrompt, DESKS, deskById, domainLine, suggestDesk } from "@/lib/mydoctor/desks/assess";
import { DANGER_ORDER, FOLLOW_QUESTIONS, followFor } from "@/lib/mydoctor/desks/questions";
import {
  loadProfiles,
  loadReports,
  profileHasIdentifiers,
  saveProfiles,
  saveReports,
  exportPortable,
  exportReports,
  mergePortable,
  parsePortable,
} from "@/lib/mydoctor/desks/store";
import type { Assessment, DeskId, DeskProfile, DeskReport, Relation, Sex } from "@/lib/mydoctor/desks/types";
import { useClinic } from "@/lib/mydoctor/store";
import type { AgeBand, DangerKey, Lang } from "@/lib/mydoctor/types";

const RELATIONS: Relation[] = ["me", "mother", "father", "child", "spouse", "relative"];
const AGES: AgeBand[] = ["0-28d", "1m-5y", "6-15", "16-64", "65+"];
const AGE_KEY = { "0-28d": "age0", "1m-5y": "age1", "6-15": "age6", "16-64": "age16", "65+": "age65" } as const;

const RELATION_LABEL: Record<Relation, { en: string; ur: string }> = {
  me: { en: "Me", ur: "میں" },
  mother: { en: "Mother", ur: "والدہ" },
  father: { en: "Father", ur: "والد" },
  child: { en: "Child", ur: "بچہ" },
  spouse: { en: "Spouse", ur: "شریک حیات" },
  relative: { en: "Relative", ur: "رشتہ دار" },
};

const CARE_LABEL: Record<Assessment["care"], { en: string; ur: string }> = {
  self_care: { en: "Discuss self-care with a pharmacist", ur: "خود کی دیکھ بھال فارماسسٹ سے بات کریں" },
  doctor: { en: "See a doctor", ur: "ڈاکٹر کو دکھائیں" },
  urgent: { en: "See a doctor within one to two days", ur: "ایک دو دن میں ڈاکٹر کو دکھائیں" },
  emergency: { en: "Emergency care now", ur: "ابھی ایمرجنسی" },
};

type Step =
  | { kind: "complaint" }
  | { kind: "danger"; key: DangerKey }
  | { kind: "pregnant" }
  | { kind: "follow"; id: string }
  | { kind: "report" };

function blankProfile(relation: Relation = "me"): DeskProfile {
  return {
    id: `profile-${Date.now().toString(36)}`,
    relation,
    nickname: "",
    ageBand: relation === "child" ? "6-15" : "16-64",
    sex: "unspecified",
    conditions: "",
    medicines: "",
    allergies: "",
    pastTreatments: "",
  };
}

export function DesksScreen() {
  const lang = useClinic((state) => state.lang);
  const [ready, setReady] = useState(false);
  const [profiles, setProfiles] = useState<DeskProfile[]>([]);
  const [reports, setReports] = useState<DeskReport[]>([]);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [editing, setEditing] = useState<DeskProfile | null>(null);
  const [profileError, setProfileError] = useState(false);
  const [started, setStarted] = useState<DeskId | null>(null);
  const [complaint, setComplaint] = useState("");
  const complaintHasIdentifiers = detectIdentifiers(complaint);
  const [danger, setDanger] = useState<Partial<Record<DangerKey, boolean>>>({});
  const [follow, setFollow] = useState<Record<string, string>>({});
  const [pregnant, setPregnant] = useState<"yes" | "no" | "unknown" | "na">("na");
  const [steps, setSteps] = useState<Step[]>([]);
  const [cursor, setCursor] = useState(0);
  const [openReport, setOpenReport] = useState<string | null>(null);
  const saved = useRef(false);

  useEffect(() => {
    setProfiles(loadProfiles());
    setReports(loadReports());
    setReady(true);
  }, []);

  const profile = profiles.find((item) => item.id === profileId) ?? null;
  const active = steps[cursor];
  const questionDesk = useMemo(() => {
    if (!started || !profile) return started;
    if (started !== "gp" || complaint.trim().length < 2) return started;
    return suggestDesk(complaint, profile.ageBand, profile.relation === "child" || profile.ageBand === "0-28d" || profile.ageBand === "1m-5y" || profile.ageBand === "6-15").desk;
  }, [started, profile, complaint]);

  function persistProfiles(next: DeskProfile[]) {
    setProfiles(next.slice(0, 12));
    saveProfiles(next);
  }

  function persistReports(next: DeskReport[]) {
    setReports(next.slice(0, 40));
    saveReports(next);
  }

  function begin(desk: DeskId) {
    setStarted(desk);
    setComplaint("");
    setDanger({});
    setFollow({});
    setPregnant("na");
    setOpenReport(null);
    setSteps([{ kind: "complaint" }]);
    setCursor(0);
    saved.current = false;
  }

  function saveProfile() {
    if (!editing || (profiles.length >= 12 && !profiles.some((item) => item.id === editing.id))) return;
    if (profileHasIdentifiers(editing)) {
      setProfileError(true);
      return;
    }
    setProfileError(false);
    const next = profiles.some((item) => item.id === editing.id)
      ? profiles.map((item) => (item.id === editing.id ? editing : item))
      : [...profiles, editing];
    persistProfiles(next);
    setProfileId(editing.id);
    setEditing(null);
  }

  function answerDanger(key: DangerKey, value: boolean) {
    const nextDanger = { ...danger, [key]: value };
    setDanger(nextDanger);
    if (value) {
      finish(nextDanger, follow, pregnant);
      return;
    }
    advance();
  }

  function answerFollow(id: string, value: string) {
    const next = { ...follow, [id]: value };
    setFollow(next);
    if (id === "sudden" && value === "yes") {
      finish({ ...danger, fast: true }, next, pregnant);
      return;
    }
    advance();
  }

  function advance() {
    setCursor((current) => current + 1);
  }

  function afterComplaint() {
    if (!profile || !started || complaintHasIdentifiers) return;
    const child = profile.relation === "child" || profile.ageBand === "0-28d" || profile.ageBand === "1m-5y" || profile.ageBand === "6-15";
    const target = started === "gp" ? suggestDesk(complaint, profile.ageBand, child).desk : started;
    const followSteps: Step[] = followFor(target).map((question) => ({ kind: "follow", id: question.id }));
    const pregnantStep: Step[] = profile.sex === "female" && profile.ageBand === "16-64" ? [{ kind: "pregnant" }] : [];
    const next: Step[] = [
      { kind: "complaint" },
      ...DANGER_ORDER.map((key) => ({ kind: "danger" as const, key })),
      ...pregnantStep,
      ...followSteps,
      { kind: "report" },
    ];
    setSteps(next);
    setCursor(1);
  }

  function finish(nextDanger: Partial<Record<DangerKey, boolean>>, nextFollow: Record<string, string>, nextPregnant: "yes" | "no" | "unknown" | "na") {
    if (!profile || !started || complaintHasIdentifiers) return;
    const child = profile.relation === "child" || profile.ageBand === "0-28d" || profile.ageBand === "1m-5y" || profile.ageBand === "6-15";
    const result = assessDesk({
      started,
      complaint,
      ageBand: profile.ageBand,
      sex: profile.sex,
      child,
      pregnant: nextPregnant,
      danger: nextDanger,
      follow: nextFollow,
      medicines: [profile.medicines, profile.conditions].filter(Boolean).join(", "),
    });
    const report: DeskReport = {
      id: `desk-${Date.now().toString(36)}`,
      createdAt: new Date().toISOString(),
      lang,
      profileId: profile.id,
      relation: profile.relation,
      nickname: profile.nickname || RELATION_LABEL[profile.relation].en,
      ageBand: profile.ageBand,
      complaint,
      follow: nextFollow,
      danger: nextDanger,
      result,
    };
    persistReports([report, ...reports]);
    setOpenReport(report.id);
    setSteps([{ kind: "report" }]);
    setCursor(0);
  }

  useEffect(() => {
    if (active?.kind === "report" && started && profile && !openReport && !saved.current) {
      saved.current = true;
      finish(danger, follow, pregnant);
    }
    // Save once when the question list reaches the report step.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active?.kind]);

  if (!ready) {
    return <h1 className="text-3xl font-semibold">{lang === "ur" ? "ماہر ڈیسک" : "Specialist desks"}</h1>;
  }

  const viewing = reports.find((report) => report.id === openReport) ?? null;

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold leading-tight">{lang === "ur" ? "ماہر ڈیسک" : "Specialist desks"}</h1>
        <p className="text-sm text-muted">
          {lang === "ur"
            ? "سوال ایک ایک کر کے۔ یہ تشخیص نہیں۔ ایمرجنسی میں مقامی ایمرجنسی کو کال کریں۔ ڈاکٹر کی جگہ نہیں۔"
            : "Questions come one at a time. This is not a diagnosis. In an emergency, contact local emergency services. It does not replace a doctor."}
        </p>
        <p className="text-sm text-muted">
          {lang === "ur"
            ? "نام، تاریخ پیدائش، یا ریکارڈ نمبر نہ لکھیں۔ رشتہ استعمال کریں، جیسے میں یا والدہ۔"
            : "Do not type names, birth dates, or record numbers. Use a relation such as Me or Mother."}
        </p>
      </div>

      {!started && !viewing && <FamilyCareLinks lang={lang} />}

      {!started && !viewing && (
        <>
          <Profiles
            lang={lang}
            profiles={profiles}
            profileId={profileId}
            editing={editing}
            error={profileError}
            onPick={setProfileId}
            onEdit={(profile) => {
              setProfileError(false);
              setEditing(profile);
            }}
            onChange={setEditing}
            onSave={saveProfile}
            onClose={() => setEditing(null)}
            onDelete={(id) => {
              persistProfiles(profiles.filter((item) => item.id !== id));
              if (profileId === id) setProfileId(null);
            }}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            {DESKS.map((desk) => (
              <button
                key={desk.id}
                type="button"
                disabled={!profile}
                className="min-h-11 rounded-xl border border-line bg-surface p-4 text-start disabled:opacity-50"
                onClick={() => begin(desk.id)}
              >
                <span className="block font-semibold">{lang === "ur" ? desk.ur : desk.en}</span>
                <span className="mt-1 block text-sm text-muted">{lang === "ur" ? desk.blurbUr : desk.blurbEn}</span>
              </button>
            ))}
          </div>
          <History
            lang={lang}
            reports={reports}
            profiles={profiles}
            onOpen={setOpenReport}
            onDelete={(id) => persistReports(reports.filter((item) => item.id !== id))}
            onClear={() => persistReports([])}
            onImport={(file) => {
              const merged = mergePortable(profiles, reports, file);
              persistProfiles(merged.profiles);
              persistReports(merged.reports);
            }}
          />
        </>
      )}

      {started && profile && active && active.kind !== "report" && !viewing && (
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold text-primary">
            {lang === "ur" ? deskById(started).ur : deskById(started).en}
            {questionDesk && questionDesk !== started ? ` · ${lang === "ur" ? deskById(questionDesk).ur : deskById(questionDesk).en}` : ""}
          </p>
          <p className="text-sm text-muted">
            {RELATION_LABEL[profile.relation][lang === "ur" ? "ur" : "en"]}
            {profile.nickname ? ` · ${profile.nickname}` : ""}
          </p>
          {active.kind === "complaint" && (
            <>
              <label className="flex flex-col gap-2 text-sm font-semibold">
                {lang === "ur" ? "اصل شکایت، اپنے الفاظ میں" : "Main complaint, in your own words"}
                <textarea
                  value={complaint}
                  onChange={(event) => setComplaint(event.target.value)}
                  rows={4}
                  className="min-h-24 rounded-xl border border-line bg-surface px-4 py-3 text-base font-normal"
                />
              </label>
              {complaintHasIdentifiers && <p role="alert">{t(lang, "identifierBlocked")}</p>}
              <Button disabled={complaint.trim().length < 2 || complaintHasIdentifiers} onClick={afterComplaint}>
                {lang === "ur" ? "اگلا" : "Next"}
              </Button>
            </>
          )}
          {active.kind === "danger" && (
            <YesNo
              prompt={dangerPrompt(active.key, lang)}
              lang={lang}
              onYes={() => answerDanger(active.key, true)}
              onNo={() => answerDanger(active.key, false)}
            />
          )}
          {active.kind === "pregnant" && (
            <YesNo
              prompt={lang === "ur" ? "کیا حمل ہے، یا ہو سکتا ہے؟" : "Pregnant, or could be?"}
              lang={lang}
              onYes={() => {
                setPregnant("yes");
                advance();
              }}
              onNo={() => {
                setPregnant("no");
                advance();
              }}
            />
          )}
          {active.kind === "follow" && (
            <FollowPrompt id={active.id} lang={lang} onYes={() => answerFollow(active.id, "yes")} onNo={() => answerFollow(active.id, "no")} />
          )}
          <Button
            variant="outline"
            onClick={() => {
              if (cursor === 0) {
                setStarted(null);
                return;
              }
              setCursor((current) => current - 1);
            }}
          >
            {t(lang, "back")}
          </Button>
        </div>
      )}

      {viewing && (
        <ReportView
          lang={lang}
          report={viewing}
          onBack={() => {
            setOpenReport(null);
            setStarted(null);
          }}
          onDelete={() => {
            persistReports(reports.filter((item) => item.id !== viewing.id));
            setOpenReport(null);
            setStarted(null);
          }}
        />
      )}
    </section>
  );
}

function YesNo({ prompt, lang, onYes, onNo }: { prompt: string; lang: Lang; onYes: () => void; onNo: () => void }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-lg font-semibold">{prompt}</p>
      <div className="flex gap-2">
        <Button onClick={onYes}>{lang === "ur" ? "ہاں" : "Yes"}</Button>
        <Button variant="outline" onClick={onNo}>{lang === "ur" ? "نہیں" : "No"}</Button>
      </div>
    </div>
  );
}

function FollowPrompt({ id, lang, onYes, onNo }: { id: string; lang: Lang; onYes: () => void; onNo: () => void }) {
  const question = FOLLOW_QUESTIONS.find((item) => item.id === id);
  return <YesNo prompt={question ? (lang === "ur" ? question.ur : question.en) : id} lang={lang} onYes={onYes} onNo={onNo} />;
}

function Profiles({
  lang,
  profiles,
  profileId,
  editing,
  error,
  onPick,
  onEdit,
  onChange,
  onSave,
  onDelete,
  onClose,
}: {
  lang: Lang;
  profiles: DeskProfile[];
  profileId: string | null;
  editing: DeskProfile | null;
  error: boolean;
  onPick: (id: string) => void;
  onEdit: (profile: DeskProfile) => void;
  onChange: (profile: DeskProfile) => void;
  onSave: () => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}) {
  const ur = lang === "ur";
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-xl font-semibold">{ur ? "کس کے لیے؟" : "Who is this for?"}</h2>
      <div className="flex flex-wrap gap-2">
        {profiles.map((profile) => (
          <button
            key={profile.id}
            type="button"
            className={`min-h-11 rounded-xl border px-3 text-sm font-semibold ${profileId === profile.id ? "border-primary bg-primary/10" : "border-line bg-surface"}`}
            onClick={() => onPick(profile.id)}
          >
            {RELATION_LABEL[profile.relation][ur ? "ur" : "en"]}
            {profile.nickname ? ` · ${profile.nickname}` : ""}
          </button>
        ))}
        <Button variant="outline" onClick={() => onEdit(blankProfile())}>{ur ? "نیا پروفائل" : "New profile"}</Button>
      </div>
      {editing && (
        <div className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-4">
          <label className="flex flex-col gap-1 text-sm font-semibold">
            {ur ? "رشتہ" : "Relation"}
            <select
              value={editing.relation}
              onChange={(event) => onChange({ ...editing, relation: event.target.value as Relation })}
              className="min-h-11 rounded-xl border border-line bg-bg px-3"
            >
              {RELATIONS.map((relation) => (
                <option key={relation} value={relation}>{RELATION_LABEL[relation][ur ? "ur" : "en"]}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm font-semibold">
            {ur ? "عرف، نام نہیں" : "Nickname, not a legal name"}
            <input
              value={editing.nickname}
              onChange={(event) => onChange({ ...editing, nickname: event.target.value })}
              className="min-h-11 rounded-xl border border-line bg-bg px-3"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-semibold">
            {ur ? "عمر" : "Age"}
            <select
              value={editing.ageBand}
              onChange={(event) => onChange({ ...editing, ageBand: event.target.value as AgeBand })}
              className="min-h-11 rounded-xl border border-line bg-bg px-3"
            >
              {AGES.map((age) => (
                <option key={age} value={age}>{t(lang, AGE_KEY[age])}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm font-semibold">
            {ur ? "جنس" : "Sex"}
            <select
              value={editing.sex}
              onChange={(event) => onChange({ ...editing, sex: event.target.value as Sex })}
              className="min-h-11 rounded-xl border border-line bg-bg px-3"
            >
              <option value="unspecified">{ur ? "نہ بتائیں" : "Unspecified"}</option>
              <option value="female">{ur ? "خاتون" : "Female"}</option>
              <option value="male">{ur ? "مرد" : "Male"}</option>
            </select>
          </label>
          {(["conditions", "medicines", "allergies", "pastTreatments"] as const).map((field) => (
            <label key={field} className="flex flex-col gap-1 text-sm font-semibold">
              {field === "conditions"
                ? ur ? "پہلے سے موجود حالتیں" : "Pre-existing conditions"
                : field === "medicines"
                  ? ur ? "موجودہ ادویات" : "Current medicines"
                  : field === "allergies"
                    ? ur ? "الرجی" : "Allergies"
                    : ur ? "پرانا علاج" : "Past treatments"}
              <textarea
                value={editing[field]}
                onChange={(event) => onChange({ ...editing, [field]: event.target.value })}
                rows={2}
                className="rounded-xl border border-line bg-bg px-3 py-2 font-normal"
              />
            </label>
          ))}
          {error && <p className="text-sm text-accent">{t(lang, "identifierBlocked")}</p>}
          <div className="flex gap-2">
            <Button onClick={onSave}>{ur ? "محفوظ کریں" : "Save"}</Button>
            <Button variant="outline" onClick={onClose}>{ur ? "رد کریں" : "Cancel"}</Button>
            {profiles.some((item) => item.id === editing.id) && (
              <Button variant="ghost" onClick={() => onDelete(editing.id)}>{ur ? "مٹائیں" : "Delete"}</Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function History({
  lang,
  reports,
  profiles,
  onOpen,
  onDelete,
  onClear,
  onImport,
}: {
  lang: Lang;
  reports: DeskReport[];
  profiles: DeskProfile[];
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
  onImport: (file: NonNullable<ReturnType<typeof parsePortable>>) => void;
}) {
  const ur = lang === "ur";
  const [importError, setImportError] = useState(false);
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-xl font-semibold">{ur ? "پچھلی رپورٹیں" : "Past reports"}</h2>
      {reports.length === 0 && <p className="text-sm text-muted">{ur ? "ابھی کوئی رپورٹ نہیں۔" : "No reports yet."}</p>}
      {reports.map((report) => (
        <div key={report.id} className="flex flex-wrap items-center gap-2 rounded-xl border border-line bg-surface p-3">
          <button type="button" className="min-h-11 flex-1 text-start" onClick={() => onOpen(report.id)}>
            <span className="block font-semibold">{deskById(report.result.suggested)[ur ? "ur" : "en"]}</span>
            <span className="block text-sm text-muted">{report.complaint.slice(0, 80)}</span>
          </button>
          <Button variant="outline" onClick={() => onDelete(report.id)}>{ur ? "مٹائیں" : "Delete"}</Button>
        </div>
      ))}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => download(exportPortable(profiles, reports), "compodar-saib-portable.json")}>
          {ur ? "فائل برآمد کریں" : "Export file"}
        </Button>
        <label className="inline-flex min-h-11 cursor-pointer items-center rounded-xl border border-line bg-surface px-4 text-sm font-semibold">
          {ur ? "فائل درآمد کریں" : "Import file"}
          <input
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (!file) return;
              if (file.size > 2_000_000) {
                setImportError(true);
                return;
              }
              const reader = new FileReader();
              reader.onerror = () => setImportError(true);
              reader.onload = () => {
                const parsed = parsePortable(String(reader.result ?? ""));
                if (!parsed) {
                  setImportError(true);
                  return;
                }
                setImportError(false);
                onImport(parsed);
              };
              reader.readAsText(file);
            }}
          />
        </label>
        {reports.length > 0 && <Button variant="ghost" onClick={onClear}>{ur ? "سب صاف کریں" : "Clear all"}</Button>}
      </div>
      {importError && (
        <p className="text-sm text-accent" role="alert">
          {ur ? "یہ فائل پروفائل اور رپورٹ نہیں لگی۔" : "That file is not a profiles and reports export."}
        </p>
      )}
      <p className="text-xs text-muted">
        {ur
          ? "فائل دوسرے براؤزر یا ڈیوائس پر لے جا کر درآمد کی جا سکتی ہے۔ سائن اِن والی ہم آہنگی سرور والی اشاعت پر رہتی ہے۔"
          : "The file can be imported in another browser or on another device. Sign-in sync stays on the server build."}
      </p>
    </div>
  );
}

function ReportView({ lang, report, onBack, onDelete }: { lang: Lang; report: DeskReport; onBack: () => void; onDelete: () => void }) {
  const ur = lang === "ur";
  const result = report.result;
  const desk = deskById(result.suggested);
  const emergencyDomain = result.ruleIds[0] ? domainLine(result.ruleIds[0], lang) : "";
  return (
    <article className="flex flex-col gap-4" id="desk-report">
      <p className="text-sm font-semibold text-primary">{ur ? "ممکنہ اسباب، ڈاکٹر سے بات کے لیے" : "Possible causes to discuss with a doctor"}</p>
      <h2 className="text-2xl font-semibold">{result.emergency ? t(lang, "urgentNow") : ur ? desk.ur : desk.en}</h2>
      {result.emergency && (
        <>
          <p>{emergencyDomain}</p>
          <Link to="/community-care" hash="emergency" className="inline-flex min-h-11 items-center font-semibold text-primary underline">
            {ur ? "اپنے علاقے کا ایمرجنسی نمبر تلاش کریں" : "Find the emergency number for your current location"}
          </Link>
        </>
      )}
      {!result.emergency && (
        <>
          <p className="font-semibold">{CARE_LABEL[result.care][ur ? "ur" : "en"]}</p>
          {result.childReview && (
            <Link to="/family-care" search={{ track: "children" }} className="inline-flex min-h-11 items-center font-semibold text-primary underline">
              {ur ? "بچوں کی صحت اور مقامی مدد" : "Child health and local care"}
            </Link>
          )}
          {result.mentalReview && (
            <p>{ur ? "کہانی مزاج کی ہے۔ موجودہ نوٹ ذہنی صحت کے ڈاکٹر کی طرف اشارہ کرتے ہیں۔" : "The story is about mood. The existing notes point to a mental health doctor."}</p>
          )}
          {result.uncovered && (
            <p>{ur ? "نوٹس اس نمونے کا سبب نہیں بتاتے۔ فیملی ڈاکٹر دیکھے۔ اندازہ نہیں۔" : "The notes do not name a cause for this pattern. A family doctor should review it. Nothing was guessed."}</p>
          )}
          {result.causes.map((cause) => (
            <section key={cause.id} className="rounded-xl border border-line bg-surface p-4">
              <h3 className="font-semibold">{ur ? cause.titleUr : cause.titleEn}</h3>
              <p className="mt-2">{ur ? cause.detailUr : cause.detailEn}</p>
              <p className="mt-2 text-xs text-muted">{cause.sourceId} · {ur ? cause.sourceUr : cause.sourceEn}</p>
            </section>
          ))}
          <p>{ur ? result.watchUr : result.watchEn}</p>
          <ul className="flex flex-col gap-1">
            {(ur ? result.askUr : result.askEn).map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          {result.medicineIds.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="font-semibold">{ur ? "فارماسسٹ ڈیسک" : "Pharmacist desk"}</p>
              {result.medicineIds.map((id) => (
                <a key={id} href={`${import.meta.env.BASE_URL}pharmacy?q=${encodeURIComponent(id)}`} className="font-semibold text-primary">
                  {id}
                </a>
              ))}
              <p className="text-sm text-muted">{ur ? "اس رپورٹ پر کوئی خوراک نہیں۔ ہاتھ والا پیک کارڈ پر فوقیت رکھتا ہے۔" : "This report states no dose. The pack in hand overrides the card."}</p>
            </div>
          )}
        </>
      )}
      <p className="text-sm font-semibold">{t(lang, "pharmVerify")}</p>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => download(exportReports([report]), "compodar-saib-desk-report.json")}>{ur ? "فائل" : "Export file"}</Button>
        <Button variant="outline" onClick={() => window.print()}>{ur ? "چھپائیں" : "Print"}</Button>
        <Button variant="outline" onClick={onDelete}>{ur ? "مٹائیں" : "Delete"}</Button>
        <Button variant="ghost" onClick={onBack}>{t(lang, "back")}</Button>
      </div>
    </article>
  );
}

function download(contents: string, filename: string) {
  const blob = new Blob([contents], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
