import Link from "next/link";
import { AppShellBackButton } from "@/components/layout/AppShellBackButton";
import { AppShellHeaderActions } from "@/components/layout/AppShellHeaderActions";

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
    <div className="flex min-h-dvh flex-col bg-stone-50 text-stone-900 dark:bg-stone-950 dark:text-stone-100">
      <header className="sticky top-0 z-10 border-b border-stone-200/80 bg-stone-50/95 backdrop-blur-sm dark:border-stone-800 dark:bg-stone-950/95 pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex h-14 max-w-3xl items-center gap-3 px-4 sm:px-6">
          {showBack ? (
            <AppShellBackButton backHref={backHref} />
          ) : (
            <span className="min-w-11 shrink-0" aria-hidden />
          )}
          {title ? (
            <h1 className="min-w-0 flex-1 truncate text-lg font-semibold">{title}</h1>
          ) : (
            <Link
              href="/"
              className="min-w-0 flex-1 truncate text-lg font-semibold tracking-tight"
            >
              Aleph Translate
            </Link>
          )}
          <AppShellHeaderActions trailing={trailing} />
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:px-6">
        {children}
      </main>
    </div>
  );
}
