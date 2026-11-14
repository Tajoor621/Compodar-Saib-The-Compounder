import assert from "node:assert/strict";
import test from "node:test";
import { assessDesk, DESKS, suggestDesk } from "./assess.ts";
import { NOTE_COUNT } from "./notes.ts";
import { exportPortable, exportReports, memoryBucket, mergePortable, parsePortable, profileHasIdentifiers, saveProfiles, saveReports, loadReports, REPORT_KEY } from "./store.ts";
import type { DeskReport } from "./types.ts";

const base = {
  ageBand: "16-64" as const,
  sex: "female" as const,
  child: false,
  pregnant: "no" as const,
  medicines: "",
  danger: {
    chest: false,
    fast: false,
    breath: false,
    sepsis: false,
    anaphylaxis: false,
    pregnancy: false,
    child: false,
    suicide: false,
    trauma: false,
    tox: false,
    metabolic: false,
  },
  follow: {},
};

test("a red-flag answer stops as an emergency and names the existing rule", () => {
  const result = assessDesk({
    ...base,
    started: "gp",
    complaint: "chest pain with sweating and breathlessness",
    danger: { ...base.danger, chest: true },
  });
  assert.equal(result.emergency, true);
  assert.equal(result.care, "emergency");
  assert.ok(result.ruleIds.includes("RF-CARDIAC-1"));
  assert.equal(result.causes.length, 0);
});

test("a sudden worst headache reuses the neurological safety rule", () => {
  const result = assessDesk({
    ...base,
    started: "neurology",
    complaint: "headache for a day",
    follow: { sudden: "yes" },
  });
  assert.equal(result.emergency, true);
  assert.ok(result.ruleIds.includes("RF-NEURO-1"));
});

test("an itch without danger cites the skin routing note and does not diagnose", () => {
  const result = assessDesk({
    ...base,
    started: "gp",
    complaint: "itchy rash on the arm",
    follow: { itch: "yes" },
  });
  assert.equal(result.emergency, false);
  assert.equal(result.suggested, "dermatology");
  assert.equal(result.uncovered, false);
  assert.ok(result.causes.some((cause) => cause.sourceId === "routing:dermatology"));
  const blob = JSON.stringify(result.causes);
  assert.equal(/you have|diagnosis of|eczema|melanoma/i.test(blob), false);
  assert.match(blob, /Image diagnosis is not performed/);
  assert.doesNotMatch(blob, /\d+\s*mg/i);
});

test("a story the notes do not cover stays with the family doctor and names no cause", () => {
  const result = assessDesk({
    ...base,
    started: "gp",
    complaint: "my left elbow clicks when I type",
  });
  assert.equal(result.suggested, "gp");
  assert.equal(result.uncovered, true);
  assert.equal(result.causes.length, 0);
  assert.equal(result.care, "doctor");
});

test("the seven desks are the only entry points", () => {
  assert.deepEqual(
    DESKS.map((desk) => desk.id),
    ["gp", "dermatology", "gastroenterology", "neurology", "cardiology", "pulmonology_ent", "endocrinology"],
  );
  assert.equal(suggestDesk("burning urine", "16-64", false).desk, "gp");
  assert.equal(NOTE_COUNT >= 10 && NOTE_COUNT <= 20, true);
});

test("profiles reject identifiers and reports export", () => {
  assert.equal(
    profileHasIdentifiers({
      nickname: "Mr John Smith",
      conditions: "",
      medicines: "",
      allergies: "",
      pastTreatments: "",
    }),
    true,
  );
  const bucket = memoryBucket();
  saveProfiles(
    [
      {
        id: "p1",
        relation: "mother",
        nickname: "Mother",
        ageBand: "65+",
        sex: "female",
        conditions: "sugar words",
        medicines: "metformin",
        allergies: "",
        pastTreatments: "",
      },
    ],
    bucket,
  );
  const report: DeskReport = {
    id: "r1",
    createdAt: "2026-11-10T00:00:00.000Z",
    lang: "en",
    profileId: "p1",
    relation: "mother",
    nickname: "Mother",
    ageBand: "65+",
    complaint: "thirst",
    follow: { thirst: "yes" },
    danger: base.danger,
    result: assessDesk({ ...base, ageBand: "65+", started: "endocrinology", complaint: "thirst", follow: { thirst: "yes" } }),
  };
  assert.equal(report.result.emergency, false);
  assert.ok(report.result.causes.some((cause) => cause.sourceId === "routing:metabolic"));
  saveReports([report], bucket);
  const raw = exportReports(loadReports(bucket));
  const parsed = JSON.parse(raw) as DeskReport[];
  assert.equal(parsed[0]?.id, "r1");
  assert.doesNotMatch(raw, /\d+\s*mg/i);
  const portable = exportPortable(
    [
      {
        id: "p1",
        relation: "mother",
        nickname: "Mother",
        ageBand: "65+",
        sex: "female",
        conditions: "",
        medicines: "",
        allergies: "",
        pastTreatments: "",
      },
    ],
    [report],
  );
  const file = parsePortable(portable);
  assert.ok(file);
  const merged = mergePortable([], [], file);
  assert.equal(merged.profiles[0]?.relation, "mother");
  assert.equal(merged.reports[0]?.id, "r1");
  assert.equal(parsePortable("[]"), null);
  const malformed = { ...report, result: { ...report.result, causes: null } };
  bucket.setItem(REPORT_KEY, JSON.stringify([malformed, report]));
  assert.deepEqual(loadReports(bucket), [report]);
  assert.equal(parsePortable(JSON.stringify({ ...file, reports: [malformed] })), null);
  assert.equal(parsePortable(JSON.stringify({ ...file, reports: [{ ...report, complaint: "Name: Jane Doe" }] })), null);

});
