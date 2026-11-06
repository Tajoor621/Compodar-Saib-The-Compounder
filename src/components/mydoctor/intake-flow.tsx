import { useNavigate } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { Mic, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DANGER_TEXT, t, type CopyKey } from "@/lib/mydoctor/copy";
import { evaluateGate } from "@/lib/mydoctor/rules";
import { clusterFor, type ClusterId } from "@/lib/mydoctor/routing";
import { CITIES, nearestCity } from "@/lib/mydoctor/places";
import { canListen, listenOnce, speak, stopSpeaking } from "@/lib/mydoctor/speech";
import { useClinic } from "@/lib/mydoctor/store";
import { DANGER_KEYS, type AgeBand, type RuleId } from "@/lib/mydoctor/types";
import { detectIdentifiers } from "@/lib/mydoctor/safety";

type Step = "consent" | "person" | "place" | "complaint" | "confirm" | "danger" | "cluster" | "follow" | "reach" | "meds";

const AGES: { id: AgeBand; key: CopyKey }[] = [
  { id: "0-28d", key: "age0" },
  { id: "1m-5y", key: "age1" },
  { id: "6-15", key: "age6" },
  { id: "16-64", key: "age16" },
  { id: "65+", key: "age65" },
];

const DURATIONS: CopyKey[] = ["hours", "days", "weeks", "months", "longer"];

const CLUSTER_FIELDS: Record<ClusterId, { id: string; kind: "yesno" | "text"; key: CopyKey }[]> = {
  skin: [
    { id: "where", kind: "text", key: "where" },
    { id: "fever", kind: "yesno", key: "feverWith" },
    { id: "spread", kind: "yesno", key: "spread" },
    { id: "round", kind: "yesno", key: "roundEdge" },
    { id: "night", kind: "yesno", key: "nightItch" },
    { id: "eye", kind: "yesno", key: "eyeInvolved" },
  ],
  heart: [
    { id: "exertion", kind: "yesno", key: "exertion" },
    { id: "known", kind: "yesno", key: "knownHeart" },
    { id: "rest", kind: "yesno", key: "restPain" },
    { id: "ankles", kind: "yesno", key: "ankles" },
    { id: "alreadyAspirin", kind: "yesno", key: "alreadyAspirin" },
  ],
  mood: [
    { id: "note", kind: "text", key: "moodHow" },
    { id: "safety", kind: "yesno", key: "othersUnsafe" },
    { id: "tasks", kind: "yesno", key: "tasks" },
    { id: "sleep", kind: "yesno", key: "sleepWorse" },
    { id: "weeks", kind: "yesno", key: "moodWeeks" },
  ],
  child: [
    { id: "drinking", kind: "yesno", key: "drinking" },
    { id: "alert", kind: "yesno", key: "alert" },
    { id: "fever", kind: "yesno", key: "childFever" },
    { id: "rash", kind: "yesno", key: "childRash" },
    { id: "feverLong", kind: "yesno", key: "feverLong" },
    { id: "weightKg", kind: "text", key: "childWeight" },
  ],
  metabolic: [
    { id: "thirst", kind: "yesno", key: "thirst" },
    { id: "weight", kind: "yesno", key: "weight" },
    { id: "knownSugar", kind: "yesno", key: "knownSugar" },
    { id: "vomit", kind: "yesno", key: "vomit" },
  ],
  gut: [
    { id: "burn", kind: "yesno", key: "gutBurn" },
    { id: "loose", kind: "yesno", key: "looseStool" },
    { id: "blood", kind: "yesno", key: "gutBlood" },
    { id: "weightLoss", kind: "yesno", key: "weightLoss" },
  ],
  urine: [
    { id: "urineBurn", kind: "yesno", key: "urineBurn" },
    { id: "fever", kind: "yesno", key: "feverWith" },
    { id: "flank", kind: "yesno", key: "flank" },
    { id: "lessWater", kind: "yesno", key: "lessWater" },
  ],
  cough: [
    { id: "longCough", kind: "yesno", key: "longCough" },
    { id: "fever", kind: "yesno", key: "feverWith" },
    { id: "sputum", kind: "yesno", key: "sputum" },
    { id: "coughBlood", kind: "yesno", key: "coughBlood" },
    { id: "coughWake", kind: "yesno", key: "coughWake" },
  ],
  joint: [
    { id: "jointWhere", kind: "text", key: "jointWhere" },
    { id: "jointSwell", kind: "yesno", key: "jointSwell" },
    { id: "stomach", kind: "yesno", key: "stomachUlcer" },
    { id: "fever", kind: "yesno", key: "feverWith" },
  ],
  eye: [
    { id: "vision", kind: "yesno", key: "visionWorse" },
    { id: "eyePain", kind: "yesno", key: "eyePain" },
    { id: "light", kind: "yesno", key: "lightHurts" },
    { id: "discharge", kind: "yesno", key: "eyeDischarge" },
  ],
  general: [
    { id: "worry", kind: "text", key: "worry" },
    { id: "fever", kind: "yesno", key: "feverWith" },
    { id: "pain", kind: "yesno", key: "painMain" },
  ],
};

type FollowField = {
  id: string;
  kind: "yesno" | "text";
  key: CopyKey;
  when: (cluster: Record<string, string>) => boolean;
  escalate?: "chest" | "suicide";
};

const FOLLOWS: Record<ClusterId, FollowField[]> = {
  skin: [
    { id: "site", kind: "text", key: "skinSite", when: (cluster) => cluster.round === "yes" },
    { id: "skinHot", kind: "yesno", key: "skinHot", when: (cluster) => cluster.spread === "yes" || cluster.fever === "yes" },
  ],
  heart: [
    {
      id: "settle",
      kind: "yesno",
      key: "painSettles",
      when: (cluster) => cluster.exertion === "yes" && cluster.rest !== "yes",
    },
    { id: "jawNow", kind: "yesno", key: "jawNow", when: (cluster) => cluster.rest === "yes", escalate: "chest" },
  ],
  mood: [{ id: "recentHarm", kind: "yesno", key: "recentHarm", when: () => true, escalate: "suicide" }],
  child: [{ id: "fewerWet", kind: "yesno", key: "fewerWet", when: (cluster) => cluster.drinking === "yes" || cluster.fever === "yes" }],
  metabolic: [{ id: "nightUrine", kind: "yesno", key: "nightUrine", when: (cluster) => cluster.thirst === "yes" || cluster.knownSugar === "yes" }],
  gut: [{ id: "burnNight", kind: "yesno", key: "burnNight", when: (cluster) => cluster.burn === "yes" && cluster.blood !== "yes" }],
  urine: [{ id: "urineBlood", kind: "yesno", key: "urineBlood", when: (cluster) => cluster.urineBurn === "yes" }],
  cough: [{ id: "sweats", kind: "yesno", key: "nightSweats", when: (cluster) => cluster.longCough === "yes" || cluster.sputum === "yes" }],
  joint: [{ id: "cannotBear", kind: "yesno", key: "cannotBear", when: (cluster) => cluster.jointSwell === "yes" }],
  eye: [{ id: "oneEye", kind: "yesno", key: "oneEye", when: (cluster) => cluster.discharge === "yes" && cluster.vision !== "yes" }],
  general: [{ id: "painWhere", kind: "text", key: "painWhere", when: (cluster) => cluster.pain === "yes" }],
};

const INSPECT: Record<ClusterId, CopyKey> = {
  skin: "inspectSkin",
  heart: "inspectHeart",
  mood: "inspectMood",
  child: "inspectChild",
  metabolic: "inspectSugar",
  gut: "inspectGut",
  urine: "inspectUrine",
  cough: "inspectCough",
  joint: "inspectJoint",
  eye: "inspectEye",
  general: "inspectGeneral",
};

export function IntakeFlow() {
  const navigate = useNavigate();
  const lang = useClinic((state) => state.lang);
  const intake = useClinic((state) => state.intake);
  const patchIntake = useClinic((state) => state.patchIntake);
  const confirmRule = useClinic((state) => state.confirmRule);
  const submitCase = useClinic((state) => state.submitCase);
  const [step, setStep] = useState<Step>("consent");
  const [dangerIndex, setDangerIndex] = useState(0);
  const [consent, setConsent] = useState(false);
  const [listening, setListening] = useState(false);
  const [heard, setHeard] = useState<string | null>(null);
  const [lowConfidence, setLowConfidence] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [privacyError, setPrivacyError] = useState(false);
  const [slow, setSlow] = useState(false);
  const [medsOk, setMedsOk] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locNote, setLocNote] = useState<string | null>(null);
  const [qIndex, setQIndex] = useState(0);
  const stopRef = useRef<{ stop: () => void } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const pending = useMemo(
    () =>
      evaluateGate({
        answers: intake.danger,
        transcript: intake.complaint,
        confirmed: intake.confirmed,
        denied: intake.denied,
        ageBand: intake.ageBand,
      }).pending,
    [intake],
  );

  const cluster = clusterFor(intake.complaint, intake.ageBand, intake.forWhom);
  const fields = CLUSTER_FIELDS[cluster];
  const childAges = intake.forWhom === "child";
  const askPregnancy = !childAges && (intake.ageBand === "16-64" || intake.ageBand === "65+");

  function say(text: string) {
    speak(text, lang, slow);
  }

  function finish(recordId: string | null) {
    if (!recordId) {
      setStep("confirm");
      return;
    }
    void navigate({ to: "/case/$caseId", params: { caseId: recordId } });
  }

  function submitNow() {
    const freeText = [intake.complaint, intake.medications, intake.allergies, intake.reportName, intake.asrNote, ...Object.values(intake.cluster)].join(" ");
    if (detectIdentifiers(freeText)) {
      setPrivacyError(true);
      return;
    }
    setPrivacyError(false);
    const record = submitCase();
    finish(record ? record.id : null);
  }

  function startVoice() {
    setVoiceError(null);
    if (!canListen()) {
      setVoiceError(t(lang, "voiceMissing"));
      return;
    }
    setListening(true);
    stopRef.current = listenOnce(
      lang,
      (transcript, confidence) => {
        setListening(false);
        setHeard(transcript);
        setLowConfidence(confidence < 0.72);
        patchIntake({ voiceUsed: true, asrNote: confidence < 0.72 ? t(lang, "lowAsr") : "Voice accepted after read-back." });
      },
      (code) => {
        setListening(false);
        setVoiceError(code === "unsupported" || code === "not-allowed" ? t(lang, "voiceMissing") : t(lang, "noisy"));
      },
    );
  }

  function stopVoice() {
    stopRef.current?.stop();
    setListening(false);
    stopSpeaking();
  }

  const storyReady = intake.complaint.trim().length >= 3 && Boolean(intake.duration);
  const steps: Step[] = ["consent", "person", "place", "complaint", "confirm", "danger", "cluster", "follow", "reach", "meds"];
  const stepIndex = Math.max(0, steps.indexOf(step));

  function usePhoneLocation() {
    setLocNote(null);
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocNote(t(lang, "locMissing"));
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const city = nearestCity(position.coords.latitude, position.coords.longitude);
        patchIntake({ cityId: city.id });
        setLocating(false);
        setLocNote(`${t(lang, "locFound")}: ${lang === "ur" ? city.ur : city.en}`);
      },
      () => {
        setLocating(false);
        setLocNote(t(lang, "locDenied"));
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 },
    );
  }

  function openDanger() {
    const firstOpen = DANGER_KEYS.findIndex((key) => typeof intake.danger[key] !== "boolean");
    setDangerIndex(firstOpen === -1 ? DANGER_KEYS.length - 1 : firstOpen);
    setStep("danger");
  }

  function afterComplaint() {
    const gate = evaluateGate({
      answers: intake.danger,
      transcript: intake.complaint,
      confirmed: intake.confirmed,
      denied: intake.denied,
      ageBand: intake.ageBand,
    });
    if (gate.level === "RED") {
      submitNow();
      return;
    }
    setStep(gate.pending.length ? "confirm" : "danger");
    if (!gate.pending.length) openDanger();
  }

  return (
    <div className="flex flex-col gap-6">
      {privacyError && <p role="alert" className="rounded-xl border border-accent bg-accent/10 p-3 text-sm text-accent">{t(lang, "identifierBlocked")}</p>}
      <div className="h-2 overflow-hidden rounded-full bg-line" aria-hidden="true">
        <div
          className="h-full bg-primary"
          style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
        />
      </div>
      {step === "consent" && (
        <section className="flex flex-col gap-4">
          <h1 className="text-3xl font-semibold leading-tight">{t(lang, "consentTitle")}</h1>
          <p className="text-muted">{t(lang, "consentBody")}</p>
          <label className="flex items-start gap-3 rounded-xl border border-line bg-surface p-4">
            <input
              type="checkbox"
              className="mt-1 size-5 accent-primary"
              checked={consent}
              onChange={(event) => setConsent(event.target.checked)}
            />
            <span>{t(lang, "consentCheck")}</span>
          </label>
          <Button
            full
            disabled={!consent}
            onClick={() => {
              if (storyReady && !intake.cityId) setStep("place");
              else if (storyReady) setStep("complaint");
              else setStep("person");
            }}
          >
            {t(lang, "continue")}
          </Button>
        </section>
      )}

      {step === "person" && (
        <section className="flex flex-col gap-4">
          <h1 className="text-3xl font-semibold">{t(lang, "personTitle")}</h1>
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                ["self", "whoSelf"],
                ["child", "whoChild"],
                ["other", "whoOther"],
              ] as const
            ).map(([id, key]) => (
              <button
                key={id}
                type="button"
                aria-pressed={intake.forWhom === id}
                className={chip(intake.forWhom === id)}
                onClick={() =>
                  patchIntake({
                    forWhom: id,
                    pregnant: id === "child" ? "na" : intake.pregnant,
                    ageBand: id === "child" && (intake.ageBand === "16-64" || intake.ageBand === "65+") ? "6-15" : intake.ageBand,
                  })
                }
              >
                {t(lang, key)}
              </button>
            ))}
          </div>
          <p className="text-sm font-semibold text-muted">{t(lang, "ageLabel")}</p>
          <div className="grid gap-2">
            {AGES.filter((age) => (childAges ? age.id !== "16-64" && age.id !== "65+" : true)).map((age) => (
              <button
                key={age.id}
                type="button"
                aria-pressed={intake.ageBand === age.id}
                className={chip(intake.ageBand === age.id)}
                onClick={() => patchIntake({ ageBand: age.id, pregnant: age.id === "0-28d" || age.id === "1m-5y" || age.id === "6-15" ? "na" : intake.pregnant })}
              >
                {t(lang, age.key)}
              </button>
            ))}
          </div>
          {askPregnancy && (
            <fieldset className="flex flex-col gap-2">
              <legend className="text-sm font-semibold text-muted">{t(lang, "pregnantLabel")}</legend>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    ["yes", "yes"],
                    ["no", "no"],
                    ["unknown", "preferNot"],
                  ] as const
                ).map(([id, key]) => (
                  <button
                    key={id}
                    type="button"
                    className={chip(intake.pregnant === id)}
                    aria-pressed={intake.pregnant === id}
                    onClick={() => patchIntake({ pregnant: id })}
                  >
                    {t(lang, key)}
                  </button>
                ))}
              </div>
            </fieldset>
          )}
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={() => setStep("consent")}>
              {t(lang, "back")}
            </Button>
            <Button
              onClick={() => setStep("place")}
              disabled={askPregnancy && intake.pregnant === "na"}
            >
              {t(lang, "continue")}
            </Button>
          </div>
        </section>
      )}

      {step === "place" && (
        <section className="flex flex-col gap-4">
          <h1 className="text-3xl font-semibold">{t(lang, "placeTitle")}</h1>
          <p className="text-muted">{t(lang, "placeHint")}</p>
          <Button variant="outline" disabled={locating} onClick={usePhoneLocation}>
            {locating ? t(lang, "locWorking") : t(lang, "locUse")}
          </Button>
          {locNote && <p className="text-sm text-muted">{locNote}</p>}
          {(
            [
              ["SG", "placeSg"],
              ["AE", "placeAe"],
              ["PK", "placePk"],
              ["UK", "placeUk"],
            ] as const
          ).map(([group, key]) => (
            <div key={group} className="flex flex-col gap-2">
              <p className="text-sm font-semibold text-muted">{t(lang, key)}</p>
              <div className="flex flex-wrap gap-2">
                {CITIES.filter((city) => city.group === group && city.id !== "other").map((city) => (
                  <button
                    key={city.id}
                    type="button"
                    aria-pressed={intake.cityId === city.id}
                    className={chip(intake.cityId === city.id)}
                    onClick={() => patchIntake({ cityId: city.id })}
                  >
                    {lang === "ur" ? city.ur : city.en}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <button
            type="button"
            aria-pressed={intake.cityId === "other"}
            className={chip(intake.cityId === "other")}
            onClick={() => patchIntake({ cityId: "other" })}
          >
            {(lang === "ur" ? CITIES.find((city) => city.id === "other")?.ur : CITIES.find((city) => city.id === "other")?.en) ?? ""}
          </button>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={() => setStep("person")}>
              {t(lang, "back")}
            </Button>
            <Button disabled={!intake.cityId} onClick={() => setStep("complaint")}>
              {t(lang, "continue")}
            </Button>
          </div>
        </section>
      )}

      {step === "complaint" && (
        <section className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-3xl font-semibold">{t(lang, "complaintTitle")}</h1>
            <Button variant="ghost" onClick={() => say(t(lang, "complaintHint"))}>
              {t(lang, "repeat")}
            </Button>
          </div>
          <p className="text-muted">{t(lang, "complaintHint")}</p>
          {storyReady && <p className="text-sm text-muted">{t(lang, "storyLoaded")}</p>}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-muted">
              {t(lang, intake.forWhom === "self" ? "whoSelf" : intake.forWhom === "child" ? "whoChild" : "whoOther")}
              {" · "}
              {t(lang, AGES.find((age) => age.id === intake.ageBand)?.key ?? "age16")}
            </p>
            <Button variant="ghost" onClick={() => setStep("person")}>
              {t(lang, "changeWho")}
            </Button>
          </div>
          <textarea
            value={intake.complaint}
            onChange={(event) => patchIntake({ complaint: event.target.value })}
            rows={4}
            className="w-full rounded-xl border border-line bg-surface p-4 text-lg text-ink outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          />
          <div className="flex flex-wrap gap-2">
            {!listening ? (
              <Button variant="outline" onClick={startVoice}>
                <Mic className="size-4" aria-hidden="true" />
                {t(lang, "speak")}
              </Button>
            ) : (
              <Button variant="accent" onClick={stopVoice}>
                <Square className="size-4" aria-hidden="true" />
                {t(lang, "stop")}
              </Button>
            )}
            <Button variant="ghost" onClick={() => setSlow((value) => !value)} aria-pressed={slow}>
              {t(lang, "slower")}
            </Button>
          </div>
          {voiceError && <p className="text-sm text-accent">{voiceError}</p>}
          {heard && (
            <div className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-4">
              <p className="font-semibold">{t(lang, "heard")}</p>
              {lowConfidence && <p className="text-sm text-accent">{t(lang, "noisy")}</p>}
              <p>{heard}</p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => {
                    patchIntake({ complaint: heard });
                    setHeard(null);
                  }}
                >
                  {t(lang, "correct")}
                </Button>
                <Button variant="outline" onClick={() => setHeard(null)}>
                  {t(lang, "tryAgain")}
                </Button>
              </div>
            </div>
          )}
          <p className="text-sm font-semibold text-muted">{t(lang, "durationLabel")}</p>
          <div className="flex flex-wrap gap-2">
            {DURATIONS.map((key) => (
              <button
                key={key}
                type="button"
                className={chip(intake.duration === t(lang, key))}
                onClick={() => patchIntake({ duration: t(lang, key) })}
              >
                {t(lang, key)}
              </button>
            ))}
          </div>
          <p className="text-sm font-semibold text-muted">{t(lang, "severityLabel")}</p>
          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((level) => (
              <button
                key={level}
                type="button"
                className={chip(intake.severity === level)}
                onClick={() => patchIntake({ severity: level })}
              >
                {level}
              </button>
            ))}
          </div>
          <div className="flex justify-between text-sm text-muted">
            <span>{t(lang, "mild")}</span>
            <span>{t(lang, "severe")}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={() => setStep("place")}>
              {t(lang, "back")}
            </Button>
            <Button
              disabled={intake.complaint.trim().length < 3 || !intake.duration || heard !== null}
              onClick={afterComplaint}
            >
              {t(lang, "continue")}
            </Button>
          </div>
        </section>
      )}

      {step === "confirm" && (
        <ConfirmStep
          pendingId={pending[0]?.ruleId}
          excerpt={pending[0]?.excerpt || intake.complaint}
          onYes={() => {
            if (!pending[0]) return;
            confirmRule(pending[0].ruleId, true);
            submitNow();
          }}
          onNo={() => {
            const current = pending[0];
            if (!current) {
              openDanger();
              return;
            }
            confirmRule(current.ruleId, false);
            const next = evaluateGate({
              answers: intake.danger,
              transcript: intake.complaint,
              confirmed: intake.confirmed,
              denied: [...intake.denied, current.ruleId],
              ageBand: intake.ageBand,
            });
            if (next.level === "RED") {
              submitNow();
              return;
            }
            if (next.pending.length === 0) openDanger();
          }}
        />
      )}

      {step === "danger" && (
        <DangerStep
          index={dangerIndex}
          slow={slow}
          onSlow={() => setSlow((value) => !value)}
          onSpeak={say}
          onYes={() => {
            const key = DANGER_KEYS[dangerIndex];
            if (!key) return;
            patchIntake({ danger: { ...intake.danger, [key]: true } });
            submitNow();
          }}
          onNo={() => {
            const key = DANGER_KEYS[dangerIndex];
            if (!key) return;
            patchIntake({ danger: { ...intake.danger, [key]: false } });
            if (dangerIndex < DANGER_KEYS.length - 1) setDangerIndex(dangerIndex + 1);
            else {
              setQIndex(0);
              setStep("cluster");
            }
          }}
          onBack={() => {
            if (dangerIndex > 0) setDangerIndex(dangerIndex - 1);
            else setStep(pending.length ? "confirm" : "complaint");
          }}
        />
      )}

      {step === "cluster" && (
        <InspectStep
          fields={fields}
          index={qIndex}
          intro={t(lang, INSPECT[cluster])}
          onSpeak={say}
          onBack={() => {
            if (qIndex > 0) setQIndex(qIndex - 1);
            else openDanger();
          }}
          onNext={() => {
            if (qIndex < fields.length - 1) setQIndex(qIndex + 1);
            else {
              const next = FOLLOWS[cluster].filter((field) => field.when(intake.cluster));
              setStep(next.length ? "follow" : "reach");
            }
          }}
        />
      )}

      {step === "follow" && (
        <FollowStep
          fields={FOLLOWS[cluster].filter((field) => field.when(intake.cluster))}
          onBack={() => setStep("cluster")}
          onDone={() => setStep("reach")}
          onEscalate={(field) => {
            const danger = { ...intake.danger };
            if (field.escalate === "chest") danger.chest = true;
            if (field.escalate === "suicide") danger.suicide = true;
            patchIntake({
              cluster: { ...intake.cluster, [field.id]: "yes", ...(field.escalate === "suicide" ? { safety: "yes" } : {}) },
              danger,
            });
            submitNow();
          }}
        />
      )}

      {step === "reach" && (
        <section className="flex flex-col gap-4">
          <h1 className="text-3xl font-semibold">{t(lang, "reachTitle")}</h1>
          <p className="text-muted">{t(lang, "reachLead")}</p>
          {(
            [
              ["hospital", "reachHospital"],
              ["dispensary", "reachDispensary"],
              ["neither", "reachNeither"],
            ] as const
          ).map(([id, key]) => (
            <button
              key={id}
              type="button"
              aria-pressed={intake.reachCare === id}
              className={chip(intake.reachCare === id)}
              onClick={() => patchIntake({ reachCare: id })}
            >
              {t(lang, key)}
            </button>
          ))}
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={() => setStep(FOLLOWS[cluster].some((field) => field.when(intake.cluster)) ? "follow" : "cluster")}>
              {t(lang, "back")}
            </Button>
            <Button disabled={!intake.reachCare} onClick={() => setStep("meds")}>
              {t(lang, "continue")}
            </Button>
          </div>
        </section>
      )}

      {step === "meds" && (
        <section className="flex flex-col gap-4">
          <h1 className="text-3xl font-semibold">{t(lang, "medsTitle")}</h1>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-muted">{t(lang, "medsLabel")}</span>
            <textarea
              value={intake.medications}
              onChange={(event) => {
                setMedsOk(false);
                patchIntake({ medications: event.target.value, medsConfirmed: false });
              }}
              rows={3}
              className="rounded-xl border border-line bg-surface p-4 text-ink outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-muted">{t(lang, "allergyLabel")}</span>
            <textarea
              value={intake.allergies}
              onChange={(event) => {
                setMedsOk(false);
                patchIntake({ allergies: event.target.value, medsConfirmed: false });
              }}
              rows={2}
              className="rounded-xl border border-line bg-surface p-4 text-ink outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            />
          </label>
          <div className="rounded-xl border border-primary/30 bg-surface p-4">
            <p className="font-semibold">{t(lang, "readback")}</p>
            <p className="mt-2">
              {t(lang, "medsLabel")}: {intake.medications.trim() || t(lang, "noneNoted")}
            </p>
            <p>
              {t(lang, "allergyLabel")}: {intake.allergies.trim() || t(lang, "noneNoted")}
            </p>
            <Button
              className="mt-3"
              variant={medsOk ? "primary" : "outline"}
              onClick={() => {
                setMedsOk(true);
                patchIntake({ medsConfirmed: true });
                say(
                  `${t(lang, "medsLabel")}. ${intake.medications.trim() || t(lang, "noneNoted")}. ${t(lang, "allergyLabel")}. ${intake.allergies.trim() || t(lang, "noneNoted")}`,
                );
              }}
            >
              {t(lang, "correct")}
            </Button>
          </div>
          <div className="rounded-xl border border-line bg-surface p-4">
            <p className="font-semibold">{t(lang, "reportLabel")}</p>
            <p className="mt-1 text-sm text-muted">{t(lang, "reportHint")}</p>
            <input
              ref={fileRef}
              type="file"
              accept="image/*,.pdf"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                patchIntake({ reportName: file ? file.name : "" });
              }}
            />
            <Button className="mt-3" variant="outline" onClick={() => fileRef.current?.click()}>
              {t(lang, "addFile")}
            </Button>
            <p className="mt-2 text-sm">{intake.reportName || t(lang, "noMedia")}</p>
            <label className="mt-3 flex items-start gap-3">
              <input
                type="checkbox"
                className="mt-1 size-5 accent-primary"
                checked={intake.reportNormal}
                onChange={(event) => patchIntake({ reportNormal: event.target.checked })}
              />
              <span>{t(lang, "normalReport")}</span>
            </label>
            <label className="mt-3 flex items-start gap-3">
              <input
                type="checkbox"
                className="mt-1 size-5 accent-primary"
                checked={intake.reportAbnormal}
                onChange={(event) => patchIntake({ reportAbnormal: event.target.checked })}
              />
              <span>{t(lang, "abnormalReport")}</span>
            </label>
            <p className="mt-2 text-sm text-muted">{t(lang, "reportRule")}</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={() => setStep("reach")}>
              {t(lang, "back")}
            </Button>
            <Button disabled={!medsOk} onClick={submitNow}>
              {t(lang, "submit")}
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}

function DangerStep({
  index,
  slow,
  onSlow,
  onSpeak,
  onYes,
  onNo,
  onBack,
}: {
  index: number;
  slow: boolean;
  onSlow: () => void;
  onSpeak: (text: string) => void;
  onYes: () => void;
  onNo: () => void;
  onBack: () => void;
}) {
  const lang = useClinic((state) => state.lang);
  const ageBand = useClinic((state) => state.intake.ageBand);
  const key = DANGER_KEYS[index];
  if (!key) return null;
  const copy = DANGER_TEXT[key];
  const question = lang === "ur" ? copy.ur : copy.en;
  return (
    <section className="flex flex-col gap-4" aria-live="polite">
      <p className="text-sm font-semibold tabular-nums text-primary">
        {index + 1} / {DANGER_KEYS.length}
      </p>
      <h1 className="text-3xl font-semibold">{t(lang, "dangerTitle")}</h1>
      <p className="text-muted">{t(lang, "dangerIntro")}</p>
      {ageBand === "0-28d" && (
        <p className="rounded-xl border border-accent/40 bg-accent/10 p-4 text-sm text-accent">{t(lang, "neonateBanner")}</p>
      )}
      <div className="rounded-xl border border-line bg-surface p-4">
        <p className="text-lg">{question}</p>
        {lang === "ur" && <p className="mt-2 text-sm text-muted">{copy.roman}</p>}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => onSpeak(question)}>
          {t(lang, "repeat")}
        </Button>
        <Button variant="ghost" onClick={onSlow} aria-pressed={slow}>
          {t(lang, "slower")}
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" onClick={onYes}>
          {t(lang, "yes")}
        </Button>
        <Button variant="outline" onClick={onNo}>
          {t(lang, "no")}
        </Button>
      </div>
      <Button variant="ghost" onClick={onBack}>
        {t(lang, "back")}
      </Button>
    </section>
  );
}

function FollowStep({
  fields,
  onBack,
  onDone,
  onEscalate,
}: {
  fields: FollowField[];
  onBack: () => void;
  onDone: () => void;
  onEscalate: (field: FollowField) => void;
}) {
  const lang = useClinic((state) => state.lang);
  const cluster = useClinic((state) => state.intake.cluster);
  const patchIntake = useClinic((state) => state.patchIntake);
  if (fields.length === 0) {
    return (
      <section className="flex flex-col gap-4">
        <h1 className="text-3xl font-semibold">{t(lang, "followTitle")}</h1>
        <Button onClick={onDone}>{t(lang, "continue")}</Button>
      </section>
    );
  }
  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-3xl font-semibold">{t(lang, "followTitle")}</h1>
      <p className="text-muted">{t(lang, "followLead")}</p>
      {fields.map((field) => {
        const value = cluster[field.id] ?? "";
        const prompt = t(lang, field.key);
        if (field.kind === "text") {
          return (
            <label key={field.id} className="flex flex-col gap-2">
              <span className="font-semibold">{prompt}</span>
              <textarea
                value={value}
                rows={3}
                onChange={(event) => patchIntake({ cluster: { ...cluster, [field.id]: event.target.value } })}
                className="rounded-xl border border-line bg-surface p-4 text-ink outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              />
            </label>
          );
        }
        return (
          <fieldset key={field.id} className="flex flex-col gap-2">
            <legend className="font-semibold">{prompt}</legend>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={value === "yes" ? "primary" : "outline"}
                onClick={() => {
                  if (field.escalate) {
                    onEscalate(field);
                    return;
                  }
                  patchIntake({ cluster: { ...cluster, [field.id]: "yes" } });
                }}
              >
                {t(lang, "yes")}
              </Button>
              <Button
                variant={value === "no" ? "primary" : "outline"}
                onClick={() => patchIntake({ cluster: { ...cluster, [field.id]: "no" } })}
              >
                {t(lang, "no")}
              </Button>
            </div>
          </fieldset>
        );
      })}
      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" onClick={onBack}>
          {t(lang, "back")}
        </Button>
        <Button disabled={fields.some((field) => !cluster[field.id])} onClick={onDone}>
          {t(lang, "continue")}
        </Button>
      </div>
    </section>
  );
}

function chip(active: boolean) {
  return active
    ? "min-h-11 rounded-xl border border-primary bg-primary px-3 text-primary-fg font-semibold"
    : "min-h-11 rounded-xl border border-line bg-surface px-3 font-semibold text-ink";
}

function ConfirmStep({
  pendingId,
  excerpt,
  onYes,
  onNo,
}: {
  pendingId?: RuleId;
  excerpt: string;
  onYes: () => void;
  onNo: () => void;
}) {
  const lang = useClinic((state) => state.lang);
  if (!pendingId) {
    return (
      <section className="flex flex-col gap-4">
        <h1 className="text-3xl font-semibold">{t(lang, "confirmTitle")}</h1>
        <Button onClick={onNo}>{t(lang, "continue")}</Button>
      </section>
    );
  }
  return (
    <section className="flex flex-col gap-4" aria-live="polite">
      <h1 className="text-3xl font-semibold">{t(lang, "confirmTitle")}</h1>
      <p className="text-muted">{t(lang, "confirmBody")}</p>
      <blockquote className="rounded-xl border border-accent/40 bg-surface p-4">{excerpt}</blockquote>
      <Button variant="accent" full onClick={onYes}>
        {t(lang, "yesHappening")}
      </Button>
      <Button variant="outline" full onClick={onNo}>
        {t(lang, "noHappening")}
      </Button>
    </section>
  );
}

function InspectStep({
  fields,
  index,
  intro,
  onSpeak,
  onBack,
  onNext,
}: {
  fields: { id: string; kind: "yesno" | "text"; key: CopyKey }[];
  index: number;
  intro: string;
  onSpeak: (text: string) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const lang = useClinic((state) => state.lang);
  const field = fields[index];
  if (!field) return null;
  return (
    <section className="flex flex-col gap-4" aria-live="polite">
      <p className="text-sm font-semibold tabular-nums text-primary">
        {index + 1} / {fields.length}
      </p>
      <h1 className="text-3xl font-semibold">{intro}</h1>
      <p className="text-muted">{t(lang, "clusterTitle")}</p>
      <ClusterField field={field} />
      <Button variant="ghost" onClick={() => onSpeak(t(lang, field.key))}>
        {t(lang, "repeat")}
      </Button>
      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" onClick={onBack}>
          {t(lang, "back")}
        </Button>
        <InspectNext fieldId={field.id} onNext={onNext} />
      </div>
    </section>
  );
}

function InspectNext({ fieldId, onNext }: { fieldId: string; onNext: () => void }) {
  const lang = useClinic((state) => state.lang);
  const value = useClinic((state) => state.intake.cluster[fieldId] ?? "");
  return (
    <Button disabled={!value} onClick={onNext}>
      {t(lang, "continue")}
    </Button>
  );
}

function ClusterField({ field }: { field: { id: string; kind: "yesno" | "text"; key: CopyKey } }) {
  const lang = useClinic((state) => state.lang);
  const value = useClinic((state) => state.intake.cluster[field.id] ?? "");
  const patchIntake = useClinic((state) => state.patchIntake);
  const cluster = useClinic((state) => state.intake.cluster);
  const prompt = t(lang, field.key);
  if (field.kind === "text") {
    return (
      <label className="flex flex-col gap-2">
        <span className="font-semibold">{prompt}</span>
        <textarea
          value={value}
          rows={3}
          onChange={(event) => patchIntake({ cluster: { ...cluster, [field.id]: event.target.value } })}
          className="rounded-xl border border-line bg-surface p-4 text-ink outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        />
      </label>
    );
  }
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="font-semibold">{prompt}</legend>
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant={value === "yes" ? "primary" : "outline"}
          onClick={() => patchIntake({ cluster: { ...cluster, [field.id]: "yes" } })}
        >
          {t(lang, "yes")}
        </Button>
        <Button
          variant={value === "no" ? "primary" : "outline"}
          onClick={() => patchIntake({ cluster: { ...cluster, [field.id]: "no" } })}
        >
          {t(lang, "no")}
        </Button>
      </div>
    </fieldset>
  );
}
