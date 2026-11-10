import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { t } from "@/lib/mydoctor/copy";
import { chemistFor, seenForm } from "@/lib/mydoctor/forms";
import { libraryStamp, lookupPharmacy, type Monograph } from "@/lib/mydoctor/pharmacy";
import { queryFromSight, readPackPhoto } from "@/lib/mydoctor/read-pack";
import { detectIdentifiers } from "@/lib/mydoctor/safety";
import { useClinic } from "@/lib/mydoctor/store";
import { isStaticPages, STATIC_HOST_COPY } from "@/lib/static-pages";
import type { Lang } from "@/lib/mydoctor/types";

const CHIPS = ["Panadol", "Nexium", "Gravinate", "Augmentin", "Septran", "Concor"];

const FORM_PHRASE: Record<string, string> = {
  tablet: "tablet",
  capsule: "capsule",
  syrup: "syrup",
  "oral-drops": "oral drops",
  eye: "eye drops",
  ear: "ear drops",
  nasal: "nasal spray",
  powder: "powder",
  cream: "cream",
  inhaler: "inhaler",
  injection: "injection syringe",
  "drop-unspecified": "drops",
};

export function PharmacyScreen() {
  const lang = useClinic((state) => state.lang);
  const [query, setQuery] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoSeen, setPhotoSeen] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [photoConsent, setPhotoConsent] = useState(false);
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [formPick, setFormPick] = useState<string | null>(null);
  useEffect(() => {
    const preset = new URLSearchParams(window.location.search).get("q");
    if (preset) setQuery(preset);
  }, []);
  const blocked = query.trim().length > 0 && detectIdentifiers(query);
  const lookup = useMemo(() => (blocked ? null : lookupPharmacy(query)), [blocked, query]);
  const matches = lookup?.matches ?? [];
  const exact = matches[0]?.score === 100;
  const chosen =
    matches.find((item) => item.row.id === pickedId)?.row ??
    (matches.length === 1 || exact ? matches[0]?.row : undefined);
  const formQuery = formPick ? `${query} ${FORM_PHRASE[formPick] ?? formPick}` : query;

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold leading-tight">{t(lang, "pharmTitle")}</h1>
        <p className="text-muted">{t(lang, "pharmLead")}</p>
        <Link to="/reference" className="text-sm font-semibold text-primary">
          {t(lang, "referenceDesk")}
        </Link>
      </div>
      <label className="flex flex-col gap-2">
        <span className="text-sm font-semibold">{t(lang, "pharmSearch")}</span>
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setPhotoSeen(null);
            setPickedId(null);
            setFormPick(null);
          }}
          placeholder={t(lang, "pharmHint")}
          className="min-h-11 rounded-xl border border-line bg-surface px-4 text-lg text-ink outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        />
      </label>
      <div className="flex flex-wrap gap-2">
        {CHIPS.map((chip) => (
          <button
            key={chip}
            type="button"
            className="min-h-11 rounded-xl border border-line bg-surface px-3 text-sm font-semibold"
            onClick={() => {
              setQuery(chip);
              setPhotoSeen(null);
              setPickedId(null);
              setFormPick(null);
            }}
          >
            {chip}
          </button>
        ))}
      </div>
      {blocked && (
        <p className="rounded-xl border border-accent bg-accent/10 p-4 text-sm" role="alert">
          {t(lang, "identifierBlocked")}
        </p>
      )}
      {!blocked && query.trim().length >= 2 && lookup?.kind === "miss" && (
        <p className="rounded-xl border border-line bg-surface p-4 text-sm">{t(lang, "pharmMiss")}</p>
      )}
      {!blocked && lookup?.kind === "named" && matches.length > 1 && (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold">{t(lang, "pharmPick")}</p>
          <div className="flex flex-col gap-2">
            {matches.map((item) => (
              <button
                key={item.row.id}
                type="button"
                className={`min-h-11 rounded-xl border px-4 py-3 text-start ${chosen?.id === item.row.id ? "border-primary bg-primary/10" : "border-line bg-surface"}`}
                onClick={() => {
                  setPickedId(item.row.id);
                  setFormPick(null);
                }}
              >
                <span className="block font-semibold">{item.row.inn}</span>
                <span className="mt-1 block text-sm text-muted">
                  {lang === "ur" ? item.row.groupUr : item.row.group}
                  {" · "}
                  {item.row.form}
                  {" · "}
                  {item.row.brands
                    .slice(0, 3)
                    .map((brand) => brand.brand)
                    .join(", ")}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
      {chosen && <Card row={chosen} lang={lang} query={formQuery} onForm={setFormPick} formPick={formPick} />}
      {!blocked && lookup?.kind === "class" && lookup.reading && (
        <Card row={lookup.reading} lang={lang} query={formQuery} onForm={setFormPick} formPick={formPick} classNote />
      )}

      <label className="flex items-start gap-3 rounded-xl border border-line bg-surface p-3 text-sm">
        <input type="checkbox" className="mt-1 size-5" checked={photoConsent} onChange={(event) => setPhotoConsent(event.target.checked)} />
        <span>{isStaticPages() ? STATIC_HOST_COPY.photoConsent[lang] : t(lang, "pharmPhotoConsent")}</span>
      </label>
      <label className={`flex min-h-11 items-center justify-center rounded-xl border border-line bg-surface px-4 font-semibold ${photoConsent ? "cursor-pointer" : "cursor-not-allowed opacity-50"}`}>
        {t(lang, "pharmPhoto")}
        <input
          type="file"
          accept="image/*"
          capture="environment"
          className="sr-only"
          disabled={!photoConsent}
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (!file) return;
            void readPhoto(file, lang, setPhoto, setPhotoBusy, setPhotoSeen, setPhotoError, (value) => {
              setQuery(value);
              setPickedId(null);
              setFormPick(null);
            });
          }}
        />
      </label>
      {photoBusy && <p className="text-sm text-muted">{t(lang, "pharmPhotoReading")}</p>}
      {photoError && <p className="rounded-xl border border-line bg-surface p-4 text-sm">{photoError}</p>}
      {photo && (
        <figure className="flex flex-col gap-2">
          <img src={photo} alt="" className="max-h-64 w-full rounded-xl border border-line object-contain bg-surface" />
          <figcaption className="text-sm text-muted">{photoSeen ? `${t(lang, "pharmPhotoSeen")}: ${photoSeen}` : t(lang, "pharmPhotoNote")}</figcaption>
        </figure>
      )}
      {!photo && <p className="text-sm text-muted">{t(lang, "pharmPhotoNote")}</p>}
      <p className="text-sm text-muted">{libraryStamp()}</p>
    </section>
  );
}

function Card({
  row,
  lang,
  query,
  onForm,
  formPick,
  classNote = false,
}: {
  row: Monograph;
  lang: Lang;
  query: string;
  onForm: (form: string) => void;
  formPick: string | null;
  classNote?: boolean;
}) {
  const text = (en: string, ur: string) => (lang === "ur" ? ur : en);
  const chemist = chemistFor(row, query);
  const described = seenForm(query).form;
  const lead: [string, string][] = [
    [t(lang, "pharmUsed"), text(row.usedEn, row.usedUr)],
    [t(lang, "pharmFor"), text(row.forEn ?? row.group, row.forUr ?? row.groupUr)],
    [t(lang, "pharmAdult"), text(row.adultEn, row.adultUr)],
    [t(lang, "pharmChild"), text(row.childEn, row.childUr)],
  ];
  const rest: [string, string][] = [
    [t(lang, "pharmWhat"), `${row.inn}. ${text(row.group, row.groupUr)}. ATC ${row.atc}. ${row.form}.`],
    [t(lang, "pharmAvoid"), text(row.avoidEn, row.avoidUr)],
    [t(lang, "pharmEffects"), text(row.effectsEn, row.effectsUr)],
    [t(lang, "pharmMix"), text(row.mixEn, row.mixUr)],
    [t(lang, "pharmPreg"), text(row.pregEn, row.pregUr)],
    [t(lang, "pharmStore"), text(row.storeEn, row.storeUr)],
  ];
  return (
    <article className="flex flex-col gap-4 rounded-xl border border-primary/40 bg-surface p-4">
      <header>
        <h2 className="text-2xl font-semibold">{row.inn}</h2>
        <p className="text-sm text-muted">{text(row.group, row.groupUr)}</p>
        <p className="mt-1 text-sm text-muted">{row.form}</p>
        <p className="mt-2 text-xs font-semibold text-primary">
          {classNote ? t(lang, "pharmClass") : `${t(lang, "pharmSource")} · ${row.id}`}
        </p>
      </header>
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold">{t(lang, "pharmForms")}</p>
        <div className="flex flex-wrap gap-2">
          {chemist.panels.map((panel) => (
            <button
              key={panel.id}
              type="button"
              className={`min-h-11 rounded-xl border px-3 text-sm font-semibold ${formPick === panel.id || (!formPick && described === panel.id) ? "border-primary bg-primary/10" : "border-line bg-bg"}`}
              onClick={() => onForm(panel.id)}
            >
              {text(panel.titleEn, panel.titleUr)}
            </button>
          ))}
        </div>
      </div>
      {lead.map(([label, body]) => (
        <section key={label}>
          <h3 className="text-base font-semibold">{label}</h3>
          <p className="mt-1 text-base leading-relaxed">{body}</p>
        </section>
      ))}
      <p className="text-sm font-semibold">{text(chemist.knownEn, chemist.knownUr)}</p>
      {chemist.panels.map((panel, index) => (
        <section key={`${panel.id}-${panel.titleEn}`} className={index === 0 && described ? "rounded-xl border border-primary/40 p-3" : ""}>
          <h3 className="text-base font-semibold">{text(panel.titleEn, panel.titleUr)}</h3>
          {described && index === 0 && <p className="text-sm font-semibold text-primary">{t(lang, "pharmThisForm")}</p>}
          <p className="mt-1 text-base leading-relaxed">{text(panel.bodyEn, panel.bodyUr)}</p>
        </section>
      ))}
      <p className="text-sm text-muted">{t(lang, "pharmSuggestNote")}</p>
      <section>
        <h3 className="font-semibold">{t(lang, "pharmShelf")}</h3>
        <ul className="mt-2 flex flex-col gap-2">
          {row.brands.map((brand) => (
            <li key={`${brand.brand}-${brand.market}-${brand.strength}`} className="text-sm">
              <span className="font-semibold">{brand.brand}</span>
              <span className="text-muted">
                {" "}
                · {brand.strength} · {brand.maker} · {brand.market === "BOTH" ? "Pakistan and Gulf" : brand.market === "PK" ? "Pakistan" : "Gulf"}
              </span>
            </li>
          ))}
        </ul>
      </section>
      {rest.map(([label, body]) => (
        <section key={label}>
          <h3 className="font-semibold">{label}</h3>
          <p className="mt-1 text-sm">{body}</p>
        </section>
      ))}
      <p className="rounded-xl border border-line bg-bg p-3 text-sm">{t(lang, "pharmCheck")}</p>
      <p className="text-sm font-semibold">{t(lang, "pharmVerify")}</p>
      <p className="text-sm font-semibold">{t(lang, "pharmNotRx")}</p>
    </article>
  );
}

async function readPhoto(
  file: File,
  lang: Lang,
  setPhoto: (value: string | null) => void,
  setPhotoBusy: (value: boolean) => void,
  setPhotoSeen: (value: string | null) => void,
  setPhotoError: (value: string | null) => void,
  setQuery: (value: string) => void,
) {
  setPhotoBusy(true);
  setPhotoError(null);
  setPhotoSeen(null);
  try {
    const image = await shrinkPhoto(file);
    setPhoto(image);
    const sight = await readPackPhoto({ data: { image, consent: true } });
    if (!sight.ok) {
      setPhotoError(sight.error);
      return;
    }
    const next = queryFromSight(sight);
    if (!next) {
      setPhotoError(t(lang, "pharmPhotoUnread"));
      return;
    }
    setQuery(next);
    setPhotoSeen([sight.name, sight.strength, sight.form === "unknown" ? "" : sight.form, sight.volume].filter(Boolean).join(" · "));
  } catch {
    setPhotoError(t(lang, "pharmPhotoUnread"));
  } finally {
    setPhotoBusy(false);
  }
}

function shrinkPhoto(file: File): Promise<string> {
  const url = URL.createObjectURL(file);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, 960 / Math.max(img.width, img.height, 1));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(img.width * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));
      canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.72));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("unreadable"));
    };
    img.src = url;
  });
}
