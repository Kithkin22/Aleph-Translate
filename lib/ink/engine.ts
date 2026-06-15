/**
 * Ink engine contracts — post-MVP implementation targets.
 * No runtime code; interfaces only so PDF/ink modules can plug in later.
 * @see GOODNOTES_ZOOM.md
 */

import type {
  FocusRegion,
  InkDocument,
  NormalizedRect,
  Stroke,
  WritingDirection,
} from "@/lib/ink/types";

export interface InkSurfaceMountOptions {
  page: number;
  pageWidthPx: number;
  pageHeightPx: number;
  devicePixelRatio: number;
}

/** Renders and captures strokes on a document page canvas. */
export interface InkSurface {
  mount(container: HTMLElement, options: InkSurfaceMountOptions): void;
  unmount(): void;
  addStroke(stroke: Stroke): void;
  removeStroke(strokeId: string): void;
  getStrokes(page: number): Stroke[];
  clearPage(page: number): void;
  render(): void;
}

/** Maps zoom-lane pointer events to page coordinates and applies strokes. */
export interface CoordinateMapper {
  laneToPage(
    laneX: number,
    laneY: number,
    focus: FocusRegion,
    pageSize: { width: number; height: number },
    laneSize?: { width: number; height: number },
  ): { x: number; y: number };
  pageToLane(
    pageX: number,
    pageY: number,
    focus: FocusRegion,
    pageSize: { width: number; height: number },
    laneSize?: { width: number; height: number },
  ): { x: number; y: number };
}

export interface AutoAdvanceResult {
  advanced: boolean;
  nextFocus: NormalizedRect;
}

/** GoodNotes-style focus rect + auto-advance in writing direction. */
export interface ZoomLaneController {
  getFocus(page: number): FocusRegion | null;
  setFocus(page: number, rect: NormalizedRect): void;
  setDirection(page: number, direction: WritingDirection): void;
  checkAutoAdvance(
    page: number,
    strokeBounds: NormalizedRect,
  ): AutoAdvanceResult | null;
}

export interface PdfInkExporter {
  export(sourcePdf: Blob, ink: InkDocument): Promise<Blob>;
}

/** Factory placeholder — implement when PDF workspace ships. */
export type InkEngineFactory = {
  createSurface(): InkSurface;
  createMapper(): CoordinateMapper;
  createZoomLane(): ZoomLaneController;
  createExporter(): PdfInkExporter;
};
