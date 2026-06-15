import {
  folderColor,
  notebookPaper,
  type FolderColorId,
  type NotebookPaper,
} from "@/lib/library/appearance";

interface NotebookIconProps {
  paper?: NotebookPaper;
  colorId?: FolderColorId;
  size?: number;
  className?: string;
}

/** Notebook icon with white or black paper and colored cover. */
export function NotebookIcon({
  paper = "white",
  colorId,
  size = 72,
  className = "",
}: NotebookIconProps) {
  const paperStyle = notebookPaper(paper);
  const cover = folderColor(colorId);
  const height = Math.round(size * 0.88);

  return (
    <svg
      width={size}
      height={height}
      viewBox="0 0 72 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <ellipse cx="38" cy="60" rx="26" ry="3" fill="#000" opacity="0.12" />
      {/* Cover spine */}
      <rect x="10" y="8" width="14" height="52" rx="2" fill={cover.back} />
      <rect x="10" y="8" width="6" height="52" rx="1" fill={cover.depth} opacity="0.4" />
      {/* Pages stack edge */}
      <rect x="22" y="10" width="40" height="50" rx="2" fill={paperStyle.page} stroke="#C8C4BC" strokeWidth="0.5" />
      {/* Ruled lines */}
      {[20, 26, 32, 38, 44, 50].map((y) => (
        <line
          key={y}
          x1="28"
          y1={y}
          x2="56"
          y2={y}
          stroke={paperStyle.line}
          strokeWidth="0.75"
        />
      ))}
      {/* Spiral rings */}
      {[16, 24, 32, 40, 48].map((y) => (
        <ellipse
          key={y}
          cx="18"
          cy={y}
          rx="4"
          ry="2.5"
          fill="none"
          stroke={cover.depth}
          strokeWidth="1.2"
        />
      ))}
      {/* Cover highlight */}
      <rect x="22" y="10" width="40" height="6" rx="2" fill="white" opacity={paper === "white" ? 0.35 : 0.08} />
    </svg>
  );
}
