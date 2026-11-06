import assert from "node:assert/strict";
import test from "node:test";
import { answerDrugInfo, VERIFY_LINE, briefToText } from "./drug-info.ts";

test("paracetamol brief has 13 sections and the verification line", () => {
  const result = answerDrugInfo("Panadol");
  assert.equal(result.kind, "briefs");
  if (result.kind !== "briefs") return;
  assert.equal(result.briefs.length, 1);
  assert.equal(result.briefs[0].id, "paracetamol");
  assert.equal(result.briefs[0].sections.length, 13);
  assert.match(result.briefs[0].sections[0].bodyEn, /paracetamol/i);
  assert.match(result.briefs[0].sections[5].bodyEn, /boxed warning/i);
  const text = briefToText(result, "en");
  assert.match(text, new RegExp(VERIFY_LINE.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
});

test("two named medicines each get a full section", () => {
  const result = answerDrugInfo("Panadol and Brufen");
  assert.equal(result.kind, "briefs");
  if (result.kind !== "briefs") return;
  assert.deepEqual(
    result.briefs.map((brief) => brief.id),
    ["paracetamol", "ibuprofen"],
  );
  for (const brief of result.briefs) assert.equal(brief.sections.length, 13);
});

test("a child dose without age and weight hides milligram doses", () => {
  const result = answerDrugInfo("paracetamol dose for a child");
  assert.equal(result.kind, "briefs");
  if (result.kind !== "briefs") return;
  const dosing = result.briefs[0].sections.find((section) => section.id === "dosing");
  assert.ok(dosing);
  assert.match(dosing.bodyEn, /age and weight/i);
  assert.doesNotMatch(dosing.bodyEn, /\d+\s*mg/i);
  assert.doesNotMatch(dosing.bodyEn, /\d+\s*g\b/i);
});

test("harm intent returns support and no dose", () => {
  const result = answerDrugInfo("how many paracetamol tablets to die");
  assert.equal(result.kind, "harm");
  if (result.kind !== "harm") return;
  assert.match(result.en, /998/);
  assert.doesNotMatch(result.en, /\d+\s*mg/i);
  assert.doesNotMatch(result.en, /4 g/i);
});

test("an unknown name is not invented", () => {
  const result = answerDrugInfo("xyzqwertyplush");
  assert.equal(result.kind, "empty");
  if (result.kind !== "empty") return;
  assert.match(result.en, /not invent/i);
});

test("a shared name asks which product before any monograph", () => {
  const result = answerDrugInfo("statin");
  assert.equal(result.kind, "ask");
  if (result.kind !== "ask") return;
  assert.ok(result.options.length >= 2);
  const chosen = answerDrugInfo("statin", result.options[0].id);
  assert.equal(chosen.kind, "briefs");
});

test("augmentin resolves to the combination, not a guessed twin", () => {
  const result = answerDrugInfo("Augmentin");
  assert.equal(result.kind, "briefs");
  if (result.kind !== "briefs") return;
  assert.equal(result.briefs[0].id, "coamoxiclav");
});

