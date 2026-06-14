"use client";

import type { SaveStatus } from "@/lib/types/project";

const labels: Record<SaveStatus, string> = {
  idle: "",
  saving: "Saving…",
  saved: "Saved",
  error: "Save failed",
};

interface WorkspaceToolbarProps {
  status: SaveStatus;
}

export function WorkspaceToolbar({ status }: WorkspaceToolbarProps) {
  const label = labels[status];
  if (!label) return null;

  return (
    <span
      className={`text-sm font-medium ${
        status === "error"
          ? "text-red-600 dark:text-red-400"
          : status === "saved"
            ? "text-emerald-600 dark:text-emerald-400"
            : "text-stone-500 dark:text-stone-400"
      }`}
      aria-live="polite"
    >
      {label}
    </span>
  );
}
