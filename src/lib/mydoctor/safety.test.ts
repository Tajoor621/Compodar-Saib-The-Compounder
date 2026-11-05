import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { patientFacingCorpus } from "./copy.ts";
import { buildDraft, draftHasRequiredLabel } from "./drafts.ts";
import { formularyFor } from "./formulary.ts";
import { patientView } from "./patient.ts";
import { nearestCity, suggestPlaces } from "./places.ts";
import { evaluateGate, mergeUrgency, runRegression } from "./rules.ts";
import { routeComplaint } from "./routing.ts";
import { careFor, emergencyBridge, emergencyChecks, emergencyHelp, homeRemedies, inspectionNotes } from "./suggestions.ts";
import { emptyIntake, FORMULARY_LABEL, type CaseRecord } from "./types.ts";

describe("red-flag regression", () => {
  it("misses no scripted emergency and never lets a normal report lower urgency", () => {
    const result = runRegression();
    assert.deepEqual(result.failed, []);
  });
});

describe("routing", () => {
  it("sends a child to paediatrics even when the rash words are dermatology-shaped", () => {
    const decision = routeComplaint({
      complaint: "Itchy rash on the arms",
      ageBand: "6-15",
      forWhom: "child",
      pregnant: "na",
      cluster: {},
    });
    assert.equal(decision.primarySpecialty, "pediatrics");
    assert.equal(decision.urgency, "YELLOW");
    assert.equal(decision.halted, false);
  });

  it("keeps vague stories in general medicine at low confidence", () => {
    const decision = routeComplaint({
      complaint: "I feel off",
      ageBand: "16-64",
      forWhom: "self",
      pregnant: "no",
      cluster: {},
    });
    assert.equal(decision.primarySpecialty, "general_internal_medicine");
    assert.equal(decision.confidence, "low");
  });

  it("does not clear pregnancy onto a routine list", () => {
    const decision = routeComplaint({
      complaint: "Itchy rash on my arms for two weeks",
      ageBand: "16-64",
      forWhom: "self",
      pregnant: "yes",
      cluster: { where: "arms", fever: "no" },
    });
    assert.equal(decision.urgency, "AMBER");
  });
});

describe("drafts and formulary", () => {
  it("labels every phase-1 draft and refuses community brands on red", () => {
    const specialties = [
      "dermatology",
      "cardiology",
      "general_internal_medicine",
      "pediatrics",
      "psychiatry",
    ] as const;
    for (const primarySpecialty of specialties) {
      const routing = {
        primarySpecialty,
        secondary: [],
        urgency: "YELLOW" as const,
        confidence: "high" as const,
        reasoning: "test",
        halted: false,
      };
      const draft = buildDraft(routing, emptyIntake(), { level: "CLEAR", hits: [], pending: [] });
      assert.equal(draftHasRequiredLabel(draft), true);
    }
    const red = formularyFor({
      primarySpecialty: "cardiology",
      secondary: [],
      urgency: "RED",
      confidence: "high",
      reasoning: "halt",
      halted: true,
    });
    assert.equal(red.label, FORMULARY_LABEL);
    assert.equal(red.localBrands.length, 0);
    assert.equal(mergeUrgency("RED", false, true), "RED");
  });
});

describe("patient language", () => {
  it("does not use forbidden certainty or a patient-facing draft", () => {
    const corpus = patientFacingCorpus();
    const banned = [
      /you have a /i,
      /you have an /i,
      /this medicine will cure/i,
      /no need to see a doctor/i,
      /i am your doctor/i,
      /will cure you/i,
      /آپ کو یہ بیماری ہے/,
      /دوا آپ کو ٹھیک کر دے گی/,
      /ڈاکٹر کے پاس جانے کی ضرورت نہیں/,
      /میں آپ کا ڈاکٹر ہوں/,
    ];
    for (const pattern of banned) {
      assert.equal(pattern.test(corpus), false, pattern.source);
    }
  });

  it("shows emergency words, not the differential, after a cardiac rule", () => {
    const intake = emptyIntake();
    intake.complaint = "Chest pain spreading to my left arm with sweating";
    const gate = evaluateGate({
      answers: { chest: true },
      transcript: intake.complaint,
      confirmed: [],
      denied: [],
    });
    const record = {
      id: "md-test",
      createdAt: "2026-10-19T00:00:00.000Z",
      lang: "en" as const,
      jurisdiction: "PK" as const,
      intake,
      gate,
      routing: {
        primarySpecialty: "cardiology" as const,
        secondary: [],
        urgency: "RED" as const,
        confidence: "high" as const,
        reasoning: "halt",
        halted: true,
      },
      draft: buildDraft(
        {
          primarySpecialty: "cardiology",
          secondary: [],
          urgency: "RED",
          confidence: "high",
          reasoning: "halt",
          halted: true,
        },
        intake,
        gate,
      ),
      formulary: formularyFor({
        primarySpecialty: "cardiology",
        secondary: [],
        urgency: "RED",
        confidence: "high",
        reasoning: "halt",
        halted: true,
      }),
      audit: [],
      status: "red" as const,
    } satisfies CaseRecord;
    const view = patientView(record);
    const blob = JSON.stringify(view);
    assert.match(blob, /nearest emergency department/i);
    assert.equal(/acute coronary|DRAFT — REQUIRES|example brand|panadol|rigix/i.test(blob), false);
  });
});

describe("humble suggestions", () => {
  const adult = { ...emptyIntake(), pregnant: "no" as const, cityId: "karachi" };

  it("offers a local antihistamine for a simple adult itch, not a cure", () => {
    const care = careFor(
      {
        primarySpecialty: "dermatology",
        secondary: [],
        urgency: "YELLOW",
        confidence: "high",
        reasoning: "skin",
        halted: false,
      },
      { ...adult, complaint: "Itchy rash on my arms", cluster: { fever: "no", spread: "no", round: "yes" } },
    );
    assert.equal(care.counter.some((item) => item.brands.some((brand) => brand.brand === "Rigix" && brand.company === "AGP")), true);
    assert.equal(care.counter.some((item) => item.brands.some((brand) => brand.brand === "Ronex")), true);
    assert.equal(/will cure|you have /i.test(JSON.stringify(care)), false);
  });

  it("uses UAE shelf names in Dubai and not a Pakistan price", () => {
    const care = careFor(
      {
        primarySpecialty: "dermatology",
        secondary: [],
        urgency: "YELLOW",
        confidence: "high",
        reasoning: "skin",
        halted: false,
      },
      { ...adult, cityId: "dubai", complaint: "Itchy rash on my arms", cluster: { fever: "no", spread: "no", round: "no" } },
    );
    const shelf = JSON.stringify(care.counter);
    assert.match(shelf, /Zyrtec/);
    assert.match(shelf, /AED/);
    assert.equal(/Rigix|PKR/.test(shelf), false);
    assert.match(care.tests.find((item) => item.rank === "most")?.en ?? "", /Most useful next check/);
  });

  it("keeps emergency help practical and off the pharmacy shelf", () => {
    const text = JSON.stringify(emergencyHelp(["Cardiac", "Anaphylaxis"]));
    assert.match(text, /Do not drive/);
    assert.equal(/panadol|rigix|aspirin|antibiotic/i.test(text), false);
  });

  it("does not suggest heart, mental-health, or antibiotic packs to start", () => {
    const heart = careFor(
      {
        primarySpecialty: "cardiology",
        secondary: [],
        urgency: "AMBER",
        confidence: "high",
        reasoning: "heart",
        halted: false,
      },
      { ...adult, complaint: "Chest discomfort on stairs", cluster: { rest: "yes" } },
    );
    const mood = careFor(
      {
        primarySpecialty: "psychiatry",
        secondary: [],
        urgency: "YELLOW",
        confidence: "high",
        reasoning: "mood",
        halted: false,
      },
      { ...adult, complaint: "I cannot sleep" },
    );
    const packs = JSON.stringify({ heart: heart.counter, mood: [...mood.counter, ...mood.clinicianOnly] });
    assert.equal(heart.counter.length, 0);
    assert.equal(mood.counter.length, 0);
    assert.equal(mood.clinicianOnly.length, 0);
    assert.equal(/aspirin|loprin|amoxicillin|augmentin|sertraline|diazepam|mg\/kg|give \d+ ml/i.test(packs), false);
    assert.match(heart.withheldEn, /No heart tablet/);
    assert.match(heart.tests.map((item) => item.en).join(" "), /ECG/);
  });

  it("offers a humble 75 mg aspirin only when chest discomfort is not at rest", () => {
    const stable = careFor(
      {
        primarySpecialty: "cardiology",
        secondary: [],
        urgency: "AMBER",
        confidence: "high",
        reasoning: "effort",
        halted: false,
      },
      { ...adult, cityId: "karachi", complaint: "Chest discomfort on stairs", cluster: { exertion: "yes", rest: "no" } },
    );
    const text = JSON.stringify(stable.counter);
    assert.match(text, /Loprin/);
    assert.match(text, /Highnoon/);
    assert.match(text, /Ascard/);
    assert.match(text, /PKR 107/);
    assert.equal(/Disprin|antibiotic|you have /i.test(text), false);
    assert.match(stable.withheldEn, /not a signed or legal prescription/);
    const dubai = JSON.stringify(
      careFor(
        {
          primarySpecialty: "cardiology",
          secondary: [],
          urgency: "AMBER",
          confidence: "high",
          reasoning: "effort",
          halted: false,
        },
        { ...adult, cityId: "dubai", complaint: "Chest discomfort on stairs", cluster: { exertion: "yes", rest: "no" } },
      ).counter,
    );
    assert.match(dubai, /Jusprin/);
    assert.match(dubai, /AED|Julphar/);
    assert.equal(/Loprin|PKR/.test(dubai), false);
    const gut = JSON.stringify(
      careFor(
        {
          primarySpecialty: "general_internal_medicine",
          secondary: [],
          urgency: "YELLOW",
          confidence: "high",
          reasoning: "gut",
          halted: false,
        },
        { ...adult, cityId: "dubai", complaint: "acidity after meals", cluster: { burn: "yes", blood: "no", loose: "no" } },
      ).counter,
    );
    assert.match(gut, /Risek/);
    assert.match(gut, /Julphar/);
    assert.equal(/Nexium/.test(gut), false);
  });

  it("names metformin only as something not to start", () => {
    const care = careFor(
      {
        primarySpecialty: "general_internal_medicine",
        secondary: [],
        urgency: "AMBER",
        confidence: "high",
        reasoning: "sugar",
        halted: false,
      },
      { ...adult, complaint: "Lots of thirst and sugar" },
    );
    assert.equal(care.counter.some((item) => item.inn === "metformin"), false);
    assert.equal(care.clinicianOnly.some((item) => item.inn === "metformin"), true);
  });

  it("prints no child dose and withholds packs in pregnancy", () => {
    const child = careFor(
      {
        primarySpecialty: "pediatrics",
        secondary: [],
        urgency: "YELLOW",
        confidence: "high",
        reasoning: "child",
        halted: false,
      },
      { ...emptyIntake(), forWhom: "child", ageBand: "1m-5y", pregnant: "na", cityId: "lahore", cluster: { fever: "yes", drinking: "yes" }, severity: 4, complaint: "fever" },
    );
    assert.equal(/\d+\s*mg\/kg|\d+\s*ml/i.test(JSON.stringify(child)), false);
    assert.equal(child.counter.some((item) => item.inn === "paracetamol"), true);
    const pregnant = careFor(
      {
        primarySpecialty: "dermatology",
        secondary: [],
        urgency: "AMBER",
        confidence: "high",
        reasoning: "skin",
        halted: false,
      },
      { ...adult, pregnant: "yes", complaint: "Itchy rash" },
    );
    assert.equal(pregnant.counter.length, 0);
  });

  it("keeps rest chest pain off the routine list and names a cardiac hospital", () => {
    const decision = routeComplaint({
      complaint: "Chest discomfort",
      ageBand: "16-64",
      forWhom: "self",
      pregnant: "no",
      cluster: { rest: "yes" },
    });
    assert.equal(decision.primarySpecialty, "cardiology");
    assert.equal(decision.urgency, "AMBER");
    const places = suggestPlaces("karachi", "cardiology", false, "en");
    assert.equal(places[0]?.name.includes("NICVD"), true);
  });

  it("matches a phone location to the nearest listed city", () => {
    assert.equal(nearestCity(25.2, 55.27).id, "dubai");
    assert.equal(nearestCity(31.52, 74.36).id, "lahore");
    assert.equal(nearestCity(51.5, -0.12).id, "london");
    assert.equal(nearestCity(1.35, 103.82).id, "singapore");
  });

  it("names Singapore specialists and Guardian shelf packs, not a Pakistan price", () => {
    const skin = suggestPlaces("singapore", "dermatology", false, "en");
    const heart = suggestPlaces("singapore", "cardiology", false, "en");
    assert.match(skin[0]?.name ?? "", /National Skin Centre/);
    assert.match(heart[0]?.name ?? "", /National Heart Centre/);
    const care = careFor(
      {
        primarySpecialty: "dermatology",
        secondary: [],
        urgency: "YELLOW",
        confidence: "high",
        reasoning: "skin",
        halted: false,
      },
      { ...adult, cityId: "singapore", complaint: "Itchy rash on my arms", cluster: { fever: "no", spread: "no", round: "no" } },
    );
    const shelf = JSON.stringify(care.counter);
    assert.match(shelf, /Zyrtec/);
    assert.match(shelf, /SGD/);
    assert.equal(/Rigix|PKR|AED/.test(shelf), false);
    const stable = JSON.stringify(
      careFor(
        {
          primarySpecialty: "cardiology",
          secondary: [],
          urgency: "AMBER",
          confidence: "high",
          reasoning: "effort",
          halted: false,
        },
        { ...adult, cityId: "singapore", complaint: "Chest discomfort on stairs", cluster: { exertion: "yes", rest: "no" } },
      ).counter,
    );
    assert.match(stable, /Cardiprin/);
    assert.match(stable, /100 mg/);
    const low = JSON.stringify(emergencyBridge(["Metabolic"], { ...adult, cityId: "singapore" }));
    assert.match(low, /Glucolin/);
    assert.match(low, /995/);
    assert.equal(/you have /i.test(low), false);
  });

  it("offers a humble aspirin bridge only while adult cardiac help is coming", () => {
    const adultBridge = emergencyBridge(["Cardiac"], { ...adult, cityId: "karachi" });
    const text = JSON.stringify(adultBridge);
    assert.match(text, /Disprin/);
    assert.match(text, /already/);
    assert.match(text, /Not a legal prescription/);
    assert.equal(/you have |antibiotic|panadol/i.test(text), false);
    const childBridge = emergencyBridge(["Cardiac"], {
      ...emptyIntake(),
      forWhom: "child",
      ageBand: "1m-5y",
      cityId: "lahore",
    });
    assert.equal(childBridge.length, 0);
    const dubai = JSON.stringify(emergencyBridge(["Cardiac"], { ...adult, cityId: "dubai" }));
    assert.match(dubai, /Disprin/);
    assert.match(dubai, /UAE/);
    assert.equal(/PKR|Rigix/.test(dubai), false);
    const lowSugar = JSON.stringify(emergencyBridge(["Metabolic"], { ...adult, cityId: "karachi" }));
    assert.match(lowSugar, /Glucon-D/);
    assert.match(lowSugar, /Not a legal prescription/);
    assert.equal(/you have /i.test(lowSugar), false);
    const eyed = careFor(
      {
        primarySpecialty: "dermatology",
        secondary: [],
        urgency: "YELLOW",
        confidence: "high",
        reasoning: "skin",
        halted: false,
      },
      { ...adult, complaint: "Itchy rash near my eye", cluster: { fever: "no", spread: "no", round: "yes", eye: "yes" } },
    );
    assert.equal(eyed.counter.some((item) => item.inn === "clotrimazole"), false);
    assert.equal(eyed.counter.some((item) => item.inn === "cetirizine"), true);
  });

  it("names the hospital check a heart specialist would want first", () => {
    const checks = emergencyChecks(["Cardiac"]).map((item) => item.en).join(" ");
    assert.match(checks, /ECG/);
    assert.match(checks, /Do not stop at a laboratory/);
    const notes = inspectionNotes(
      {
        primarySpecialty: "dermatology",
        secondary: [],
        urgency: "YELLOW",
        confidence: "high",
        reasoning: "skin",
        halted: false,
      },
      { ...adult, cluster: { round: "yes", fever: "no", spread: "no" } },
    );
    const blob = JSON.stringify(notes);
    assert.match(blob, /skin scraping/);
    assert.equal(/you have /i.test(blob), false);
  });

  it("offers household measures in Pakistan and the Gulf only when neither hospital nor dispensary is close", () => {
    const routing = {
      primarySpecialty: "dermatology" as const,
      secondary: [],
      urgency: "YELLOW" as const,
      confidence: "high" as const,
      reasoning: "skin",
      halted: false,
    };
    const far = homeRemedies(routing, {
      ...adult,
      cityId: "dubai",
      reachCare: "neither",
      complaint: "Itchy rash on my arms",
      cluster: { fever: "no", spread: "no", round: "no", eye: "no" },
    });
    const text = JSON.stringify(far);
    assert.match(text, /petroleum jelly/);
    assert.match(text, /surma/);
    assert.equal(/Zyrtec|Rigix|AED|will cure|you have /i.test(text), false);
    assert.equal(
      homeRemedies(routing, { ...adult, reachCare: "dispensary", complaint: "Itchy rash" }).length,
      0,
    );
    const eye = JSON.stringify(
      homeRemedies(
        { ...routing, primarySpecialty: "general_internal_medicine" },
        {
          ...adult,
          reachCare: "neither",
          complaint: "eye pain",
          cluster: { vision: "yes", eyePain: "yes" },
        },
      ),
    );
    assert.match(eye, /rose water/);
    assert.match(eye, /surma/);
    const baby = JSON.stringify(
      homeRemedies(
        { ...routing, primarySpecialty: "pediatrics" },
        { ...emptyIntake(), forWhom: "child", ageBand: "0-28d", reachCare: "neither", complaint: "quiet baby" },
      ),
    );
    assert.match(baby, /honey/);
    assert.equal(/teaspoon of sugar/i.test(baby), false);
    const red = homeRemedies(
      { ...routing, urgency: "RED", halted: true },
      { ...adult, reachCare: "neither", complaint: "chest pain" },
    );
    assert.equal(red.length, 0);
  });
});
