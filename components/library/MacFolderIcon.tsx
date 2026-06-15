"use client";

import { useId } from "react";
import { folderColor, type FolderColorId } from "@/lib/library/appearance";

interface MacFolderIconProps {
  colorId?: FolderColorId;
  size?: number;
  className?: string;
}

/**
 * macOS Finder–style folder icon — soft gradient, tab, gloss highlight, no outline.
 */
export function MacFolderIcon({
  colorId,
  size = 100,
  className = "",
}: MacFolderIconProps) {
  const uid = useId().replace(/:/g, "");
  const colors = folderColor(colorId);
  const height = Math.round(size * 0.79);

  const bodyGrad = `${uid}-body`;
  const tabGrad = `${uid}-tab`;

  return (
    <svg
      width={size}
      height={height}
      viewBox="0 0 88 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id={bodyGrad} x1="44" y1="8" x2="44" y2="68" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={colors.front} />
          <stop offset="45%" stopColor={colors.front} />
          <stop offset="100%" stopColor={colors.back} />
        </linearGradient>
        <linearGradient id={tabGrad} x1="30" y1="6" x2="30" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={colors.front} />
          <stop offset="100%" stopColor={colors.back} stopOpacity="0.92" />
        </linearGradient>
        <filter id={`${uid}-shadow`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.14" />
        </filter>
      </defs>

      {/* Ground shadow */}
      <ellipse cx="44" cy="69" rx="30" ry="2.8" fill="#000000" opacity="0.1" />

      {/* Back panel (depth behind tab) */}
      <path
        d="M10 30 C10 24 14 20 20 20 H32 C34 20 36 18 39 14 H66 C73 14 78 19 78 26 V60 C78 65 74 69 68 69 H20 C14 69 10 65 10 60 V30 Z"
        fill={colors.back}
        opacity="0.38"
      />

      {/* Tab */}
      <path
        d="M8 28 C8 22 12 18 18 18 H30 C32 18 34 16 37 12 H62 C68 12 72 16 72 22 V30 H8 Z"
        fill={`url(#${tabGrad})`}
        filter={`url(#${uid}-shadow)`}
      />

      {/* Main body */}
      <path
        d="M8 30 H80 V60 C80 65 76 69 70 69 H18 C12 69 8 65 8 60 V30 Z"
        fill={`url(#${bodyGrad})`}
        filter={`url(#${uid}-shadow)`}
      />

      {/* Top gloss strip */}
      <rect x="14" y="33" width="60" height="5" rx="2.5" fill="#FFFFFF" opacity="0.3" />

      {/* Subtle inner fold line */}
      <path
        d="M8 30 H80"
        stroke="#FFFFFF"
        strokeOpacity="0.2"
        strokeWidth="0.75"
      />
    </svg>
  );
}

/** @deprecated Use MacFolderIcon — kept for existing imports */
export const GoodNotesFolderIcon = MacFolderIcon;

/** @deprecated Use MacFolderIcon */
export const FinderFolderIcon = MacFolderIcon;
