"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { HomeActions } from "@/components/home/HomeActions";
import { NewMenu } from "@/components/library/NewMenu";
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
      <AppShell showBack={false}>
        <p className="text-stone-500">Loading…</p>
      </AppShell>
    );
  }

  return (
    <AppShell showBack={false} trailing={<NewMenu context="library" />}>
      <div className="mb-10 pt-4 text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-stone-900 text-3xl font-serif text-white dark:bg-stone-100 dark:text-stone-900">
          א
        </div>
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Annotate. Translate.
        </h2>
        <p className="mx-auto mt-3 max-w-sm text-base leading-relaxed text-stone-500 dark:text-stone-400">
          Import PDFs, organize in folders, and work with Apple Pencil — saved
          locally on your device.
        </p>
      </div>
      <HomeActions
        continueHref={continueTarget?.href}
        continueLabel={continueTarget?.label}
      />
    </AppShell>
  );
}
