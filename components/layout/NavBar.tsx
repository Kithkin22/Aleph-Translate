import Link from "next/link";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/my-shifts", label: "My Shifts" },
  { href: "/swaps", label: "Swaps" },
];

export function NavBar() {
  return (
    <nav className="flex flex-wrap gap-2">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-teal-500 hover:text-teal-700 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:hover:border-teal-400 dark:hover:text-teal-300"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
