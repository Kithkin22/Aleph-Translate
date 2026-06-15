"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** Far-left home anchor — Mac menu bar / Word “File” placement. */
export function AppShellHomeButton() {
  const pathname = usePathname();
  const onHome = pathname === "/";

  return (
    <Link
      href="/"
      aria-label="Home"
      aria-current={onHome ? "page" : undefined}
      className={`inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-lg px-2.5 text-stone-800 transition-colors hover:bg-stone-200/80 dark:text-stone-100 dark:hover:bg-stone-800 ${
        onHome ? "bg-stone-200/90 dark:bg-stone-800" : ""
      }`}
    >
      <svg
        width="20"
        height="20"
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
      <span className="hidden text-sm font-medium sm:inline">Home</span>
    </Link>
  );
}
