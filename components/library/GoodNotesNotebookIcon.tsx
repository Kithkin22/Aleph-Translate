import {
  notebookPaper,
  type NotebookPaper,
} from "@/lib/library/appearance";

interface GoodNotesNotebookIconProps {
  paper?: NotebookPaper;
  size?: number;
  className?: string;
  /** Show faint ruled lines on white paper (empty notebook). */
  showLines?: boolean;
}

/** GoodNotes-style notebook cover — solid black or white. */
export function GoodNotesNotebookIcon({
  paper = "white",
  size = 100,
  className = "",
  showLines = true,
}: GoodNotesNotebookIconProps) {
  const style = notebookPaper(paper);
  const height = Math.round(size * 1.15);
  const isBlack = paper === "black";

  return (
    <svg
      width={size}
      height={height}
      viewBox="0 0 100 115"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <rect
        x="8"
        y="4"
        width="84"
        height="107"
        rx="8"
        fill={isBlack ? "#1C1C1E" : style.page}
        stroke={isBlack ? "#2C2C2E" : "#D1D1D6"}
        strokeWidth="1"
      />
      {isBlack ? (
        <>
          <rect x="8" y="4" width="84" height="20" rx="8" fill="white" opacity="0.06" />
          <ellipse cx="82" cy="16" rx="6" ry="6" fill="none" stroke="#6B6B6B" strokeWidth="1.2" />
        </>
      ) : (
        <>
          {showLines
            ? [32, 42, 52, 62, 72, 82, 92].map((y) => (
                <line
                  key={y}
                  x1="20"
                  y1={y}
                  x2="80"
                  y2={y}
                  stroke={style.line}
                  strokeWidth="0.8"
                />
              ))
            : null}
          <rect x="16" y="20" width="50" height="6" rx="2" fill="#E5E5EA" opacity="0.8" />
          <rect x="16" y="30" width="68" height="4" rx="1" fill="#E5E5EA" opacity="0.5" />
        </>
      )}
    </svg>
  );
}
