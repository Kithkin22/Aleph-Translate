import { folderColor, type FolderColorId } from "@/lib/library/appearance";

interface FinderFolderIconProps {
  colorId?: FolderColorId;
  size?: number;
  className?: string;
}

/** macOS Finder–style folder icon with customizable color. */
export function FinderFolderIcon({
  colorId,
  size = 72,
  className = "",
}: FinderFolderIconProps) {
  const colors = folderColor(colorId);
  const height = Math.round(size * 0.78);

  return (
    <svg
      width={size}
      height={height}
      viewBox="0 0 72 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id={`folder-body-${colorId ?? "blue"}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={colors.tab} />
          <stop offset="100%" stopColor={colors.body} />
        </linearGradient>
        <linearGradient id={`folder-tab-${colorId ?? "blue"}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={colors.tab} />
          <stop offset="100%" stopColor={colors.body} stopOpacity="0.9" />
        </linearGradient>
      </defs>
      {/* Shadow */}
      <ellipse cx="36" cy="52" rx="28" ry="3" fill={colors.shadow} opacity="0.25" />
      {/* Back panel */}
      <path
        d="M6 18 C6 14 9 12 13 12 H28 C30 12 32 11 34 9 H58 C62 9 66 12 66 16 V46 C66 50 63 52 59 52 H13 C9 52 6 49 6 45 Z"
        fill={colors.shadow}
        opacity="0.35"
      />
      {/* Tab */}
      <path
        d="M8 20 C8 16 11 14 15 14 H30 C32 14 34 13 36 11 H56 C60 11 62 13 62 16 V22 H8 Z"
        fill={`url(#folder-tab-${colorId ?? "blue"})`}
      />
      {/* Front body */}
      <path
        d="M6 22 H66 V46 C66 50 63 52 59 52 H13 C9 52 6 49 6 45 Z"
        fill={`url(#folder-body-${colorId ?? "blue"})`}
      />
      {/* Highlight */}
      <path
        d="M10 26 H62 V30 H10 Z"
        fill="white"
        opacity="0.18"
      />
    </svg>
  );
}
