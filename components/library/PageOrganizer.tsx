"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  getFolder,
  getNotebook,
  isPageInInbox,
  listFilingFolders,
  listNotebooks,
  movePageToNotebook,
  pagePath,
} from "@/lib/library/storage";
import type { FolderId, NotebookId, Page } from "@/lib/library/types";

interface PageOrganizerProps {
  page: Page;
}

export function PageOrganizer({ page }: PageOrganizerProps) {
  const router = useRouter();
  const unfiled = isPageInInbox(page);
  const [expanded, setExpanded] = useState(unfiled);
  const [folderId, setFolderId] = useState<FolderId | "">(
    unfiled ? "" : page.folderId,
  );
  const [notebookId, setNotebookId] = useState<NotebookId | "">(
    unfiled ? "" : page.notebookId,
  );

  const folders = listFilingFolders();
  const notebooks = folderId ? listNotebooks(folderId) : [];

  function handleFolderChange(id: FolderId | "") {
    setFolderId(id);
    setNotebookId("");
  }

  const currentFolder = getFolder(page.folderId);
  const currentNotebook = getNotebook(page.notebookId);

  function handleMove() {
    if (!folderId || !notebookId) return;
    try {
      const moved = movePageToNotebook(page.id, folderId, notebookId);
      router.replace(pagePath(moved));
    } catch {
      alert("Could not move chapter. Please try again.");
    }
  }

  const canMove =
    folderId &&
    notebookId &&
    (folderId !== page.folderId || notebookId !== page.notebookId);

  return (
    <section
      className={`mb-5 rounded-2xl border p-4 sm:p-5 ${
        unfiled
          ? "border-amber-300/70 bg-amber-50/80 dark:border-amber-700/50 dark:bg-amber-950/30"
          : "border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-600 dark:text-stone-400">
            Library location
          </h2>
          {unfiled ? (
            <p className="mt-1 text-sm text-amber-900 dark:text-amber-200">
              Not filed yet — assign a folder and notebook when you&apos;re ready.
            </p>
          ) : (
            <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
              {currentFolder?.name} · {currentNotebook?.name}
            </p>
          )}
        </div>
        {!unfiled ? (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="inline-flex min-h-11 shrink-0 items-center rounded-xl px-3 text-sm font-medium text-stone-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800"
          >
            {expanded ? "Done" : "Change"}
          </button>
        ) : null}
      </div>

      {expanded ? (
        <div className="mt-4 flex flex-col gap-3">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-stone-600 dark:text-stone-400">
              Folder
            </span>
            <select
              value={folderId}
              onChange={(e) => handleFolderChange(e.target.value)}
              className="min-h-12 rounded-xl border border-stone-200 bg-white px-4 outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-500/15 dark:border-stone-700 dark:bg-stone-950"
            >
              <option value="">Choose folder…</option>
              {folders.map((folder) => (
                <option key={folder.id} value={folder.id}>
                  {folder.name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-stone-600 dark:text-stone-400">
              Notebook
            </span>
            <select
              value={notebookId}
              onChange={(e) => setNotebookId(e.target.value)}
              disabled={!folderId}
              className="min-h-12 rounded-xl border border-stone-200 bg-white px-4 outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-500/15 disabled:opacity-50 dark:border-stone-700 dark:bg-stone-950"
            >
              <option value="">
                {folderId ? "Choose notebook…" : "Select a folder first"}
              </option>
              {notebooks.map((notebook) => (
                <option key={notebook.id} value={notebook.id}>
                  {notebook.name}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={handleMove}
            disabled={!canMove}
            className="inline-flex min-h-12 items-center justify-center rounded-xl bg-amber-600 px-5 font-semibold text-white hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {unfiled ? "File chapter" : "Move chapter"}
          </button>
        </div>
      ) : null}
    </section>
  );
}
