import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/mydoctor/shell";
import { authEnabled, signOut } from "@/lib/auth/client";
import { useClinic } from "@/lib/mydoctor/store";
import { t } from "@/lib/mydoctor/copy";

export const Route = createFileRoute("/privacy")({ component: PrivacyPage });

async function eraseIndexedDatabases(): Promise<void> {
  if (typeof indexedDB === "undefined") return;
  const factory = indexedDB as IDBFactory & { databases?: () => Promise<Array<{ name?: string }>> };
  if (!factory.databases) return;
  const databases = await factory.databases();
  await Promise.all(databases.map((database) => new Promise<void>((resolve, reject) => {
    if (!database.name) return resolve();
    const request = indexedDB.deleteDatabase(database.name);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error ?? new Error("IndexedDB deletion failed"));
    request.onblocked = () => reject(new Error("IndexedDB deletion blocked"));
  })));
}

function PrivacyPage() {
  const lang = useClinic((state) => state.lang);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<"idle" | "done" | "failed">("idle");

  async function clearAllData() {
    if (!window.confirm(t(lang, "privacyClearConfirm"))) return;
    setBusy(true);
    setStatus("idle");
    try {
      window.localStorage.clear();
      await eraseIndexedDatabases();
      if ("caches" in window) {
        const names = await window.caches.keys();
        await Promise.all(names.map((name) => window.caches.delete(name)));
      }
      if ("serviceWorker" in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((registration) => registration.unregister()));
      }
      if (authEnabled) {
        await signOut("/");
        return;
      }
      window.sessionStorage.clear();
      setStatus("done");
      window.location.assign("/");
    } catch {
      setStatus("failed");
      setBusy(false);
    }
  }

  return (
    <Shell wide>
      <section className="flex flex-col gap-5">
        <div>
          <p className="text-sm font-semibold tracking-wide text-primary">MY DOCTOR</p>
          <h1 className="mt-2 text-3xl font-semibold">{t(lang, "privacyTitle")}</h1>
        </div>
        <article className="rounded-xl border border-line bg-surface p-4">
          <h2 className="font-semibold">{t(lang, "privacyStoredHeading")}</h2>
          <p className="mt-2 text-sm leading-relaxed">{t(lang, "privacyStored")}</p>
        </article>
        <article className="rounded-xl border border-line bg-surface p-4">
          <h2 className="font-semibold">{t(lang, "privacySentHeading")}</h2>
          <p className="mt-2 text-sm leading-relaxed">{t(lang, "privacySent")}</p>
        </article>
        <article className="rounded-xl border border-line bg-surface p-4">
          <h2 className="font-semibold">{t(lang, "privacyPhotoHeading")}</h2>
          <p className="mt-2 text-sm leading-relaxed">{t(lang, "privacyPhoto")}</p>
        </article>
        <article className="rounded-xl border border-line bg-surface p-4">
          <h2 className="font-semibold">{t(lang, "privacyBoundaryHeading")}</h2>
          <p className="mt-2 text-sm leading-relaxed">{t(lang, "privacyNever")}</p>
        </article>
        <div className="rounded-xl border border-line p-4">
          <p className="text-sm text-muted">
            {t(lang, "privacyDoNotEnter")}
          </p>
          <button
            type="button"
            disabled={busy}
            onClick={() => void clearAllData()}
            className="mt-4 min-h-11 rounded-xl border border-accent px-4 py-2 text-sm font-semibold text-accent disabled:opacity-50"
          >
            {busy ? t(lang, "privacyClearing") : t(lang, "privacyClear")}
          </button>
          {status === "done" && <p role="status" className="mt-3 text-sm">{t(lang, "privacyClearDone")}</p>}
          {status === "failed" && <p role="alert" className="mt-3 text-sm text-accent">{t(lang, "privacyClearFailed")}</p>}
        </div>
      </section>
    </Shell>
  );
}
