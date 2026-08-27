// Quick side notes.
//
// Short learning tips shown next to whatever the learner is doing. Matched by
// CONTEXT rather than by page, so the same note appears wherever it is
// relevant — beside the opgave that exercises it, beside the verb that
// demonstrates it, and beside the mistake that shows it has not landed yet.

import type { SIDE_NOTE_KINDS } from "@/lib/notes/side-notes";
import type { GrammarTopic } from "./feedback";

export type SideNoteKind = (typeof SIDE_NOTE_KINDS)[number];

/** Where in the app a note is relevant. */
export type SideNoteSurface =
  | "reading"
  | "writing"
  | "speaking"
  | "verbs"
  | "mock"
  | "mistakes";

export interface SideNote {
  id: string;
  kind: SideNoteKind;
  /** Four or five words. It is what the learner reads when the note is closed. */
  title: string;
  /** One or two sentences. Longer than that and it stops being a side note. */
  body: string;
  example?: { danish: string; english: string };
  match: {
    taskTypes?: string[];
    topics?: GrammarTopic[];
    surfaces?: SideNoteSurface[];
  };
}

export interface SideNoteContext {
  taskType?: string | null;
  topics?: GrammarTopic[];
  surface?: SideNoteSurface;
}
