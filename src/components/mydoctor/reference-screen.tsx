import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  acceptReferenceDisclaimer,
  answerReference,
  clearReferenceHistory,
  exportReferenceHistory,
  hasReferenceAccess,
  loadReferenceHistory,
  parseReferenceHistory,
  REFERENCE_ASSISTANTS,
  REFERENCE_DISCLAIMER,
  REFERENCE_DISCLAIMER_ACCEPT,
  REFERENCE_IDENTIFIER_BANNER,
  REFERENCE_VERIFY,
  saveReferenceHistory,
  type ReferenceMessage,
} from "@/lib/mydoctor/reference";
import { detectIdentifiers } from "@/lib/mydoctor/safety";
import { useClinic } from "@/lib/mydoctor/store";

const EXAMPLES = [
  { en: "Paracetamol with warfarin", ur: "پیراسیٹامول اور وارفرین" },
  { en: "Adult paracetamol dose", ur: "بالغ پیراسیٹامول کی خوراک" },
  { en: "Ibuprofen in late pregnancy", ur: "حمل کے آخر میں آئبوپروفین" },
  { en: "Chest pain with sweating and breathlessness", ur: "سینے میں درد، پسینہ، اور سانس پھولنا" },
];

function newId(): string {
  return `ref-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function ReferenceScreen() {
  const lang = useClinic((state) => state.lang);
  const [ready, setReady] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [assistantId, setAssistantId] = useState(REFERENCE_ASSISTANTS[0].id);
  const [messages, setMessages] = useState<ReferenceMessage[]>([]);
  const [input, setInput] = useState("");
  const [importError, setImportError] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const ur = lang === "ur";
  const identifierHit = input.trim().length > 0 && detectIdentifiers(input);

  useEffect(() => {
    setAccepted(hasReferenceAccess());
    setMessages(loadReferenceHistory());
    setReady(true);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function persist(next: ReferenceMessage[]) {
    setMessages(next);
    saveReferenceHistory(next);
  }

  function ask(text: string) {
    const question = text.trim();
    if (question.length < 2) return;
    if (detectIdentifiers(question)) return;
    setImportError(false);
    const answer = answerReference({ question, assistantId, lang });
    const now = new Date().toISOString();
    persist([
      ...messages,
      { id: newId(), role: "user", text: question, createdAt: now, assistantId },
      {
        id: newId(),
        role: "assistant",
        text: answer.text,
        createdAt: new Date().toISOString(),
        assistantId,
        status: answer.status,
        quotes: answer.quotes,
      },
    ]);
    setInput("");
  }

  function exportHistory() {
    const blob = new Blob([exportReferenceHistory(messages)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "compodar-saib-reference-history.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  function importHistory(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const parsed = parseReferenceHistory(String(reader.result ?? ""));
      if (!parsed) {
        setImportError(true);
        return;
      }
      setImportError(false);
      persist(parsed);
    };
    reader.readAsText(file);
  }

  if (!ready) {
    return (
      <section className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold">{ur ? "حوالہ ڈیسک" : "Reference desk"}</h1>
      </section>
    );
  }

  if (!accepted) {
    return (
      <section className="flex flex-col gap-6">
        <h1 className="text-3xl font-semibold">{ur ? "شروع سے پہلے" : "Before we begin"}</h1>
        <p className="rounded-xl border border-line bg-surface p-4 text-sm leading-relaxed">
          {REFERENCE_DISCLAIMER[lang]}
        </p>
        <p className="rounded-xl border border-accent/40 bg-accent/10 p-3 text-sm">
          {REFERENCE_IDENTIFIER_BANNER[lang]}
        </p>
        <Button
          full
          onClick={() => {
            acceptReferenceDisclaimer();
            setAccepted(true);
          }}
        >
          {REFERENCE_DISCLAIMER_ACCEPT[lang]}
        </Button>
      </section>
    );
  }

  const current =
    REFERENCE_ASSISTANTS.find((item) => item.id === assistantId) ?? REFERENCE_ASSISTANTS[0];

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold leading-tight">
          {ur ? "حوالہ ڈیسک" : "Reference desk"}
        </h1>
        <p className="text-sm text-muted">
          {ur
            ? "یہ ڈیسک اس ایپ کے نوٹس نقل کرتا ہے۔ اندازہ نہیں لگاتا۔ ہاتھ والا پیک کارڈ پر فوقیت رکھتا ہے۔"
            : "This desk quotes the notes in this app. It does not guess. The pack in hand overrides the card."}
        </p>
      </div>

      <p className="rounded-xl border border-accent/40 bg-accent/10 p-3 text-sm" role="note">
        {REFERENCE_IDENTIFIER_BANNER[lang]}
      </p>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-semibold">{ur ? "نوٹس کا مجموعہ" : "Note set"}</span>
        <select
          value={assistantId}
          onChange={(event) => setAssistantId(event.target.value)}
          className="min-h-11 rounded-xl border border-line bg-surface px-3"
        >
          {REFERENCE_ASSISTANTS.map((item) => (
            <option key={item.id} value={item.id}>
              {ur ? item.nameUr : item.nameEn}
            </option>
          ))}
        </select>
        <span className="text-xs text-muted">{ur ? current.detailUr : current.detailEn}</span>
      </label>

      <div className="flex flex-wrap gap-2">
        {EXAMPLES.map((example) => (
          <button
            key={example.en}
            type="button"
            className="min-h-11 rounded-xl border border-line bg-surface px-3 text-start text-sm font-semibold"
            onClick={() => ask(ur ? example.ur : example.en)}
          >
            {ur ? example.ur : example.en}
          </button>
        ))}
      </div>

      <div className="flex max-h-[50vh] flex-col gap-3 overflow-y-auto rounded-xl border border-line bg-surface p-3">
        {messages.length === 0 && (
          <p className="text-sm text-muted">
            {ur
              ? "شیلف کارڈ، تعامل، لیبل کی مقدار، یا حفاظتی جانچ کے بارے میں پوچھیں۔"
              : "Ask about a shelf card, an interaction, a labeled amount, or a safety-check note."}
          </p>
        )}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`rounded-lg px-3 py-2 text-sm ${message.role === "user" ? "ms-8 bg-primary/10" : "me-8 bg-bg"}`}
          >
            <p className="whitespace-pre-wrap">{message.text}</p>
            {message.quotes && message.quotes.length > 0 && (
              <p className="mt-2 text-xs text-muted">
                {ur ? "حوالہ:" : "Cited notes:"}{" "}
                {message.quotes.map((quote) => quote.id).join("; ")}
              </p>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {identifierHit && (
        <p
          className="rounded-lg border border-accent bg-accent/10 p-3 text-sm text-accent"
          role="alert"
        >
          {ur
            ? "شناختی معلومات لگ رہی ہیں۔ ہٹا کر دوبارہ پوچھیں۔ سوال محفوظ نہیں ہوگا۔"
            : "Possible identifiers detected. Remove them and ask again. The question will not be saved."}
        </p>
      )}
      {importError && (
        <p
          className="rounded-lg border border-accent bg-accent/10 p-3 text-sm text-accent"
          role="alert"
        >
          {ur
            ? "یہ فائل حوالہ ہسٹری نہیں لگی۔ کچھ درآمد نہیں ہوا۔"
            : "That file is not a reference-desk history. Nothing was imported."}
        </p>
      )}

      <div className="flex flex-col gap-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-semibold">{ur ? "سوال" : "Question"}</span>
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={ur ? "سوال لکھیں…" : "Type a question…"}
            rows={3}
            className="min-h-20 rounded-xl border border-line bg-surface px-4 py-3 text-base outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                ask(input);
              }
            }}
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => ask(input)} disabled={identifierHit || input.trim().length < 2}>
            {ur ? "نوٹس دیکھیں" : "Search notes"}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              clearReferenceHistory();
              setMessages([]);
            }}
          >
            {ur ? "ہسٹری صاف کریں" : "Clear history"}
          </Button>
          <Button variant="outline" onClick={exportHistory}>
            {ur ? "فائل برآمد کریں" : "Export file"}
          </Button>
          <label className="inline-flex min-h-11 cursor-pointer items-center rounded-xl border border-line bg-surface px-4 text-sm font-semibold">
            {ur ? "فائل درآمد کریں" : "Import file"}
            <input
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (file) importHistory(file);
              }}
            />
          </label>
        </div>
        <p className="text-xs text-muted">
          {ur
            ? "برآمد اور درآمد ایک فائل ہے، دوسرے آلات کی ہم آہنگی نہیں۔ درآمد اس ڈیوائس کی ہسٹری بدل دیتی ہے۔"
            : "Export and import use a file, not sync across devices. Import replaces the history on this device."}
        </p>
      </div>

      <p className="text-xs text-muted">{REFERENCE_VERIFY[lang]}</p>
    </section>
  );
}
