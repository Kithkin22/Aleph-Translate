"use client";

import { useCallback, useEffect, useRef } from "react";
import type { FocusRegion, Stroke } from "@/lib/ink/types";
import { createCoordinateMapper } from "@/lib/ink/coordinateMapper";
import { findStrokesToErase, isScribbleEraseGesture } from "@/lib/ink/scribbleErase";
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

const LIVE_EDGE_LTR = 0.82;
const LIVE_EDGE_RTL = 0.18;
const LIVE_ADVANCE_MS = 320;

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
  ctx.strokeStyle = "#d1d5db";
  ctx.lineWidth = 1;
  const lineGap = height / 5;
  for (let i = 1; i < 5; i++) {
    const y = lineGap * i;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  ctx.restore();
}

function drawEdgeVignette(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  const fade = Math.min(48, width * 0.08);
  const left = ctx.createLinearGradient(0, 0, fade, 0);
  left.addColorStop(0, "rgba(255,255,255,0.55)");
  left.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = left;
  ctx.fillRect(0, 0, fade, height);

  const right = ctx.createLinearGradient(width - fade, 0, width, 0);
  right.addColorStop(0, "rgba(255,255,255,0)");
  right.addColorStop(1, "rgba(255,255,255,0.55)");
  ctx.fillStyle = right;
  ctx.fillRect(width - fade, 0, fade, height);
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
  const lastLiveAdvance = useRef(0);
  const mapper = useRef(createCoordinateMapper()).current;

  const zoom = focus?.zoomFactor ?? DEFAULT_ZOOM_SCALE;
  const rect = focus?.rect ?? { x: 0.06, y: 0.74, w: 0.42, h: 0.11 };
  const isRtl = writingDirection === "rtl";

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
    const laneH = Math.max(1, canvas.clientHeight || 180);
    canvas.width = laneW;
    canvas.height = laneH;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, laneW, laneH);
    ctx.drawImage(pageImage, cropX, cropY, cropW, cropH, 0, 0, laneW, laneH);
    drawRuledLines(ctx, laneH, laneW);
    drawEdgeVignette(ctx, laneW, laneH);

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

  const languageLabel =
    detectedLanguage === "hebrew"
      ? "Hebrew — zoom window moves right to left"
      : detectedLanguage === "greek"
        ? "Greek — zoom window moves right to left"
        : isRtl
          ? "Right-to-left writing"
          : "Left-to-right writing";

  function lanePoint(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = laneRef.current!;
    const bounds = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - bounds.left) / bounds.width) * canvas.width,
      y: ((e.clientY - bounds.top) / bounds.height) * canvas.height,
      pressure: e.pressure > 0 ? e.pressure : 0.5,
    };
  }

  function maybeLiveAdvance(laneX: number, laneW: number) {
    const relX = laneX / laneW;
    const atEdge = isRtl ? relX <= LIVE_EDGE_RTL : relX >= LIVE_EDGE_LTR;
    if (!atEdge) return;
    if (Date.now() - lastLiveAdvance.current < LIVE_ADVANCE_MS) return;
    lastLiveAdvance.current = Date.now();
    onNudge(isRtl ? "left" : "right");
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
    const canvas = laneRef.current;
    if (!canvas) return;
    const pt = lanePoint(e);
    activeStroke.current.points.push({ ...pt, timestamp: Date.now() });
    maybeLiveAdvance(pt.x, canvas.width);
    redrawLane();
  }

  function finishStroke(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!activeStroke.current || !focus) return;
    const canvas = laneRef.current;
    const laneSize = canvas ? { width: canvas.width, height: canvas.height } : undefined;
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

      if (isScribbleEraseGesture(stroke)) {
        const ids = findStrokesToErase(stroke, strokes);
        if (ids.length > 0) {
          onStroke({ ...stroke, tool: "eraser" });
        }
      } else {
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
    }

    activeStroke.current = null;
    redrawLane();
    e.currentTarget.releasePointerCapture(e.pointerId);
  }

  return (
    <div className="border-t border-gray-200 bg-[#f2f2f7] px-3 py-3">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-800">Zoom window</span>
            {isRtl ? (
              <span className="rounded bg-blue-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                RTL
              </span>
            ) : null}
          </div>
          <p className="truncate text-[11px] text-gray-500">{languageLabel}</p>
          <p className="truncate text-[10px] text-gray-400">
            Write here — ink appears on the PDF above
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => onNudge(isRtl ? "right" : "left")}
            className="inline-flex min-h-9 min-w-9 items-center justify-center rounded-md border border-gray-200 bg-white text-sm text-gray-600 hover:bg-gray-50"
            aria-label={isRtl ? "Move focus right" : "Move focus left"}
          >
            ◀
          </button>
          <button
            type="button"
            onClick={() => onNudge(isRtl ? "left" : "right")}
            className="inline-flex min-h-9 min-w-9 items-center justify-center rounded-md border border-gray-200 bg-white text-sm text-gray-600 hover:bg-gray-50"
            aria-label={isRtl ? "Move focus left" : "Move focus right"}
          >
            ▶
          </button>
        </div>
      </div>

      <div
        className="relative overflow-hidden rounded-lg border-2 bg-white shadow-md"
        style={{ borderColor: FOCUS_RECT_COLOR }}
      >
        <canvas
          ref={laneRef}
          className="block w-full touch-none"
          style={{ height: "min(35dvh, 240px)", minHeight: 160 }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={finishStroke}
          onPointerLeave={finishStroke}
        />
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-1"
          style={{ backgroundColor: FOCUS_RECT_COLOR }}
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1"
          style={{ backgroundColor: FOCUS_RECT_COLOR }}
        />
        {isRtl ? (
          <div className="pointer-events-none absolute right-2 top-2 rounded bg-blue-600/90 px-1.5 py-0.5 text-[10px] font-medium text-white">
            ←
          </div>
        ) : (
          <div className="pointer-events-none absolute left-2 top-2 rounded bg-blue-600/90 px-1.5 py-0.5 text-[10px] font-medium text-white">
            →
          </div>
        )}
      </div>
    </div>
  );
}
