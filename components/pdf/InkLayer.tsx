"use client";

import { useEffect, useRef } from "react";
import type { Stroke } from "@/lib/ink/types";
import { FOCUS_RECT_COLOR } from "@/lib/pdf/constants";

interface InkLayerProps {
  width: number;
  height: number;
  strokes: Stroke[];
  interactive: boolean;
  tool: "pen" | "highlighter" | "eraser";
  onStrokeComplete: (stroke: Stroke) => void;
  onStrokeBounds?: (bounds: { x: number; y: number; w: number; h: number }) => void;
}

function strokeWidth(tool: Stroke["tool"], pressure: number): number {
  const base = tool === "highlighter" ? 14 : 2.5;
  return base + pressure * (tool === "highlighter" ? 8 : 4);
}

function drawStroke(ctx: CanvasRenderingContext2D, stroke: Stroke): void {
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

export function InkLayer({
  width,
  height,
  strokes,
  interactive,
  tool,
  onStrokeComplete,
  onStrokeBounds,
}: InkLayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeStroke = useRef<Stroke | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    for (const stroke of strokes) {
      drawStroke(ctx, stroke);
    }
    if (activeStroke.current) {
      drawStroke(ctx, activeStroke.current);
    }
  }, [strokes, width, height]);

  function localPoint(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      pressure: e.pressure > 0 ? e.pressure : 0.5,
    };
  }

  function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!interactive || tool === "eraser") return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const pt = localPoint(e);
    activeStroke.current = {
      id: `stroke-${Date.now()}`,
      page: 0,
      points: [{ ...pt, timestamp: Date.now() }],
      color: tool === "highlighter" ? "#FDE047" : "#1D4ED8",
      width: strokeWidth(tool, pt.pressure),
      tool,
    };
  }

  function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!interactive || !activeStroke.current) return;
    const pt = localPoint(e);
    activeStroke.current.points.push({ ...pt, timestamp: Date.now() });
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, width, height);
    for (const stroke of strokes) drawStroke(ctx, stroke);
    drawStroke(ctx, activeStroke.current);
  }

  function handlePointerUp(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!activeStroke.current) return;
    const stroke = { ...activeStroke.current, page: 0 };
    activeStroke.current = null;
    if (stroke.points.length > 1) {
      onStrokeComplete(stroke);
      if (onStrokeBounds) {
        const xs = stroke.points.map((p) => p.x);
        const ys = stroke.points.map((p) => p.y);
        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        const minY = Math.min(...ys);
        const maxY = Math.max(...ys);
        onStrokeBounds({
          x: minX / width,
          y: minY / height,
          w: (maxX - minX) / width,
          h: (maxY - minY) / height,
        });
      }
    }
    e.currentTarget.releasePointerCapture(e.pointerId);
  }

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute inset-0 touch-none"
      style={{
        width,
        height,
        pointerEvents: interactive ? "auto" : "none",
        cursor: interactive ? "crosshair" : "default",
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    />
  );
}

interface FocusRectOverlayProps {
  rect: { x: number; y: number; w: number; h: number };
  pageWidth: number;
  pageHeight: number;
  onDrag: (rect: { x: number; y: number; w: number; h: number }) => void;
}

export function FocusRectOverlay({
  rect,
  pageWidth,
  pageHeight,
  onDrag,
}: FocusRectOverlayProps) {
  const dragRef = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(
    null,
  );

  const left = rect.x * pageWidth;
  const top = rect.y * pageHeight;
  const w = rect.w * pageWidth;
  const h = rect.h * pageHeight;

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { startX: e.clientX, startY: e.clientY, originX: rect.x, originY: rect.y };
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragRef.current) return;
    const dx = (e.clientX - dragRef.current.startX) / pageWidth;
    const dy = (e.clientY - dragRef.current.startY) / pageHeight;
    onDrag({
      ...rect,
      x: Math.max(0, Math.min(1 - rect.w, dragRef.current.originX + dx)),
      y: Math.max(0, Math.min(1 - rect.h, dragRef.current.originY + dy)),
    });
  }

  function onPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    dragRef.current = null;
    e.currentTarget.releasePointerCapture(e.pointerId);
  }

  return (
    <div
      className="absolute touch-none"
      data-focus-rect
      style={{
        left,
        top,
        width: w,
        height: h,
        border: `2px solid ${FOCUS_RECT_COLOR}`,
        borderRadius: 2,
        boxShadow: `0 0 0 1px ${FOCUS_RECT_COLOR}33`,
        cursor: "move",
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    />
  );
}
