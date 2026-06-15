"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PdfImportButton } from "@/components/pdf/PdfImportButton";
import { CompletionBadge } from "@/components/library/CompletionBadge";
import {
  deletePage,
  listPages,
  pagePath,
  subscribeStorage,
} from "@/lib/library/storage";
import type { NotebookId, PageIndexEntry } from "@/lib/library/types";

interface PageListProps {
  folderId: string;
  notebookId: NotebookId;
}

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export function PageList({ folderId, notebookId }: PageListProps) {
  const [pages, setPages] = useState<PageIndexEntry[]>([]);

  useEffect(() => {
    function refresh() {
      try {
        setPages(listPages(notebookId));
      } catch {
        setPages([]);
      }
    }
    refresh();
    return subscribeStorage(refresh);
  }, [notebookId]);

  function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    deletePage(id);
  }

  if (pages.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-center dark:border-stone-700 dark:bg-stone-900">
        <p className="font-medium">No documents yet</p>
        <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
          Import a PDF to start translating.
        </p>
        <PdfImportButton className="mt-5 inline-flex min-h-12 items-center justify-center rounded-xl bg-blue-600 px-6 font-semibold text-white hover:bg-blue-500 disabled:opacity-50">
          Import PDF
        </PdfImportButton>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {pages.map((page) => (
        <li
          key={page.id}
          className="rounded-2xl border border-stone-200 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-900"
        >
          <Link href={pagePath(page)} className="block p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-lg font-semibold">{page.name}</p>
                <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                  {page.contentKind === "pdf" ? "PDF · " : ""}
                  {formatRelativeTime(page.updatedAt)}
                </p>
              </div>
              <CompletionBadge completion={page.completion} />
            </div>
          </Link>
          <div className="border-t border-stone-100 px-4 py-2 dark:border-stone-800 sm:px-5">
            <button
              type="button"
              onClick={() => handleDelete(page.id, page.name)}
              className="inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
            >
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
