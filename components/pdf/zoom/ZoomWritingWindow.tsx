"use client";

import { useCallback, useEffect, useRef } from "react";
import type { FocusRegion, NormalizedRect, Stroke } from "@/lib/ink/types";
import { createCoordinateMapper } from "@/lib/ink/coordinateMapper";
import { findStrokesToErase, isScribbleEraseGesture } from "@/lib/ink/scribbleErase";
import { FOCUS_RECT_COLOR } from "@/lib/pdf/constants";

interface ZoomWritingWindowProps {
  open: boolean;
  onClose: () => void;
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

const LIVE_EDGE_LTR = 0.88;
const LIVE_EDGE_RTL = 0.12;
const LIVE_ADVANCE_MS = 280;

/** GoodNotes-style ruled writing lane — large motions here become precise ink on the PDF. */
function drawRuledWritingLane(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
): void {
  ctx.save();
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  const lineCount = 5;
  const gap = height / (lineCount + 1);
  ctx.strokeStyle = "#93c5fd";
  ctx.lineWidth = 1;
  for (let i = 1; i <= lineCount; i++) {
    const y = gap * i;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  ctx.strokeStyle = "#dbeafe";
  ctx.setLineDash([4, 6]);
  ctx.beginPath();
  ctx.moveTo(width * 0.08, 0);
  ctx.lineTo(width * 0.08, height);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

function drawLaneStroke(ctx: CanvasRenderingContext2D, stroke: Stroke): void {
  if (stroke.points.length < 2) return;
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = stroke.color;
  ctx.lineWidth = stroke.width;
  ctx.beginPath();
  ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
  for (let i = 1; i < stroke.points.length; i++) {
    ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
  }
  ctx.stroke();
  ctx.restore();
}

export function ZoomWritingWindow({
  open,
  onClose,
  pageImage,
  pageSize,
  focus,
  strokes,
  writingDirection,
  detectedLanguage,
  onStroke,
  onStrokeBounds,
  onNudge,
}: ZoomWritingWindowProps) {
  const laneRef = useRef<HTMLCanvasElement>(null);
  const activeStroke = useRef<Stroke | null>(null);
  const lastLiveAdvance = useRef(0);
  const mapper = useRef(createCoordinateMapper()).current;

  const zoom = focus?.zoomFactor ?? 3.5;
  const rect = focus?.rect ?? { x: 0.06, y: 0.74, w: 0.28, h: 0.07 };
  const isRtl = writingDirection === "rtl";

  const redrawLane = useCallback(() => {
    const canvas = laneRef.current;
    if (!canvas || !focus || !open) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const laneW = canvas.width;
    const laneH = canvas.height;

    drawRuledWritingLane(ctx, laneW, laneH);

    if (pageImage) {
      const cropW = rect.w * pageImage.width;
      const cropH = rect.h * pageImage.height;
      const cropX = rect.x * pageImage.width;
      const cropY = rect.y * pageImage.height;
      ctx.save();
      ctx.globalAlpha = 0.35;
      ctx.drawImage(pageImage, cropX, cropY, cropW, cropH, 0, 0, laneW, laneH);
      ctx.restore();
    }

    const laneSize = { width: laneW, height: laneH };
    for (const stroke of strokes) {
      const lanePoints = stroke.points.map((p) => {
        const lane = mapper.pageToLane(p.x, p.y, focus, pageSize, laneSize);
        return { ...p, x: lane.x, y: lane.y };
      });
      drawLaneStroke(ctx, {
        ...stroke,
        points: lanePoints,
        width: stroke.width * zoom,
      });
    }
    if (activeStroke.current) {
      drawLaneStroke(ctx, activeStroke.current);
    }
  }, [open, pageImage, focus, pageSize, rect, strokes, zoom, mapper]);

  useEffect(() => {
    const canvas = laneRef.current;
    if (!canvas || !open) return;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(rect.width * devicePixelRatio));
      canvas.height = Math.max(1, Math.floor(rect.height * devicePixelRatio));
      redrawLane();
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [open, redrawLane]);

  useEffect(() => {
    redrawLane();
  }, [redrawLane]);

  if (!open || !focus) return null;

  const languageLabel =
    detectedLanguage === "hebrew"
      ? "Hebrew · advances right to left"
      : detectedLanguage === "greek"
        ? "Greek · advances right to left"
        : isRtl
          ? "Right-to-left"
          : "Left-to-right";

  function lanePoint(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = laneRef.current!;
    const bounds = canvas.getBoundingClientRect();
    const scaleX = canvas.width / bounds.width;
    const scaleY = canvas.height / bounds.height;
    return {
      x: (e.clientX - bounds.left) * scaleX,
      y: (e.clientY - bounds.top) * scaleY,
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
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    const pt = lanePoint(e);
    activeStroke.current = {
      id: `lane-${Date.now()}`,
      page: focus.page,
      points: [{ ...pt, timestamp: Date.now() }],
      color: "#1D4ED8",
      width: 3 + pt.pressure * 5,
      tool: "pen",
    };
    redrawLane();
  }

  function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!activeStroke.current) return;
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
      const pageWidth = Math.max(1.5, activeStroke.current.width / zoom);
      const stroke = {
        ...activeStroke.current,
        points: pagePoints,
        page: focus.page,
        width: pageWidth,
      };

      if (isScribbleEraseGesture({ ...stroke, points: activeStroke.current.points })) {
        const laneStroke = { ...activeStroke.current, page: focus.page };
        const ids = findStrokesToErase(laneStroke, strokes);
        if (ids.length > 0) onStroke({ ...stroke, tool: "eraser" });
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
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex justify-center px-3 pb-[env(safe-area-inset-bottom)] pt-2">
      <div
        className="pointer-events-auto w-full max-w-3xl overflow-hidden rounded-2xl border-2 bg-white shadow-2xl"
        style={{ borderColor: FOCUS_RECT_COLOR }}
      >
        <div className="flex items-center justify-between gap-2 border-b border-gray-100 bg-[#f8f9fa] px-3 py-2">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-800">Zoom writing window</p>
            <p className="truncate text-[10px] text-gray-500">
              {languageLabel} · large strokes here → precise ink on PDF
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => onNudge(isRtl ? "right" : "left")}
              className="inline-flex min-h-8 min-w-8 items-center justify-center rounded-md border border-gray-200 bg-white text-xs"
              aria-label="Move focus back"
            >
              ◀
            </button>
            <button
              type="button"
              onClick={() => onNudge(isRtl ? "left" : "right")}
              className="inline-flex min-h-8 min-w-8 items-center justify-center rounded-md border border-gray-200 bg-white text-xs"
              aria-label="Move focus forward"
            >
              ▶
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex min-h-8 items-center rounded-md px-2.5 text-xs font-medium text-gray-600 hover:bg-gray-100"
            >
              Done
            </button>
          </div>
        </div>

        <canvas
          ref={laneRef}
          className="block w-full touch-none bg-white"
          style={{ height: "min(32dvh, 220px)", minHeight: 150 }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={finishStroke}
          onPointerLeave={finishStroke}
        />
      </div>
    </div>
  );
}

/** Place focus rect centered on a normalized tap point, clamped to page bounds. */
export function focusRectAtPoint(
  nx: number,
  ny: number,
  size: NormalizedRect,
): NormalizedRect {
  return {
    w: size.w,
    h: size.h,
    x: Math.max(0, Math.min(1 - size.w, nx - size.w / 2)),
    y: Math.max(0, Math.min(1 - size.h, ny - size.h / 2)),
  };
}
