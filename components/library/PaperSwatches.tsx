"use client";

import {
  NOTEBOOK_PAPERS,
  type NotebookPaper,
} from "@/lib/library/appearance";

interface PaperSwatchesProps {
  value: NotebookPaper;
  onChange: (paper: NotebookPaper) => void;
}

export function PaperSwatches({ value, onChange }: PaperSwatchesProps) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-medium text-stone-500 dark:text-stone-400">
        Paper
      </p>
      <div className="flex gap-2" role="radiogroup" aria-label="Paper color">
        {(["white", "black"] as const).map((paper) => {
          const style = NOTEBOOK_PAPERS[paper];
          const selected = value === paper;
          return (
            <button
              key={paper}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onChange(paper);
              }}
              className={`flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg border-2 px-3 text-xs font-medium transition ${
                selected
                  ? "border-amber-500 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200"
                  : "border-stone-200 bg-white text-stone-600 hover:border-stone-300 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-400"
              }`}
            >
              <span
                className="h-5 w-5 rounded border border-stone-300"
                style={{ backgroundColor: style.page }}
              />
              {style.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
