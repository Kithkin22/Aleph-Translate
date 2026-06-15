import type { PageCompletion } from "@/lib/library/types";
import { completionLabel } from "@/lib/library/completion";

interface CompletionBadgeProps {
  completion: PageCompletion;
}

export function CompletionBadge({ completion }: CompletionBadgeProps) {
  const colors = {
    not_started:
      "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400",
    in_progress:
      "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
    complete:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  };

  return (
    <span
      className={`inline-flex min-h-7 items-center rounded-full px-2.5 text-xs font-medium ${colors[completion.status]}`}
    >
      {completion.status === "complete" ? "✓ " : ""}
      {completionLabel(completion)}
    </span>
  );
}
