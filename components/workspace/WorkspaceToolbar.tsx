"use client";

import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import { NewMenu } from "@/components/library/NewMenu";
import { IconMore } from "@/components/workspace/WorkspaceIcons";

export function WorkspaceToolbar() {
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!moreOpen) return;
    function onPointerDown(e: PointerEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [moreOpen]);

  return (
    <div className="flex items-center justify-end gap-2 border-b border-gray-200 px-6 py-3 md:px-8">
      <Link
        href="/quick-start"
        className="inline-flex min-h-9 items-center rounded-md bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-700"
      >
        + Import PDF
      </Link>
      <div className="[&_button]:rounded-md [&_button]:border [&_button]:border-blue-600 [&_button]:bg-white [&_button]:px-4 [&_button]:font-medium [&_button]:text-blue-600 [&_button]:shadow-none [&_button]:hover:bg-blue-50">
        <NewMenu context="library" />
      </div>
      <div className="relative" ref={moreRef}>
        <button
          type="button"
          onClick={() => setMoreOpen((v) => !v)}
          className="inline-flex min-h-9 min-w-9 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
          aria-label="More actions"
        >
          <IconMore />
        </button>
        {moreOpen ? (
          <div className="absolute right-0 top-full z-50 mt-1 min-w-[160px] rounded-md border border-gray-200 bg-white py-1 shadow-lg">
            <Link
              href="/library"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              onClick={() => setMoreOpen(false)}
            >
              Open Library
            </Link>
            <Link
              href="/quick-start"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              onClick={() => setMoreOpen(false)}
            >
              Quick Start
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}
