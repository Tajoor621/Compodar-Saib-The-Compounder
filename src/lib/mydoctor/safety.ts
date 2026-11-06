const patterns: RegExp[] = [
  /\b(?:0?[1-9]|[12]\d|3[01])[-/.](?:0?[1-9]|1[0-2])[-/.](?:19|20)?\d{2}\b/,
  /\b(?:19|20)\d{2}[-/.](?:0?[1-9]|1[0-2])[-/.](?:0?[1-9]|[12]\d|3[01])\b/,
  /\b(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+\d{1,2},?\s+(?:19|20)?\d{2}\b/i,
  /\b\d{1,2}\s+(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+(?:19|20)?\d{2}\b/i,
  /\b\d{5}-\d{7}-\d\b/,
  /\b\d{3}-\d{2}-\d{4}\b/,
  /\b(?:MRN|MR|UHID|patient\s*id|record\s*(?:no|number)|file\s*(?:no|number)|passport\s*(?:no|number)|national\s*id)\s*[:#=-]?\s*[A-Z0-9/-]{5,}\b/i,
  /\b[A-Z]{1,3}[-/]?\d{6,12}\b/i,
  /\b\+?\d{1,3}[\s.-]?(?:\(?\d{2,4}\)?[\s.-]?)?\d{3,4}[\s.-]?\d{4}\b/,
  /\b(?:\+?\d[\s().-]*){10,15}\b/,
  /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i,
  /\b(?:street|st\.|road|rd\.|avenue|ave\.|lane|block|flat|apartment|apt\.?|house\s*(?:no|number)|building)\s+[\w#/-]+/i,
  /\b\d{1,5}\s+[A-Z0-9][\w.-]*(?:\s+(?:street|st\.?|road|rd\.?|avenue|ave\.?|lane|ln\.?|drive|dr\.?|boulevard|blvd\.?))\b/i,
  /\b(?:address|home\s*address|residential\s*address)\s*[:=]/i,
  /\b(?:Mr|Mrs|Ms|Miss|Dr|Doctor)\.?\s+[A-Z][a-z]{1,}(?:\s+[A-Z][a-z]{1,}){0,2}\b/,
  /\b(?:patient|name|full\s*name)\s*[:=]\s*[A-Z][a-z]{1,}(?:\s+[A-Z][a-z]{1,}){0,2}\b/i,
  /(?:مریض|نام|جناب|محترمہ|ڈاکٹر)\s*[:：]?\s*[\u0600-\u06FF]{2,}(?:\s+[\u0600-\u06FF]{2,})?/u,
];

export function detectIdentifiers(value: string): boolean {
  const digitMap = "01234567890123456789";
  const text = value.normalize("NFKC").replace(/[٠-٩۰-۹]/g, (digit) => {
    const code = digit.charCodeAt(0);
    return digitMap[code >= 0x06f0 ? code - 0x06f0 + 10 : code - 0x0660];
  });
  return patterns.some((pattern) => pattern.test(text));
}

const injectionPatterns = [
  /ignore\s+(?:all\s+)?(?:previous|prior|above)\s+instructions?/gi,
  /disregard\s+(?:all\s+)?(?:above|previous|prior)\s+(?:safety\s+)?(?:constraints|rules|instructions)/gi,
  /disregard\s+(?:the\s+)?(?:system|developer|safety|previous)\s+(?:prompt|instructions?)/gi,
  /override\s+(?:the\s+)?(?:system|developer|safety)\s+(?:prompt|rules?)/gi,
  /reveal\s+(?:the\s+)?(?:system|developer)\s+prompt/gi,
  /act\s+as\s+(?:an?\s+)?(?:unrestricted|uncensored|different)\s+(?:ai|assistant|model)/gi,
  /you\s+are\s+now\s+(?:dan|unrestricted|uncensored)/gi,
  /forget\s+your\s+(?:rules|instructions|safety)/gi,
  /do\s+not\s+follow\s+(?:your\s+)?(?:safety|system)\s+(?:rules|instructions)/gi,
  /\[\s*system\s*\]|<\/?system>|<\/?developer>/gi,
  /BEGIN\s+(?:SYSTEM|DEVELOPER)\s+(?:PROMPT|INSTRUCTIONS)/gi,
];

export function neutralizePromptInjection(value: string): string {
  // eslint-disable-next-line no-control-regex
  let result = value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, " ");
  for (const pattern of injectionPatterns) result = result.replace(pattern, "[neutralized instruction override]");
  return result.slice(0, 1600);
}

export function hasPromptInjection(value: string): boolean {
  return injectionPatterns.some((pattern) => {
    pattern.lastIndex = 0;
    return pattern.test(value);
  });
}
