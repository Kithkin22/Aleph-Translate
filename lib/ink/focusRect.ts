import type { NormalizedRect, WritingDirection } from "@/lib/ink/types";

/** Default magnified writing band — anchored for reading direction. */
export function defaultFocusRect(direction: WritingDirection): NormalizedRect {
  const w = 0.42;
  const h = 0.11;
  const y = 0.74;
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
