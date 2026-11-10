import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/mydoctor/copy";
import { cityName } from "@/lib/mydoctor/places";
import { runRegression } from "@/lib/mydoctor/rules";
import { useClinic } from "@/lib/mydoctor/store";
import type { SpecialtyId, Urgency } from "@/lib/mydoctor/types";
import { DRAFT_LABEL, FORMULARY_LABEL } from "@/lib/mydoctor/types";

const SPECIALTY: Record<SpecialtyId, string> = {
  dermatology: "Dermatology",
  cardiology: "Cardiology",
  general_internal_medicine: "General internal medicine",
  pediatrics: "Paediatrics",
  psychiatry: "Psychiatry",
};

function tone(urgency: Urgency) {
  if (urgency === "RED") return "bg-accent text-accent-fg";
  if (urgency === "AMBER") return "bg-accent/15 text-accent";
  return "bg-primary/10 text-primary";
}

export function DeskList() {
  const lang = useClinic((state) => state.lang);
  const order = useClinic((state) => state.order);
  const cases = useClinic((state) => state.cases);
  const erase = useClinic((state) => state.erase);
  const regression = runRegression();
  const ranked = [...order].sort((a, b) => {
    const left = cases[a];
    const right = cases[b];
    if (!left || !right) return 0;
    const rank = { RED: 0, AMBER: 1, YELLOW: 2, GREEN: 3, BLUE: 4 };
    const byUrgency = rank[left.routing.urgency] - rank[right.routing.urgency];
    if (byUrgency !== 0) return byUrgency;
    if (left.status !== right.status) return left.status === "signed" ? 1 : -1;
    return left.createdAt < right.createdAt ? 1 : -1;
  });
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold">{t(lang, "deskTitle")}</h1>
        <p className="text-muted">{t(lang, "deskIntro")}</p>
        <p className="text-sm text-muted">{t(lang, "queueLead")}</p>
        <Link to="/reference" className="text-sm font-semibold text-primary">
          {t(lang, "referenceDesk")}
        </Link>
      </header>
      {order.length === 0 && <p className="rounded-xl border border-line bg-surface p-4">{t(lang, "deskEmpty")}</p>}
      <ul className="flex flex-col gap-3">
        {ranked.map((id) => {
          const item = cases[id];
          if (!item) return null;
          return (
            <li key={id}>
              <Link
                to="/desk/$caseId"
                params={{ caseId: id }}
                className="block rounded-xl border border-line bg-surface p-4"
              >
                <span className="flex items-center justify-between gap-3">
                  <span className={`rounded-lg px-2 py-1 text-sm font-semibold ${tone(item.routing.urgency)}`}>
                    {item.routing.urgency}
                  </span>
                  <span className="text-sm text-muted">{item.status === "signed" ? t(lang, "verdictTitle") : t(lang, "waiting")}</span>
                </span>
                <span className="mt-2 block font-semibold">{SPECIALTY[item.routing.primarySpecialty]}</span>
                <span className="mt-1 block text-sm text-muted">{item.intake.complaint}</span>
              </Link>
            </li>
          );
        })}
      </ul>
      <section className="rounded-xl border border-line bg-surface p-4">
        <h2 className="font-semibold">{t(lang, "regression")}</h2>
        <p className={regression.failed.length === 0 ? "mt-2 text-primary" : "mt-2 text-accent"}>
          {regression.failed.length === 0
            ? `${t(lang, "regressionPass")} ${regression.total}/${regression.total}`
            : `${t(lang, "regressionFail")} ${regression.failed.map((row) => row.id).join(", ")}`}
        </p>
      </section>
      {order.length > 0 && (
        <Button variant="ghost" onClick={erase}>
          {t(lang, "erase")}
        </Button>
      )}
    </div>
  );
}

export function DeskCase({ caseId }: { caseId: string }) {
  const lang = useClinic((state) => state.lang);
  const record = useClinic((state) => state.cases[caseId]);
  const signerName = useClinic((state) => state.signerName);
  const signCase = useClinic((state) => state.signCase);
  const [action, setAction] = useState<"accept" | "modify" | "reject">("accept");
  const [text, setText] = useState("");
  const [reason, setReason] = useState("");
  const [signer, setSigner] = useState(signerName);
  const [checked, setChecked] = useState(false);
  const [brands, setBrands] = useState<string[]>([]);
  const [error, setError] = useState("");

  if (!record) {
    return <p className="text-muted">{t(lang, "deskEmpty")}</p>;
  }

  const minutes = record.verdict
    ? Math.max(0, Math.round((new Date(record.verdict.signedAt).getTime() - new Date(record.createdAt).getTime()) / 60000))
    : null;

  function sign() {
    if (signer.trim().length < 2 || text.trim().length < 12 || !checked) {
      setError(t(lang, "required"));
      return;
    }
    if (action !== "accept" && reason.trim().length < 3) {
      setError(t(lang, "required"));
      return;
    }
    signCase(caseId, {
      action,
      text,
      reason,
      selectedBrandIds: brands,
      signerLabel: signer.trim(),
    });
    setError("");
  }

  return (
    <article className="flex flex-col gap-5">
      <div className="flex flex-wrap gap-4">
        <Link to="/desk" className="text-sm font-semibold text-primary">
          {t(lang, "back")}
        </Link>
        <Link to="/reference" className="text-sm font-semibold text-primary">
          {t(lang, "referenceDesk")}
        </Link>
      </div>
      <header className="flex flex-col gap-2">
        <p className={`w-fit rounded-lg px-2 py-1 text-sm font-semibold ${tone(record.routing.urgency)}`}>
          {record.routing.urgency}
          {record.routing.halted ? ` · ${t(lang, "halted")}` : ""}
        </p>
        <h1 className="text-3xl font-semibold">{t(lang, "packet")}</h1>
        <p className="text-muted">{t(lang, "packetLead")}</p>
        <p className="text-muted">
          {SPECIALTY[record.routing.primarySpecialty]}
          {record.routing.secondary.length > 0
            ? ` · ${t(lang, "secondary")}: ${record.routing.secondary.map((item) => SPECIALTY[item]).join(", ")}`
            : ""}
        </p>
        <p className="text-sm text-muted">
          {t(lang, "confidence")}: {record.routing.confidence}
        </p>
      </header>

      <section className="rounded-xl border border-line bg-surface p-4">
        <h2 className="font-semibold">{t(lang, "history")}</h2>
        <dl className="mt-3 grid gap-2 text-sm">
          <div>
            <dt className="text-muted">{t(lang, "complaintTitle")}</dt>
            <dd>{record.intake.complaint}</dd>
          </div>
          <div>
            <dt className="text-muted">{t(lang, "durationLabel")}</dt>
            <dd>{record.intake.duration || "—"} · {record.intake.severity}/5</dd>
          </div>
          <div>
            <dt className="text-muted">{t(lang, "cityLabel")}</dt>
            <dd>{cityName(record.intake.cityId, lang) || "—"}</dd>
          </div>
          <div>
            <dt className="text-muted">{t(lang, "ageLabel")}</dt>
            <dd>
              {record.intake.forWhom} · {record.intake.ageBand} · {record.intake.pregnant}
            </dd>
          </div>
          <div>
            <dt className="text-muted">{t(lang, "medsLabel")}</dt>
            <dd>{record.intake.medications || t(lang, "noneNoted")}</dd>
          </div>
          <div>
            <dt className="text-muted">{t(lang, "allergyLabel")}</dt>
            <dd>{record.intake.allergies || t(lang, "noneNoted")}</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-xl border border-line bg-surface p-4">
        <h2 className="font-semibold">{t(lang, "ruleIds")}</h2>
        {record.gate.hits.length === 0 && <p className="mt-2 text-sm">{t(lang, "regressionPass")}</p>}
        <ul className="mt-2 flex flex-col gap-1 text-sm">
          {record.gate.hits.map((hit) => (
            <li key={hit.ruleId}>
              {hit.ruleId} · {hit.domain} · {hit.source}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-line bg-surface p-4">
        <h2 className="font-semibold">{t(lang, "media")}</h2>
        <p className="mt-2 text-sm">{record.intake.reportName || t(lang, "noMedia")}</p>
        <p className="mt-2 text-sm text-muted">{t(lang, "reportHint")}</p>
        {record.intake.reportNormal && <p className="mt-2 text-sm">{t(lang, "normalKept")}</p>}
        {record.intake.reportAbnormal && <p className="mt-2 text-sm">{t(lang, "abnormalRaised")}</p>}
      </section>

      <section className="rounded-xl border border-accent/40 bg-surface p-4">
        <p className="text-sm font-semibold tracking-wide text-accent">{DRAFT_LABEL}</p>
        <h2 className="mt-2 text-lg font-semibold">{t(lang, "draftTitle")}</h2>
        <p className="mt-2 text-sm text-muted">{t(lang, "phaseNote")}</p>
        <p className="mt-3 text-sm">{record.draft.suggestedSpecialistType}</p>
        <h3 className="mt-4 text-sm font-semibold text-muted">{t(lang, "considerations")}</h3>
        <ul className="mt-2 flex flex-col gap-2">
          {record.draft.rankedDifferential.map((row) => (
            <li key={row.name} className="text-sm">
              <span className="font-semibold">{row.name}</span> · {row.confidence}. {row.evidence}
            </li>
          ))}
        </ul>
        <h3 className="mt-4 text-sm font-semibold text-muted">{t(lang, "investigations")}</h3>
        <ul className="mt-2 list-disc ps-5 text-sm">
          {record.draft.recommendedInvestigations.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <h3 className="mt-4 text-sm font-semibold text-muted">{t(lang, "uncertainty")}</h3>
        <p className="mt-2 text-sm">{record.draft.uncertaintyStatement}</p>
        <h3 className="mt-4 text-sm font-semibold text-muted">{t(lang, "cited")}</h3>
        <ul className="mt-2 flex flex-col gap-1 text-sm">
          {record.draft.citations.map((citation) => (
            <li key={citation.title}>
              {citation.href ? (
                <a className="font-semibold text-primary underline" href={citation.href} target="_blank" rel="noreferrer">
                  {citation.title}
                </a>
              ) : (
                citation.title
              )}
              <span className="text-muted"> · {citation.publisher}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-muted">{record.routing.reasoning}</p>
      </section>

      <section className="rounded-xl border border-line bg-surface p-4">
        <p className="text-sm font-semibold tracking-wide text-primary">{FORMULARY_LABEL}</p>
        <h2 className="mt-2 font-semibold">{t(lang, "formularyTitle")}</h2>
        <p className="mt-2 text-sm">{t(lang, "optionsOnly")}</p>
        <p className="mt-2 text-sm text-muted">{record.formulary.demoStamp}</p>
        {record.formulary.suppressedReason && <p className="mt-2 text-sm">{record.formulary.suppressedReason}</p>}
        <p className="mt-3 text-sm">
          {record.formulary.inn} · {record.formulary.atcCode}
        </p>
        {record.formulary.localBrands.length === 0 && <p className="mt-2 text-sm">{t(lang, "noBrands")}</p>}
        <ul className="mt-3 flex flex-col gap-2">
          {record.formulary.localBrands.map((brand) => {
            const on = brands.includes(brand.id);
            return (
              <li key={brand.id}>
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() =>
                    setBrands((current) =>
                      current.includes(brand.id) ? current.filter((id) => id !== brand.id) : [...current, brand.id],
                    )
                  }
                  className={
                    on
                      ? "w-full rounded-xl border border-primary bg-bg p-3 text-start"
                      : "w-full rounded-xl border border-line bg-bg p-3 text-start"
                  }
                >
                  <span className="block font-semibold">
                    {brand.brand} · {brand.strength}
                  </span>
                  <span className="mt-1 block text-sm text-muted">
                    {brand.company} · {brand.packSize} · {brand.mrpPKR}
                  </span>
                  <span className="mt-1 block text-sm text-muted">
                    {brand.drapRegNo} · {brand.status}
                  </span>
                  <span className="mt-2 block text-sm font-semibold text-primary">{t(lang, "selectOption")}</span>
                </button>
              </li>
            );
          })}
        </ul>
        <ul className="mt-3 list-disc ps-5 text-sm text-muted">
          {record.formulary.interactions.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-line bg-surface p-4">
        <h2 className="font-semibold">{t(lang, "audit")}</h2>
        <ol className="mt-3 flex flex-col gap-2 text-sm">
          {record.audit.map((event) => (
            <li key={`${event.at}-${event.kind}`}>
              <span className="font-semibold">{event.kind}</span>
              <span className="text-muted"> · {event.detail}</span>
            </li>
          ))}
        </ol>
      </section>

      {record.verdict ? (
        <section className="rounded-xl border border-primary/30 bg-surface p-4">
          <h2 className="font-semibold">{t(lang, "verdictTitle")}</h2>
          <p className="mt-2">{record.verdict.text}</p>
          <p className="mt-2 text-sm text-muted">
            {record.verdict.signerLabel} · {record.verdict.action}
            {record.verdict.reason ? ` · ${record.verdict.reason}` : ""}
          </p>
          {minutes !== null && (
            <p className="mt-2 text-sm tabular-nums">
              {t(lang, "timeTo")}: {minutes < 1 ? "< 1 min" : `${minutes} min`}
            </p>
          )}
          <p className="mt-3 text-sm font-semibold">{t(lang, "notValid")}</p>
        </section>
      ) : (
        <section className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-4">
          <h2 className="font-semibold">{t(lang, "signTitle")}</h2>
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                ["accept", "accept"],
                ["modify", "modify"],
                ["reject", "reject"],
              ] as const
            ).map(([id, key]) => (
              <button key={id} type="button" className={action === id ? "min-h-11 rounded-xl bg-primary px-2 text-sm font-semibold text-primary-fg" : "min-h-11 rounded-xl border border-line px-2 text-sm font-semibold"} aria-pressed={action === id} onClick={() => setAction(id)}>
                {t(lang, key)}
              </button>
            ))}
          </div>
          <label className="flex flex-col gap-1 text-sm">
            {t(lang, "signer")}
            <input
              value={signer}
              onChange={(event) => setSigner(event.target.value)}
              className="min-h-11 rounded-xl border border-line bg-bg px-3 text-ink outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            {t(lang, "verdictLabel")}
            <textarea
              value={text}
              onChange={(event) => setText(event.target.value)}
              rows={4}
              className="rounded-xl border border-line bg-bg p-3 text-ink outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            />
          </label>
          {action !== "accept" && (
            <label className="flex flex-col gap-1 text-sm">
              {t(lang, "reasonLabel")}
              <textarea
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                rows={3}
                className="rounded-xl border border-line bg-bg p-3 text-ink outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              />
            </label>
          )}
          <label className="flex items-start gap-3 text-sm">
            <input type="checkbox" className="mt-1 size-5 accent-primary" checked={checked} onChange={(event) => setChecked(event.target.checked)} />
            <span>{t(lang, "signCheck")}</span>
          </label>
          {error && <p className="text-sm text-accent">{error}</p>}
          <Button onClick={sign}>{t(lang, "sign")}</Button>
        </section>
      )}

      <Link
        to="/case/$caseId"
        params={{ caseId }}
        className="inline-flex min-h-11 items-center justify-center rounded-xl border border-line px-4 font-semibold"
      >
        {t(lang, "preview")}
      </Link>
    </article>
  );
}
