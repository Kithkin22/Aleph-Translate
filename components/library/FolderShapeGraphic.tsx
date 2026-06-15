"use client";

import { folderColor, type FolderColorId } from "@/lib/library/appearance";

interface FolderShapeGraphicProps {
  colorId?: FolderColorId;
  className?: string;
  /** When true, stretch to fill container (folder cards). When false, keep proportions (icons). */
  stretch?: boolean;
}

/**
 * GoodNotes-style folder shape — wide tab, rounded corners, thick outline, two-tone fill.
 * Matches the Aleph folder reference: back tab + front panel + depth lip.
 */
export function FolderShapeGraphic({
  colorId,
  className = "",
  stretch = false,
}: FolderShapeGraphicProps) {
  const { front, back, depth } = folderColor(colorId);

  return (
    <svg
      viewBox="0 0 96 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      preserveAspectRatio={stretch ? "none" : "xMidYMid meet"}
      aria-hidden
    >
      {/* Back panel + tab (darker) */}
      <path
        d="M14 28 V18 C14 11 19 6 27 6 H35 C37 6 39 4 43 2 H73 C83 2 90 9 90 18 V64 C90 69 86 72 81 72 H15 C10 72 6 68 6 63 V28 H14 Z"
        fill={back}
        className="stroke-gray-900 dark:stroke-gray-100"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      {/* Front panel (lighter) */}
      <rect
        x="4"
        y="24"
        width="88"
        height="44"
        rx="11"
        fill={front}
        className="stroke-gray-900 dark:stroke-gray-100"
        stroke="currentColor"
        strokeWidth="3.5"
      />
      {/* Bottom depth lip */}
      <rect x="12" y="56" width="72" height="8" rx="4" fill={depth} />
    </svg>
  );
}
