import Link from "next/link";

const actions = [
  {
    href: "/new",
    title: "New Translation",
    description: "Paste Hebrew or Greek text and begin translating verse by verse.",
    icon: "✦",
  },
  {
    href: "/archive",
    title: "Open Saved Translation",
    description: "Continue a project you already started.",
    icon: "↩",
  },
  {
    href: "/archive",
    title: "Archive",
    description: "Browse all saved translation projects.",
    icon: "▤",
  },
] as const;

interface HomeActionsProps {
  lastOpenedId?: string | null;
  lastOpenedTitle?: string | null;
}

export function HomeActions({
  lastOpenedId,
  lastOpenedTitle,
}: HomeActionsProps) {
  return (
    <div className="flex flex-col gap-4">
      {lastOpenedId && lastOpenedTitle ? (
        <Link
          href={`/workspace/${lastOpenedId}`}
          className="rounded-2xl border border-amber-300/60 bg-amber-50 p-5 transition-colors hover:bg-amber-100/80 dark:border-amber-700/50 dark:bg-amber-950/40 dark:hover:bg-amber-950/60"
        >
          <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
            Continue where you left off
          </p>
          <p className="mt-1 truncate text-lg font-semibold">{lastOpenedTitle}</p>
        </Link>
      ) : null}

      <div className="grid gap-4 md:grid-cols-1">
        {actions.map((action) => (
          <Link
            key={action.title}
            href={action.href}
            className="group flex min-h-[88px] items-start gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition-all active:scale-[0.99] hover:border-stone-300 hover:shadow-md dark:border-stone-800 dark:bg-stone-900 dark:hover:border-stone-700"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-lg dark:bg-stone-800">
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
