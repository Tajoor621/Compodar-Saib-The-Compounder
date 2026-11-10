import { referenceAssistant, referenceNotes } from "./notes.ts";
import type { ReferenceNote } from "./types.ts";

const STOP = new Set([
  "a",
  "an",
  "the",
  "of",
  "to",
  "for",
  "and",
  "or",
  "with",
  "in",
  "on",
  "at",
  "is",
  "are",
  "was",
  "were",
  "be",
  "this",
  "that",
  "it",
  "from",
  "by",
  "about",
  "what",
  "how",
  "when",
  "where",
  "why",
  "does",
  "do",
  "did",
  "can",
  "could",
  "should",
  "would",
  "tell",
  "me",
  "please",
  "local",
  "card",
  "note",
  "notes",
  "say",
  "says",
  "using",
  "use",
  "used",
  "کیا",
  "ہے",
  "کے",
  "کی",
  "کو",
  "میں",
  "سے",
  "اور",
  "یا",
  "پر",
  "لیے",
  "لئے",
]);

export type ScoredNote = { note: ReferenceNote; score: number; nameHit: boolean };

const FILLER = new Set([
  "dose",
  "doses",
  "dosing",
  "dosage",
  "adult",
  "adults",
  "child",
  "children",
  "baby",
  "tablet",
  "tablets",
  "capsule",
  "capsules",
  "medicine",
  "medicines",
  "drug",
  "drugs",
  "line",
  "pack",
  "amount",
  "amounts",
]);

export function normalizeText(value: string): string {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

export function contentTokens(value: string): string[] {
  return normalizeText(value)
    .split(" ")
    .filter((token) => token.length >= 3 && !STOP.has(token));
}

function topicAdjustment(question: string, note: ReferenceNote): number {
  const dosing = isDosingQuestion(question);
  const interaction = isInteractionQuestion(question);
  const child = isChildQuestion(question);
  const pregnancy = /pregnan|breastfeed|breast-?feed|lactation|حمل|دودھ/i.test(question);
  let score = 0;
  if (dosing && note.topic === "dosing") score += 8;
  if (dosing && note.topic !== "dosing") score -= 12;
  if (!dosing && note.topic === "dosing") score -= 8;
  if (interaction && note.topic === "interactions") score += 12;
  if (interaction && note.topic !== "interactions") score -= 6;
  if (child && note.section === "child") score += 10;
  if (child && note.section === "adult") score -= 14;
  if (/\badult\b|بالغ/.test(question) && note.section === "adult") score += 12;
  if (/\badult\b|بالغ/.test(question) && !child && note.section === "child") score -= 12;
  if (pregnancy && note.section === "pregnancy") score += 14;
  if (note.topic === "guidance") score += 2;
  return score;
}

export function isDosingQuestion(question: string): boolean {
  return /(dose|dosing|dosage|how much|how many|milligram|\bmg\b|\bml\b|خوراک|کتنا|کتنی)/i.test(
    question,
  );
}

export function isChildQuestion(question: string): boolean {
  return /(child|baby|infant|neonate|toddler|paediatric|pediatric|بچہ|بچے|شیرخوار|نو مولود)/i.test(
    question,
  );
}

export function isInteractionQuestion(question: string): boolean {
  return /(interact|interaction|combine|combination|\bmix\b|together|\bwith\b|تعامل|کے ساتھ)/i.test(
    question,
  );
}

export function searchReferenceNotes(question: string, assistantId = "all"): ScoredNote[] {
  const assistant = referenceAssistant(assistantId);
  const allowed = assistant.topics ? new Set<string>(assistant.topics) : null;
  const normalized = normalizeText(question);
  const tokens = contentTokens(question).filter((token) => !FILLER.has(token));
  const hits: ScoredNote[] = [];
  for (const note of referenceNotes()) {
    if (allowed && !allowed.has(note.topic)) continue;
    let score = topicAdjustment(question, note);
    let nameHit = false;
    for (const keyword of note.keywords) {
      const key = normalizeText(keyword);
      if (key.length < 3) continue;
      if (normalized.includes(key)) {
        score += key.length >= 5 ? 24 : 14;
        nameHit = true;
      }
    }
    const haystack = new Set(
      contentTokens(
        `${note.passageEn} ${note.passageUr} ${note.titleEn} ${note.keywords.join(" ")}`,
      ).filter((token) => !FILLER.has(token)),
    );
    let overlap = 0;
    for (const token of tokens) {
      if (!haystack.has(token)) continue;
      overlap += 1;
      score += token.length >= 6 ? 5 : 3;
    }
    if (!nameHit && overlap < 2) continue;
    if (score < 12) continue;
    hits.push({ note, score, nameHit });
  }
  const named = hits.filter((hit) => hit.nameHit);
  const pool = named.length > 0 ? named : hits;
  const sectionRank: Record<ReferenceNote["section"], number> = {
    uses: 0,
    mix: 1,
    pregnancy: 2,
    avoid: 3,
    effects: 4,
    child: 5,
    adult: 6,
    storage: 7,
    guidance: 8,
  };
  pool.sort(
    (a, b) => b.score - a.score || sectionRank[a.note.section] - sectionRank[b.note.section],
  );
  return pool;
}
