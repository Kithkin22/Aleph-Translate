import Link from "next/link";
import { GoodNotesFolderIcon } from "@/components/library/GoodNotesFolderIcon";

interface HomeActionsProps {
  continueHref?: string | null;
  continueLabel?: string | null;
}

export function HomeActions({ continueHref, continueLabel }: HomeActionsProps) {
  return (
    <div className="flex flex-col gap-5">
      {continueHref && continueLabel ? (
        <Link
          href={continueHref}
          className="group rounded-2xl border border-sky-200 bg-white p-5 shadow-sm transition active:scale-[0.99] hover:border-sky-300 hover:shadow-md dark:border-sky-800 dark:bg-stone-900 dark:hover:border-sky-700"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-sky-600 dark:text-sky-400">
            Continue
          </p>
          <p className="mt-1 truncate text-xl font-semibold">{continueLabel}</p>
          <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
            Pick up where you left off →
          </p>
        </Link>
      ) : null}

      <Link
        href="/library"
        className="group flex flex-col items-center rounded-3xl border border-stone-200/80 bg-white px-6 py-10 shadow-sm transition active:scale-[0.99] hover:border-stone-300 hover:shadow-md dark:border-stone-800 dark:bg-stone-900"
      >
        <GoodNotesFolderIcon colorId="purple" size={96} />
        <span className="mt-4 text-xl font-semibold">Library</span>
        <span className="mt-1 text-center text-sm text-stone-500 dark:text-stone-400">
          Folders, notebooks, and annotated PDFs
        </span>
      </Link>

      <p className="text-center text-sm text-stone-400 dark:text-stone-500">
        Tap <span className="font-semibold text-sky-500">+ New</span> above to import or
        start quickly
      </p>
    </div>
  );
}
