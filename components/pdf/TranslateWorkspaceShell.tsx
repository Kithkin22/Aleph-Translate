"use client";

import Link from "next/link";
import type { SaveStatus } from "@/lib/types/project";

interface TranslateWorkspaceShellProps {
  title: string;
  backHref: string;
  toolbar: React.ReactNode;
  saveStatus?: SaveStatus;
  headerTrailing?: React.ReactNode;
  children: React.ReactNode;
  bottom?: React.ReactNode;
}

function saveLabel(status: SaveStatus | undefined): string {
  switch (status) {
    case "saving":
      return "Saving…";
    case "saved":
      return "Saved";
    case "error":
      return "Save failed";
    default:
      return "";
  }
}

export function TranslateWorkspaceShell({
  title,
  backHref,
  toolbar,
  saveStatus,
  headerTrailing,
  children,
  bottom,
}: TranslateWorkspaceShellProps) {
  const statusText = saveLabel(saveStatus);

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-[#f8f9fa] text-gray-900">
      <header className="sticky top-0 z-30 shrink-0 border-b border-gray-200 bg-white pt-[env(safe-area-inset-top)] shadow-sm">
        <div className="flex h-12 items-center gap-2 px-3 md:px-4">
          <Link
            href={backHref}
            className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-md text-gray-600 hover:bg-gray-100"
            aria-label="Back"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </Link>
          <h1 className="min-w-0 flex-1 truncate text-[15px] font-semibold">{title}</h1>
          <div className="flex shrink-0 items-center gap-2">
            {headerTrailing}
            {statusText ? (
              <span
                className={`text-xs tabular-nums ${
                  saveStatus === "error" ? "text-red-600" : "text-gray-400"
                }`}
              >
                {statusText}
              </span>
            ) : null}
          </div>
        </div>
        {toolbar}
      </header>

      <div className="relative min-h-0 flex-1 overflow-hidden">{children}</div>

      {bottom ? (
        <div className="shrink-0 border-t border-gray-200 bg-white pb-[env(safe-area-inset-bottom)]">
          {bottom}
        </div>
      ) : null}
    </div>
  );
}
