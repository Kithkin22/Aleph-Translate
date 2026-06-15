"use client";

import { SourceInput } from "@/components/translation/SourceInput";

interface NewChapterFormProps {
  busy: boolean;
  chapterName: string;
  onChapterNameChange: (value: string) => void;
  onStart: (text: string) => void;
  hint: string;
}

export function NewChapterForm({
  busy,
  chapterName,
  onChapterNameChange,
  onStart,
  hint,
}: NewChapterFormProps) {
  return (
    <>
      <p className="mb-4 text-base leading-relaxed text-stone-600 dark:text-stone-400">
        {hint}
      </p>
      <label className="mb-4 flex flex-col gap-2">
        <span className="text-sm font-medium text-stone-600 dark:text-stone-400">
          Chapter name (optional)
        </span>
        <input
          value={chapterName}
          onChange={(e) => onChapterNameChange(e.target.value)}
          placeholder="e.g. Job 1"
          className="min-h-12 rounded-xl border border-stone-200 bg-white px-4 outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-500/15 dark:border-stone-700 dark:bg-stone-900"
        />
      </label>
      <SourceInput onStart={onStart} busy={busy} />
    </>
  );
}
