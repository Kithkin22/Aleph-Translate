"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { EditableName } from "@/components/library/EditableName";
import { NotebookList } from "@/components/library/NotebookList";
import { useLibraryInit } from "@/hooks/useLibraryInit";
import { getFolder, renameFolder } from "@/lib/library/storage";

export default function FolderPage() {
  const params = useParams<{ folderId: string }>();
  const ready = useLibraryInit();
  const folder = ready ? getFolder(params.folderId) : null;

  if (!ready) {
    return (
      <AppShell title="Library" backHref="/library">
        <p className="text-stone-500">Loading…</p>
      </AppShell>
    );
  }

  if (!folder) {
    return (
      <AppShell title="Library" backHref="/library">
        <p className="text-stone-500">Folder not found.</p>
        <Link href="/library" className="mt-4 inline-block text-amber-700 underline">
          Back to Library
        </Link>
      </AppShell>
    );
  }

  return (
    <AppShell title={folder.name} backHref="/library">
      <div className="mb-6">
        <EditableName
          value={folder.name}
          onSave={(name) => renameFolder(folder.id, name)}
          className="text-2xl font-semibold"
          ariaLabel="Folder name"
        />
        <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
          Drag notebooks to rearrange. Tap ··· to set paper color and cover.
        </p>
      </div>
      <NotebookList folderId={folder.id} />
    </AppShell>
  );
}
