"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { NewMenu } from "@/components/library/NewMenu";
import { NotebookList } from "@/components/library/NotebookList";
import { useLibraryInit } from "@/hooks/useLibraryInit";
import { getFolder } from "@/lib/library/storage";

export default function FolderPage() {
  const params = useParams<{ folderId: string }>();
  const ready = useLibraryInit();
  const folder = ready ? getFolder(params.folderId) : null;

  if (!ready) {
    return (
      <AppShell title="Documents" backHref="/library">
        <p className="text-stone-500">Loading…</p>
      </AppShell>
    );
  }

  if (!folder) {
    return (
      <AppShell title="Documents" backHref="/library">
        <p className="text-stone-500">Folder not found.</p>
        <Link href="/library" className="mt-4 inline-block text-sky-600 underline">
          Back to Documents
        </Link>
      </AppShell>
    );
  }

  return (
    <AppShell
      title={folder.name}
      backHref="/library"
      trailing={<NewMenu context="folder" folderId={folder.id} />}
    >
      <NotebookList folderId={folder.id} />
    </AppShell>
  );
}
