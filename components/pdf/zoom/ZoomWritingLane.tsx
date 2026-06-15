"use client";

import { useEffect, useRef } from "react";
import type { FocusRegion, Stroke } from "@/lib/ink/types";
import { createCoordinateMapper } from "@/lib/ink/coordinateMapper";
import { DEFAULT_ZOOM_SCALE } from "@/lib/pdf/constants";

interface ZoomWritingLaneProps {
  enabled: boolean;
  pageImage: HTMLCanvasElement | null;
  pageSize: { width: number; height: number };
  focus: FocusRegion | null;
  strokes: Stroke[];
  writingDirection: "ltr" | "rtl";
  onStroke: (stroke: Stroke) => void;
  onNudge: (direction: "left" | "right") => void;
}

function drawLaneStroke(ctx: CanvasRenderingContext2D, stroke: Stroke, scale: number): void {
  if (stroke.points.length < 2) return;
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = stroke.color;
  ctx.globalAlpha = stroke.tool === "highlighter" ? 0.35 : 1;
  ctx.lineWidth = stroke.width * scale;
  ctx.beginPath();
  ctx.moveTo(stroke.points[0].x * scale, stroke.points[0].y * scale);
  for (let i = 1; i < stroke.points.length; i++) {
    ctx.lineTo(stroke.points[i].x * scale, stroke.points[i].y * scale);
  }
  ctx.stroke();
  ctx.restore();
}

export function ZoomWritingLane({
  enabled,
  pageImage,
  pageSize,
  focus,
  strokes,
  writingDirection,
  onStroke,
  onNudge,
}: ZoomWritingLaneProps) {
  const laneRef = useRef<HTMLCanvasElement>(null);
  const activeStroke = useRef<Stroke | null>(null);
  const mapper = useRef(createCoordinateMapper()).current;

  const zoom = focus?.zoomFactor ?? DEFAULT_ZOOM_SCALE;
  const rect = focus?.rect ?? { x: 0.1, y: 0.72, w: 0.45, h: 0.12 };
  const laneHeight = 140;

  useEffect(() => {
    const canvas = laneRef.current;
    if (!canvas || !pageImage || !enabled) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cropW = rect.w * pageImage.width;
    const cropH = rect.h * pageImage.height;
    const cropX = rect.x * pageImage.width;
    const cropY = rect.y * pageImage.height;

    canvas.width = cropW * zoom;
    canvas.height = laneHeight;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(
      pageImage,
      cropX,
      cropY,
      cropW,
      cropH,
      0,
      0,
      canvas.width,
      canvas.height,
    );

    for (const stroke of strokes) {
      const lanePoints = stroke.points.map((p) => {
        const lane = mapper.pageToLane(p.x, p.y, focus!, pageSize);
        return { ...p, x: lane.x, y: lane.y };
      });
      drawLaneStroke(ctx, { ...stroke, points: lanePoints }, 1);
    }
    if (activeStroke.current) {
      drawLaneStroke(ctx, activeStroke.current, 1);
    }
  }, [enabled, pageImage, pageSize, focus, rect, strokes, zoom, mapper]);

  if (!enabled) return null;

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
  }

  function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!activeStroke.current || !focus) return;
    const pt = lanePoint(e);
    activeStroke.current.points.push({ ...pt, timestamp: Date.now() });
    const canvas = laneRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas || !pageImage) return;
    // Redraw triggered by effect on next frame — quick inline redraw:
    const event = new Event("lane-redraw");
    canvas.dispatchEvent(event);
  }

  function handlePointerUp(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!activeStroke.current || !focus) return;
    const pagePoints = activeStroke.current.points.map((p) => {
      const page = mapper.laneToPage(p.x, p.y, focus, pageSize);
      return { ...p, x: page.x, y: page.y };
    });
    if (pagePoints.length > 1) {
      onStroke({
        ...activeStroke.current,
        points: pagePoints,
        page: focus.page,
      });
    }
    activeStroke.current = null;
    e.currentTarget.releasePointerCapture(e.pointerId);
  }

  return (
    <div className="border-t border-gray-200 bg-white px-3 py-2">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500">Zoom writing lane</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onNudge(writingDirection === "rtl" ? "right" : "left")}
            className="rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-600 hover:bg-gray-50"
          >
            ◀
          </button>
          <button
            type="button"
            onClick={() => onNudge(writingDirection === "rtl" ? "left" : "right")}
            className="rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-600 hover:bg-gray-50"
          >
            ▶
          </button>
        </div>
      </div>
      <div className="overflow-hidden rounded-md border border-gray-200 bg-white">
        <canvas
          ref={laneRef}
          className="block w-full touch-none"
          style={{ height: laneHeight }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        />
      </div>
    </div>
  );
}
