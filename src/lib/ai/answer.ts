import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { retrieveClinicalSources } from "../retrieval/index.ts";
import { generateGroundedAnswer } from "./provider.server.ts";
import type { ClinicalAnswer } from "./types.ts";
import { detectIdentifiers, neutralizePromptInjection } from "../mydoctor/safety.ts";

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
  .validator((input) => inputSchema.parse(input))
  .handler(async ({ data }): Promise<ClinicalAnswer> => {
    const question = data.question;
    if (detectIdentifiers(question)) {
      return {
        status: "insufficient_sources",
        answer: data.language === "ur"
          ? "شناختی یا ذاتی معلومات کی نشاندہی ہوئی ہے۔ براہِ کرم نام، فون، تاریخ پیدائش، ای میل، پتہ یا شناختی نمبر حذف کریں۔ سوال کسی AI فراہم کنندہ کو نہیں بھیجا گیا۔"
          : "Possible personal identifiers were detected. Remove names, phone numbers, dates of birth, email addresses, addresses, or ID numbers. The question was not sent to an AI provider.",
        sources: [],
      };
    }
    const safeQuestion = neutralizePromptInjection(question);
    // Never log question text, request bodies, source passages, or identifiers.
    try {
      const sources = await retrieveClinicalSources(safeQuestion);
      if (!sources.length) return insufficient(data.language, "insufficient_sources");
      const generated = await generateGroundedAnswer(safeQuestion, sources, data.language);
      if (!generated) return insufficient(data.language, "insufficient_sources");
      return {
        status: "ok",
        answer: generated.text,
        provider: generated.provider,
        sources: sources.map(({ passage: _passage, ...source }) => source),
      };
    } catch (error) {
      const code = error instanceof Error ? error.message : "unknown";
      if (code === "citation_validation_failed") return insufficient(data.language, "insufficient_sources");
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
