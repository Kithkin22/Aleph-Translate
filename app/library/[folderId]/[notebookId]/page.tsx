"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { EditableName } from "@/components/library/EditableName";
import { PageList } from "@/components/library/PageList";
import { useLibraryInit } from "@/hooks/useLibraryInit";
import { getFolder, getNotebook, renameNotebook } from "@/lib/library/storage";

export default function NotebookPage() {
  const params = useParams<{ folderId: string; notebookId: string }>();
  const ready = useLibraryInit();
  const folder = ready ? getFolder(params.folderId) : null;
  const notebook = ready ? getNotebook(params.notebookId) : null;

  if (!ready) {
    return (
      <AppShell title="Notebook" backHref="/library">
        <p className="text-stone-500">Loading…</p>
      </AppShell>
    );
  }

  if (!folder || !notebook) {
    return (
      <AppShell title="Notebook" backHref="/library">
        <p className="text-stone-500">Notebook not found.</p>
      </AppShell>
    );
  }

  return (
    <AppShell
      title={notebook.name}
      backHref={`/library/${folder.id}`}
      trailing={
        <Link
          href="/quick-start"
          className="inline-flex min-h-11 items-center rounded-xl bg-blue-600 px-3 text-sm font-semibold text-white hover:bg-blue-500"
        >
          Import PDF
        </Link>
      }
    >
      <div className="mb-6">
        <EditableName
          value={notebook.name}
          onSave={(name) => renameNotebook(notebook.id, name)}
          className="text-2xl font-semibold"
          ariaLabel="Notebook name"
        />
        <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
          {folder.name} · tap a document to translate
        </p>
      </div>
      <PageList folderId={folder.id} notebookId={notebook.id} />
    </AppShell>
  );
}
