import { test } from "node:test";
import assert from "node:assert/strict";
import { assessFamilyCare, questionsFor, FAMILY_GUIDES } from "./family-care.ts";

test("positive and uncertain answers escalate every warning sign", () => {
  for (const track of ["children", "pregnancy", "gynaecology"] as const) {
    const questions = questionsFor(track);
    for (const [index, question] of questions.entries()) {
      const previous = Array<"no">(index).fill("no");
      assert.equal(assessFamilyCare(track, previous).status, "screening");
      for (const answer of ["yes", "unsure"] as const) {
        assert.deepEqual(assessFamilyCare(track, [...previous, answer]), {
          status: question.action,
          source: question.source,
        });
      }
    }
    assert.equal(
      assessFamilyCare(
        track,
        questions.map(() => "no"),
      ).status,
      "complete",
    );
  }
});

test("family care guides include bilingual instructions and follow-up sources", () => {
  for (const guide of FAMILY_GUIDES) {
    for (const language of ["en", "ur"] as const) {
      assert.ok(guide.title[language] && guide.do[language] && guide.follow[language]);
    }
    assert.ok(guide.sources.length && guide.sources.every(({ url }) => url.startsWith("https://")));
  }
});
