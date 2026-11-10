import { createServerFn } from "@tanstack/react-start";
import { queryFromSight, type PackSight } from "./read-pack-query.ts";

export type { PackSight } from "./read-pack-query.ts";
export { queryFromSight };

const FORMS = new Set(["tablet", "capsule", "syrup", "oral-drops", "eye", "ear", "nasal", "powder", "cream", "inhaler", "injection", "unknown"]);

export const readPackPhoto = createServerFn({ method: "POST" })
  .validator((input: { image: string; consent: boolean }) => {
    if (input.consent !== true) throw new Error("Explicit photo processing consent is required");
    if (!input || typeof input.image !== "string" || !input.image.startsWith("data:image/")) {
      throw new Error("Photo must be an image");
    }
    if (input.image.length > 1_800_000) throw new Error("Photo is too large");
    return { image: input.image, consent: true as const };
  })
  .handler(async ({ data }): Promise<PackSight | { ok: false; error: string }> => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { ok: false, error: "The pack reader is not available. Type the name printed on the box." };
    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "grok-4.5",
        max_tokens: 220,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: 'Read this image only if it is clearly medicine packaging. If it is a patient scan, radiology image, body photo, prescription, patient record, or any document showing a patient identifier, refuse by returning empty strings and form "unknown". Never interpret or describe clinical images. Reply with JSON only: {"name":"","strength":"","form":"tablet|capsule|syrup|oral-drops|eye|ear|nasal|powder|cream|inhaler|injection|unknown","volume":"","seen":""}. form is eye, ear, or nasal only when those words are printed. oral-drops means drops to swallow. volume is the printed bottle size such as 5 ml, not a guessed dose. Copy only words you can read. If unreadable, leave strings empty. Do not guess from colour or bottle shape.',
              },
              { type: "image_url", image_url: { url: data.image } },
            ],
          },
        ],
      }),
    });
    if (!res.ok) return { ok: false, error: "The pack photo could not be read. Type the name on the box." };
    const body = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const text = body.choices?.[0]?.message?.content ?? "";
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return { ok: false, error: "The pack photo could not be read. Type the name on the box." };
    try {
      const raw = JSON.parse(match[0]) as { name?: unknown; strength?: unknown; form?: unknown; volume?: unknown; seen?: unknown };
      const form = typeof raw.form === "string" && FORMS.has(raw.form) ? (raw.form as PackSight["form"]) : "unknown";
      const clip = (value: unknown) => (typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, 80) : "");
      return { ok: true, name: clip(raw.name), strength: clip(raw.strength), form, volume: clip(raw.volume), seen: clip(raw.seen) };
    } catch {
      return { ok: false, error: "The pack photo could not be read. Type the name on the box." };
    }
  });
