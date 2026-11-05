import type { AgeBand, ForWhom, GateHit, Pregnant, RoutingDecision, SpecialtyId } from "./types.ts";

export type ClusterId =
  | "skin"
  | "heart"
  | "mood"
  | "metabolic"
  | "child"
  | "gut"
  | "urine"
  | "cough"
  | "joint"
  | "eye"
  | "general";

const SKIN = /rash|itch|kharish|khujli|hives|خارش|دانے|دانہ/i;
const HEART = /chest|palpitat|heart|seena|sina\b|سین|دل کا|dil ka/i;
const MOOD = /sad|depress|anxi|low mood|can't sleep|cannot sleep|udasi|neend|ghussa|اداس|پریشان|نیند/i;
const SUGAR = /sugar|diabet|thirst|pyaas|pyas\b|شوگر|پیاس/i;
const URINE = /burning urine|urine burns|dysuria|peshab mein jalan|peshab.*jalan|پیشاب میں جلن|burning when i (pass|pee)|pain (when|while) (passing|i pass) urine/i;
const EYE = /red eye|sore eye|itchy eyes|eye pain|blurry vision|blurred vision|aankh|آنکھ|can't see|cannot see/i;
const COUGH = /cough|khansi|کھانسی|sore throat|runny nose|گلا درد/i;
const GUT = /stomach|acidity|heartburn|loose stool|diarrhoea|diarrhea|pet dard|تیزاب|پیٹ|dast|دست|ulcer pain/i;
const JOINT = /knee|joint pain|back pain|kamar dard|ghutn|جوڑ|کمر|arthritis|gout/i;
const EXERT = /stair|exert|while walking|when i walk|seedhi|سیڑھ/i;
const BP = /\bbp\b|blood pressure|فشار/i;

export function clusterFor(complaint: string, ageBand: AgeBand, forWhom: ForWhom): ClusterId {
  if (forWhom === "child" || ageBand === "0-28d" || ageBand === "1m-5y" || ageBand === "6-15") {
    return "child";
  }
  if (MOOD.test(complaint)) return "mood";
  if (EYE.test(complaint)) return "eye";
  if (SKIN.test(complaint)) return "skin";
  if (HEART.test(complaint)) return "heart";
  if (URINE.test(complaint)) return "urine";
  if (COUGH.test(complaint)) return "cough";
  if (GUT.test(complaint)) return "gut";
  if (JOINT.test(complaint)) return "joint";
  if (SUGAR.test(complaint)) return "metabolic";
  return "general";
}

function atLeast(urgency: RoutingDecision["urgency"], floor: RoutingDecision["urgency"]): RoutingDecision["urgency"] {
  const rank = { BLUE: 0, GREEN: 1, YELLOW: 2, AMBER: 3, RED: 4 };
  return rank[urgency] >= rank[floor] ? urgency : floor;
}

export function routeComplaint(input: {
  complaint: string;
  ageBand: AgeBand;
  forWhom: ForWhom;
  pregnant: Pregnant;
  cluster: Record<string, string>;
}): RoutingDecision {
  const cluster = clusterFor(input.complaint, input.ageBand, input.forWhom);
  let primary: SpecialtyId = "general_internal_medicine";
  let secondary: SpecialtyId[] = [];
  let urgency: RoutingDecision["urgency"] = "YELLOW";
  let confidence: RoutingDecision["confidence"] = "high";
  let reasoning = "No phase-1 specialty pattern was strong. General medicine is the safe default.";

  if (cluster === "child") {
    primary = "pediatrics";
    reasoning = "Age or the story places this with a children's doctor. Danger signs were asked separately and did not fire.";
    if (SKIN.test(input.complaint)) secondary = ["dermatology"];
    if (input.cluster.drinking === "yes" || input.cluster.alert === "no" || input.cluster.fever === "yes") {
      urgency = "AMBER";
      reasoning += " Drinking, alertness, or fever keeps this urgent rather than routine.";
    }
    if (input.cluster.rash === "yes" && input.cluster.fever === "yes") {
      urgency = "AMBER";
      reasoning += " Fever with a rash in a child should be seen the same day.";
    }
  } else if (cluster === "mood") {
    primary = "psychiatry";
    reasoning = "The story is about mood, worry, or sleep. The emergency suicide question did not fire.";
    confidence = MOOD.test(input.complaint) ? "high" : "low";
  } else if (cluster === "heart") {
    primary = "cardiology";
    reasoning = "Chest or heart words without a red-flag combination. This is not a clearance.";
    if (input.cluster.exertion === "yes" || EXERT.test(input.complaint) || input.cluster.rest === "yes") {
      urgency = "AMBER";
      reasoning += " Symptoms on effort, or pain while resting, should be seen within one to two days and sooner if they are happening now.";
    }
  } else if (cluster === "skin") {
    primary = "dermatology";
    reasoning = "A skin complaint without red-flag features. Image diagnosis is not performed.";
    if (input.cluster.fever === "yes" || input.cluster.spread === "yes") {
      urgency = "AMBER";
      secondary = ["general_internal_medicine"];
      reasoning += " Fever or a hot spreading patch raises urgency and adds general medicine.";
    }
  } else if (cluster === "metabolic") {
    primary = "general_internal_medicine";
    urgency = "AMBER";
    reasoning = "Thirst, urine, or sugar words can worsen. Seen soon, not filed as routine. Not a diagnosis of diabetes.";
  } else if (cluster === "gut") {
    primary = "general_internal_medicine";
    reasoning = "Stomach or bowel words. A general doctor would ask about acid, loose stools, and blood before any pack. Not a diagnosis.";
    if (input.cluster.blood === "yes" || input.cluster.weightLoss === "yes") {
      urgency = "AMBER";
      reasoning += " Blood, black stool, or weight loss should be seen within one to two days.";
    }
  } else if (cluster === "urine") {
    primary = "general_internal_medicine";
    reasoning = "Burning urine. The useful next step is a urine check, not an antibiotic from a shop. Not a diagnosis of infection.";
    if (input.cluster.fever === "yes" || input.cluster.flank === "yes") {
      urgency = "AMBER";
      reasoning += " Fever or one-sided back pain should be seen the same day.";
    }
  } else if (cluster === "cough") {
    primary = "general_internal_medicine";
    reasoning = "Cough or throat words without a breathing emergency. No antibiotic is chosen from this story.";
    if (input.cluster.fever === "yes" || input.cluster.longCough === "yes" || input.cluster.coughBlood === "yes") {
      urgency = "AMBER";
      reasoning += " Fever, blood in the phlegm, or a cough lasting more than a week should be listened to by a clinician.";
    }
  } else if (cluster === "joint") {
    primary = "general_internal_medicine";
    reasoning = "Joint or back pain. A clinician should see swelling or fever. Not a diagnosis of arthritis.";
    if (input.cluster.fever === "yes") {
      urgency = "AMBER";
      reasoning += " Fever with a joint should be seen the same day.";
    }
  } else if (cluster === "eye") {
    primary = "general_internal_medicine";
    reasoning = "An eye complaint. Someone who can look at the eye is the right next step. This screen does not name an eye disease.";
    if (input.cluster.vision === "yes" || input.cluster.eyePain === "yes" || input.cluster.light === "yes") {
      urgency = "AMBER";
      reasoning += " Worse vision, eye pain, or light hurting the eye should be seen the same day.";
    }
  } else if (BP.test(input.complaint)) {
    primary = "general_internal_medicine";
    reasoning = "Blood pressure is mentioned without chest-pain red flags. A general doctor should review this.";
  } else {
    confidence = "low";
    reasoning = "The story is undifferentiated. Low routing confidence defaults to general medicine, not a guessed specialty.";
  }

  if (input.pregnant === "yes") {
    urgency = atLeast(urgency, "AMBER");
    reasoning += " Pregnancy was disclosed, so this should not wait on a routine list. Obstetrics is not a phase-1 agent; the holding specialty remains the one above.";
  }

  if (input.cluster.safety === "yes") {
    reasoning += " A separate safety concern was recorded and must be handled by the red-flag gate before this routing is used.";
  }

  return {
    primarySpecialty: primary,
    secondary,
    urgency,
    confidence,
    reasoning,
    halted: false,
  };
}

const DOMAIN_SPECIALTY: Record<string, SpecialtyId> = {
  Cardiac: "cardiology",
  Neurological: "general_internal_medicine",
  Respiratory: "general_internal_medicine",
  Sepsis: "general_internal_medicine",
  Anaphylaxis: "general_internal_medicine",
  Obstetric: "general_internal_medicine",
  Pediatric: "pediatrics",
  Psychiatric: "psychiatry",
  Trauma: "general_internal_medicine",
  Toxicology: "general_internal_medicine",
  Metabolic: "general_internal_medicine",
};

export function emergencyRouting(hits: GateHit[]): RoutingDecision {
  const primary = DOMAIN_SPECIALTY[hits[0]?.domain ?? ""] ?? "general_internal_medicine";
  const ids = hits.map((hit) => hit.ruleId).join(", ");
  return {
    primarySpecialty: primary,
    secondary: [],
    urgency: "RED",
    confidence: "high",
    halted: true,
    reasoning: `Red-flag gate fired (${ids || "unspecified"}). Specialty questioning stopped. Emergency transfer comes before any draft consideration.`,
  };
}
