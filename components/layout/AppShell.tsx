import Link from "next/link";
import { AppShellBackButton } from "@/components/layout/AppShellBackButton";
import { AppShellHeaderActions } from "@/components/layout/AppShellHeaderActions";
import { AppShellHomeButton } from "@/components/layout/AppShellHomeButton";

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
  backHref?: string;
  showBack?: boolean;
  trailing?: React.ReactNode;
}

export function AppShell({
  children,
  title,
  backHref = "/",
  showBack = true,
  trailing,
}: AppShellProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-[#f5f5f7] text-stone-900 dark:bg-stone-950 dark:text-stone-100">
      <header className="sticky top-0 z-10 border-b border-stone-200/60 bg-[#f5f5f7]/90 backdrop-blur-md dark:border-stone-800 dark:bg-stone-950/90 pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex h-14 max-w-3xl items-center gap-2 px-4 sm:gap-3 sm:px-6">
          {/* Left cluster — Mac menu bar style: Home first, then Back */}
          <div className="flex shrink-0 items-center gap-0.5">
            <AppShellHomeButton />
            {showBack ? <AppShellBackButton backHref={backHref} /> : null}
          </div>

          {title ? (
            <h1 className="min-w-0 flex-1 truncate text-lg font-semibold">{title}</h1>
          ) : (
            <span className="min-w-0 flex-1 truncate text-lg font-semibold tracking-tight">
              Aleph Translate
            </span>
          )}

          <div className="flex shrink-0 items-center gap-1">
            <Link
              href="/library"
              className="inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-200/80 dark:text-stone-400 dark:hover:bg-stone-800"
            >
              Library
            </Link>
            <AppShellHeaderActions trailing={trailing} />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:px-6">
        {children}
      </main>
    </div>
  );
}
