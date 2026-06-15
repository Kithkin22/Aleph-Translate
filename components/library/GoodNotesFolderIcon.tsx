import { folderColor, type FolderColorId } from "@/lib/library/appearance";

interface GoodNotesFolderIconProps {
  colorId?: FolderColorId;
  size?: number;
  className?: string;
}

/** GoodNotes-style rounded folder icon. */
export function GoodNotesFolderIcon({
  colorId,
  size = 100,
  className = "",
}: GoodNotesFolderIconProps) {
  const colors = folderColor(colorId);
  const height = Math.round(size * 0.72);
  const uid = colorId ?? "blue";

  return (
    <svg
      width={size}
      height={height}
      viewBox="0 0 100 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id={`gn-folder-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={colors.tab} />
          <stop offset="100%" stopColor={colors.body} />
        </linearGradient>
      </defs>
      <rect x="4" y="16" width="92" height="52" rx="10" fill={`url(#gn-folder-${uid})`} />
      <path
        d="M12 16 C12 10 16 8 22 8 H42 C46 8 48 6 52 4 H78 C86 4 92 10 92 16 H12 Z"
        fill={colors.tab}
      />
      <rect x="4" y="22" width="92" height="8" rx="2" fill="white" opacity="0.15" />
    </svg>
  );
}
