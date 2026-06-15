/**
 * Future ink / zoom-lane types — post-MVP.
 * @see GOODNOTES_ZOOM.md
 */

export type WritingDirection = "ltr" | "rtl";

export interface NormalizedRect {
  /** 0–1 relative to page width */
  x: number;
  /** 0–1 relative to page height */
  y: number;
  w: number;
  h: number;
}

export interface InkPoint {
  x: number;
  y: number;
  pressure: number;
  timestamp: number;
}

export interface Stroke {
  id: string;
  page: number;
  points: InkPoint[];
  color: string;
  width: number;
  tool: "pen" | "highlighter" | "eraser";
}

export interface FocusRegion {
  id: string;
  page: number;
  rect: NormalizedRect;
  direction: WritingDirection;
  zoomFactor: number;
}

export interface PageInkData {
  strokes: Stroke[];
  focusRegions: FocusRegion[];
  activeFocusId: string;
}

export interface InkDocument {
  version: 1;
  pages: Record<number, PageInkData>;
}

/** Resolve writing direction from language with optional user override. */
export function defaultWritingDirection(
  sourceLanguage: "hebrew" | "greek" | "unknown" | "english",
  override?: WritingDirection,
): WritingDirection {
  if (override) return override;
  if (sourceLanguage === "hebrew" || sourceLanguage === "greek") return "rtl";
  return "ltr";
}
