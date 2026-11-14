import { detectIdentifiers } from "../safety.ts";
import type { DeskProfile, DeskReport, Relation } from "./types.ts";

import { z } from "zod";
import { DANGER_KEYS, RULE_META } from "../types.ts";
import { appStorage, PROFILE_KEY, REPORT_KEY, type Bucket } from "../local-storage.ts";

export { PROFILE_KEY, REPORT_KEY, memoryBucket, type Bucket } from "../local-storage.ts";

const RELATIONS = new Set<Relation>(["me", "mother", "father", "child", "spouse", "relative"]);

export function profileText(
  profile: Pick<
    DeskProfile,
    "nickname" | "conditions" | "medicines" | "allergies" | "pastTreatments"
  >,
): string {
  return [
    profile.nickname,
    profile.conditions,
    profile.medicines,
    profile.allergies,
    profile.pastTreatments,
  ].join("\n");
}

export function profileHasIdentifiers(
  profile: Pick<
    DeskProfile,
    "nickname" | "conditions" | "medicines" | "allergies" | "pastTreatments"
  >,
): boolean {
  return detectIdentifiers(profileText(profile));
}

const ageBand = z.enum(["0-28d", "1m-5y", "6-15", "16-64", "65+"]);
const desk = z.enum([
  "gp",
  "dermatology",
  "gastroenterology",
  "neurology",
  "cardiology",
  "pulmonology_ent",
  "endocrinology",
]);
const identifier = z.string().min(1).max(100);
const text = z.string().max(12000);
const personalText = text.refine((value) => !detectIdentifiers(value));
const relation = z.custom<Relation>((value) => RELATIONS.has(value as Relation));
const profileSchema = z.object({
  id: identifier,
  relation,
  nickname: personalText,
  ageBand,
  sex: z.enum(["female", "male", "unspecified"]),
  conditions: personalText,
  medicines: personalText,
  allergies: personalText,
  pastTreatments: personalText,
});
const causeSchema = z.object({
  id: identifier,
  titleEn: text,
  titleUr: text,
  detailEn: text,
  detailUr: text,
  sourceId: text,
  sourceEn: text,
  sourceUr: text,
});
const rule = z.custom<DeskReport["result"]["ruleIds"][number]>(
  (value) => typeof value === "string" && Object.hasOwn(RULE_META, value),
);
const reportSchema = z
  .object({
    id: identifier,
    createdAt: z.iso.datetime({ offset: true }),
    lang: z.enum(["en", "ur"]),
    profileId: identifier,
    relation,
    nickname: personalText,
    ageBand,
    complaint: personalText,
    follow: z.record(z.string(), personalText),
    danger: z.partialRecord(z.enum(DANGER_KEYS), z.boolean()),
    result: z.object({
      emergency: z.boolean(),
      ruleIds: z.array(rule),
      started: desk,
      suggested: desk,
      childReview: z.boolean(),
      mentalReview: z.boolean(),
      uncovered: z.boolean(),
      care: z.enum(["self_care", "doctor", "urgent", "emergency"]),
      causes: z.array(causeSchema),
      watchEn: text,
      watchUr: text,
      askEn: z.array(text),
      askUr: z.array(text),
      medicineIds: z.array(identifier),
    }),
  })
  .refine(({ result }) => result.emergency === (result.care === "emergency"));

function validRows<T>(rows: unknown[], schema: z.ZodType<T>, limit: number): T[] {
  return rows
    .flatMap((row) => {
      const result = schema.safeParse(row);
      return result.success ? [result.data] : [];
    })
    .slice(0, limit);
}

export function loadProfiles(bucket?: Bucket): DeskProfile[] {
  const raw = (bucket ?? appStorage).getItem(PROFILE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return validRows(parsed, profileSchema, 12);
  } catch {
    return [];
  }
}

export function saveProfiles(profiles: DeskProfile[], bucket?: Bucket): void {
  const clean = profiles.filter((profile) => !profileHasIdentifiers(profile)).slice(0, 12);
  (bucket ?? appStorage).setItem(PROFILE_KEY, JSON.stringify(clean));
}

export function loadReports(bucket?: Bucket): DeskReport[] {
  const raw = (bucket ?? appStorage).getItem(REPORT_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return validRows(parsed, reportSchema, 40);
  } catch {
    return [];
  }
}

export function saveReports(reports: DeskReport[], bucket?: Bucket): void {
  (bucket ?? appStorage).setItem(REPORT_KEY, JSON.stringify(reports.slice(0, 40)));
}

export function exportReports(reports: DeskReport[]): string {
  return JSON.stringify(reports, null, 2);
}

export const PORTABLE_KIND = "compodar-saib-portable";

export type PortableFile = {
  kind: typeof PORTABLE_KIND;
  version: 1;
  profiles: DeskProfile[];
  reports: DeskReport[];
};

export function exportPortable(profiles: DeskProfile[], reports: DeskReport[]): string {
  const file: PortableFile = {
    kind: PORTABLE_KIND,
    version: 1,
    profiles: profiles.filter((profile) => !profileHasIdentifiers(profile)),
    reports,
  };
  return JSON.stringify(file, null, 2);
}

export function parsePortable(raw: string): PortableFile | null {
  try {
    const parsed = JSON.parse(raw) as Partial<PortableFile>;
    if (parsed.kind !== PORTABLE_KIND || parsed.version !== 1) return null;
    if (!Array.isArray(parsed.profiles) || !Array.isArray(parsed.reports)) return null;
    if (parsed.profiles.length > 12 || parsed.reports.length > 40) return null;
    const profiles = validRows(parsed.profiles, profileSchema, 12);
    const reports = validRows(parsed.reports, reportSchema, 40);
    if (profiles.length !== parsed.profiles.length || reports.length !== parsed.reports.length)
      return null;
    return { kind: PORTABLE_KIND, version: 1, profiles, reports };
  } catch {
    return null;
  }
}

export function mergePortable(
  currentProfiles: DeskProfile[],
  currentReports: DeskReport[],
  incoming: PortableFile,
): {
  profiles: DeskProfile[];
  reports: DeskReport[];
} {
  const profiles = [...currentProfiles];
  for (const profile of incoming.profiles) {
    const index = profiles.findIndex((item) => item.id === profile.id);
    if (index >= 0) profiles[index] = profile;
    else profiles.push(profile);
  }
  const reports = [...new Map(incoming.reports.map((item) => [item.id, item])).values()];
  for (const report of currentReports) {
    if (!reports.some((item) => item.id === report.id)) reports.push(report);
  }
  return { profiles: profiles.slice(0, 12), reports: reports.slice(0, 40) };
}
