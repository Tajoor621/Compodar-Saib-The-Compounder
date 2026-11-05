import { careFor } from "./suggestions.ts";
import { emptyIntake, FORMULARY_LABEL, type FormularyPacket, type Intake, type RoutingDecision } from "./types.ts";

const STAMP =
  "Local packs from public lists. DRAP PharmaPrice figures used here are dated 23–27 July 2026 (Panadol 500 mg 200s PKR 762.93; Glucophage 500 mg 5×10 PKR 221.45; Risek 20 mg 2×7 PKR 991.14; Disprin 300 mg 100s PKR 334.13). Dubai shelf: Zyrtec 10 mg 20s AED 39.50. Ask today's price. Not a live feed. Interaction rules v0.3-demo.";

const DOSE_HOLD = {
  renal: "No dose is calculated here. Renal adjustment is a clinician decision.",
  hepatic: "No dose is calculated here. Hepatic adjustment is a clinician decision.",
  pediatric: "No weight was used. Do not derive a paediatric dose from this packet.",
  pregnancy: "Pregnancy category is not assigned by this demo. The clinician decides.",
};

function packet(
  partial: Omit<FormularyPacket, "label" | "demoStamp" | "doseConsiderations"> & {
    doseConsiderations?: FormularyPacket["doseConsiderations"];
  },
): FormularyPacket {
  return {
    ...partial,
    doseConsiderations: partial.doseConsiderations ?? DOSE_HOLD,
    label: FORMULARY_LABEL,
    demoStamp: STAMP,
  };
}

export function formularyFor(routing: RoutingDecision, intake?: Intake): FormularyPacket {
  const care = careFor(routing, intake ?? emptyIntake());
  if (routing.urgency === "RED" || routing.halted) {
    return packet({
      activeIngredient: "None listed",
      atcCode: "—",
      inn: "—",
      localBrands: [],
      interactions: [care.withheldEn],
      suppressedReason: care.withheldEn,
    });
  }

  const items = [...care.counter, ...care.clinicianOnly];
  const localBrands = items.flatMap((item) =>
    item.brands.map((brand) => ({
      id: brand.id,
      brand: brand.brand,
      company: brand.company,
      strength: brand.strength,
      packSize: brand.packSize,
      mrpPKR: brand.mrpNote,
      drapRegNo: "DEMO-NOT-LIVE",
      status: brand.status,
    })),
  );
  const first = items[0];
  return packet({
    activeIngredient: first?.inn ?? "None listed",
    atcCode: first?.atc ?? "—",
    inn: items.length > 1 ? "See each row" : (first?.inn ?? "—"),
    localBrands,
    interactions: [...new Set(items.map((item) => item.cautionEn)), care.withheldEn],
    suppressedReason: localBrands.length === 0 ? care.withheldEn : undefined,
  });
}
