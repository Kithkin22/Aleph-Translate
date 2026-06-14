import Link from "next/link";

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
  backHref?: string;
  trailing?: React.ReactNode;
}

export function AppShell({
  children,
  title,
  backHref = "/",
  trailing,
}: AppShellProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-stone-50 text-stone-900 dark:bg-stone-950 dark:text-stone-100">
      <header className="sticky top-0 z-10 border-b border-stone-200/80 bg-stone-50/95 backdrop-blur-sm dark:border-stone-800 dark:bg-stone-950/95 pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex h-14 max-w-3xl items-center gap-3 px-4 sm:px-6">
          <Link
            href={backHref}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl text-stone-600 transition-colors hover:bg-stone-200/70 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100"
            aria-label="Back"
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
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </Link>
          {title ? (
            <h1 className="flex-1 truncate text-lg font-semibold">{title}</h1>
          ) : (
            <Link href="/" className="flex-1 text-lg font-semibold tracking-tight">
              Aleph Translate
            </Link>
          )}
          <nav className="flex items-center gap-1">
            <Link
              href="/library"
              className="inline-flex min-h-11 items-center rounded-xl px-3 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-200/70 dark:text-stone-400 dark:hover:bg-stone-800"
            >
              Library
            </Link>
            {trailing}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:px-6">
        {children}
      </main>
    </div>
  );
}
