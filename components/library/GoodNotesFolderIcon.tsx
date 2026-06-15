import { folderColor, type FolderColorId } from "@/lib/library/appearance";

interface GoodNotesFolderIconProps {
  colorId?: FolderColorId;
  size?: number;
  className?: string;
}

const OUTLINE = "#111111";
const OUTLINE_W = 2.8;

/**
 * GoodNotes / Mac-style folder: darker back tab, lighter front panel,
 * thick outline, rounded corners, bottom depth lip.
 */
export function GoodNotesFolderIcon({
  colorId,
  size = 100,
  className = "",
}: GoodNotesFolderIconProps) {
  const { front, back, depth } = folderColor(colorId);
  const height = Math.round(size * 0.8);

  return (
    <svg
      width={size}
      height={height}
      viewBox="0 0 100 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      {/* Back panel + tab (darker) */}
      <path
        d="M 12 34
           V 22
           C 12 15 17 10 25 10
           H 37
           C 39 10 41 8 45 6
           H 77
           C 88 6 94 12 94 22
           V 70
           C 94 75 90 78 85 78
           H 15
           C 10 78 6 74 6 69
           V 34
           H 12 Z"
        fill={back}
        stroke={OUTLINE}
        strokeWidth={OUTLINE_W}
        strokeLinejoin="round"
      />

      {/* Front pocket (lighter) */}
      <path
        d="M 4 32
           H 96
           C 98 32 99 33.5 99 36
           V 68
           C 99 73 95 76 90 76
           H 10
           C 5 76 1 72 1 67
           V 36
           C 1 33 3 32 4 32
           Z"
        fill={front}
        stroke={OUTLINE}
        strokeWidth={OUTLINE_W}
        strokeLinejoin="round"
      />

      {/* Bottom depth lip */}
      <rect x="13" y="62" width="74" height="9" rx="4.5" fill={depth} />

      {/* Soft highlight along top of front panel */}
      <path
        d="M 8 35 H 92 C 94 35 95 36 95 37.5 V 40 H 5 V 37.5 C 5 36 6 35 8 35 Z"
        fill="white"
        opacity="0.22"
      />
    </svg>
  );
}
