import Link from "next/link";

const actions = [
  {
    href: "/quick-start",
    title: "New Chapter",
    description: "Paste text and start now — assign folder and notebook later.",
    icon: "✦",
    primary: true,
  },
  {
    href: "/library",
    title: "Library",
    description: "Browse Hebrew, Greek, Inbox, and custom folders.",
    icon: "▤",
    primary: false,
  },
] as const;

interface HomeActionsProps {
  continueHref?: string | null;
  continueLabel?: string | null;
}

export function HomeActions({ continueHref, continueLabel }: HomeActionsProps) {
  return (
    <div className="flex flex-col gap-4">
      {continueHref && continueLabel ? (
        <Link
          href={continueHref}
          className="rounded-2xl border border-amber-300/60 bg-amber-50 p-5 transition-colors hover:bg-amber-100/80 dark:border-amber-700/50 dark:bg-amber-950/40 dark:hover:bg-amber-950/60"
        >
          <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
            Continue where you left off
          </p>
          <p className="mt-1 truncate text-lg font-semibold">{continueLabel}</p>
        </Link>
      ) : null}

      <div className="grid gap-4">
        {actions.map((action) => (
          <Link
            key={action.title}
            href={action.href}
            className={`group flex min-h-[88px] items-start gap-4 rounded-2xl border p-5 shadow-sm transition-all active:scale-[0.99] ${
              action.primary
                ? "border-amber-300/60 bg-amber-50/50 hover:border-amber-400 hover:shadow-md dark:border-amber-700/40 dark:bg-amber-950/20 dark:hover:border-amber-600"
                : "border-stone-200 bg-white hover:border-stone-300 hover:shadow-md dark:border-stone-800 dark:bg-stone-900 dark:hover:border-stone-700"
            }`}
          >
            <span
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg ${
                action.primary
                  ? "bg-amber-100 dark:bg-amber-900/50"
                  : "bg-stone-100 dark:bg-stone-800"
              }`}
            >
              {action.icon}
            </span>
            <span>
              <span className="block text-lg font-semibold">{action.title}</span>
              <span className="mt-1 block text-sm leading-relaxed text-stone-600 dark:text-stone-400">
                {action.description}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
