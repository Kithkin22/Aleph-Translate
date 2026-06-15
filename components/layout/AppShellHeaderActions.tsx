"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface AppShellHeaderActionsProps {
  trailing?: React.ReactNode;
}

export function AppShellHeaderActions({ trailing }: AppShellHeaderActionsProps) {
  const pathname = usePathname();
  const onHome = pathname === "/";

  return (
    <nav className="flex shrink-0 items-center gap-1">
      {trailing}
      <Link
        href="/library"
        className="inline-flex min-h-11 items-center rounded-xl px-3 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-200/70 dark:text-stone-400 dark:hover:bg-stone-800"
      >
        Library
      </Link>
      {!onHome ? (
        <Link
          href="/"
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl text-stone-600 transition-colors hover:bg-stone-200/70 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100"
          aria-label="Home"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V9.5z" />
          </svg>
        </Link>
      ) : null}
    </nav>
  );
}
