import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { buildDraft } from "./drafts.ts";
import { formularyFor } from "./formulary.ts";
import { evaluateGate } from "./rules.ts";
import { mergeUrgency } from "./rules.ts";
import { clusterFor, emergencyRouting, routeComplaint } from "./routing.ts";
import {
  emptyIntake,
  type AuditEvent,
  type CaseRecord,
  type Intake,
  type Jurisdiction,
  type Lang,
  type RuleId,
  type Verdict,
} from "./types.ts";

type ClinicState = {
  hydrated: boolean;
  lang: Lang;
  jurisdiction: Jurisdiction;
  signerName: string;
  intake: Intake;
  cases: Record<string, CaseRecord>;
  order: string[];
  setLang: (lang: Lang) => void;
  setJurisdiction: (jurisdiction: Jurisdiction) => void;
  setSignerName: (name: string) => void;
  patchIntake: (partial: Partial<Intake>) => void;
  resetIntake: (partial?: Partial<Intake>) => void;
  confirmRule: (ruleId: RuleId, accepted: boolean) => void;
  submitCase: () => CaseRecord | null;
  signCase: (id: string, verdict: Omit<Verdict, "signedAt" | "signerLabel"> & { signerLabel?: string }) => void;
  erase: () => void;
  markHydrated: () => void;
};

const memory = new Map<string, string>();
const browserStorage = {
  getItem: (name: string) => {
    if (typeof window === "undefined") return memory.get(name) ?? null;
    return window.localStorage.getItem(name);
  },
  setItem: (name: string, value: string) => {
    if (typeof window === "undefined") {
      memory.set(name, value);
      return;
    }
    window.localStorage.setItem(name, value);
  },
  removeItem: (name: string) => {
    if (typeof window === "undefined") {
      memory.delete(name);
      return;
    }
    window.localStorage.removeItem(name);
  },
};

function stamp(kind: string, detail: string): AuditEvent {
  return { at: new Date().toISOString(), kind, detail };
}

export const useClinic = create<ClinicState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      lang: "en",
      jurisdiction: "PK",
      signerName: "",
      intake: emptyIntake(),
      cases: {},
      order: [],
      setLang: (lang) => set({ lang }),
      setJurisdiction: (jurisdiction) => set({ jurisdiction }),
      setSignerName: (signerName) => set({ signerName }),
      patchIntake: (partial) => set({ intake: { ...get().intake, ...partial } }),
      resetIntake: (partial) => set({ intake: { ...emptyIntake(), ...partial } }),
      confirmRule: (ruleId, accepted) => {
        const intake = get().intake;
        const confirmed = intake.confirmed.filter((id) => id !== ruleId);
        const denied = intake.denied.filter((id) => id !== ruleId);
        if (accepted) confirmed.push(ruleId);
        else denied.push(ruleId);
        set({ intake: { ...intake, confirmed, denied } });
      },
      submitCase: () => {
        const { intake, lang, jurisdiction } = get();
        let confirmed = [...intake.confirmed];
        if (intake.cluster.safety === "yes" && !confirmed.includes("RF-PSYCH-1")) {
          confirmed = [...confirmed, "RF-PSYCH-1"];
        }
        const gate = evaluateGate({
          answers: intake.danger,
          transcript: intake.complaint,
          confirmed,
          denied: intake.denied,
          ageBand: intake.ageBand,
        });
        if (gate.level === "NEEDS_CONFIRMATION") return null;

        const routingBase =
          gate.level === "RED" ? emergencyRouting(gate.hits) : routeComplaint({
            complaint: intake.complaint,
            ageBand: intake.ageBand,
            forWhom: intake.forWhom,
            pregnant: intake.pregnant,
            cluster: intake.cluster,
          });
        const urgency = mergeUrgency(routingBase.urgency, intake.reportAbnormal, intake.reportNormal);
        const routing = { ...routingBase, urgency };
        const draft = buildDraft(routing, intake, gate);
        const formulary = formularyFor(routing, intake);
        const id = `md-${Date.now().toString(36)}`;
        const createdAt = new Date().toISOString();
        const audit: AuditEvent[] = [
          stamp("intake", "Complaint, danger answers, and read-back stored on this device."),
          stamp("language", lang === "ur" ? "Urdu" : "English (UK)"),
          stamp("jurisdiction", jurisdiction),
          stamp("asr", intake.voiceUsed ? intake.asrNote || "Voice used." : "Typed intake."),
          stamp(
            "red-flag",
            gate.level === "RED"
              ? gate.hits.map((hit) => `${hit.ruleId} via ${hit.source}`).join("; ")
              : "No red-flag rule fired.",
          ),
        ];
        if (intake.reportNormal) {
          audit.push(stamp("report", "Normal report noted. Urgency was not lowered."));
        }
        if (intake.reportAbnormal) {
          audit.push(stamp("report", `Abnormal report noted. Urgency is ${urgency}.`));
        }
        if (gate.level === "RED") {
          audit.push(stamp("halt", "Later questions stop so emergency instructions are not delayed."));
        }
        audit.push(stamp("draft", `${draft.label} ${routing.primarySpecialty}`));
        audit.push(stamp("formulary", formulary.suppressedReason || formulary.label));

        const record: CaseRecord = {
          id,
          createdAt,
          lang,
          jurisdiction,
          intake: { ...intake, confirmed, cluster: { ...intake.cluster, clusterId: clusterFor(intake.complaint, intake.ageBand, intake.forWhom) } },
          gate,
          routing,
          draft,
          formulary,
          audit,
          status: gate.level === "RED" ? "red" : "awaiting_clinician",
        };
        set({
          cases: { ...get().cases, [id]: record },
          order: [id, ...get().order],
          intake: emptyIntake(),
        });
        return record;
      },
      signCase: (id, verdict) => {
        const current = get().cases[id];
        if (!current) return;
        const signedAt = new Date().toISOString();
        const signerLabel = verdict.signerLabel?.trim() || get().signerName.trim() || "Demonstration clinician";
        const next: CaseRecord = {
          ...current,
          status: "signed",
          verdict: {
            action: verdict.action,
            text: verdict.text.trim(),
            reason: verdict.reason.trim(),
            selectedBrandIds: verdict.selectedBrandIds,
            signedAt,
            signerLabel,
          },
          audit: [
            ...current.audit,
            stamp(
              "verdict",
              `${verdict.action} by ${signerLabel}. ${verdict.reason.trim() || "No override reason."}`,
            ),
          ],
        };
        set({ cases: { ...get().cases, [id]: next }, signerName: signerLabel });
      },
      erase: () => set({ cases: {}, order: [], intake: emptyIntake() }),
      markHydrated: () => set({ hydrated: true }),
    }),
    {
      name: "mydoctor.v1",
      skipHydration: true,
      storage: createJSONStorage(() => browserStorage),
      partialize: (state) => ({
        lang: state.lang,
        jurisdiction: state.jurisdiction,
        signerName: state.signerName,
        cases: state.cases,
        order: state.order,
      }),
      onRehydrateStorage: () => (state) => {
        state?.markHydrated();
      },
    },
  ),
);

export function rehydrateClinic() {
  if (useClinic.getState().hydrated) return Promise.resolve();
  return useClinic.persist.rehydrate();
}
