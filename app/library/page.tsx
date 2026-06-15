"use client";

import { AppShell } from "@/components/layout/AppShell";
import { FolderGrid } from "@/components/library/FolderGrid";
import { NewMenu } from "@/components/library/NewMenu";
import { useLibraryFolders } from "@/hooks/useLibraryFolders";

export default function LibraryPage() {
  const { ready } = useLibraryFolders();

  if (!ready) {
    return (
      <AppShell title="Library">
        <p className="text-stone-500">Loading…</p>
      </AppShell>
    );
  }

  return (
    <AppShell title="Library" trailing={<NewMenu context="library" />}>
      <FolderGrid />
    </AppShell>
  );
}
