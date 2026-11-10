import { Link } from "@tanstack/react-router";
import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/mydoctor/copy";
import { patientView } from "@/lib/mydoctor/patient";
import type { PlaceCard } from "@/lib/mydoctor/places";
import { speak } from "@/lib/mydoctor/speech";
import { useClinic } from "@/lib/mydoctor/store";
import type { Lang } from "@/lib/mydoctor/types";

export function CaseScreen({ caseId }: { caseId: string }) {
  const lang = useClinic((state) => state.lang);
  const record = useClinic((state) => state.cases[caseId]);
  if (!record) {
    return (
      <section className="flex flex-col gap-4">
        <h1 className="text-3xl font-semibold">{t(lang, "packet")}</h1>
        <p className="text-muted">{t(lang, "deskEmpty")}</p>
        <Link to="/" className="font-semibold text-primary">
          Compodar Saib The Compounder
        </Link>
      </section>
    );
  }
  const view = patientView(record);
  const spoken = [...view.paragraphs, ...view.roman].join(" ");
  return (
    <article className="flex flex-col gap-5" aria-live="polite">
      {view.showEmergency ? (
        <section className="flex flex-col gap-4 rounded-xl bg-accent p-5 text-accent-fg">
          <p className="text-sm font-semibold tracking-wide">{t(lang, "urgentLabel")}</p>
          <h1 className="text-3xl font-semibold leading-tight">{view.paragraphs[0]}</h1>
          {view.paragraphs.slice(1).map((paragraph) => (
            <p key={paragraph} className="text-lg">
              {paragraph}
            </p>
          ))}
          {record.lang === "ur" &&
            view.roman.map((line) => (
              <p key={line} className="text-sm text-accent-fg/80">
                {line}
              </p>
            ))}
          <div className="flex flex-col gap-2">
            {view.phones.map((phone) => (
              <a
                key={phone.phone}
                href={`tel:${phone.phone}`}
                className="flex min-h-11 items-center gap-3 rounded-xl bg-surface px-4 py-3 text-ink"
              >
                <Phone className="size-5 shrink-0 text-accent" aria-hidden="true" />
                <span>
                  <span className="block font-semibold">
                    {t(lang, "call")} {phone.display}
                  </span>
                  <span className="block text-sm text-muted">
                    {phone.name}. {phone.detail}
                  </span>
                </span>
              </a>
            ))}
          </div>
          <p className="text-sm text-accent-fg/80">{t(record.lang, "demoClinician")}</p>
        </section>
      ) : (
        <section className="flex flex-col gap-4">
          <p className="text-sm font-semibold tracking-wide text-primary">{t(lang, "onDevice")}</p>
          <h1 className="text-3xl font-semibold leading-tight">{view.paragraphs[0]}</h1>
          {view.paragraphs.slice(1).map((paragraph) => (
            <p key={paragraph} className="text-lg">
              {paragraph}
            </p>
          ))}
          <p className="rounded-xl border border-line bg-surface p-4">
            {t(record.lang, view.farFromCare ? "planNeither" : view.doctorNear ? "planNear" : "planFar")}
          </p>
          {record.lang === "ur" &&
            view.roman.map((line) => (
              <p key={line} className="text-sm text-muted">
                {line}
              </p>
            ))}
        </section>
      )}
      {view.showEmergency && <p className="text-sm font-semibold">{t(record.lang, "noMedicine")}</p>}
      {view.showEmergency && view.firstAid.length > 0 && (
        <section className="rounded-xl border border-line bg-surface p-4">
          <h2 className="text-lg font-semibold">{t(lang, "firstAidTitle")}</h2>
          <ul className="mt-3 flex flex-col gap-2">
            {view.firstAid.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
        </section>
      )}
      {view.showEmergency && view.hospitalChecks.length > 0 && (
        <section className="rounded-xl border border-line bg-surface p-4">
          <h2 className="text-lg font-semibold">{t(lang, "hospitalTestsTitle")}</h2>
          <p className="mt-1 text-sm text-muted">{t(lang, "hospitalTestsLead")}</p>
          <ul className="mt-3 flex flex-col gap-2">
            {view.hospitalChecks.map((check) => (
              <li key={check}>{check}</li>
            ))}
          </ul>
        </section>
      )}
      {view.showEmergency && (
        <Places places={view.places} city={view.city} lang={lang} />
      )}
      {view.showEmergency && view.emergencyMeds.length > 0 && (
        <section className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-4">
          <h2 className="text-lg font-semibold">{t(lang, "emergencyHumbleTitle")}</h2>
          <p className="text-sm text-muted">{t(lang, "emergencyHumbleLead")}</p>
          {view.emergencyMeds.map((item) => (
            <article key={item.inn} className="rounded-xl border border-line bg-bg p-3">
              <h3 className="font-semibold">{item.inn}</h3>
              <p className="mt-1 text-sm">{item.why}</p>
              <ul className="mt-2 flex flex-col gap-2">
                {item.brands.map((brand) => (
                  <li key={brand.id} className="text-sm">
                    <span className="font-semibold">{brand.brand}</span>
                    <span className="mt-1 block text-muted">{brand.detail}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-sm text-muted">{item.caution}</p>
            </article>
          ))}
        </section>
      )}
      {!view.showEmergency && view.heard.length > 0 && (
        <section className="rounded-xl border border-line bg-surface p-4">
          <h2 className="text-lg font-semibold">{t(lang, "heardTitle")}</h2>
          <ul className="mt-3 flex flex-col gap-2">
            {view.heard.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>
      )}
      {!view.showEmergency && view.inspection.length > 0 && (
        <section className="rounded-xl border border-line bg-surface p-4">
          <h2 className="text-lg font-semibold">{t(lang, "inspectReadTitle")}</h2>
          <ul className="mt-3 flex flex-col gap-2">
            {view.inspection.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </section>
      )}
      {!view.showEmergency && view.tests.length > 0 && (
        <section className="rounded-xl border border-primary/40 bg-surface p-4">
          <h2 className="text-lg font-semibold">{t(lang, "testsTitle")}</h2>
          <p className="mt-1 text-sm text-muted">{t(lang, "testsLead")}</p>
          {view.testsMost.length > 0 && (
            <div className="mt-3">
              <h3 className="text-sm font-semibold text-primary">{t(lang, "mostTest")}</h3>
              <ol className="mt-2 flex list-decimal flex-col gap-2 ps-5">
                {view.testsMost.map((test) => (
                  <li key={test}>{test}</li>
                ))}
              </ol>
            </div>
          )}
          {view.testsAlso.length > 0 && (
            <div className="mt-3">
              <h3 className="text-sm font-semibold text-muted">{t(lang, "alsoTests")}</h3>
              <ul className="mt-2 flex flex-col gap-2">
                {view.testsAlso.map((test) => (
                  <li key={test}>{test}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}
      {!view.showEmergency && view.home.length > 0 && (
        <section className="flex flex-col gap-3 rounded-xl border border-primary/40 bg-surface p-4">
          <h2 className="text-lg font-semibold">{t(lang, "homeTitle")}</h2>
          <p className="text-sm text-muted">{t(lang, "homeLead")}</p>
          <ol className="flex list-decimal flex-col gap-2 ps-5">
            {view.home.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>
      )}
      {!view.showEmergency && (
        <Places places={view.places} city={view.city} lang={lang} />
      )}
      {!view.showEmergency && !view.farFromCare && (
        <section className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-4">
          <h2 className="text-lg font-semibold">
            {t(lang, "humbleTitle")}
            {view.city ? ` · ${view.city}` : ""}
          </h2>
          <p className="text-sm text-muted">
            {t(lang, view.doctorNear ? "shelfIfNear" : "humbleLead")}
          </p>
          <p className="text-sm font-semibold">{t(lang, "humbleNotRx")}</p>
          {view.counter.length === 0 && <p>{view.withheld}</p>}
          {view.counter.map((item) => (
            <article key={item.inn} className="rounded-xl border border-line bg-bg p-3">
              <h3 className="font-semibold">{item.inn}</h3>
              <p className="mt-1 text-sm">{item.why}</p>
              <ul className="mt-2 flex flex-col gap-2">
                {item.brands.map((brand, index) => (
                  <li key={brand.id} className="text-sm">
                    {index === 0 && <span className="block text-sm font-semibold text-primary">{t(lang, "stockedHere")}</span>}
                    <span className="font-semibold">{brand.brand}</span>
                    <span className="mt-1 block text-muted">{brand.detail}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-sm font-semibold">{t(lang, "usualSays")}</p>
              <p className="mt-1 text-sm text-muted">{item.caution}</p>
            </article>
          ))}
          {view.clinicianOnly.length > 0 && (
            <div className="mt-2 flex flex-col gap-3 border-t border-line pt-3">
              <h3 className="font-semibold">{t(lang, "clinicianOnlyTitle")}</h3>
              <p className="text-sm text-muted">{t(lang, "clinicianOnlyLead")}</p>
              {view.clinicianOnly.map((item) => (
                <article key={item.inn} className="rounded-xl border border-line bg-bg p-3">
                  <h3 className="font-semibold">{item.inn}</h3>
                  <p className="mt-1 text-sm">{item.why}</p>
                  <ul className="mt-2 flex flex-col gap-2">
                    {item.brands.map((brand, index) => (
                      <li key={brand.id} className="text-sm">
                        {index === 0 && <span className="block text-sm font-semibold text-primary">{t(lang, "stockedHere")}</span>}
                        <span className="font-semibold">{brand.brand}</span>
                        <span className="mt-1 block text-muted">{brand.detail}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-sm text-muted">{item.caution}</p>
                </article>
              ))}
            </div>
          )}
          {view.counter.length > 0 && <p className="text-sm text-muted">{view.withheld}</p>}
        </section>
      )}
      {view.normalKept && <p className="text-sm text-muted">{t(record.lang, "normalKept")}</p>}
      {view.abnormalRaised && <p className="text-sm text-muted">{t(record.lang, "abnormalRaised")}</p>}
      <Button variant="outline" onClick={() => speak(spoken, record.lang)}>
        {t(lang, "repeat")}
      </Button>
      {view.waiting && !view.showEmergency && (
        <p className="rounded-xl border border-line bg-surface p-4">{t(record.lang, "waiting")}</p>
      )}
      {view.verdict && (
        <section className="rounded-xl border border-primary/30 bg-surface p-4">
          <h2 className="text-lg font-semibold">{t(record.lang, "verdictTitle")}</h2>
          <p className="mt-2 text-lg">{view.verdict}</p>
          {view.signer && <p className="mt-2 text-sm text-muted">{view.signer}</p>}
          <p className="mt-3 text-sm font-semibold">{t(record.lang, "notValid")}</p>
          {view.brandNote && <p className="mt-2 text-sm text-muted">{t(record.lang, "brandNote")}</p>}
        </section>
      )}
      <div className="flex flex-wrap gap-2">
        <Link
          to="/desk/$caseId"
          params={{ caseId: record.id }}
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-line bg-surface px-4 font-semibold"
        >
          {t(lang, "openDesk")}
        </Link>
        <Link
          to="/reference"
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-line bg-surface px-4 font-semibold"
        >
          {t(lang, "referenceDesk")}
        </Link>
      </div>
    </article>
  );
}

function Places({
  places,
  city,
  lang,
}: {
  places: PlaceCard[];
  city: string;
  lang: Lang;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">
        {t(lang, "placesTitle")}
        {city ? ` · ${city}` : ""}
      </h2>
      <p className="text-sm text-muted">{t(lang, "placesLead")}</p>
      {places.length === 0 && <p className="rounded-xl border border-line bg-surface p-4">{t(lang, "placesEmpty")}</p>}
      {places.map((place) => (
        <article key={place.id} className={place.direct ? "rounded-xl border border-primary bg-surface p-4" : "rounded-xl border border-line bg-surface p-4"}>
          {place.direct && <p className="text-sm font-semibold text-primary">{t(lang, "directOption")}</p>}
          <h3 className="mt-1 font-semibold">{place.name}</h3>
          <p className="text-sm text-muted">{place.area}</p>
          <p className="mt-2 text-sm">{place.note}</p>
          {place.phone && (
            <a href={`tel:${place.phone}`} className="mt-3 inline-flex min-h-11 items-center font-semibold text-primary">
              {t(lang, "call")} {place.display}
            </a>
          )}
        </article>
      ))}
      <p className="text-sm text-muted">{t(lang, "farBridge")}</p>
    </section>
  );
}
