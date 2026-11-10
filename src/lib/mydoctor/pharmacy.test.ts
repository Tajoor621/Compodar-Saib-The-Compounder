import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { LIBRARY, lookupPharmacy, resolveMedicine, searchMedicines } from "./pharmacy.ts";
import { chemistFor, seenForm } from "./forms.ts";

describe("offline pharmacist library", () => {
  it("reads a Pakistan or Gulf brand back to the generic, and does not invent a missing name", () => {
    const panadol = searchMedicines("Panadol");
    assert.equal(panadol[0]?.id, "paracetamol");
    assert.match(panadol[0]?.brands.map((brand) => brand.brand).join(" ") ?? "", /Adol/);
    const risek = searchMedicines("رائزک");
    assert.equal(risek[0]?.id, "omeprazole");
    assert.equal(searchMedicines("Risek").some((row) => row.id === "pantoprazole"), false);
    const augmentin = searchMedicines("Augmentin");
    assert.equal(augmentin[0]?.id, "coamoxiclav");
    assert.equal(searchMedicines("not-a-real-pack-xyz").length, 0);
    assert.ok(LIBRARY.length >= 70);
    assert.equal(searchMedicines("Nexium")[0]?.id, "esomeprazole");
    assert.equal(searchMedicines("Risek")[0]?.id, "omeprazole");
    assert.equal(searchMedicines("Gravinate")[0]?.id, "dimenhydrinate");
    assert.match(searchMedicines("Betnovate")[0]?.usedEn ?? "", /fairness/);
    assert.match(searchMedicines("Cytotec")[0]?.usedEn ?? "", /does not explain/);
    assert.match(searchMedicines("methotrexate")[0]?.usedEn ?? "", /once a week/);
  });

  it("reads any typed medicine or formula instead of an empty box", () => {
    const lin = resolveMedicine("linagliptin 5 mg");
    assert.equal(lin.named.length, 0);
    assert.match(lin.reading?.group ?? "", /DPP-4/);
    assert.match(lin.reading?.adultEn ?? "", /5 mg/);
    const both = resolveMedicine("Panadol + Brufen");
    assert.deepEqual(both.named.map((row) => row.id).sort(), ["ibuprofen", "paracetamol"]);
    assert.equal(both.reading, null);
    const ampicillin = resolveMedicine("ampicillin 500 mg capsule");
    assert.equal(ampicillin.named.some((row) => row.id === "amoxicillin"), false);
    assert.match(ampicillin.reading?.group ?? "", /Penicillin/);
    const typo = resolveMedicine("panadole");
    assert.equal(typo.named[0]?.id, "paracetamol");
    const blob = JSON.stringify(lin.reading);
    assert.equal(/not listed|not in this offline library|will cure|you have a /i.test(blob), false);
    assert.match(resolveMedicine("osimertinib").reading?.group ?? "", /Kinase/);
    assert.match(resolveMedicine("baricitinib").reading?.group ?? "", /JAK/);
    assert.match(resolveMedicine("tozinameran").reading?.group ?? "", /mRNA/);
    assert.match(resolveMedicine("inclisiran").reading?.group ?? "", /siRNA/);
    assert.match(resolveMedicine("nusinersen").reading?.group ?? "", /Antisense/);
    assert.match(resolveMedicine("etanercept").reading?.group ?? "", /fusion/i);
    assert.match(resolveMedicine("darunavir").reading?.group ?? "", /protease/i);
    assert.match(resolveMedicine("dolutegravir").reading?.group ?? "", /integrase/i);
    assert.match(resolveMedicine("sofosbuvir").reading?.group ?? "", /NS5B/);
    assert.match(resolveMedicine("doxorubicin").reading?.group ?? "", /Anthracycline/);
    assert.match(resolveMedicine("qwxzylon 10 mg").reading?.usedEn ?? "", /Read this box/);
    assert.equal(resolveMedicine("qwxzylon 10 mg").named.length, 0);
    const seloxx = resolveMedicine("what (Seloxx )is using for");
    assert.equal(seloxx.named[0]?.id, "celecoxib");
    assert.match(seloxx.named[0]?.usedEn ?? "", /Pain and swelling/);
    assert.match(seloxx.named[0]?.forEn ?? "", /Osteoarthritis/);
    assert.match(seloxx.named[0]?.forEn ?? "", /rheumatoid arthritis/);
    assert.match(seloxx.named[0]?.adultEn ?? "", /200 mg once a day/);
    assert.match(seloxx.named[0]?.childEn ?? "", /juvenile idiopathic arthritis/);
    assert.equal(/will cure|you have a /i.test(JSON.stringify(seloxx.named[0])), false);
    const drop = resolveMedicine("soloxx 5ml drop");
    assert.equal(drop.named[0]?.id, "celecoxib");
    const card = chemistFor(drop.named[0]!, "soloxx 5ml drop");
    assert.equal(seenForm("soloxx 5ml drop").form, "drop-unspecified");
    assert.match(card.knownEn, /capsule/);
    assert.doesNotMatch(card.knownEn, /syrup|eye drops/);
    assert.match(card.panels[0]?.bodyEn ?? "", /eye, ear, nose, or mouth/);
    assert.match(card.panels[0]?.bodyEn ?? "", /size of the bottle/);
    assert.equal(seenForm("Otrivin nasal spray").form, "nasal");
    assert.equal(seenForm("chloramphenicol eye drops").form, "eye");
    assert.equal(seenForm("ear drops 5 ml").form, "ear");
    const cipro = resolveMedicine("Novidat eye drops");
    assert.equal(cipro.named[0]?.id, "ciprofloxacin");
    assert.match(chemistFor(cipro.named[0]!, "Novidat eye drops 5ml").panels[0]?.bodyEn ?? "", /lower lid/);
  });

  it("looks up a name even when a form word comes first, and refuses an unknown name", () => {
    const adrenaline = lookupPharmacy("injection adrenaline");
    assert.equal(adrenaline.kind, "named");
    assert.equal(adrenaline.matches[0]?.row.id, "adrenaline");
    const syringe = lookupPharmacy("syringe");
    assert.equal(syringe.kind, "miss");
    assert.equal(syringe.reading, null);
    const unknown = lookupPharmacy("xyzunknown medicine");
    assert.equal(unknown.kind, "miss");
    const statins = lookupPharmacy("statin");
    assert.equal(statins.kind, "named");
    assert.ok(statins.matches.length >= 2);
    const named = lookupPharmacy("Panadol tablet");
    assert.equal(named.matches[0]?.row.id, "paracetamol");
    const family = lookupPharmacy("linagliptin 5 mg");
    assert.equal(family.kind, "class");
    assert.match(family.reading?.group ?? "", /DPP-4/);
  });

  it("keeps a professional card complete and does not claim a cure", () => {
    for (const row of LIBRARY) {
      assert.ok(row.atc.length > 3, row.id);
      assert.ok(row.brands.length > 0, row.id);
      assert.ok(row.adultEn.length > 20, row.id);
      assert.ok(row.avoidUr.length > 5, row.id);
    }
    const blob = JSON.stringify(LIBRARY);
    assert.equal(/will cure|you have a |you have an /i.test(blob), false);
    assert.match(blob, /Not a shop start|does not start|This card does not start|not a shop/i);
  });
});
