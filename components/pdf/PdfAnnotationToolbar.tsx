"use client";

export type AnnotationTool = "pen" | "highlighter" | "eraser" | "pan";

interface PdfAnnotationToolbarProps {
  tool: AnnotationTool;
  onToolChange: (tool: AnnotationTool) => void;
  writingDirection: "ltr" | "rtl";
  onWritingDirectionChange: (dir: "ltr" | "rtl") => void;
  zoomLaneEnabled: boolean;
  onZoomLaneToggle: () => void;
}

function ToolButton({
  active,
  label,
  onClick,
  children,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`inline-flex min-h-10 min-w-10 items-center justify-center rounded-md transition ${
        active
          ? "bg-blue-50 text-blue-600"
          : "text-gray-600 hover:bg-gray-100"
      }`}
    >
      {children}
    </button>
  );
}

export function PdfAnnotationToolbar({
  tool,
  onToolChange,
  writingDirection,
  onWritingDirectionChange,
  zoomLaneEnabled,
  onZoomLaneToggle,
}: PdfAnnotationToolbarProps) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto border-t border-gray-100 px-3 py-1.5 md:px-4">
      <ToolButton active={tool === "pen"} label="Pen" onClick={() => onToolChange("pen")}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
        </svg>
      </ToolButton>
      <ToolButton
        active={tool === "highlighter"}
        label="Highlighter"
        onClick={() => onToolChange("highlighter")}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M9 11l-3 3a2.5 2.5 0 103.5 3.5l3-3" />
          <path d="M14 6l4 4" />
          <path d="M3 21h7l9-9a2.5 2.5 0 00-3.5-3.5L6.5 17.5 3 21z" />
        </svg>
      </ToolButton>
      <ToolButton active={tool === "eraser"} label="Eraser" onClick={() => onToolChange("eraser")}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M20 20H7L3 16l11-11 6 6-5 5" />
          <path d="M6.5 17.5l3-3" />
        </svg>
      </ToolButton>
      <ToolButton active={tool === "pan"} label="Pan" onClick={() => onToolChange("pan")}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M18 11V6a2 2 0 00-4 0v1" />
          <path d="M14 9V4a2 2 0 00-4 0v5" />
          <path d="M10 10V5a2 2 0 00-4 0v8a8 8 0 008 8h2a6 6 0 006-6v-3a2 2 0 00-4 0z" />
        </svg>
      </ToolButton>

      <div className="mx-1 h-6 w-px bg-gray-200" />

      <button
        type="button"
        onClick={() => onWritingDirectionChange("ltr")}
        className={`rounded-md px-2.5 py-1.5 text-xs font-medium ${
          writingDirection === "ltr"
            ? "bg-blue-600 text-white"
            : "text-gray-600 hover:bg-gray-100"
        }`}
      >
        LTR
      </button>
      <button
        type="button"
        onClick={() => onWritingDirectionChange("rtl")}
        className={`rounded-md px-2.5 py-1.5 text-xs font-medium ${
          writingDirection === "rtl"
            ? "bg-blue-600 text-white"
            : "text-gray-600 hover:bg-gray-100"
        }`}
      >
        RTL
      </button>

      <div className="mx-1 h-6 w-px bg-gray-200" />

      <button
        type="button"
        onClick={onZoomLaneToggle}
        className={`rounded-md px-2.5 py-1.5 text-xs font-medium ${
          zoomLaneEnabled
            ? "bg-blue-50 text-blue-600"
            : "text-gray-600 hover:bg-gray-100"
        }`}
      >
        Zoom lane
      </button>
    </div>
  );
}
