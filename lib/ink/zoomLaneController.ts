import type { ZoomLaneController, AutoAdvanceResult } from "@/lib/ink/engine";
import type { FocusRegion, NormalizedRect, WritingDirection } from "@/lib/ink/types";
import { defaultFocusRect, focusRectForDirection } from "@/lib/ink/focusRect";

const ADVANCE_OVERLAP = 0.7;
const LTR_TRAILING_THRESHOLD = 0.85;
const RTL_TRAILING_THRESHOLD = 0.15;

export function createZoomLaneController(
  zoomFactor = 2.5,
  initialDirection: WritingDirection = "ltr",
): ZoomLaneController & { regions: Map<number, FocusRegion> } {
  const regions = new Map<number, FocusRegion>();

  function ensureFocus(page: number): FocusRegion {
    const existing = regions.get(page);
    if (existing) return existing;
    const region: FocusRegion = {
      id: `focus-${page}`,
      page,
      rect: defaultFocusRect(initialDirection),
      direction: initialDirection,
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
      regions.set(page, {
        ...current,
        direction,
        rect: focusRectForDirection(direction, current.rect),
      });
    },
    checkAutoAdvance(page, strokeBounds): AutoAdvanceResult | null {
      const focus = ensureFocus(page);
      const rect = focus.rect;
      const step = rect.w * ADVANCE_OVERLAP;

      if (focus.direction === "rtl") {
        // RTL: trailing edge is the left side of the stroke
        if (strokeBounds.x > rect.x + rect.w * RTL_TRAILING_THRESHOLD) {
          return null;
        }
        const nextRect: NormalizedRect = {
          ...rect,
          x: Math.max(0, rect.x - step),
        };
        regions.set(page, { ...focus, rect: nextRect });
        return { advanced: true, nextFocus: nextRect };
      }

      // LTR: trailing edge is the right side of the stroke
      const trailing = strokeBounds.x + strokeBounds.w;
      if (trailing < rect.x + rect.w * LTR_TRAILING_THRESHOLD) {
        return null;
      }
      const nextRect: NormalizedRect = {
        ...rect,
        x: Math.min(1 - rect.w, rect.x + step),
      };
      regions.set(page, { ...focus, rect: nextRect });
      return { advanced: true, nextFocus: nextRect };
    },
  };
}
