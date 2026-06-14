"use client";

import { AppShell } from "@/components/layout/AppShell";

export default function LibraryError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <AppShell title="Library" backHref="/">
      <p className="text-stone-700 dark:text-stone-300">
        Something went wrong loading your library.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-4 inline-flex min-h-12 items-center rounded-xl bg-amber-600 px-5 font-semibold text-white hover:bg-amber-500"
      >
        Try again
      </button>
    </AppShell>
  );
}
