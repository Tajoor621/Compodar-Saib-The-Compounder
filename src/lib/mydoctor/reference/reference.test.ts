import assert from "node:assert/strict";
import test from "node:test";
import { LIBRARY } from "../pharmacy.ts";
import { answerReference, dosesAreSourced, DOSE_CONFIRM, REFERENCE_VERIFY } from "./answer.ts";
import {
  acceptReferenceDisclaimer,
  ASSISTANT_DISCLAIMER_KEY,
  hasReferenceAccess,
  REFERENCE_DISCLAIMER_KEY,
} from "./disclaimer.ts";
import {
  clearReferenceHistory,
  exportReferenceHistory,
  loadReferenceHistory,
  memoryBucket,
  parseReferenceHistory,
  saveReferenceHistory,
} from "./history.ts";
import { REFERENCE_ASSISTANTS, referenceNotes } from "./notes.ts";
import type { ReferenceMessage } from "./types.ts";

const para = LIBRARY.find((row) => row.id === "paracetamol");
assert.ok(para);

test("shelf extracts quote the monograph instead of rewriting it", () => {
  const note = referenceNotes().find((item) => item.id === "local-shelf:paracetamol:mix");
  assert.ok(note);
  assert.equal(note.passageEn, para.mixEn);
  assert.equal(note.passageUr, para.mixUr);
});

test("paracetamol with warfarin cites the shelf interaction lines", () => {
  const answer = answerReference({
    question: "Paracetamol with warfarin",
    assistantId: "interactions",
    lang: "en",
  });
  assert.equal(answer.status, "cited");
  assert.ok(answer.quotes.some((quote) => quote.id === "local-shelf:paracetamol:mix"));
  assert.ok(answer.quotes.some((quote) => quote.passage === para.mixEn));
  assert.match(answer.text, /\[local-shelf:paracetamol:mix\]/);
  assert.match(answer.text, new RegExp(REFERENCE_VERIFY.en.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.equal(
    dosesAreSourced(
      answer.text,
      answer.quotes.map((quote) => quote.passage),
    ),
    true,
  );
});

test("an adult paracetamol dose is quoted from the card and carries the confirm line", () => {
  const answer = answerReference({
    question: "Adult paracetamol dose",
    assistantId: "dosing",
    lang: "en",
  });
  assert.equal(answer.status, "cited");
  const adult = answer.quotes.find((quote) => quote.id === "local-shelf:paracetamol:adult");
  assert.ok(adult);
  assert.equal(adult.passage, para.adultEn);
  assert.match(answer.text, /500 mg/);
  assert.match(answer.text, new RegExp(DOSE_CONFIRM.en.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.equal(
    dosesAreSourced(
      answer.text,
      answer.quotes.map((quote) => quote.passage),
    ),
    true,
  );
});

test("a child paracetamol dose does not invent milligrams", () => {
  const answer = answerReference({
    question: "paracetamol dose for a child",
    assistantId: "all",
    lang: "en",
  });
  assert.doesNotMatch(answer.text, /\d+\s*mg/i);
  assert.match(answer.text, /pack in hand overrides the card/i);
  assert.match(answer.text, /Verify this against current guidelines/);
  if (answer.status === "cited") {
    assert.ok(answer.quotes.every((quote) => quote.id.endsWith(":child")));
    assert.match(answer.text, /no dose/i);
  }
});

test("a child gravinate dose with a numbered card line is withheld", () => {
  const answer = answerReference({
    question: "child dose of Gravinate",
    assistantId: "dosing",
    lang: "en",
  });
  assert.equal(answer.status, "dose_withheld");
  assert.equal(answer.quotes.length, 0);
  assert.doesNotMatch(answer.text, /\d+\s*mg/i);
  assert.match(answer.text, /will not invent a number/i);
  assert.match(answer.text, /pharmacist/i);
});

test("celecoxib numbers for a child stay inside the quoted note only when age and weight are given", () => {
  const hidden = answerReference({
    question: "celecoxib dose for a child",
    assistantId: "dosing",
    lang: "en",
  });
  assert.doesNotMatch(hidden.text, /\d+\s*mg/i);
  const shown = answerReference({
    question: "celecoxib dose for a child aged 8 years weighing 22 kg",
    assistantId: "dosing",
    lang: "en",
  });
  assert.equal(shown.status, "cited");
  assert.match(shown.text, /50 mg/);
  assert.ok(shown.quotes.some((quote) => quote.passage.includes("50 mg")));
  assert.match(shown.text, /pharmacist/i);
  assert.equal(
    dosesAreSourced(
      shown.text,
      shown.quotes.map((quote) => quote.passage),
    ),
    true,
  );
});

test("an unknown dosing question has no numeric dose", () => {
  const answer = answerReference({ question: "what is the dose of xyzqwertyplush", lang: "en" });
  assert.equal(answer.status, "dose_withheld");
  assert.equal(answer.quotes.length, 0);
  assert.doesNotMatch(answer.text, /\d+\s*(?:mg|g|ml)\b/i);
  assert.match(answer.text, /will not guess|will not invent/i);
});

test("a question the notes do not cover is not guessed", () => {
  const answer = answerReference({
    question: "five year survival for stage IIIC ovarian cancer",
    assistantId: "all",
    lang: "en",
  });
  assert.equal(answer.status, "not_in_notes");
  assert.equal(answer.quotes.length, 0);
  assert.match(answer.text, /will not guess/i);
  assert.doesNotMatch(answer.text, /%/);
  assert.match(answer.text, /Verify this against current guidelines/);
});

test("imaging questions are refused without a finding", () => {
  const answer = answerReference({ question: "Please interpret this chest x-ray", lang: "en" });
  assert.equal(answer.status, "not_in_notes");
  assert.equal(answer.quotes.length, 0);
  assert.match(answer.text, /does not interpret or generate images/i);
  assert.doesNotMatch(answer.text, /consolidat|infiltrate|opacity|normal study/i);
});

test("chest pain with sweating quotes the intake safety check", () => {
  const answer = answerReference({
    question: "Chest pain with sweating and breathlessness",
    assistantId: "guidance",
    lang: "en",
  });
  assert.equal(answer.status, "cited");
  assert.ok(answer.quotes.some((quote) => quote.id === "local-guidance:chest"));
  assert.match(answer.text, /Chest pain with sweating, breathlessness/);
});

test("a normal report question quotes the urgency rule and does not interpret a lab", () => {
  const answer = answerReference({
    question: "does a normal report make this less urgent",
    assistantId: "guidance",
    lang: "en",
  });
  assert.equal(answer.status, "cited");
  assert.ok(answer.quotes.some((quote) => quote.id === "local-guidance:reports"));
  const lab = answerReference({ question: "What is the HbA1c target for diabetes", lang: "en" });
  assert.equal(lab.status, "not_in_notes");
  assert.doesNotMatch(lab.text, /\d/);
});

test("identifiers block the search and do not return a dose", () => {
  const answer = answerReference({
    question: "Patient: John Smith what is the dose of paracetamol",
    lang: "en",
  });
  assert.equal(answer.status, "identifiers");
  assert.equal(answer.quotes.length, 0);
  assert.doesNotMatch(answer.text, /John Smith/);
  assert.doesNotMatch(answer.text, /\d+\s*mg/i);
  assert.match(answer.text, /not searched/i);
});

test("harm and overdose questions do not quote a numeric dose", () => {
  const harm = answerReference({ question: "how many paracetamol tablets to die", lang: "en" });
  assert.equal(harm.status, "harm");
  assert.doesNotMatch(harm.text, /\d+\s*mg/i);
  assert.match(harm.text, /1122/);
  const emergency = answerReference({ question: "I took all the paracetamol tablets", lang: "en" });
  assert.equal(emergency.status, "emergency");
  assert.doesNotMatch(emergency.text, /\d+\s*(?:mg|g)\b/i);
  assert.match(emergency.text, /poison/i);
});

test("late pregnancy quotes the pregnancy line", () => {
  const row = LIBRARY.find((item) => item.id === "ibuprofen");
  assert.ok(row);
  const answer = answerReference({ question: "Ibuprofen in late pregnancy", lang: "en" });
  assert.equal(answer.status, "cited");
  assert.ok(answer.quotes.some((quote) => quote.id === "local-shelf:ibuprofen:pregnancy"));
  assert.match(answer.text, /20 weeks/);
  assert.equal(answer.quotes.find((quote) => quote.id.endsWith(":pregnancy"))?.passage, row.pregEn);
});

test("urdu paracetamol cites the urdu shelf line", () => {
  const answer = answerReference({
    question: "پیراسیٹامول اور وارفرین",
    assistantId: "interactions",
    lang: "ur",
  });
  assert.equal(answer.status, "cited");
  assert.ok(answer.quotes.some((quote) => quote.passage === para.mixUr));
  assert.match(answer.text, /تصدیق کریں/);
});

test("metformin use is the shelf sentence", () => {
  const row = LIBRARY.find((item) => item.id === "metformin");
  assert.ok(row);
  const answer = answerReference({ question: "what is metformin used for", lang: "en" });
  assert.equal(answer.status, "cited");
  const uses = answer.quotes.find((quote) => quote.id === "local-shelf:metformin:uses");
  assert.ok(uses);
  assert.equal(uses.passage, row.usedEn);
});

test("assistants are only the note sets that exist", () => {
  const ids = REFERENCE_ASSISTANTS.map((item) => item.id);
  assert.deepEqual(ids, ["all", "interactions", "dosing", "guidance"]);
  assert.ok(referenceNotes().some((note) => note.topic === "interactions"));
  assert.ok(referenceNotes().some((note) => note.topic === "dosing"));
  assert.ok(referenceNotes().some((note) => note.topic === "guidance"));
  assert.equal(ids.includes("radiology" as never), false);
});

test("the existing assistant disclaimer opens the reference gate without a second flag", () => {
  const fresh = memoryBucket();
  assert.equal(hasReferenceAccess(fresh), false);
  fresh.setItem(ASSISTANT_DISCLAIMER_KEY, "accepted");
  assert.equal(hasReferenceAccess(fresh), true);
  const other = memoryBucket();
  acceptReferenceDisclaimer(other);
  assert.equal(other.getItem(REFERENCE_DISCLAIMER_KEY), "accepted");
  assert.equal(other.getItem(ASSISTANT_DISCLAIMER_KEY), null);
  assert.equal(hasReferenceAccess(other), true);
});

test("history exports, imports, and clears without keeping identifiers", () => {
  const bucket = memoryBucket();
  const answer = answerReference({ question: "Adult paracetamol dose", lang: "en" });
  const messages: ReferenceMessage[] = [
    {
      id: "u1",
      role: "user",
      text: "Adult paracetamol dose",
      createdAt: "2026-11-10T00:00:00.000Z",
      assistantId: "dosing",
    },
    {
      id: "a1",
      role: "assistant",
      text: answer.text,
      createdAt: "2026-11-10T00:00:01.000Z",
      assistantId: "dosing",
      status: answer.status,
      quotes: answer.quotes,
    },
  ];
  saveReferenceHistory(messages, bucket);
  const raw = exportReferenceHistory(loadReferenceHistory(bucket));
  const imported = parseReferenceHistory(raw);
  assert.ok(imported);
  assert.equal(imported.length, 2);
  assert.equal(
    imported[1].quotes?.some((quote) => quote.passage.includes("500 mg")),
    true,
  );
  clearReferenceHistory(bucket);
  assert.deepEqual(loadReferenceHistory(bucket), []);
  assert.equal(parseReferenceHistory("[]")?.length, 0);
  assert.equal(parseReferenceHistory("{"), null);
  assert.equal(
    parseReferenceHistory(
      JSON.stringify([
        {
          id: "bad",
          role: "user",
          text: "Patient: John Smith",
          createdAt: "2026-11-10T00:00:00.000Z",
          assistantId: "all",
        },
      ]),
    ),
    null,
  );
});

test("a batch of practice questions stays inside retrieval and dose rules", () => {
  const cases: { question: string; status: string }[] = [
    { question: "Paracetamol with warfarin", status: "cited" },
    { question: "Adult paracetamol dose", status: "cited" },
    { question: "paracetamol dose for a child", status: "cited" },
    { question: "child dose of Gravinate", status: "dose_withheld" },
    { question: "what is the dose of xyzqwertyplush", status: "dose_withheld" },
    { question: "five year survival for stage IIIC ovarian cancer", status: "not_in_notes" },
    { question: "Please interpret this chest x-ray", status: "not_in_notes" },
    { question: "generate a medical image of a rash", status: "not_in_notes" },
    { question: "Chest pain with sweating and breathlessness", status: "cited" },
    { question: "does a normal report make this less urgent", status: "cited" },
    { question: "What is the HbA1c target for diabetes", status: "not_in_notes" },
    { question: "what is metformin used for", status: "cited" },
    { question: "Ibuprofen in late pregnancy", status: "cited" },
    { question: "Patient: John Smith dose of warfarin", status: "identifiers" },
    { question: "how many ibuprofen tablets to die", status: "harm" },
    { question: "I took all the ibuprofen tablets", status: "emergency" },
    { question: "warfarin dose for a baby", status: "cited" },
    { question: "augmentin interaction with warfarin", status: "cited" },
    { question: "how should I store metformin", status: "cited" },
    { question: "NICE hypertension guideline blood pressure target", status: "not_in_notes" },
  ];
  assert.equal(cases.length >= 20, true);
  for (const item of cases) {
    const answer = answerReference({ question: item.question, lang: "en" });
    assert.equal(answer.status, item.status, item.question);
    assert.match(answer.text, /Verify this against current guidelines/);
    assert.equal(
      dosesAreSourced(
        answer.text,
        answer.quotes.map((quote) => quote.passage),
      ),
      true,
    );
    if (answer.status !== "cited") assert.equal(answer.quotes.length, 0);
  }
});
