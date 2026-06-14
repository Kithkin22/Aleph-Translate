"use client";

import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { EditableName } from "@/components/library/EditableName";
import { useLibraryFolders } from "@/hooks/useLibraryFolders";
import {
  createFolder,
  listNotebooks,
  notebookPageCount,
  renameFolder,
} from "@/lib/library/storage";

export default function LibraryPage() {
  const { folders, ready } = useLibraryFolders();

  if (!ready) {
    return (
      <AppShell title="Library">
        <p className="text-stone-500">Loading library…</p>
      </AppShell>
    );
  }

  return (
    <AppShell title="Library">
      <p className="mb-6 text-base text-stone-600 dark:text-stone-400">
        Folders contain notebooks; notebooks contain chapter pages. Everything
        autosaves locally.
      </p>
      {folders.length === 0 ? (
        <p className="mb-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          No folders yet — Hebrew and Greek should appear automatically. Try
          refreshing, or add a folder below.
        </p>
      ) : null}
      <ul className="flex flex-col gap-3">
        {folders.map((folder) => {
          const notebookCount = listNotebooks(folder.id).length;
          const pageCount = listNotebooks(folder.id).reduce(
            (sum, nb) => sum + notebookPageCount(nb.id),
            0,
          );
          return (
            <li
              key={folder.id}
              className="rounded-2xl border border-stone-200 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-900"
            >
              <div className="flex items-center gap-2 p-4 sm:p-5">
                <div className="min-w-0 flex-1">
                  <EditableName
                    value={folder.name}
                    onSave={(name) => renameFolder(folder.id, name)}
                    className="text-xl font-semibold"
                    ariaLabel="Folder name"
                  />
                  <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                    {notebookCount}{" "}
                    {notebookCount === 1 ? "notebook" : "notebooks"} ·{" "}
                    {pageCount} {pageCount === 1 ? "page" : "pages"}
                  </p>
                </div>
                <Link
                  href={`/library/${folder.id}`}
                  className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
                  aria-label={`Open ${folder.name}`}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden
                  >
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </Link>
              </div>
            </li>
          );
        })}
      </ul>
      <form
        className="mt-6 flex flex-col gap-2 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          const name = String(fd.get("name") ?? "").trim();
          if (!name) return;
          createFolder(name);
          e.currentTarget.reset();
        }}
      >
        <input
          name="name"
          placeholder="New folder name"
          className="min-h-12 flex-1 rounded-xl border border-stone-200 bg-white px-4 outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-500/15 dark:border-stone-700 dark:bg-stone-900"
        />
        <button
          type="submit"
          className="inline-flex min-h-12 items-center justify-center rounded-xl border border-stone-300 bg-white px-5 font-medium hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-900 dark:hover:bg-stone-800"
        >
          Add Folder
        </button>
      </form>
    </AppShell>
  );
}
