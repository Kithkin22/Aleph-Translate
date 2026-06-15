"use client";

import Link from "next/link";
import { listPages, pagePath } from "@/lib/library/storage";
import type { Page } from "@/lib/library/types";
import { CompletionBadge } from "@/components/library/CompletionBadge";

interface ChapterNavProps {
  page: Page;
}

export function ChapterNav({ page }: ChapterNavProps) {
  const pages = listPages(page.notebookId);
  const index = pages.findIndex((p) => p.id === page.id);
  const prev = index > 0 ? pages[index - 1] : null;
  const next = index >= 0 && index < pages.length - 1 ? pages[index + 1] : null;

  return (
    <nav
      className="mb-5 flex flex-col gap-3 rounded-2xl border border-stone-200 bg-white p-3 dark:border-stone-800 dark:bg-stone-900"
      aria-label="Chapter navigation"
    >
      <div className="flex items-center justify-between gap-2">
        {prev ? (
          <Link
            href={pagePath(prev)}
            className="inline-flex min-h-11 items-center rounded-xl px-3 text-sm font-medium text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
          >
            ← {prev.name}
          </Link>
        ) : (
          <span className="min-h-11 px-3 text-sm text-stone-400">←</span>
        )}
        <CompletionBadge completion={page.completion} />
        {next ? (
          <Link
            href={pagePath(next)}
            className="inline-flex min-h-11 items-center rounded-xl px-3 text-sm font-medium text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
          >
            {next.name} →
          </Link>
        ) : (
          <span className="min-h-11 px-3 text-sm text-stone-400">→</span>
        )}
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {pages.map((p) => (
          <ChapterChip key={p.id} name={p.name} active={p.id === page.id} href={pagePath(p)} completion={p.completion} />
        ))}
      </div>
    </nav>
  );
}

function ChapterChip({
  name,
  active,
  href,
  completion,
}: {
  name: string;
  active: boolean;
  href: string;
  completion: Page["completion"];
}) {
  return (
    <Link
      href={href}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-amber-600 text-white"
          : "bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700"
      }`}
      aria-current={active ? "page" : undefined}
    >
      {completion.status === "complete" ? (
        <span aria-hidden className="text-xs">
          ✓
        </span>
      ) : completion.status === "in_progress" ? (
        <span
          aria-hidden
          className={`h-2 w-2 rounded-full ${active ? "bg-white" : "bg-amber-500"}`}
        />
      ) : null}
      {name}
    </Link>
  );
}
