import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ClipboardCheck, Shield, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Shell } from "@/components/mydoctor/shell";
import { SCENARIOS, t, type CopyKey } from "@/lib/mydoctor/copy";
import { useClinic } from "@/lib/mydoctor/store";

export const Route = createFileRoute("/")({ component: Home });

const LAYERS: { icon: typeof Shield; title: CopyKey; body: CopyKey }[] = [
  { icon: Shield, title: "layerGate", body: "layerGateBody" },
  { icon: Stethoscope, title: "layerDraft", body: "layerDraftBody" },
  { icon: ClipboardCheck, title: "layerVerdict", body: "layerVerdictBody" },
];

const SPECS: CopyKey[] = ["specSkin", "specHeart", "specGeneral", "specChild", "specMind"];

function Home() {
  const navigate = useNavigate();
  const lang = useClinic((state) => state.lang);
  const resetIntake = useClinic((state) => state.resetIntake);

  return (
    <Shell wide>
      <div className="flex flex-col gap-10">
        <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div className="flex flex-col gap-3">
            <p className="text-sm font-semibold tracking-wide text-primary">English · اردو</p>
            <h1 className="text-4xl font-semibold leading-tight">{t(lang, "tagline")}</h1>
            <p className="text-lg text-muted" lang={lang === "ur" ? "en" : "ur"} dir={lang === "ur" ? "ltr" : "rtl"}>
              {t(lang, "altTagline")}
            </p>
            <p className="text-muted">{t(lang, "notADoctor")}</p>
          </div>
          <div className="grid gap-2">
            <Button
              full
              onClick={() => {
                resetIntake();
                void navigate({ to: "/intake" });
              }}
            >
              {t(lang, "start")}
            </Button>
            <Link
              to="/pharmacy"
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-line bg-surface px-4 font-semibold"
            >
              {t(lang, "pharmOpen")}
            </Link>
            <Link
              to="/desk"
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-line bg-surface px-4 font-semibold"
            >
              {t(lang, "desk")}
            </Link>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          {LAYERS.map((layer) => {
            const Icon = layer.icon;
            return (
              <article key={layer.title} className="rounded-xl border border-line bg-surface p-4">
                <Icon className="size-5 text-primary" aria-hidden="true" />
                <h2 className="mt-3 font-semibold">{t(lang, layer.title)}</h2>
                <p className="mt-1 text-sm text-muted">{t(lang, layer.body)}</p>
              </article>
            );
          })}
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-semibold">{t(lang, "scenarios")}</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {SCENARIOS.map((scenario) => (
              <button
                key={scenario.id}
                type="button"
                className="min-h-11 rounded-xl border border-line bg-surface px-4 py-3 text-start"
                onClick={() => {
                  resetIntake({
                    complaint: scenario.complaint,
                    forWhom: scenario.forWhom ?? "self",
                    ageBand: scenario.ageBand ?? (scenario.forWhom === "child" ? "1m-5y" : "16-64"),
                    pregnant: scenario.forWhom === "child" ? "na" : "no",
                    duration: t(lang, scenario.duration),
                  });
                  void navigate({ to: "/intake" });
                }}
              >
                <span className="block font-semibold">{lang === "ur" ? scenario.labelUr : scenario.label}</span>
                <span className="mt-1 block text-sm text-muted">{lang === "ur" ? scenario.blurbUr : scenario.blurb}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-semibold">{t(lang, "howTitle")}</h2>
          <ol className="grid gap-3 sm:grid-cols-3">
            {(
              [
                ["01", "step1"],
                ["02", "step2"],
                ["03", "step3"],
              ] as const
            ).map(([n, key]) => (
              <li key={key} className="border-t border-line pt-3">
                <p className="text-sm font-semibold tabular-nums text-primary">{n}</p>
                <p className="mt-1 text-sm">{t(lang, key)}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-line bg-surface p-4">
            <h2 className="text-xl font-semibold">{t(lang, "neverTitle")}</h2>
            <ul className="mt-3 flex flex-col gap-2 text-sm">
              <li>{t(lang, "never1")}</li>
              <li>{t(lang, "never2")}</li>
              <li>{t(lang, "never3")}</li>
            </ul>
          </div>
          <div className="rounded-xl border border-line bg-surface p-4">
            <h2 className="text-xl font-semibold">{t(lang, "phaseTitle")}</h2>
            <p className="mt-2 text-sm text-muted">{t(lang, "phaseBody")}</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {SPECS.map((key) => (
                <li key={key} className="rounded-lg border border-line bg-bg px-3 py-2 text-sm font-semibold">
                  {t(lang, key)}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </Shell>
  );
}
