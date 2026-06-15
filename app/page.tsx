"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { HomeActions } from "@/components/home/HomeActions";
import {
  ensureLibrary,
  getLastLocation,
  getPage,
  lastLocationPath,
  subscribeStorage,
} from "@/lib/library/storage";

interface ContinueTarget {
  href: string;
  label: string;
}

function readContinueTarget(): ContinueTarget | null {
  try {
    const path = lastLocationPath();
    if (!path) return null;
    const loc = getLastLocation();
    if (!loc) return null;
    const page = getPage(loc.pageId);
    if (!page) return null;
    return { href: path, label: page.name };
  } catch {
    return null;
  }
}

export default function HomePage() {
  const [continueTarget, setContinueTarget] = useState<ContinueTarget | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    function refresh() {
      try {
        ensureLibrary();
        setContinueTarget(readContinueTarget());
      } catch {
        setContinueTarget(null);
      }
    }
    refresh();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mount gate for localStorage
    setReady(true);
    return subscribeStorage(refresh);
  }, []);

  if (!ready) {
    return (
      <AppShell>
        <p className="text-stone-500">Loading…</p>
      </AppShell>
    );
  }

  return (
    <AppShell showBack={false}>
      <div className="mb-8">
        <p className="text-sm font-medium uppercase tracking-wider text-amber-700 dark:text-amber-400">
          Aleph Translate 1.0
        </p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight">
          Read. Translate. Notes.
        </h2>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-stone-600 dark:text-stone-400">
          Organize annotated PDFs in folders and notebooks. Everything autosaves
          locally on your iPad or desktop.
        </p>
      </div>
      <HomeActions
        continueHref={continueTarget?.href}
        continueLabel={continueTarget?.label}
      />
    </AppShell>
  );
}
