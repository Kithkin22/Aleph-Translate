"use client";

import {
  FOLDER_COLOR_IDS,
  FOLDER_COLORS,
  type FolderColorId,
} from "@/lib/library/appearance";

interface ColorSwatchesProps {
  value: FolderColorId;
  onChange: (color: FolderColorId) => void;
  label?: string;
  size?: "sm" | "md";
}

export function ColorSwatches({
  value,
  onChange,
  label = "Color",
  size = "sm",
}: ColorSwatchesProps) {
  const dot = size === "sm" ? "h-5 w-5" : "h-7 w-7";

  return (
    <div>
      {label ? (
        <p className="mb-1.5 text-xs font-medium text-stone-500 dark:text-stone-400">
          {label}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label={label}>
        {FOLDER_COLOR_IDS.map((id) => {
          const colors = FOLDER_COLORS[id];
          const selected = value === id;
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={colors.label}
              title={colors.label}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onChange(id);
              }}
              className={`${dot} rounded-full border-2 transition-transform hover:scale-110 ${
                selected
                  ? "border-stone-900 ring-2 ring-stone-400 dark:border-white dark:ring-stone-500"
                  : "border-white/80 shadow-sm"
              }`}
              style={{ background: `linear-gradient(180deg, ${colors.front}, ${colors.back})` }}
            />
          );
        })}
      </div>
    </div>
  );
}
