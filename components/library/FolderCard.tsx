"use client";

import Link from "next/link";
import { FolderShapeGraphic } from "@/components/library/FolderShapeGraphic";
import { formatEditedLabel } from "@/lib/library/formatTime";
import type { FolderColorId } from "@/lib/library/appearance";

interface FolderCardProps {
  href: string;
  name: string;
  notebookCount: number;
  updatedAt: string;
  colorId?: FolderColorId;
  className?: string;
}

/**
 * Large folder-shaped navigation card — the folder IS the card.
 * Name, notebook count, and last modified sit on the folder body.
 */
export function FolderCard({
  href,
  name,
  notebookCount,
  updatedAt,
  colorId,
  className = "",
}: FolderCardProps) {
  const notebookLabel =
    notebookCount === 1 ? "1 notebook" : `${notebookCount} notebooks`;

  return (
    <Link
      href={href}
      className={`group block w-full min-h-[152px] touch-manipulation transition-transform duration-150 hover:scale-[1.02] active:scale-[0.97] ${className}`}
    >
      <div className="relative aspect-[5/4] w-full min-h-[152px]">
        <FolderShapeGraphic
          colorId={colorId}
          stretch
          className="absolute inset-0 h-full w-full drop-shadow-sm transition-shadow group-hover:drop-shadow-md"
        />
        <div className="absolute inset-0 flex flex-col justify-end px-4 pb-4 pt-14 text-left sm:px-5 sm:pb-5">
          <p className="truncate text-base font-semibold leading-tight text-gray-900 dark:text-gray-900">
            {name}
          </p>
          <p className="mt-1 text-sm font-medium text-gray-800/90 dark:text-gray-800">
            {notebookLabel}
          </p>
          <p className="mt-1.5 truncate text-xs text-gray-600/90 dark:text-gray-700">
            {formatEditedLabel(updatedAt)}
          </p>
        </div>
      </div>
    </Link>
  );
}
