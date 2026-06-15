"use client";

import Link from "next/link";
import { GoodNotesFolderIcon } from "@/components/library/GoodNotesFolderIcon";
import { GoodNotesNotebookIcon } from "@/components/library/GoodNotesNotebookIcon";
import { formatRelativeTime } from "@/lib/library/formatTime";

interface LibraryGridItemProps {
  href: string;
  name: string;
  updatedAt: string;
  children: React.ReactNode;
}

export function LibraryGridItem({ href, name, updatedAt, children }: LibraryGridItemProps) {
  return (
    <Link
      href={href}
      className="group flex w-full flex-col items-center rounded-2xl p-2 transition active:scale-[0.98]"
    >
        <div className="mb-2 flex h-[115px] items-end justify-center sm:h-[130px]">
          {children}
        </div>
        <div className="flex w-full max-w-[140px] items-center justify-center gap-0.5">
          <span className="truncate text-center text-sm font-medium text-stone-800 dark:text-stone-100">
            {name}
          </span>
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className="shrink-0 text-sky-500"
            aria-hidden
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
        <p className="mt-0.5 text-xs text-stone-400 dark:text-stone-500">
          {formatRelativeTime(updatedAt)}
        </p>
    </Link>
  );
}

export { GoodNotesFolderIcon, GoodNotesNotebookIcon };
