"use client";

import { useState } from "react";
import { notesFor } from "@/lib/notes/side-notes";
import type { SideNote, SideNoteContext } from "@/types";

// Side notes, shown closed.
//
// Closed is the default on purpose. The brief for this feature is that it must
// not overwhelm the main content, and a tip that is open by default is not a
// side note — it is more page. Closed, a note is one line the learner can scan
// and ignore; open, it is three lines they asked for.

const KIND_STYLE: Record<SideNote["kind"], { label: string; chip: string }> = {
  grammar: { label: "Grammar", chip: "bg-blue-100 text-blue-700" },
  expression: { label: "Expression", chip: "bg-emerald-100 text-emerald-700" },
  vocabulary: { label: "Vocabulary", chip: "bg-violet-100 text-violet-700" },
  mistake: { label: "Common mistake", chip: "bg-amber-100 text-amber-800" },
  confusable: { label: "Easily confused", chip: "bg-rose-100 text-rose-700" },
  exam: { label: "Exam tip", chip: "bg-slate-900 text-white" },
};

const Note = ({ note }: { note: SideNote }) => {
  const [open, setOpen] = useState(false);
  const style = KIND_STYLE[note.kind];

  return (
    <div className="rounded-lg border border-slate-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 px-3 py-2 text-left"
      >
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${style.chip}`}>
          {style.label}
        </span>
        <span className="flex-1 text-sm font-medium text-slate-800">{note.title}</span>
        <span aria-hidden className="text-xs text-slate-400">
          {open ? "−" : "+"}
        </span>
      </button>

      {open && (
        <div className="border-t border-slate-100 px-3 py-2.5">
          <p className="text-sm text-slate-600">{note.body}</p>
          {note.example && (
            <div className="mt-2 rounded-md bg-slate-50 px-3 py-2">
              <p className="text-sm font-medium text-slate-900">{note.example.danish}</p>
              <p className="mt-0.5 text-xs text-slate-500">{note.example.english}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const SideNotes = ({
  context,
  limit = 2,
  title = "Worth knowing",
  className = "",
}: {
  context: SideNoteContext;
  limit?: number;
  title?: string;
  className?: string;
}) => {
  const notes = notesFor(context, limit);
  // Nothing relevant: show nothing. An empty "Tips" heading is worse than no
  // heading at all.
  if (notes.length === 0) return null;

  return (
    <aside className={`space-y-2 ${className}`}>
      <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">{title}</h2>
      {notes.map((n) => (
        <Note key={n.id} note={n} />
      ))}
    </aside>
  );
};
