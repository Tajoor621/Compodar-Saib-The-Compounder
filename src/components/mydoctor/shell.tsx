import { Link } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { HeartPulse } from "lucide-react";
import { t } from "@/lib/mydoctor/copy";
import { rehydrateClinic, useClinic } from "@/lib/mydoctor/store";
import { cn } from "@/lib/cn";

export function Shell({
  children,
  wide = false,
}: {
  children: ReactNode;
  wide?: boolean;
}) {
  const lang = useClinic((state) => state.lang);
  const jurisdiction = useClinic((state) => state.jurisdiction);
  const setLang = useClinic((state) => state.setLang);
  const setJurisdiction = useClinic((state) => state.setJurisdiction);

  useEffect(() => {
    document.documentElement.lang = lang === "ur" ? "ur" : "en";
    document.documentElement.dir = lang === "ur" ? "rtl" : "ltr";
    void rehydrateClinic();
  }, [lang]);

  return (
    <div className="min-h-screen bg-bg text-ink">
      <header className="sticky top-0 z-20 border-b border-line bg-bg/95 backdrop-blur">
        <div className={cn("mx-auto flex items-center gap-3 px-4 py-3", wide ? "max-w-3xl" : "max-w-lg")}>
          <Link to="/" className="flex min-w-0 flex-1 items-center gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary text-primary-fg">
              <HeartPulse className="size-5" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block text-base font-semibold leading-tight">Compodar Saib</span>
              <span className="block truncate text-xs font-semibold text-muted">The Compounder</span>
              <span className="block truncate text-[11px] text-muted">{t(lang, "shortRole")}</span>
            </span>
          </Link>
          <div className="flex shrink-0 rounded-xl border border-line bg-surface p-1">
            <button
              type="button"
              className={cn(
                "min-h-11 rounded-lg px-3 text-sm font-semibold",
                lang === "en" ? "bg-primary text-primary-fg" : "text-ink",
              )}
              aria-pressed={lang === "en"}
              onClick={() => setLang("en")}
            >
              EN
            </button>
            <button
              type="button"
              className={cn(
                "min-h-11 rounded-lg px-3 text-sm font-semibold",
                lang === "ur" ? "bg-primary text-primary-fg" : "text-ink",
              )}
              aria-pressed={lang === "ur"}
              onClick={() => setLang("ur")}
            >
              اردو
            </button>
          </div>
        </div>
      </header>
      <main className={cn("mx-auto px-4 py-6", wide ? "max-w-3xl" : "max-w-lg")}>{children}</main>
      <footer className={cn("mx-auto flex flex-wrap items-center gap-3 px-4 pb-10 text-sm text-muted", wide ? "max-w-3xl" : "max-w-lg")}>
        <span>{t(lang, "demoNote")}</span>
        <Link to="/community-care" className="underline underline-offset-4">{lang === "ur" ? "مقامی طبی رہنمائی" : "Community care"}</Link>
        <Link to="/desks" className="underline underline-offset-4">{lang === "ur" ? "ماہر ڈیسک" : "Specialist desks"}</Link>
        <Link to="/reference" className="underline underline-offset-4">{t(lang, "referenceDesk")}</Link>
        <Link to="/privacy" className="underline underline-offset-4">{lang === "ur" ? "رازداری" : "Privacy"}</Link>
        <span className="inline-flex rounded-xl border border-line bg-surface p-1">
          <button
            type="button"
            className={cn("min-h-11 rounded-lg px-3", jurisdiction === "PK" ? "bg-ink text-surface" : "")}
            aria-pressed={jurisdiction === "PK"}
            onClick={() => setJurisdiction("PK")}
          >
            {t(lang, "pk")}
          </button>
          <button
            type="button"
            className={cn("min-h-11 rounded-lg px-3", jurisdiction === "UK" ? "bg-ink text-surface" : "")}
            aria-pressed={jurisdiction === "UK"}
            onClick={() => setJurisdiction("UK")}
          >
            {t(lang, "uk")}
          </button>
        </span>
      </footer>
    </div>
  );
}
