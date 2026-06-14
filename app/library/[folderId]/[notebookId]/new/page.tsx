"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { SourceInput } from "@/components/translation/SourceInput";
import { useLibraryInit } from "@/hooks/useLibraryInit";
import {
  createPage,
  getFolder,
  getNotebook,
  pagePath,
} from "@/lib/library/storage";
import { defaultTitle, parseVerses } from "@/lib/text/parseVerses";

export default function NewChapterPage() {
  const params = useParams<{ folderId: string; notebookId: string }>();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [chapterName, setChapterName] = useState("");
  const ready = useLibraryInit();

  const folder = ready ? getFolder(params.folderId) : null;
  const notebook = ready ? getNotebook(params.notebookId) : null;

  function handleStart(text: string) {
    if (!folder || !notebook) return;
    setBusy(true);
    try {
      const parsed = parseVerses(text);
      const title = defaultTitle(parsed, text);
      const page = createPage({
        folderId: folder.id,
        notebookId: notebook.id,
        name: chapterName.trim() || title,
        title,
        sourceLanguage: parsed.sourceLanguage,
        verses: parsed.verses,
        passageRef: parsed.passageRef,
      });
      router.push(pagePath(page));
    } catch {
      setBusy(false);
      alert("Could not save chapter. Your browser storage may be full.");
    }
  }

  if (!ready) {
    return (
      <AppShell title="New Chapter" backHref="/library">
        <p className="text-stone-500">Loading…</p>
      </AppShell>
    );
  }

  if (!folder || !notebook) {
    return (
      <AppShell title="New Chapter" backHref="/library">
        <p className="text-stone-500">Notebook not found.</p>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="New Chapter"
      backHref={`/library/${folder.id}/${notebook.id}`}
    >
      <p className="mb-4 text-base text-stone-600 dark:text-stone-400">
        Adding to <strong>{notebook.name}</strong> in {folder.name}. Paste
        Logos-formatted text — verses split automatically.
      </p>
      <label className="mb-4 flex flex-col gap-2">
        <span className="text-sm font-medium text-stone-600 dark:text-stone-400">
          Chapter name (optional)
        </span>
        <input
          value={chapterName}
          onChange={(e) => setChapterName(e.target.value)}
          placeholder="e.g. Job 1"
          className="min-h-12 rounded-xl border border-stone-200 bg-white px-4 outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-500/15 dark:border-stone-700 dark:bg-stone-900"
        />
      </label>
      <SourceInput onStart={handleStart} busy={busy} />
    </AppShell>
  );
}
