"use client";

import { useMemo, useState } from "react";
import { cleanText } from "@/lib/text/clean";
import { parseVerses, verseCountLabel } from "@/lib/text/parseVerses";

interface SourceInputProps {
  onStart: (text: string) => void;
  busy?: boolean;
}

export function SourceInput({ onStart, busy }: SourceInputProps) {
  const [raw, setRaw] = useState("");

  const preview = useMemo(() => {
    if (!raw.trim()) return null;
    const cleaned = cleanText(raw);
    const parsed = parseVerses(cleaned);
    return {
      cleaned,
      verseCount: parsed.verses.length,
      language: parsed.sourceLanguage,
      passageRef: parsed.passageRef,
    };
  }, [raw]);

  function handleClean() {
    setRaw(cleanText(raw));
  }

  function handleStart() {
    if (!raw.trim() || busy) return;
    onStart(cleanText(raw));
  }

  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-stone-600 dark:text-stone-400">
          Paste Hebrew or Greek text
        </span>
        <textarea
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          dir="auto"
          rows={14}
          placeholder="Paste from Logos (Fully Formatted), a reader, or any source with verse markers…"
          className="w-full resize-y rounded-2xl border border-stone-200 bg-white p-4 text-base leading-relaxed shadow-sm outline-none ring-amber-500/0 transition focus:border-amber-400 focus:ring-4 focus:ring-amber-500/15 dark:border-stone-700 dark:bg-stone-900"
        />
      </label>

      {preview ? (
        <div className="rounded-xl bg-stone-100 px-4 py-3 text-sm text-stone-700 dark:bg-stone-900 dark:text-stone-300">
          <p>{verseCountLabel(preview.verseCount)} detected</p>
          <p className="mt-1 capitalize">
            Language: {preview.language === "unknown" ? "auto" : preview.language}
          </p>
          {preview.passageRef ? (
            <p className="mt-1">Passage: {preview.passageRef}</p>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={handleClean}
          disabled={!raw.trim() || busy}
          className="inline-flex min-h-12 flex-1 items-center justify-center rounded-xl border border-stone-300 bg-white px-5 text-base font-medium transition-colors hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-stone-700 dark:bg-stone-900 dark:hover:bg-stone-800"
        >
          Clean Text
        </button>
        <button
          type="button"
          onClick={handleStart}
          disabled={!raw.trim() || busy}
          className="inline-flex min-h-12 flex-1 items-center justify-center rounded-xl bg-amber-600 px-5 text-base font-semibold text-white transition-colors hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {busy ? "Starting…" : "Start Translation"}
        </button>
      </div>
    </div>
  );
}
