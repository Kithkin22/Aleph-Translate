"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";

export default function RootError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  return (
    <AppShell title="Error" backHref="/">
      <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center dark:border-stone-800 dark:bg-stone-900">
        <p className="text-lg font-semibold">This page couldn&apos;t load</p>
        <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
          Reload to try again, or go back to continue elsewhere.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={reset}
            className="inline-flex min-h-12 items-center justify-center rounded-xl bg-amber-600 px-6 font-semibold text-white hover:bg-amber-500"
          >
            Reload
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex min-h-12 items-center justify-center rounded-xl border border-stone-300 px-6 font-semibold hover:bg-stone-50 dark:border-stone-700 dark:hover:bg-stone-800"
          >
            Back
          </button>
        </div>
        <Link
          href="/"
          className="mt-4 inline-block text-sm font-medium text-amber-700 underline dark:text-amber-400"
        >
          Go to home
        </Link>
      </div>
    </AppShell>
  );
}
