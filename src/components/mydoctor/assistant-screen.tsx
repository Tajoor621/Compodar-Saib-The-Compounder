import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useClinic } from "@/lib/mydoctor/store";
import {
  SPECIALTY_ASSISTANTS,
  KNOWLEDGE_TOPICS,
  DISCLAIMER,
  SAFETY_BANNER,
  VERIFY_REMINDER,
  detectIdentifiers,
  loadChatHistory,
  saveChatHistory,
  clearChatHistory,
  hasAcceptedDisclaimer,
  acceptDisclaimer,
  type ChatMessage,
} from "@/lib/mydoctor/assistant";
import { askClinicalReference } from "@/lib/ai/answer.server";


export function AssistantScreen() {
  const lang = useClinic((state) => state.lang);
  const [accepted, setAccepted] = useState(hasAcceptedDisclaimer());
  const [specialty, setSpecialty] = useState(SPECIALTY_ASSISTANTS[0].id);
  const [topic, setTopic] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [warnId, setWarnId] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(loadChatHistory());
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function onAccept() {
    acceptDisclaimer();
    setAccepted(true);
  }

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    if (detectIdentifiers(text)) {
      setWarnId(true);
      return;
    }
    setWarnId(false);
    const userMsg: ChatMessage = { role: "user", content: text, timestamp: Date.now() };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const result = await askClinicalReference({ data: { question: text, language: lang } });
      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: result.answer,
        citations: result.sources.map((source) => source.id),
        sources: result.sources,
        timestamp: Date.now(),
      };
      const updated = [...next, assistantMsg];
      setMessages(updated);
      saveChatHistory(updated);
    } catch {
      const failed: ChatMessage = {
        role: "assistant",
        content: lang === "ur"
          ? "درخواست مکمل نہیں ہو سکی۔ کوئی غیر مصدقہ جواب نہیں دیا گیا۔ براہِ کرم دوبارہ کوشش کریں۔"
          : "The request could not be completed. No unverified answer was provided. Please try again.",
        timestamp: Date.now(),
      };
      const updated = [...next, failed];
      setMessages(updated);
      saveChatHistory(updated);
    } finally {
      setBusy(false);
    }
  }

  function exportHistory() {
    const blob = new Blob([JSON.stringify(messages, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mydoctor-assistant-history.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function importHistory(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as ChatMessage[];
        if (Array.isArray(parsed)) {
          setMessages(parsed);
          saveChatHistory(parsed);
        }
      } catch {
        /* ignore */
      }
    };
    reader.readAsText(file);
  }

  if (!accepted) {
    return (
      <section className="flex flex-col gap-6">
        <h1 className="text-3xl font-semibold">{lang === "ur" ? "اعلان" : "Disclaimer"}</h1>
        <p className="rounded-xl border border-line bg-surface p-4 text-sm leading-relaxed">
          {DISCLAIMER[lang]}
        </p>
        <Button full onClick={onAccept}>
          {lang === "ur" ? "میں سمجھتا/سمجھتی ہوں اور سوال کو عوامی ذرائع میں تلاش کرنے اور AI فراہم کنندہ کو بھیجنے کی رضامندی دیتا/دیتی ہوں" : "I understand and consent to search public references and send submitted questions and retrieved passages to the AI provider"}
        </Button>
      </section>
    );
  }

  const current = SPECIALTY_ASSISTANTS.find((s) => s.id === specialty);

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold tracking-wide text-primary">
          {lang === "ur" ? "AI نالج اسسٹنٹ" : "AI Knowledge Assistant"}
        </p>
        <h1 className="text-3xl font-semibold leading-tight">
          {lang === "ur" ? "ریفرنس اسسٹنٹ" : "Reference Assistant"}
        </h1>
        <p className="text-muted text-sm">{SAFETY_BANNER[lang]}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-semibold">{lang === "ur" ? "اسپیشلٹی" : "Specialty"}</span>
          <select
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            className="min-h-11 rounded-xl border border-line bg-surface px-3"
          >
            {SPECIALTY_ASSISTANTS.map((s) => (
              <option key={s.id} value={s.id}>
                {lang === "ur" ? s.nameUr : s.nameEn}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-semibold">{lang === "ur" ? "موضوع" : "Topic"}</span>
          <select
            value={topic ?? ""}
            onChange={(e) => setTopic(e.target.value || null)}
            className="min-h-11 rounded-xl border border-line bg-surface px-3"
          >
            <option value="">{lang === "ur" ? "کوئی نہیں" : "None"}</option>
            {KNOWLEDGE_TOPICS.map((t) => (
              <option key={t.id} value={t.id}>
                {lang === "ur" ? t.ur : t.en}
              </option>
            ))}
          </select>
        </label>
      </div>

      {current && (
        <p className="text-xs text-muted">
          {lang === "ur" ? "ممکنہ ماخذ کے مجموعے (ابھی بازیافت نہیں ہوئے):" : "Potential source families (not yet retrieved):"} {current.sources.join(", ")}
        </p>
      )}

      <div className="flex max-h-[50vh] flex-col gap-3 overflow-y-auto rounded-xl border border-line bg-surface p-3">
        {messages.length === 0 && (
          <p className="text-sm text-muted">
            {lang === "ur"
              ? "سوال پوچھیں (مثلاً گائیڈ لائن، لیبل، یا تعامل)۔"
              : "Ask a reference question (guideline, label, interaction…)."}
          </p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`rounded-lg px-3 py-2 text-sm ${
              m.role === "user" ? "ml-8 bg-primary/10" : "mr-8 bg-bg"
            }`}
          >
            <p className="whitespace-pre-wrap">{m.content}</p>
            {m.citations && m.citations.length > 0 && (
              <div className="mt-2 flex flex-col gap-1 text-xs text-muted">
                <p>{lang === "ur" ? "حوالہ شناخت:" : "Source IDs:"} {m.citations.join("; ")}</p>
                {m.sources?.map((source) => (
                  <a key={source.id} href={source.url} target="_blank" rel="noreferrer" className="underline underline-offset-2">
                    {source.id} · {source.title} ({source.publisher}) · {source.retrievedAt.slice(0, 10)}
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {warnId && (
        <p className="rounded-lg border border-accent bg-accent/10 p-3 text-sm text-accent">
          {lang === "ur"
            ? "شناختی معلومات لگ رہی ہیں۔ براہ کرم ہٹا کر دوبارہ کوشش کریں۔"
            : "Possible identifiers detected. Please remove them and try again."}
        </p>
      )}

      <div className="flex flex-col gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={lang === "ur" ? "سوال لکھیں…" : "Type a question…"}
          rows={3}
          className="min-h-20 rounded-xl border border-line bg-surface px-4 py-3 text-base outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void send();
            }
          }}
        />
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => void send()} disabled={busy || !input.trim()}>
            {busy ? (lang === "ur" ? "ذرائع کی جانچ…" : "Checking sources…") : lang === "ur" ? "بھیجیں" : "Send"}
          </Button>
          <Button variant="outline" onClick={() => { clearChatHistory(); setMessages([]); }}>
            {lang === "ur" ? "صاف کریں" : "Clear"}
          </Button>
          <Button variant="outline" onClick={exportHistory}>
            {lang === "ur" ? "ایکسپورٹ" : "Export"}
          </Button>
          <label className="inline-flex min-h-11 cursor-pointer items-center rounded-xl border border-line bg-surface px-4 text-sm font-semibold">
            {lang === "ur" ? "امپورٹ" : "Import"}
            <input
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) importHistory(f);
              }}
            />
          </label>
        </div>
      </div>

      <p className="text-xs text-muted">{VERIFY_REMINDER[lang]}</p>
    </section>
  );
}
