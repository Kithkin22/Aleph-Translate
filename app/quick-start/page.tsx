"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { NewChapterForm } from "@/components/translation/NewChapterForm";
import { useLibraryInit } from "@/hooks/useLibraryInit";
import { createQuickStartPage, pagePath } from "@/lib/library/storage";
import { defaultTitle, parseVerses } from "@/lib/text/parseVerses";

export default function QuickStartPage() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [chapterName, setChapterName] = useState("");
  const ready = useLibraryInit();

  function handleStart(text: string) {
    setBusy(true);
    try {
      const parsed = parseVerses(text);
      const title = defaultTitle(parsed, text);
      const page = createQuickStartPage({
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
      <AppShell title="New Chapter" backHref="/">
        <p className="text-stone-500">Loading…</p>
      </AppShell>
    );
  }

  return (
    <AppShell title="New Chapter" backHref="/">
      <NewChapterForm
        busy={busy}
        chapterName={chapterName}
        onChapterNameChange={setChapterName}
        onStart={handleStart}
        hint="Paste your text and start translating right away. You can assign a folder and notebook later from the workspace."
      />
    </AppShell>
  );
}
