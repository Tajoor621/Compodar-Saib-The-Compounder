export type NoteTopic = "label" | "dosing" | "interactions" | "guidance";

export type NoteSection =
  "uses" | "adult" | "child" | "avoid" | "effects" | "mix" | "pregnancy" | "storage" | "guidance";

export type ReferenceNote = {
  id: string;
  topic: NoteTopic;
  section: NoteSection;
  titleEn: string;
  titleUr: string;
  passageEn: string;
  passageUr: string;
  keywords: string[];
};

export type ReferenceAssistant = {
  id: string;
  nameEn: string;
  nameUr: string;
  detailEn: string;
  detailUr: string;
  /** Null searches every local note. */
  topics: readonly NoteTopic[] | null;
};

export type ReferenceQuote = {
  id: string;
  title: string;
  passage: string;
  topic: NoteTopic;
};

export type ReferenceStatus =
  "cited" | "not_in_notes" | "identifiers" | "harm" | "emergency" | "dose_withheld";

export type ReferenceAnswer = {
  status: ReferenceStatus;
  text: string;
  quotes: ReferenceQuote[];
  assistantId: string;
};

export type ReferenceMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  createdAt: string;
  assistantId: string;
  status?: ReferenceStatus;
  quotes?: ReferenceQuote[];
};
