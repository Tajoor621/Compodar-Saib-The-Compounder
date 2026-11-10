import { detectIdentifiers } from "../safety.ts";
import type { ReferenceMessage, ReferenceQuote, ReferenceStatus } from "./types.ts";

export const REFERENCE_HISTORY_KEY = "mydoctor-reference-history";

const STATUSES = new Set<ReferenceStatus>([
  "cited",
  "not_in_notes",
  "identifiers",
  "harm",
  "emergency",
  "dose_withheld",
]);

export type Bucket = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
};

const memory = new Map<string, string>();

export function memoryBucket(): Bucket {
  const map = new Map<string, string>();
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => map.set(key, value),
    removeItem: (key) => map.delete(key),
  };
}

export function browserBucket(): Bucket {
  if (typeof localStorage === "undefined") {
    return {
      getItem: (key) => memory.get(key) ?? null,
      setItem: (key, value) => memory.set(key, value),
      removeItem: (key) => memory.delete(key),
    };
  }
  return {
    getItem: (key) => {
      try {
        return localStorage.getItem(key);
      } catch {
        return memory.get(key) ?? null;
      }
    },
    setItem: (key, value) => {
      try {
        localStorage.setItem(key, value);
      } catch {
        memory.set(key, value);
      }
    },
    removeItem: (key) => {
      try {
        localStorage.removeItem(key);
      } catch {
        memory.delete(key);
      }
    },
  };
}

function bucketOrDefault(bucket?: Bucket): Bucket {
  return bucket ?? browserBucket();
}

function asQuote(value: unknown): ReferenceQuote | null {
  if (!value || typeof value !== "object") return null;
  const quote = value as Partial<ReferenceQuote>;
  if (
    typeof quote.id !== "string" ||
    typeof quote.title !== "string" ||
    typeof quote.passage !== "string"
  )
    return null;
  if (!quote.id || quote.title.length > 300 || quote.passage.length > 4000) return null;
  const topic = quote.topic;
  if (topic !== "label" && topic !== "dosing" && topic !== "interactions" && topic !== "guidance")
    return null;
  return { id: quote.id, title: quote.title, passage: quote.passage, topic };
}

function asMessage(value: unknown): ReferenceMessage | null {
  if (!value || typeof value !== "object") return null;
  const message = value as Partial<ReferenceMessage>;
  if (message.role !== "user" && message.role !== "assistant") return null;
  if (typeof message.text !== "string" || message.text.length < 1 || message.text.length > 20000)
    return null;
  if (typeof message.createdAt !== "string" || message.createdAt.length > 40) return null;
  if (typeof message.assistantId !== "string" || message.assistantId.length > 40) return null;
  if (message.status !== undefined && !STATUSES.has(message.status)) return null;
  if (detectIdentifiers(message.text)) return null;
  const quotes = message.quotes === undefined ? undefined : message.quotes;
  let parsedQuotes: ReferenceQuote[] | undefined;
  if (quotes !== undefined) {
    if (!Array.isArray(quotes) || quotes.length > 6) return null;
    parsedQuotes = [];
    for (const quote of quotes) {
      const parsed = asQuote(quote);
      if (!parsed) return null;
      if (detectIdentifiers(parsed.passage) || detectIdentifiers(parsed.title)) return null;
      parsedQuotes.push(parsed);
    }
  }
  return {
    id:
      typeof message.id === "string" && message.id.length <= 80
        ? message.id
        : `ref-${message.createdAt}`,
    role: message.role,
    text: message.text,
    createdAt: message.createdAt,
    assistantId: message.assistantId,
    status: message.status,
    quotes: parsedQuotes,
  };
}

export function loadReferenceHistory(bucket?: Bucket): ReferenceMessage[] {
  const raw = bucketOrDefault(bucket).getItem(REFERENCE_HISTORY_KEY);
  if (!raw) return [];
  const parsed = parseReferenceHistory(raw);
  return parsed ?? [];
}

export function saveReferenceHistory(messages: ReferenceMessage[], bucket?: Bucket): void {
  const clean = messages.filter((message) => !detectIdentifiers(message.text)).slice(-100);
  bucketOrDefault(bucket).setItem(REFERENCE_HISTORY_KEY, JSON.stringify(clean));
}

export function clearReferenceHistory(bucket?: Bucket): void {
  bucketOrDefault(bucket).removeItem(REFERENCE_HISTORY_KEY);
}

export function exportReferenceHistory(messages: ReferenceMessage[]): string {
  return JSON.stringify(
    messages.filter((message) => !detectIdentifiers(message.text)).slice(-100),
    null,
    2,
  );
}

export function parseReferenceHistory(raw: string): ReferenceMessage[] | null {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed) || parsed.length > 100) return null;
    const messages: ReferenceMessage[] = [];
    for (const item of parsed) {
      const message = asMessage(item);
      if (!message) return null;
      messages.push(message);
    }
    return messages;
  } catch {
    return null;
  }
}
