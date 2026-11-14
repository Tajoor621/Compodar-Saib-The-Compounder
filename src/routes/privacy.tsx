import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/mydoctor/shell";
import { authEnabled, signOut } from "@/lib/auth/client";
import { clearLocalAppData } from "@/lib/mydoctor/local-storage";
import { useClinic } from "@/lib/mydoctor/store";
import { t } from "@/lib/mydoctor/copy";
import { isStaticPages, STATIC_HOST_COPY } from "@/lib/static-pages";

export const Route = createFileRoute("/privacy")({
  validateSearch: (search: Record<string, unknown>): { cleared?: true } =>
    search.cleared === 1 || search.cleared === "1" ? { cleared: true } : {},
  component: PrivacyPage,
});

function PrivacyPage() {
  const lang = useClinic((state) => state.lang);
  const [busy, setBusy] = useState(false);
  const { cleared } = Route.useSearch();
  const [status, setStatus] = useState<"idle" | "done" | "failed">(cleared ? "done" : "idle");

  async function clearAllData() {
    if (!window.confirm(t(lang, "privacyClearConfirm"))) return;
    setBusy(true);
    setStatus("idle");
    try {
      clearLocalAppData();
      const url = new URL(window.location.href);
      url.searchParams.set("cleared", "1");
      if (authEnabled) await signOut(url.href);
      else window.location.replace(url);
    } catch {
      setStatus("failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Shell wide>
      <section className="flex flex-col gap-5">
        <div>
          <p className="text-sm font-semibold tracking-wide text-primary">
            COMPODAR SAIB THE COMPOUNDER
          </p>
          <h1 className="mt-2 text-3xl font-semibold">{t(lang, "privacyTitle")}</h1>
        </div>
        <article className="rounded-xl border border-line bg-surface p-4">
          <h2 className="font-semibold">{t(lang, "privacyStoredHeading")}</h2>
          <p className="mt-2 text-sm leading-relaxed">{t(lang, "privacyStored")}</p>
        </article>
        <article className="rounded-xl border border-line bg-surface p-4">
          <h2 className="font-semibold">{t(lang, "privacySentHeading")}</h2>
          <p className="mt-2 text-sm leading-relaxed">
            {isStaticPages() ? STATIC_HOST_COPY.privacySent[lang] : t(lang, "privacySent")}
          </p>
        </article>
        <article className="rounded-xl border border-line bg-surface p-4">
          <h2 className="font-semibold">{t(lang, "privacyPhotoHeading")}</h2>
          <p className="mt-2 text-sm leading-relaxed">
            {isStaticPages() ? STATIC_HOST_COPY.privacyPhoto[lang] : t(lang, "privacyPhoto")}
          </p>
        </article>
        <article className="rounded-xl border border-line bg-surface p-4">
          <h2 className="font-semibold">{t(lang, "privacyBoundaryHeading")}</h2>
          <p className="mt-2 text-sm leading-relaxed">{t(lang, "privacyNever")}</p>
        </article>
        <article className="rounded-xl border border-line bg-surface p-4">
          <h2 className="font-semibold">{t(lang, "privacyReferenceHeading")}</h2>
          <p className="mt-2 text-sm leading-relaxed">{t(lang, "privacyReference")}</p>
        </article>
        <div className="rounded-xl border border-line p-4">
          <p className="text-sm text-muted">{t(lang, "privacyDoNotEnter")}</p>
          <button
            type="button"
            disabled={busy}
            onClick={() => void clearAllData()}
            className="mt-4 min-h-11 rounded-xl border border-accent px-4 py-2 text-sm font-semibold text-accent disabled:opacity-50"
          >
            {busy ? t(lang, "privacyClearing") : t(lang, "privacyClear")}
          </button>
          {status === "done" && (
            <div className="mt-3 text-sm">
              <p role="status">{t(lang, "privacyClearDone")}</p>
              <Link
                to="/"
                reloadDocument
                className="inline-flex min-h-11 items-center font-semibold text-primary underline"
              >
                {lang === "ur" ? "ابتدائی صفحے پر جائیں" : "Return to home"}
              </Link>
            </div>
          )}
          {status === "failed" && (
            <p role="alert" className="mt-3 text-sm text-accent">
              {t(lang, "privacyClearFailed")}
            </p>
          )}
        </div>
      </section>
    </Shell>
  );
}
