"use client";

import { useSyncExternalStore } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { HomeActions } from "@/components/home/HomeActions";
import { getLastOpenedId, listProjects, subscribeStorage } from "@/lib/storage/projects";

function getLastOpened() {
  const id = getLastOpenedId();
  if (!id) return null;
  const entry = listProjects().find((p) => p.id === id);
  return entry ? { id: entry.id, title: entry.title } : null;
}

export default function HomePage() {
  const lastOpened = useSyncExternalStore(
    subscribeStorage,
    getLastOpened,
    () => null,
  );

  return (
    <AppShell>
      <div className="mb-8">
        <p className="text-sm font-medium uppercase tracking-wider text-amber-700 dark:text-amber-400">
          Translation workspace
        </p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight">
          Read. Translate. Notes.
        </h2>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-stone-600 dark:text-stone-400">
          An iPad-friendly workspace for Hebrew and Greek translation practice.
          Projects autosave locally in your browser.
        </p>
      </div>
      <HomeActions
        lastOpenedId={lastOpened?.id}
        lastOpenedTitle={lastOpened?.title}
      />
    </AppShell>
  );
}
