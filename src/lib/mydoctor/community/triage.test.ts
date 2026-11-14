import assert from "node:assert/strict";
import { test } from "node:test";
import { emergencyContacts } from "../facilities.ts";
import { cityName, medicineMarket, regionForCity } from "../places.ts";
import { CARE_REGIONS } from "./regions.ts";
import { DANGER_SIGNS, GUIDES, nextCareStep } from "./triage.ts";

test("a positive or uncertain danger sign interrupts screening at any step", () => {
  for (let index = 0; index < DANGER_SIGNS.length; index += 1) {
    const previous = Array<"no">(index).fill("no");
    assert.equal(nextCareStep(previous), "unanswered");
    assert.equal(nextCareStep([...previous, "yes"]), "emergency");
    assert.equal(nextCareStep([...previous, "unsure"]), "emergency");
  }
  assert.equal(nextCareStep(DANGER_SIGNS.map(() => "no")), "guides");
});

test("country selection routes to the same local emergency number in both flows", () => {
  assert.deepEqual(
    CARE_REGIONS.slice(0, 8).map((region) => region.id),
    ["PK", "IN", "BD", "NP", "LK", "BT", "MV", "AF-KBL"],
  );
  for (const { id, name, emergency } of CARE_REGIONS) {
    assert.equal(regionForCity(`country:${id}`), id);
    assert.equal(cityName(`country:${id}`, "ur"), name.ur);
    assert.equal(emergencyContacts("PK", false, id)[0].phone, emergency.phone);
  }
  assert.equal(regionForCity("other"), undefined);
  assert.equal(regionForCity(undefined), undefined);
  assert.equal(regionForCity("dubai"), "AE");
  assert.equal(medicineMarket("country:IN"), undefined);
  assert.equal(medicineMarket("country:AE"), "AE");
});

test("care guides include escalation, practical support and a source in both-language view", () => {
  for (const guide of GUIDES) {
    for (const lang of ["en", "ur"] as const) {
      assert.ok(
        guide.title[lang] && guide.warning[lang] && guide.support[lang] && guide.followUp[lang],
      );
    }
    assert.ok(guide.sources.length);
    assert.ok(guide.sources.every((source) => source.url.startsWith("https://")));
  }
});
