export type ClinicalSource = {
  id: string;
  title: string;
  url: string;
  publisher: string;
  retrievedAt: string;
  kind: "pubmed" | "openfda" | "dailymed";
  passage: string;
};

export type ClinicalAnswer = {
  status: "ok" | "insufficient_sources" | "provider_unavailable" | "configuration_error";
  answer: string;
  sources: Omit<ClinicalSource, "passage">[];
  provider?: string;
};

export type ModelProvider = "groq" | "gemini" | "openrouter";
