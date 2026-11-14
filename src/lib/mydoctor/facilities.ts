import { CARE_REGIONS, type CareRegionId } from "./community/regions.ts";
import type { Region } from "./places.ts";
import type { Jurisdiction } from "./types.ts";

export type Contact = { name: string; detail: string; phone: string; display: string };

export function emergencyContacts(
  jurisdiction: Jurisdiction,
  psychiatric: boolean,
  region?: Region | CareRegionId,
): Contact[] {
  const where = region ?? (jurisdiction === "UK" ? "UK" : "PK");
  if (where === "UK") {
    const rows: Contact[] = [
      {
        name: "Emergency services",
        detail: "Call now if this is the emergency screen.",
        phone: "999",
        display: "999",
      },
    ];
    if (psychiatric) {
      rows.push({
        name: "Samaritans",
        detail: "A listening line, alongside 999 if someone is in immediate danger.",
        phone: "116123",
        display: "116 123",
      });
    }
    return rows;
  }
  if (where === "AE") {
    const rows: Contact[] = [
      {
        name: "Ambulance",
        detail: "UAE ambulance. Call if this is the emergency screen.",
        phone: "998",
        display: "998",
      },
      {
        name: "Police",
        detail: "UAE police, if ambulance does not connect.",
        phone: "999",
        display: "999",
      },
    ];
    if (psychiatric) {
      rows[0] = {
        name: "Ambulance",
        detail: "If someone may act on suicidal thoughts, call 998 now. Stay with them if it is safe.",
        phone: "998",
        display: "998",
      };
    }
    return rows;
  }
  if (where === "SG") {
    const rows: Contact[] = [
      {
        name: "SCDF ambulance",
        detail: "Singapore ambulance. Call if this is the emergency screen.",
        phone: "995",
        display: "995",
      },
    ];
    if (psychiatric) {
      rows[0] = {
        name: "SCDF ambulance",
        detail: "If someone may act on suicidal thoughts, call 995 now. Stay with them if it is safe.",
        phone: "995",
        display: "995",
      };
      rows.push({
        name: "IMH mental health helpline",
        detail: "Institute of Mental Health. If it does not connect, use 995.",
        phone: "63892222",
        display: "6389 2222",
      });
    }
    return rows;
  }
  const emergency = CARE_REGIONS.find((item) => item.id === where)?.emergency;
  if (!emergency) return [];
  const rows: Contact[] = [{
    name: emergency.label.en,
    detail: "If the call does not connect, ask someone nearby to help reach emergency care.",
    phone: emergency.phone,
    display: emergency.phone,
  }];
  if (psychiatric && where === "PK") {
    rows.push({
      name: "Umang",
      detail: "Mental health line listed by WHO for Pakistan. If it does not connect, use 1122.",
      phone: "03117786264",
      display: "0311-7786264",
    });
  }
  return rows;
}
