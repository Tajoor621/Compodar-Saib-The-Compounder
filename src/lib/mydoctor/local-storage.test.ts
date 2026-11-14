import assert from "node:assert/strict";
import { test } from "node:test";
import { parseChatHistory } from "./assistant.ts";
import {
  CHAT_HISTORY_KEY,
  clearLocalAppData,
  memoryBucket,
  REFERENCE_DISCLAIMER_KEY,
} from "./local-storage.ts";

test("clearing app data preserves storage belonging to other apps", () => {
  const bucket = memoryBucket();
  bucket.setItem(CHAT_HISTORY_KEY, "[]");
  bucket.setItem(REFERENCE_DISCLAIMER_KEY, "accepted");
  bucket.setItem("other-app", "keep");
  clearLocalAppData(bucket);
  assert.equal(bucket.getItem(CHAT_HISTORY_KEY), null);
  assert.equal(bucket.getItem(REFERENCE_DISCLAIMER_KEY), null);
  assert.equal(bucket.getItem("other-app"), "keep");
});

test("chat history imports require renderable messages and exclude identifiable questions", () => {
  const message = { role: "user", content: "What does the pack say?", timestamp: 1 };
  assert.deepEqual(parseChatHistory(JSON.stringify([message])), [message]);
  assert.equal(parseChatHistory(JSON.stringify([null])), null);
  assert.equal(parseChatHistory(JSON.stringify([{ ...message, citations: "invalid" }])), null);
  assert.equal(parseChatHistory(JSON.stringify([{ ...message, content: "Name: Jane Doe" }])), null);
});
