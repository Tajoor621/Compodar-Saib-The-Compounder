import { queryFromSight, type PackSight } from "./read-pack-query.ts";

export type { PackSight };
export { queryFromSight };

const NOT_UPLOADED =
  "This public site did not upload the photo. Type the name printed on the box. The pack in your hand overrides the card. اس عوامی سائٹ نے تصویر نہیں بھیجی۔ ڈبے پر لکھا نام ٹائپ کریں۔ ہاتھ والا پیک کارڈ پر فوقیت رکھتا ہے۔";

/** Same call shape as the server function. The photo never leaves the browser. */
export async function readPackPhoto(_input?: {
  data?: { image?: string; consent?: boolean };
}): Promise<PackSight | { ok: false; error: string }> {
  return { ok: false, error: NOT_UPLOADED };
}
