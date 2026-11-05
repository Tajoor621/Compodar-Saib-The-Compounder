import type { Monograph } from "./pharmacy.ts";

export type PackForm =
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
  | "drop-unspecified";

export type FormPanel = {
  id: PackForm;
  titleEn: string;
  titleUr: string;
  bodyEn: string;
  bodyUr: string;
};

export type ChemistCard = {
  knownEn: string;
  knownUr: string;
  panels: FormPanel[];
};

const LABEL: Record<PackForm, { en: string; ur: string }> = {
  tablet: { en: "tablet", ur: "گولی" },
  capsule: { en: "capsule", ur: "کیپسول" },
  syrup: { en: "syrup", ur: "شربت" },
  "oral-drops": { en: "oral drops", ur: "منہ کے قطرے" },
  eye: { en: "eye drops", ur: "آنکھ کے قطرے" },
  ear: { en: "ear drops", ur: "کان کے قطرے" },
  nasal: { en: "nasal drops or spray", ur: "ناک کے قطرے یا سپرے" },
  powder: { en: "powder or sachet", ur: "پاؤڈر یا ساشے" },
  cream: { en: "cream or ointment", ur: "کریم یا مرہم" },
  inhaler: { en: "inhaler", ur: "انہیلر" },
  injection: { en: "injection", ur: "انجکشن" },
  "drop-unspecified": { en: "drops, site not stated", ur: "قطرے، جگہ نہیں بتائی" },
};

const KNOWN: Record<string, PackForm[]> = {
  paracetamol: ["tablet", "syrup", "oral-drops"],
  ibuprofen: ["tablet", "syrup"],
  cetirizine: ["tablet", "syrup"],
  loratadine: ["tablet", "syrup"],
  amoxicillin: ["capsule", "syrup"],
  coamoxiclav: ["tablet", "syrup"],
  azithromycin: ["tablet", "syrup"],
  cefixime: ["capsule", "syrup"],
  ciprofloxacin: ["tablet", "eye", "ear"],
  metronidazole: ["tablet", "syrup"],
  domperidone: ["tablet", "syrup"],
  ondansetron: ["tablet", "syrup"],
  salbutamol: ["inhaler", "syrup"],
  xylometazoline: ["nasal"],
  tears: ["eye"],
  diclofenac: ["tablet", "cream"],
  clotrimazole: ["cream"],
  betamethasone: ["cream"],
  insulin: ["injection"],
  ors: ["powder"],
  celecoxib: ["capsule"],
  prednisolone: ["tablet"],
};

export function seenForm(query: string): { form: PackForm | null; volume: string | null } {
  const volume = query.match(/(\d+(?:\.\d+)?)\s*ml\b/i)?.[0].replace(/\s+/g, " ") ?? null;
  const q = query.toLowerCase();
  if (/eye|ophthalmic|آنکھ/.test(q)) return { form: "eye", volume };
  if (/\bear\b|otic|کان/.test(q)) return { form: "ear", volume };
  if (/nasal|nostril|\bnose\b|ناک|سپرے|spray/.test(q) && !/inhaler/.test(q)) return { form: "nasal", volume };
  if (/inhaler|puffer|nebule|انہیلر/.test(q)) return { form: "inhaler", volume };
  if (/cream|ointment|gel\b|کریم|مرہم/.test(q)) return { form: "cream", volume };
  if (/injection|\bpen\b|vial|انجکشن/.test(q)) return { form: "injection", volume };
  if (/oral drop|paediatric drop|infant drop|منہ کے قطر/.test(q)) return { form: "oral-drops", volume };
  if (/syrup|suspension|شربت/.test(q)) return { form: "syrup", volume };
  if (/powder|sachet|granule|پاؤڈر/.test(q)) return { form: "powder", volume };
  if (/capsule|کیپسول/.test(q)) return { form: "capsule", volume };
  if (/tablet|\btab\b|گولی/.test(q)) return { form: "tablet", volume };
  if (/\bdrops?\b|قطره|قطرہ|قطرات/.test(q)) return { form: "drop-unspecified", volume };
  return { form: null, volume };
}

function fromWording(form: string): PackForm[] {
  const q = form.toLowerCase();
  const found = new Set<PackForm>();
  if (/eye/.test(q)) found.add("eye");
  if (/ear/.test(q)) found.add("ear");
  if (/nasal|nose/.test(q)) found.add("nasal");
  if (/inhaler/.test(q)) found.add("inhaler");
  if (/cream|ointment|gel/.test(q)) found.add("cream");
  if (/injection|pen|vial/.test(q)) found.add("injection");
  if (/sachet|powder|granule/.test(q)) found.add("powder");
  if (/syrup|suspension|liquid/.test(q)) found.add("syrup");
  if (/capsule/.test(q)) found.add("capsule");
  if (/tablet/.test(q)) found.add("tablet");
  return [...found];
}

export function knownForms(row: Monograph): PackForm[] {
  const extra = KNOWN[row.id] ?? [];
  const merged = new Set<PackForm>([...extra, ...fromWording(row.form)]);
  return merged.size > 0 ? [...merged] : ["tablet"];
}

function volumeLine(volume: string | null): { en: string; ur: string } {
  if (!volume) return { en: "", ur: "" };
  return {
    en: ` ${volume} printed on a bottle is the size of the bottle unless the label says each dose is ${volume}.`,
    ur: ` بوتل پر لکھا ${volume} بوتل کا ناپ ہے، جب تک لیبل ہر خوراک ${volume} نہ کہے۔`,
  };
}

function howTo(form: PackForm, row: Monograph, volume: string | null, matched: boolean): { en: string; ur: string } {
  const vol = volumeLine(volume);
  const name = row.inn;
  if (!matched) {
    const known = knownForms(row).map((item) => LABEL[item].en).join(", ");
    const knownUr = knownForms(row).map((item) => LABEL[item].ur).join("، ");
    if (form === "drop-unspecified") {
      return {
        en: `${name} is supplied as ${known}. A drop bottle is not that pack until the label says eye, ear, nose, or mouth. Those four are not substitutes for each other, and none of them uses the swallow dose.${vol.en} Read the ingredient line. If it is not ${name}, this card is the wrong medicine.`,
        ur: `${name} ${knownUr} کے طور پر ملتا ہے۔ قطرے کی بوتل وہ پیک نہیں جب تک لیبل آنکھ، کان، ناک، یا منہ نہ کہے۔ یہ چار ایک دوسرے کے بدل نہیں، اور کسی میں نگلنے والی خوراک نہیں چلتی۔${vol.ur} جزو کی سطر پڑھیں۔ اگر ${name} نہیں، یہ کارڈ غلط دوا ہے۔`,
      };
    }
    return {
      en: `${name} is not supplied as ${LABEL[form].en}. The packs a pharmacist knows are: ${known}. Do not move the dose from one of those into a ${LABEL[form].en}.${vol.en}`,
      ur: `${name} ${LABEL[form].ur} کے طور پر نہیں ملتا۔ فارماسسٹ جن پیکوں کو جانتا ہے: ${knownUr}۔ ان میں سے کسی کی خوراک ${LABEL[form].ur} میں منتقل نہ کریں۔${vol.ur}`,
    };
  }
  if (form === "eye") {
    return {
      en: `Eye drops of ${name} only. Wash your hands. Do not touch the tip. One drop in the lower lid unless this bottle says two. Press the inner corner for a minute. Wait five minutes before a second eye drop. Do not put this bottle in the ear, nose, or mouth.${vol.en}`,
      ur: `صرف ${name} کے آنکھ کے قطرے۔ ہاتھ دھوئیں۔ نوک نہ لگائیں۔ نچلی پلک میں ایک قطرہ، جب تک یہ بوتل دو نہ کہے۔ اندرونی کونے کو ایک منٹ دبائیں۔ دوسرا آنکھ کا قطرہ پانچ منٹ بعد۔ یہ بوتل کان، ناک، یا منہ میں نہ ڈالیں۔${vol.ur}`,
    };
  }
  if (form === "ear") {
    return {
      en: `Ear drops of ${name} only. Lie on the side. Do not push the tip into the ear canal. Do not use them if the leaflet says to stop when the eardrum may be broken. Do not put ear drops in the eye.${vol.en}`,
      ur: `صرف ${name} کے کان کے قطرے۔ کروٹ لیٹیں۔ نوک کان کے سوراخ میں نہ دھکیلیں۔ اگر لیفلیٹ ٹوٹے پردے پر روکے تو استعمال نہ کریں۔ کان کے قطرے آنکھ میں نہ ڈالیں۔${vol.ur}`,
    };
  }
  if (form === "nasal") {
    return {
      en: `Nose only. ${row.form}. Blow the nose first. An adult strength and a child strength are different bottles. A decongestant spray used past the days on the pack makes the blockage worse. Do not put it in the eye or swallow the bottle.${vol.en} ${row.adultEn}`,
      ur: `صرف ناک۔ ${row.form}۔ پہلے ناک صاف کریں۔ بالغ کی طاقت اور بچے کی طاقت الگ بوتلیں ہیں۔ پیک کے دنوں سے زیادہ ناک کھولنے والا سپرے بندش بڑھا دیتا ہے۔ آنکھ میں نہ ڈالیں اور بوتل نہ نگلیں۔${vol.ur} ${row.adultUr}`,
    };
  }
  if (form === "oral-drops") {
    return {
      en: `Oral drops of ${name} are a different strength from the syrup. Read milligrams per ml on this bottle. Measure with its own dropper. Do not give a syrup's spoonful of the drops, and do not use an eye bottle by mouth.${vol.en}`,
      ur: `${name} کے منہ کے قطرے شربت سے الگ طاقت ہیں۔ اس بوتل پر ملی گرام فی ملی لیٹر پڑھیں۔ اسی کے ڈراپر سے ناپیں۔ شربت کا چمچ قطروں کا نہ دیں، اور آنکھ کی بوتل منہ سے استعمال نہ کریں۔${vol.ur}`,
    };
  }
  if (form === "syrup") {
    return {
      en: `Syrup or suspension of ${name}. Shake if the label says so. Measure with the syringe in this pack. A kitchen spoon is not a dose.${vol.en} ${row.childEn}`,
      ur: `${name} کا شربت یا سسپنشن۔ اگر لیبل کہے تو ہلائیں۔ اسی پیک کی سرنج سے ناپیں۔ باورچی خانے کا چمچ خوراک نہیں۔${vol.ur} ${row.childUr}`,
    };
  }
  if (form === "inhaler") {
    return {
      en: `Inhaler of ${name}. ${row.form}. A puff is not a tablet and not a nasal spray. ${row.adultEn}`,
      ur: `${name} کا انہیلر۔ ${row.form}۔ ایک پف گولی نہیں اور ناک کا سپرے نہیں۔ ${row.adultUr}`,
    };
  }
  if (form === "cream") {
    return {
      en: `Cream or ointment of ${name}. ${row.form}. A thin layer on the area named on the pack. Do not use it in the eye, and do not swallow it. ${row.adultEn}`,
      ur: `${name} کی کریم یا مرہم۔ ${row.form}۔ پیک کے حصے پر پتلی تہہ۔ آنکھ میں نہ لگائیں، اور نہ نگلیں۔ ${row.adultUr}`,
    };
  }
  if (form === "powder") {
    return {
      en: `Powder or sachet of ${name}. Mix it in the water volume printed on this sachet. Do not swallow the dry powder. ${row.adultEn}`,
      ur: `${name} کا پاؤڈر یا ساشے۔ اس ساشے پر لکھے پانی میں ملائیں۔ خشک پاؤڈر نہ نگلیں۔ ${row.adultUr}`,
    };
  }
  if (form === "injection") {
    return {
      en: `Injection of ${name}. ${row.form}. A pen or vial is not a tablet dose. Do not share it. ${row.adultEn}`,
      ur: `${name} کا انجکشن۔ ${row.form}۔ پین یا شیشی گولی کی خوراک نہیں۔ شیئر نہ کریں۔ ${row.adultUr}`,
    };
  }
  return {
    en: `${LABEL[form].en[0].toUpperCase()}${LABEL[form].en.slice(1)} of ${name}. ${row.form}. Swallow it whole with water unless this pack says to chew or open it. ${row.adultEn}`,
    ur: `${name} کی ${LABEL[form].ur}۔ ${row.form}۔ پانی کے ساتھ پوری نگلیں، جب تک یہ پیک چبانے یا کھولنے کو نہ کہے۔ ${row.adultUr}`,
  };
}

export function chemistFor(row: Monograph, query: string): ChemistCard {
  const known = knownForms(row);
  const seen = seenForm(query);
  const knownEn = `Packs a pharmacist stocks for this name: ${known.map((item) => LABEL[item].en).join(", ")}.`;
  const knownUr = `اس نام کے پیک جو فارماسسٹ رکھتا ہے: ${known.map((item) => LABEL[item].ur).join("، ")}۔`;
  if (!seen.form) {
    return {
      knownEn,
      knownUr,
      panels: known.map((form) => ({
        id: form,
        titleEn: LABEL[form].en,
        titleUr: LABEL[form].ur,
        ...split(howTo(form, row, null, true)),
      })),
    };
  }
  const matched = seen.form !== "drop-unspecified" && known.includes(seen.form);
  const focus = howTo(seen.form, row, seen.volume, matched);
  const rest = known
    .filter((form) => form !== seen.form)
    .map((form) => ({
      id: form,
      titleEn: `Also supplied: ${LABEL[form].en}`,
      titleUr: `یہ بھی ملتا ہے: ${LABEL[form].ur}`,
      ...split(howTo(form, row, null, true)),
    }));
  return {
    knownEn,
    knownUr,
    panels: [
      {
        id: seen.form,
        titleEn: LABEL[seen.form].en,
        titleUr: LABEL[seen.form].ur,
        ...split(focus),
      },
      ...rest,
    ],
  };
}

function split(text: { en: string; ur: string }): { bodyEn: string; bodyUr: string } {
  return { bodyEn: text.en, bodyUr: text.ur };
}
