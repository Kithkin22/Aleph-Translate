"use client";

import { useEffect } from "react";
import { useSyncExternalStore } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { HomeActions } from "@/components/home/HomeActions";
import {
  ensureLibrary,
  getLastLocation,
  getPage,
  lastLocationPath,
  subscribeStorage,
} from "@/lib/library/storage";

function getContinue() {
  const path = lastLocationPath();
  if (!path) return null;
  const loc = getLastLocation();
  if (!loc) return null;
  const page = getPage(loc.pageId);
  if (!page) return null;
  return { href: path, label: `${page.name}` };
}

export default function HomePage() {
  useEffect(() => {
    ensureLibrary();
  }, []);

  const continueTarget = useSyncExternalStore(
    subscribeStorage,
    getContinue,
    () => null,
  );

  return (
    <AppShell>
      <div className="mb-8">
        <p className="text-sm font-medium uppercase tracking-wider text-amber-700 dark:text-amber-400">
          Aleph Translate 1.0
        </p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight">
          Read. Translate. Notes.
        </h2>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-stone-600 dark:text-stone-400">
          Organize work in folders and notebooks — Hebrew, Greek, and beyond.
          Every chapter autosaves locally on your iPad or desktop.
        </p>
      </div>
      <HomeActions
        continueHref={continueTarget?.href}
        continueLabel={continueTarget?.label}
      />
    </AppShell>
  );
}
