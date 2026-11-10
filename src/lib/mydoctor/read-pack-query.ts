export type PackSight = {
  ok: true;
  name: string;
  strength: string;
  form:
    | "tablet"
    | "capsule"
    | "syrup"
    | "oral-drops"
    | "eye"
    | "ear"
    | "nasal"
    | "powder"
    | "cream"
    | "inhaler"
    | "injection"
    | "unknown";
  volume: string;
  seen: string;
  activeIngredients?: string;
  indications?: string;
  warnings?: string;
  sideEffects?: string;
};

export function queryFromSight(sight: PackSight): string {
  const formWord =
    sight.form === "eye"
      ? "eye drops"
      : sight.form === "ear"
        ? "ear drops"
        : sight.form === "nasal"
          ? "nasal spray"
          : sight.form === "oral-drops"
            ? "oral drops"
            : sight.form === "unknown"
              ? ""
              : sight.form;
  return [sight.name, sight.strength, formWord, sight.volume].filter(Boolean).join(" ");
}
