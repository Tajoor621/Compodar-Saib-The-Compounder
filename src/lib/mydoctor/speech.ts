import type { Lang } from "./types.ts";

export function speak(text: string, lang: Lang, slow = false) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang === "ur" ? "ur-PK" : "en-GB";
  utterance.rate = slow ? 0.82 : 1;
  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
}

type Rec = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: { results: { 0: { 0: { transcript: string; confidence: number } } } }) => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

export function canListen(): boolean {
  if (typeof window === "undefined") return false;
  const w = window as unknown as {
    SpeechRecognition?: new () => Rec;
    webkitSpeechRecognition?: new () => Rec;
  };
  return Boolean(w.SpeechRecognition || w.webkitSpeechRecognition);
}

export function listenOnce(
  lang: Lang,
  onText: (transcript: string, confidence: number) => void,
  onError: (code: string) => void,
): { stop: () => void } {
  stopSpeaking();
  const w = window as unknown as {
    SpeechRecognition?: new () => Rec;
    webkitSpeechRecognition?: new () => Rec;
  };
  const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
  if (!Ctor) {
    onError("unsupported");
    return { stop() {} };
  }
  const rec = new Ctor();
  rec.lang = lang === "ur" ? "ur-PK" : "en-GB";
  rec.interimResults = false;
  rec.continuous = false;
  rec.onresult = (event) => {
    const alt = event.results[0][0];
    onText(alt.transcript, typeof alt.confidence === "number" ? alt.confidence : 0.9);
  };
  rec.onerror = (event) => onError(event.error || "error");
  rec.start();
  return {
    stop() {
      rec.onresult = null;
      rec.onerror = null;
      rec.stop();
    },
  };
}
