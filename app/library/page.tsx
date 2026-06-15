"use client";

import { AppShell } from "@/components/layout/AppShell";
import { FolderGrid } from "@/components/library/FolderGrid";
import { useLibraryFolders } from "@/hooks/useLibraryFolders";

export default function LibraryPage() {
  const { ready } = useLibraryFolders();

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
        Folders contain notebooks; notebooks hold your annotated PDFs. Tap a
        folder to open it — drag to rearrange, ··· to change color.
      </p>
      <FolderGrid />
    </AppShell>
  );
}
