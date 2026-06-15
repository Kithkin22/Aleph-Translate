import { folderColor, type FolderColorId } from "@/lib/library/appearance";

interface GoodNotesFolderIconProps {
  colorId?: FolderColorId;
  size?: number;
  className?: string;
}

const STROKE = "#000000";
const STROKE_WIDTH = 3.5;

/** Two-tone folder with black outline — matches Aleph library folder style. */
export function GoodNotesFolderIcon({
  colorId,
  size = 100,
  className = "",
}: GoodNotesFolderIconProps) {
  const { front, back, depth } = folderColor(colorId);
  const height = Math.round(size * 0.75);

  return (
    <svg
      width={size}
      height={height}
      viewBox="0 0 96 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      {/* Back panel + tab (darker) */}
      <path
        d="M14 28 V18 C14 11 19 6 27 6 H35 C37 6 39 4 43 2 H73 C83 2 90 9 90 18 V64 C90 69 86 72 81 72 H15 C10 72 6 68 6 63 V28 H14 Z"
        fill={back}
        stroke={STROKE}
        strokeWidth={STROKE_WIDTH}
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
        stroke={STROKE}
        strokeWidth={STROKE_WIDTH}
      />
      {/* Bottom depth bar */}
      <rect x="12" y="56" width="72" height="8" rx="4" fill={depth} />
    </svg>
  );
}
