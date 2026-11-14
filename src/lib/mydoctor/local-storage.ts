export const CLINIC_KEY = "mydoctor.v1";
export const CHAT_HISTORY_KEY = "mydoctor-assistant-history";
export const CHAT_CONSENT_KEY = "mydoctor-assistant-disclaimer";
export const PROFILE_KEY = "mydoctor-desk-profiles";
export const REPORT_KEY = "mydoctor-desk-reports";
export const REFERENCE_DISCLAIMER_KEY = "mydoctor-reference-disclaimer";
export const REFERENCE_HISTORY_KEY = "mydoctor-reference-history";

export type Bucket = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export function memoryBucket(): Bucket {
  const items = new Map<string, string>();
  return {
    getItem: (key) => items.get(key) ?? null,
    setItem: (key, value) => {
      items.set(key, value);
    },
    removeItem: (key) => {
      items.delete(key);
    },
  };
}

// Keep a tab usable when persistent storage is blocked or full. Server calls
// never retain another request's browser data.
const memory = memoryBucket();

export const appStorage: Bucket = {
  getItem(key) {
    if (typeof window === "undefined") return null;
    const pending = memory.getItem(key);
    if (pending !== null) return pending;
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem(key, value) {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(key, value);
      memory.removeItem(key);
    } catch {
      memory.setItem(key, value);
    }
  },
  removeItem(key) {
    memory.removeItem(key);
    if (typeof window !== "undefined") window.localStorage.removeItem(key);
  },
};

export function clearLocalAppData(bucket: Bucket = appStorage): void {
  let failed = false;
  for (const key of [
    CLINIC_KEY,
    CHAT_HISTORY_KEY,
    CHAT_CONSENT_KEY,
    PROFILE_KEY,
    REPORT_KEY,
    REFERENCE_HISTORY_KEY,
    REFERENCE_DISCLAIMER_KEY,
  ]) {
    try {
      bucket.removeItem(key);
    } catch {
      failed = true;
    }
  }
  if (failed) throw new Error("Local app data could not be fully cleared");
}
