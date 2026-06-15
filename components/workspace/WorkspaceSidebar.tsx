"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { WorkspaceFolderSummary } from "@/lib/library/workspaceData";
import {
  IconClock,
  IconDocuments,
  IconOverview,
  IconSettings,
  IconStar,
  IconTrash,
  WorkspaceFolderIcon,
} from "@/components/workspace/WorkspaceIcons";

interface WorkspaceSidebarProps {
  folderCounts: WorkspaceFolderSummary[];
  counts: {
    all: number;
    recent: number;
    favorites: number;
    trash: number;
  };
}

function NavItem({
  href,
  icon,
  label,
  count,
  active,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  count?: number;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex min-h-9 items-center gap-2.5 rounded-md px-2.5 text-sm transition ${
        active
          ? "bg-blue-50 font-medium text-blue-600"
          : "text-gray-700 hover:bg-gray-100"
      }`}
    >
      <span className={active ? "text-blue-600" : "text-gray-500"}>{icon}</span>
      <span className="flex-1">{label}</span>
      {count !== undefined ? (
        <span className="text-xs tabular-nums text-gray-400">{count}</span>
      ) : null}
    </Link>
  );
}

export function WorkspaceSidebar({ folderCounts, counts }: WorkspaceSidebarProps) {
  const pathname = usePathname();
  const onOverview = pathname === "/";

  return (
    <aside className="hidden w-[240px] shrink-0 flex-col border-r border-gray-200 bg-[#f8f9fa] pt-[env(safe-area-inset-top)] md:flex">
      <div className="flex items-center gap-2.5 border-b border-gray-200 px-4 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gray-900 text-sm font-serif text-white">
          א
        </div>
        <span className="text-[15px] font-semibold text-gray-900">Aleph Translate</span>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-2 py-3">
        <NavItem
          href="/"
          icon={<IconOverview />}
          label="Overview"
          active={onOverview}
        />

        <p className="mb-1 mt-4 px-2.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
          Library
        </p>
        <NavItem
          href="/library"
          icon={<IconDocuments />}
          label="All Documents"
          count={counts.all}
        />
        <NavItem
          href="/library"
          icon={<IconClock />}
          label="Recent"
          count={counts.recent}
        />
        <NavItem
          href="/"
          icon={<IconStar />}
          label="Favorites"
          count={counts.favorites}
        />
        <NavItem
          href="/"
          icon={<IconTrash />}
          label="Trash"
          count={counts.trash}
        />

        <div className="mb-1 mt-4 flex items-center justify-between px-2.5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
            Folders
          </p>
          <Link
            href="/library"
            className="text-xs font-medium text-blue-600 hover:text-blue-700"
            aria-label="Manage folders"
          >
            +
          </Link>
        </div>
        {folderCounts.length === 0 ? (
          <p className="px-2.5 text-xs text-gray-400">No folders yet</p>
        ) : (
          folderCounts.map((folder) => (
            <Link
              key={folder.id}
              href={`/library/${folder.id}`}
              className="flex min-h-9 items-center gap-2.5 rounded-md px-2.5 text-sm text-gray-700 hover:bg-gray-100"
            >
              <WorkspaceFolderIcon />
              <span className="flex-1 truncate">{folder.name}</span>
              <span className="text-xs tabular-nums text-gray-400">
                {folder.documentCount}
              </span>
            </Link>
          ))
        )}
      </nav>

      <div className="border-t border-gray-200 p-2">
        <button
          type="button"
          className="flex min-h-9 w-full items-center gap-2.5 rounded-md px-2.5 text-sm text-gray-700 hover:bg-gray-100"
          disabled
        >
          <IconSettings className="text-gray-500" />
          Settings
        </button>
      </div>
    </aside>
  );
}
