import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { retrieveClinicalSources } from "../retrieval/index.ts";
import { generateGroundedAnswer } from "./provider.server.ts";
import type { ClinicalAnswer } from "./types.ts";

const inputSchema = z.object({
  question: z.string().trim().min(3).max(1600),
  language: z.enum(["en", "ur"]).default("en"),
});

const insufficient = (language: "en" | "ur", status: ClinicalAnswer["status"]): ClinicalAnswer => ({
  status,
  answer: language === "ur"
    ? "دستیاب قابلِ تصدیق ذرائع اس سوال کا محفوظ جواب دینے کے لیے کافی نہیں ہیں۔ براہِ کرم موجودہ سرکاری لیبل یا متعلقہ رہنما اصول دیکھیں اور لائسنس یافتہ معالج یا فارماسسٹ سے رجوع کریں۔"
    : "The retrieved, verifiable sources are insufficient to answer this safely. Check the current official label or applicable guideline and consult a licensed clinician or pharmacist.",
  sources: [],
});

export const askClinicalReference = createServerFn({ method: "POST" })
  .inputValidator(inputSchema)
  .handler(async ({ data }): Promise<ClinicalAnswer> => {
    const question = data.question;
    // Do not log question text, request bodies, source passages, or identifiers.
    try {
      const sources = await retrieveClinicalSources(question);
      if (!sources.length) return insufficient(data.language, "insufficient_sources");
      const generated = await generateGroundedAnswer(question, sources, data.language);
      if (!generated) return insufficient(data.language, "insufficient_sources");
      return {
        status: "ok",
        answer: generated.text,
        provider: generated.provider,
        sources: sources.map(({ passage: _passage, ...source }) => source),
      };
    } catch (error) {
      const code = error instanceof Error ? error.message : "unknown";
      if (code === "no_provider_key") {
        return { ...insufficient(data.language, "configuration_error"), answer: data.language === "ur"
          ? "AI فراہم کنندہ کی سرور کنفیگریشن موجود نہیں۔ کوئی طبی جواب تیار نہیں کیا گیا۔"
          : "No AI provider key is configured on the server. No clinical answer was generated." };
      }
      return { ...insufficient(data.language, "provider_unavailable"), answer: data.language === "ur"
        ? "AI سروس فی الحال دستیاب نہیں۔ کوئی غیر مصدقہ جواب نہیں دیا گیا۔ براہِ کرم بعد میں کوشش کریں یا سرکاری لیبل دیکھیں۔"
        : "The AI service is currently unavailable. No unverified answer was provided. Try again later or consult the official label." };
    }
  });
