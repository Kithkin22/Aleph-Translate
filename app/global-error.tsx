"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  return (
    <html lang="en">
      <body className="flex min-h-dvh flex-col items-center justify-center bg-stone-950 px-6 text-stone-100">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-stone-700">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
            >
              <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold">This page couldn&apos;t load</h1>
          <p className="mt-3 text-stone-400">
            Aleph Translate hit an unexpected error. Reload to try again, or go back.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={reset}
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-white px-8 font-semibold text-stone-950 hover:bg-stone-200"
            >
              Reload
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-stone-600 px-8 font-semibold text-stone-100 hover:bg-stone-900"
            >
              Back
            </button>
          </div>
          <Link
            href="/"
            className="mt-6 inline-block text-sm text-amber-400 underline underline-offset-4"
          >
            Go to home
          </Link>
        </div>
      </body>
    </html>
  );
}
