import type { NormalizedRect, WritingDirection } from "@/lib/ink/types";

/** Narrow writing band for margins and translation boxes. */
export function defaultFocusRect(direction: WritingDirection): NormalizedRect {
  const w = 0.28;
  const h = 0.07;
  const y = 0.78;
  if (direction === "rtl") {
    return { x: 1 - w - 0.06, y, w, h };
  }
  return { x: 0.06, y, w, h };
}

/** Reposition an existing focus rect when writing direction changes. */
export function focusRectForDirection(
  direction: WritingDirection,
  current?: NormalizedRect,
): NormalizedRect {
  const base = current ?? defaultFocusRect(direction);
  if (direction === "rtl") {
    return { ...base, x: Math.max(0, 1 - base.w - 0.06) };
  }
  return { ...base, x: 0.06 };
}
