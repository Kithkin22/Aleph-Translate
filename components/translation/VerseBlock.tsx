"use client";

import type { SourceLanguage, Verse } from "@/lib/types/project";

interface VerseBlockProps {
  verse: Verse;
  sourceLanguage: SourceLanguage;
  onTranslationChange: (value: string) => void;
  onNotesChange: (value: string) => void;
}

const languageClass: Record<SourceLanguage, string> = {
  hebrew: "font-hebrew text-right",
  greek: "font-greek",
  unknown: "font-serif",
};

export function VerseBlock({
  verse,
  sourceLanguage,
  onTranslationChange,
  onNotesChange,
}: VerseBlockProps) {
  const label = verse.reference
    ? `Verse ${verse.reference}`
    : `Verse ${verse.index + 1}`;

  return (
    <article className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-800 dark:bg-stone-900 sm:p-5">
      <header className="mb-3 flex items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
          {label}
        </h2>
      </header>

      <div
        dir="auto"
        className={`mb-4 rounded-xl bg-stone-50 px-4 py-3 text-lg leading-relaxed text-stone-900 dark:bg-stone-950 dark:text-stone-100 ${languageClass[sourceLanguage]}`}
      >
        {verse.original}
      </div>

      <label className="mb-3 flex flex-col gap-2">
        <span className="text-sm font-medium text-stone-600 dark:text-stone-400">
          Translation
        </span>
        <textarea
          value={verse.translation}
          onChange={(e) => onTranslationChange(e.target.value)}
          rows={3}
          dir="auto"
          placeholder="Your translation…"
          className="w-full resize-y rounded-xl border border-stone-200 bg-white p-3 text-base leading-relaxed outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-500/15 dark:border-stone-700 dark:bg-stone-950"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-stone-600 dark:text-stone-400">
          Notes
        </span>
        <textarea
          value={verse.notes}
          onChange={(e) => onNotesChange(e.target.value)}
          rows={2}
          dir="auto"
          placeholder="Grammar, vocabulary, observations…"
          className="w-full resize-y rounded-xl border border-stone-200 bg-white p-3 text-sm leading-relaxed outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-500/15 dark:border-stone-700 dark:bg-stone-950"
        />
      </label>
    </article>
  );
}
