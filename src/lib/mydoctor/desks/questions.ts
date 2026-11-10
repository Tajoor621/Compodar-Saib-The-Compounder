import { DANGER_KEYS, type DangerKey } from "../types.ts";
import type { DeskId } from "./types.ts";

export type FollowQuestion = {
  id: string;
  desks: DeskId[];
  en: string;
  ur: string;
};

export const FOLLOW_QUESTIONS: FollowQuestion[] = [
  { id: "fever", desks: ["dermatology", "gp"], en: "Is there a fever with this?", ur: "کیا اس کے ساتھ بخار ہے؟" },
  { id: "spread", desks: ["dermatology"], en: "Is a patch hot, or spreading?", ur: "کیا کوئی حصہ گرم ہے، یا پھیل رہا ہے؟" },
  { id: "mole", desks: ["dermatology"], en: "Is a mole changing, bleeding, or new?", ur: "کیا کوئی تل بدل رہا ہے، خون بہا رہا ہے، یا نیا ہے؟" },
  { id: "itch", desks: ["dermatology"], en: "Is itch the main problem?", ur: "کیا خارش اصل مسئلہ ہے؟" },
  { id: "acid", desks: ["gastroenterology"], en: "Is there burning or acid after food?", ur: "کیا کھانے کے بعد جلن یا تیزاب ہے؟" },
  { id: "loose", desks: ["gastroenterology"], en: "Are the stools loose?", ur: "کیا پاخانے پتلے ہیں؟" },
  { id: "blood", desks: ["gastroenterology"], en: "Is there blood, or black stool?", ur: "کیا خون ہے، یا کالا پاخانہ؟" },
  { id: "weight", desks: ["gastroenterology"], en: "Has weight dropped without trying?", ur: "کیا وزن بغیر کوشش کے گرا ہے؟" },
  { id: "vomit", desks: ["gastroenterology"], en: "Is there vomiting?", ur: "کیا الٹی ہو رہی ہے؟" },
  { id: "sudden", desks: ["neurology"], en: "Is this the worst headache, and did it start suddenly?", ur: "کیا یہ سب سے شدید سر درد ہے، اور اچانک شروع ہوا؟" },
  { id: "headFever", desks: ["neurology"], en: "Is there fever with this headache?", ur: "کیا اس سر درد کے ساتھ بخار ہے؟" },
  { id: "dizzy", desks: ["neurology"], en: "Is dizziness a main part of this?", ur: "کیا چکر اس کا بڑا حصہ ہے؟" },
  { id: "numb", desks: ["neurology"], en: "Is there numbness or nerve pain?", ur: "کیا سن ہونا یا اعصاب کا درد ہے؟" },
  { id: "exert", desks: ["cardiology"], en: "Does it come on with walking or stairs?", ur: "کیا چلنے یا سیڑھیوں پر ہوتا ہے؟" },
  { id: "rest", desks: ["cardiology"], en: "Does it happen while resting?", ur: "کیا آرام کے دوران ہوتا ہے؟" },
  { id: "bp", desks: ["cardiology"], en: "Has a clinician already talked about blood pressure?", ur: "کیا کلینیشن پہلے فشار خون کی بات کر چکا ہے؟" },
  { id: "longCough", desks: ["pulmonology_ent"], en: "Has the cough lasted more than a week?", ur: "کیا کھانسی ایک ہفتے سے زیادہ ہے؟" },
  { id: "coughFever", desks: ["pulmonology_ent"], en: "Is there a fever with the cough or throat?", ur: "کیا کھانسی یا گلے کے ساتھ بخار ہے؟" },
  { id: "coughBlood", desks: ["pulmonology_ent"], en: "Is there blood in the phlegm?", ur: "کیا بلغم میں خون ہے؟" },
  { id: "ear", desks: ["pulmonology_ent"], en: "Is an ear involved?", ur: "کیا کان شامل ہے؟" },
  { id: "throat", desks: ["pulmonology_ent"], en: "Is the throat or nose the main problem?", ur: "کیا گلا یا ناک اصل مسئلہ ہے؟" },
  { id: "knownSugar", desks: ["endocrinology"], en: "Has a doctor already said this is diabetes?", ur: "کیا ڈاکٹر پہلے کہہ چکا ہے کہ یہ شوگر ہے؟" },
  { id: "thirst", desks: ["endocrinology"], en: "Is there new thirst or much more urine?", ur: "کیا نئی پیاس یا بہت زیادہ پیشاب ہے؟" },
  { id: "thyroid", desks: ["endocrinology"], en: "Is there a thyroid or neck swelling story?", ur: "کیا تھائرائیڈ یا گردن کی سوجن کی بات ہے؟" },
  { id: "worse", desks: ["gp"], en: "Is this getting worse?", ur: "کیا یہ بڑھ رہا ہے؟" },
];

export function followFor(desk: DeskId): FollowQuestion[] {
  return FOLLOW_QUESTIONS.filter((question) => question.desks.includes(desk));
}

export const DANGER_ORDER: DangerKey[] = [...DANGER_KEYS];
