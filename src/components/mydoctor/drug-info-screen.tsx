import { useMemo, useState } from "react";
import { FlaskConical } from "lucide-react";
import { answerDrugInfo, VERIFY_LINE, type DrugInfoResult } from "@/lib/mydoctor/drug-info";
import { useClinic } from "@/lib/mydoctor/store";

const EXAMPLES = ["Paracetamol", "Augmentin", "Warfarin", "Panadol and Brufen"];

export function DrugInfoScreen() {
  const lang = useClinic((state) => state.lang);
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);

  const result = useMemo<DrugInfoResult | null>(() => {
    if (!submitted) return null;
    return answerDrugInfo(submitted, selectedId);
  }, [submitted, selectedId]);

  function ask(next: string, id?: string) {
    setQuery(next);
    setSubmitted(next);
    setSelectedId(id);
  }

  const ur = lang === "ur";

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <p className="inline-flex items-center gap-2 text-sm font-semibold tracking-wide text-primary">
          <FlaskConical className="size-4" aria-hidden="true" />
          {ur ? "لائسنس یافتہ کلینیشنز" : "For licensed clinicians"}
        </p>
        <h1 className="text-3xl font-semibold leading-tight">{ur ? "کلینیکل دوائی معلومات" : "Clinical drug information"}</h1>
        <p className="text-muted">
          {ur
            ? "ہر دوا کا الگ مکمل جواب۔ نام دو مصنوعات کا ہو تو پہلے پوچھا جائے گا۔ یہ نسخہ نہیں۔"
            : "Each medicine gets its own complete answer. If a name could be two products, you are asked which one first. Not a prescription."}
        </p>
      </div>

      <form
        className="flex flex-col gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          ask(query);
        }}
      >
        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold">{ur ? "جنرک یا برانڈ" : "Generic or brand"}</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={ur ? "مثلاً Panadol، یا warfarin and ibuprofen" : "For example Panadol, or warfarin and ibuprofen"}
            className="min-h-11 rounded-xl border border-line bg-surface px-4 text-lg text-ink outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          />
        </label>
        <button type="submit" className="min-h-11 rounded-xl bg-primary px-4 font-semibold text-primary-fg">
          {ur ? "معلومات دکھائیں" : "Show drug information"}
        </button>
      </form>

      <div className="flex flex-wrap gap-2">
        {EXAMPLES.map((example) => (
          <button
            key={example}
            type="button"
            className="min-h-11 rounded-xl border border-line bg-surface px-3 text-sm font-semibold"
            onClick={() => ask(example)}
          >
            {example}
          </button>
        ))}
      </div>

      {result?.kind === "harm" || result?.kind === "emergency" ? (
        <div className="rounded-xl border border-accent bg-accent-fg p-4 text-accent">
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{ur ? result.ur : result.en}</p>
        </div>
      ) : null}

      {result?.kind === "empty" ? <p className="rounded-xl border border-line bg-surface p-4 text-sm">{ur ? result.ur : result.en}</p> : null}

      {result?.kind === "ask" ? (
        <div className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-4">
          <p className="text-sm">{ur ? result.ur : result.en}</p>
          <div className="flex flex-col gap-2">
            {result.options.map((option) => (
              <button
                key={option.id}
                type="button"
                className="min-h-11 rounded-xl border border-line bg-bg px-3 py-2 text-start text-sm font-semibold"
                onClick={() => ask(submitted, option.id)}
              >
                {ur ? option.labelUr : option.labelEn}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {result?.kind === "briefs" ? (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted">{ur ? result.introUr : result.introEn}</p>
          {result.gaps.length > 0 ? (
            <p className="rounded-xl border border-line bg-surface p-4 text-sm">
              {ur
                ? `یہ نام نہیں ملے، اس لیے ان کا مونوگراف نہیں بنا: ${result.gaps.join(", ")}۔`
                : `These names were not matched, so no monograph was invented for them: ${result.gaps.join(", ")}.`}
            </p>
          ) : null}
          {result.briefs.map((brief) => (
            <article key={brief.id} className="flex flex-col gap-4 rounded-xl border border-primary/40 bg-surface p-4">
              <header>
                <h2 className="text-2xl font-semibold">{brief.inn}</h2>
              </header>
              <ol className="flex flex-col gap-4">
                {brief.sections.map((item, index) => (
                  <li key={item.id}>
                    <h3 className="text-base font-semibold">
                      {index + 1}. {ur ? item.titleUr : item.titleEn}
                    </h3>
                    <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">{ur ? item.bodyUr : item.bodyEn}</p>
                  </li>
                ))}
              </ol>
            </article>
          ))}
        </div>
      ) : null}

      <p className="text-sm font-semibold">{VERIFY_LINE}</p>
    </section>
  );
}
