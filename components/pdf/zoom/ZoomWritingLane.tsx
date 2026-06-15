"use client";

import { useCallback, useEffect, useRef } from "react";
import type { FocusRegion, Stroke } from "@/lib/ink/types";
import { createCoordinateMapper } from "@/lib/ink/coordinateMapper";
import { DEFAULT_ZOOM_SCALE, FOCUS_RECT_COLOR } from "@/lib/pdf/constants";

interface ZoomWritingLaneProps {
  enabled: boolean;
  pageImage: HTMLCanvasElement | null;
  pageSize: { width: number; height: number };
  focus: FocusRegion | null;
  strokes: Stroke[];
  writingDirection: "ltr" | "rtl";
  detectedLanguage?: "hebrew" | "greek" | "english" | "unknown";
  onStroke: (stroke: Stroke) => void;
  onStrokeBounds: (bounds: { x: number; y: number; w: number; h: number }) => void;
  onNudge: (direction: "left" | "right") => void;
}

function drawLaneStroke(ctx: CanvasRenderingContext2D, stroke: Stroke): void {
  if (stroke.points.length < 2) return;
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = stroke.color;
  ctx.globalAlpha = stroke.tool === "highlighter" ? 0.35 : 1;
  ctx.lineWidth = stroke.width;
  ctx.beginPath();
  ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
  for (let i = 1; i < stroke.points.length; i++) {
    ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
  }
  ctx.stroke();
  ctx.restore();
}

function drawRuledLines(ctx: CanvasRenderingContext2D, height: number, width: number): void {
  ctx.save();
  ctx.strokeStyle = "#e5e7eb";
  ctx.lineWidth = 1;
  const lineGap = height / 4;
  for (let i = 1; i < 4; i++) {
    const y = lineGap * i;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  ctx.restore();
}

export function ZoomWritingLane({
  enabled,
  pageImage,
  pageSize,
  focus,
  strokes,
  writingDirection,
  detectedLanguage,
  onStroke,
  onStrokeBounds,
  onNudge,
}: ZoomWritingLaneProps) {
  const laneRef = useRef<HTMLCanvasElement>(null);
  const activeStroke = useRef<Stroke | null>(null);
  const mapper = useRef(createCoordinateMapper()).current;

  const zoom = focus?.zoomFactor ?? DEFAULT_ZOOM_SCALE;
  const rect = focus?.rect ?? { x: 0.06, y: 0.74, w: 0.42, h: 0.11 };

  const redrawLane = useCallback(() => {
    const canvas = laneRef.current;
    if (!canvas || !pageImage || !focus || !enabled) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cropW = rect.w * pageImage.width;
    const cropH = rect.h * pageImage.height;
    const cropX = rect.x * pageImage.width;
    const cropY = rect.y * pageImage.height;

    const laneW = Math.max(1, Math.floor(cropW * zoom));
    const laneH = Math.max(1, canvas.clientHeight || 160);
    canvas.width = laneW;
    canvas.height = laneH;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, laneW, laneH);
    ctx.drawImage(pageImage, cropX, cropY, cropW, cropH, 0, 0, laneW, laneH);
    drawRuledLines(ctx, laneH, laneW);

    const laneSize = { width: laneW, height: laneH };
    for (const stroke of strokes) {
      const lanePoints = stroke.points.map((p) => {
        const lane = mapper.pageToLane(p.x, p.y, focus, pageSize, laneSize);
        return { ...p, x: lane.x, y: lane.y };
      });
      drawLaneStroke(ctx, { ...stroke, points: lanePoints });
    }
    if (activeStroke.current) {
      drawLaneStroke(ctx, activeStroke.current);
    }
  }, [enabled, pageImage, focus, pageSize, rect, strokes, zoom, mapper]);

  useEffect(() => {
    redrawLane();
  }, [redrawLane]);

  if (!enabled) return null;

  const isRtl = writingDirection === "rtl";
  const languageLabel =
    detectedLanguage === "hebrew"
      ? "Hebrew detected — zoom advances right to left"
      : detectedLanguage === "greek"
        ? "Greek detected — zoom advances right to left"
        : isRtl
          ? "Right-to-left writing"
          : "Left-to-right writing";

  const eraseHint = "Scribble back-and-forth over ink to erase";

  function lanePoint(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = laneRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
      pressure: e.pressure > 0 ? e.pressure : 0.5,
    };
  }

  function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!focus) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const pt = lanePoint(e);
    activeStroke.current = {
      id: `lane-${Date.now()}`,
      page: focus.page,
      points: [{ ...pt, timestamp: Date.now() }],
      color: "#1D4ED8",
      width: 2.5 + pt.pressure * 4,
      tool: "pen",
    };
    redrawLane();
  }

  function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!activeStroke.current || !focus) return;
    const pt = lanePoint(e);
    activeStroke.current.points.push({ ...pt, timestamp: Date.now() });
    redrawLane();
  }

  function handlePointerUp(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!activeStroke.current || !focus) return;
    const canvas = laneRef.current;
    const laneSize = canvas
      ? { width: canvas.width, height: canvas.height }
      : undefined;
    const pagePoints = activeStroke.current.points.map((p) => {
      const page = mapper.laneToPage(p.x, p.y, focus, pageSize, laneSize);
      return { ...p, x: page.x, y: page.y };
    });
    if (pagePoints.length > 1) {
      const stroke = {
        ...activeStroke.current,
        points: pagePoints,
        page: focus.page,
      };
      onStroke(stroke);
      const xs = pagePoints.map((p) => p.x / pageSize.width);
      const ys = pagePoints.map((p) => p.y / pageSize.height);
      onStrokeBounds({
        x: Math.min(...xs),
        y: Math.min(...ys),
        w: Math.max(...xs) - Math.min(...xs),
        h: Math.max(...ys) - Math.min(...ys),
      });
    }
    activeStroke.current = null;
    redrawLane();
    e.currentTarget.releasePointerCapture(e.pointerId);
  }

  return (
    <div className="border-t border-gray-200 bg-white px-3 py-2.5">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <span className="text-xs font-semibold text-gray-700">Zoom window</span>
          <p className="truncate text-[11px] text-gray-500">{languageLabel}</p>
          <p className="truncate text-[10px] text-gray-400">{eraseHint}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => onNudge(isRtl ? "right" : "left")}
            className="inline-flex min-h-9 min-w-9 items-center justify-center rounded-md border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
            aria-label={isRtl ? "Move focus right" : "Move focus left"}
          >
            ◀
          </button>
          <button
            type="button"
            onClick={() => onNudge(isRtl ? "left" : "right")}
            className="inline-flex min-h-9 min-w-9 items-center justify-center rounded-md border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
            aria-label={isRtl ? "Move focus left" : "Move focus right"}
          >
            ▶
          </button>
        </div>
      </div>

      <div
        className="relative overflow-hidden rounded-md border-2 bg-white shadow-inner"
        style={{ borderColor: `${FOCUS_RECT_COLOR}55` }}
      >
        <canvas
          ref={laneRef}
          className="block w-full touch-none"
          style={{ height: "min(30dvh, 200px)", minHeight: 140 }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        />
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-0.5"
          style={{ backgroundColor: FOCUS_RECT_COLOR }}
        />
      </div>
    </div>
  );
}
