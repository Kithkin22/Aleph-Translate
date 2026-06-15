"use client";

import { useState } from "react";

interface EditableNameProps {
  value: string;
  onSave: (value: string) => void;
  className?: string;
  inputClassName?: string;
  ariaLabel: string;
}

export function EditableName({
  value,
  onSave,
  className = "text-lg font-semibold",
  inputClassName,
  ariaLabel,
}: EditableNameProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  function commit() {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== value) onSave(trimmed);
    else setDraft(value);
    setEditing(false);
  }

  if (editing) {
    return (
      <input
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") {
            setDraft(value);
            setEditing(false);
          }
        }}
        aria-label={ariaLabel}
        className={
          inputClassName ??
          "min-h-11 w-full rounded-xl border border-amber-400 bg-white px-3 text-lg font-semibold outline-none ring-4 ring-amber-500/15 dark:bg-stone-900"
        }
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        setDraft(value);
        setEditing(true);
      }}
      className={`text-left ${className}`}
      aria-label={`${ariaLabel}: ${value}. Tap to rename.`}
    >
      {value}
    </button>
  );
}
