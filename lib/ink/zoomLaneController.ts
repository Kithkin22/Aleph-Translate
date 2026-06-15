import type { ZoomLaneController, AutoAdvanceResult } from "@/lib/ink/engine";
import type { FocusRegion, NormalizedRect, WritingDirection } from "@/lib/ink/types";
import { AUTO_ADVANCE_THRESHOLD } from "@/lib/pdf/constants";

function defaultFocusRect(direction: WritingDirection): NormalizedRect {
  if (direction === "rtl") {
    return { x: 0.45, y: 0.72, w: 0.45, h: 0.12 };
  }
  return { x: 0.1, y: 0.72, w: 0.45, h: 0.12 };
}

export function createZoomLaneController(
  zoomFactor = 2.5,
): ZoomLaneController & { regions: Map<number, FocusRegion> } {
  const regions = new Map<number, FocusRegion>();

  function ensureFocus(page: number): FocusRegion {
    const existing = regions.get(page);
    if (existing) return existing;
    const direction: WritingDirection = "ltr";
    const region: FocusRegion = {
      id: `focus-${page}`,
      page,
      rect: defaultFocusRect(direction),
      direction,
      zoomFactor,
    };
    regions.set(page, region);
    return region;
  }

  return {
    regions,
    getFocus(page) {
      return regions.get(page) ?? null;
    },
    setFocus(page, rect) {
      const current = ensureFocus(page);
      regions.set(page, { ...current, rect });
    },
    setDirection(page, direction) {
      const current = ensureFocus(page);
      regions.set(page, { ...current, direction });
    },
    checkAutoAdvance(page, strokeBounds): AutoAdvanceResult | null {
      const focus = ensureFocus(page);
      const rect = focus.rect;
      const trailingEdge =
        focus.direction === "rtl"
          ? strokeBounds.x
          : strokeBounds.x + strokeBounds.w;
      const focusTrailing =
        focus.direction === "rtl" ? rect.x : rect.x + rect.w;
      const focusLeading = focus.direction === "rtl" ? rect.x + rect.w : rect.x;
      const step = rect.w * 0.85;

      const nearTrailing =
        focus.direction === "rtl"
          ? trailingEdge <= focusLeading + rect.w * (1 - AUTO_ADVANCE_THRESHOLD)
          : trailingEdge >= focusTrailing - rect.w * (1 - AUTO_ADVANCE_THRESHOLD);

      if (!nearTrailing) return null;

      const nextRect: NormalizedRect =
        focus.direction === "rtl"
          ? { ...rect, x: Math.max(0, rect.x - step) }
          : { ...rect, x: Math.min(1 - rect.w, rect.x + step) };

      regions.set(page, { ...focus, rect: nextRect });
      return { advanced: true, nextFocus: nextRect };
    },
  };
}
