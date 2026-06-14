"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { SourceInput } from "@/components/translation/SourceInput";
import { createProject } from "@/lib/storage/projects";

export default function NewTranslationPage() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  function handleStart(text: string) {
    setBusy(true);
    try {
      const project = createProject(text);
      router.push(`/workspace/${project.id}`);
    } catch {
      setBusy(false);
      alert("Could not save project. Your browser storage may be full.");
    }
  }

  return (
    <AppShell title="New Translation" backHref="/">
      <p className="mb-6 text-base leading-relaxed text-stone-600 dark:text-stone-400">
        Paste text copied from Logos (Fully Formatted), a digital reader, or any
        source with verse numbers. Aleph splits verses automatically and detects
        Hebrew vs Greek.
      </p>
      <SourceInput onStart={handleStart} busy={busy} />
    </AppShell>
  );
}
