/**
 * Page completion helpers — used by library UI and autosave.
 * @see LIBRARY_STRUCTURE.md
 */

import type { Page, PageCompletion } from "@/lib/library/types";
import type { InkDocument } from "@/lib/ink/types";
import type { Verse } from "@/lib/types/project";

export function computePdfCompletion(
  pdf: Page["pdf"],
  ink?: InkDocument,
): PageCompletion {
  const totalPages = pdf?.pageCount ?? 0;
  if (totalPages === 0) {
    return {
      status: "not_started",
      translatedCount: 0,
      totalVerses: 0,
      percent: 0,
    };
  }

  const inkPages = ink?.pages ?? {};
  const inkedCount = Object.values(inkPages).filter(
    (p) => p.strokes.length > 0,
  ).length;
  const percent = Math.min(100, Math.floor((inkedCount / totalPages) * 100));

  let status: PageCompletion["status"] = "not_started";
  if (inkedCount >= totalPages) {
    status = "complete";
  } else if (inkedCount > 0) {
    status = "in_progress";
  }

  return {
    status,
    translatedCount: inkedCount,
    totalVerses: totalPages,
    percent,
  };
}

export function computeCompletionFromVerses(verses: Verse[]): PageCompletion {
  const totalVerses = verses.length;
  if (totalVerses === 0) {
    return {
      status: "not_started",
      translatedCount: 0,
      totalVerses: 0,
      percent: 0,
    };
  }

  const translatedCount = verses.filter(
    (v) => v.translation.trim().length > 0,
  ).length;
  const percent = Math.floor((translatedCount / totalVerses) * 100);

  let status: PageCompletion["status"] = "not_started";
  if (translatedCount === totalVerses) {
    status = "complete";
  } else if (translatedCount > 0 || verses.some((v) => v.notes.trim())) {
    status = "in_progress";
  }

  return { status, translatedCount, totalVerses, percent };
}

export function computePageCompletion(
  page: Pick<Page, "verses"> & Partial<Pick<Page, "contentKind" | "pdf" | "ink">>,
): PageCompletion {
  if (page.contentKind === "pdf") {
    return computePdfCompletion(page.pdf, page.ink);
  }
  return computeCompletionFromVerses(page.verses);
}

export function completionLabel(completion: PageCompletion): string {
  switch (completion.status) {
    case "complete":
      return "Complete";
    case "in_progress":
      return `${completion.percent}%`;
    default:
      return "Not started";
  }
}
