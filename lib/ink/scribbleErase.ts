import type { InkPoint, Stroke } from "@/lib/ink/types";

const MIN_SCRIBBLE_POINTS = 8;
const MAX_SCRIBBLE_MS = 900;
const MIN_PATH_RATIO = 2.2;
const MIN_REVERSALS = 2;
const MIN_SEGMENT_DX = 2;

/** Detect a quick back-and-forth scribble gesture (Apple Notes / GoodNotes style). */
export function isScribbleEraseGesture(stroke: Stroke): boolean {
  if (stroke.tool !== "pen") return false;

  const points = stroke.points;
  if (points.length < MIN_SCRIBBLE_POINTS) return false;

  const duration = points[points.length - 1].timestamp - points[0].timestamp;
  if (duration > MAX_SCRIBBLE_MS) return false;

  let pathLength = 0;
  for (let i = 1; i < points.length; i++) {
    pathLength += distance(points[i - 1], points[i]);
  }

  const displacement = distance(points[0], points[points.length - 1]);
  if (pathLength < 20) return false;

  const ratio = pathLength / Math.max(displacement, 1);
  if (ratio < MIN_PATH_RATIO && displacement > 15) return false;

  const reversals = countHorizontalReversals(points) + countVerticalReversals(points);
  return reversals >= MIN_REVERSALS;
}

function distance(a: InkPoint, b: InkPoint): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function countHorizontalReversals(points: InkPoint[]): number {
  let reversals = 0;
  let prevSign = 0;
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    if (Math.abs(dx) < MIN_SEGMENT_DX) continue;
    const sign = Math.sign(dx);
    if (prevSign !== 0 && sign !== prevSign) reversals++;
    prevSign = sign;
  }
  return reversals;
}

function countVerticalReversals(points: InkPoint[]): number {
  let reversals = 0;
  let prevSign = 0;
  for (let i = 1; i < points.length; i++) {
    const dy = points[i].y - points[i - 1].y;
    if (Math.abs(dy) < MIN_SEGMENT_DX) continue;
    const sign = Math.sign(dy);
    if (prevSign !== 0 && sign !== prevSign) reversals++;
    prevSign = sign;
  }
  return reversals;
}

function distancePointToSegment(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return distance({ x: px, y: py, pressure: 0, timestamp: 0 }, { x: x1, y: y1, pressure: 0, timestamp: 0 });

  let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  const projX = x1 + t * dx;
  const projY = y1 + t * dy;
  const ddx = px - projX;
  const ddy = py - projY;
  return Math.sqrt(ddx * ddx + ddy * ddy);
}

function strokeIntersectsScribble(scribble: Stroke, target: Stroke, threshold: number): boolean {
  if (target.id === scribble.id) return false;

  for (const sp of scribble.points) {
    for (let i = 1; i < target.points.length; i++) {
      const a = target.points[i - 1];
      const b = target.points[i];
      const hitDist = threshold + target.width * 0.75;
      if (distancePointToSegment(sp.x, sp.y, a.x, a.y, b.x, b.y) <= hitDist) {
        return true;
      }
    }
    for (const tp of target.points) {
      if (distance(sp, tp) <= threshold + target.width * 0.75) {
        return true;
      }
    }
  }
  return false;
}

/** Return IDs of strokes crossed by a scribble erase gesture. */
export function findStrokesToErase(
  scribble: Stroke,
  existing: Stroke[],
  threshold = 14,
): string[] {
  return existing
    .filter((s) => s.tool !== "eraser")
    .filter((s) => strokeIntersectsScribble(scribble, s, threshold))
    .map((s) => s.id);
}
