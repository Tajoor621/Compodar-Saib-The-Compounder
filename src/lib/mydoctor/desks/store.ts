import { detectIdentifiers } from "../safety.ts";
import type { DeskProfile, DeskReport, Relation } from "./types.ts";

export const PROFILE_KEY = "mydoctor-desk-profiles";
export const REPORT_KEY = "mydoctor-desk-reports";

export type Bucket = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
};

const memory = new Map<string, string>();

export function browserBucket(): Bucket {
  if (typeof localStorage === "undefined") {
    return {
      getItem: (key) => memory.get(key) ?? null,
      setItem: (key, value) => memory.set(key, value),
      removeItem: (key) => memory.delete(key),
    };
  }
  return {
    getItem: (key) => {
      try {
        return localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    setItem: (key, value) => {
      try {
        localStorage.setItem(key, value);
      } catch {
        memory.set(key, value);
      }
    },
    removeItem: (key) => {
      try {
        localStorage.removeItem(key);
      } catch {
        memory.delete(key);
      }
    },
  };
}

export function memoryBucket(): Bucket {
  const map = new Map<string, string>();
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => map.set(key, value),
    removeItem: (key) => map.delete(key),
  };
}

const RELATIONS = new Set<Relation>(["me", "mother", "father", "child", "spouse", "relative"]);

export function profileText(profile: Pick<DeskProfile, "nickname" | "conditions" | "medicines" | "allergies" | "pastTreatments">): string {
  return [profile.nickname, profile.conditions, profile.medicines, profile.allergies, profile.pastTreatments].join("\n");
}

export function profileHasIdentifiers(profile: Pick<DeskProfile, "nickname" | "conditions" | "medicines" | "allergies" | "pastTreatments">): boolean {
  return detectIdentifiers(profileText(profile));
}

function asProfile(value: unknown): DeskProfile | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Partial<DeskProfile>;
  if (typeof row.id !== "string" || !RELATIONS.has(row.relation as Relation)) return null;
  if (typeof row.nickname !== "string" || typeof row.conditions !== "string") return null;
  if (typeof row.medicines !== "string" || typeof row.allergies !== "string" || typeof row.pastTreatments !== "string") return null;
  if (profileHasIdentifiers(row as DeskProfile)) return null;
  return row as DeskProfile;
}

export function loadProfiles(bucket?: Bucket): DeskProfile[] {
  const raw = (bucket ?? browserBucket()).getItem(PROFILE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.map(asProfile).filter((row): row is DeskProfile => Boolean(row));
  } catch {
    return [];
  }
}

export function saveProfiles(profiles: DeskProfile[], bucket?: Bucket): void {
  const clean = profiles.filter((profile) => !profileHasIdentifiers(profile)).slice(0, 12);
  (bucket ?? browserBucket()).setItem(PROFILE_KEY, JSON.stringify(clean));
}

export function loadReports(bucket?: Bucket): DeskReport[] {
  const raw = (bucket ?? browserBucket()).getItem(REPORT_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((row) => row && typeof row === "object" && typeof (row as DeskReport).id === "string") as DeskReport[];
  } catch {
    return [];
  }
}

export function saveReports(reports: DeskReport[], bucket?: Bucket): void {
  (bucket ?? browserBucket()).setItem(REPORT_KEY, JSON.stringify(reports.slice(0, 40)));
}

export function exportReports(reports: DeskReport[]): string {
  return JSON.stringify(reports, null, 2);
}
