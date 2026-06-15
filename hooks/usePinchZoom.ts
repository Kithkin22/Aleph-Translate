"use client";

import { useCallback, useRef, useState } from "react";

export interface ViewportTransform {
  scale: number;
  x: number;
  y: number;
}

const MIN_SCALE = 0.5;
const MAX_SCALE = 5;

export function usePinchZoom(initial: ViewportTransform = { scale: 1, x: 0, y: 0 }) {
  const [transform, setTransform] = useState(initial);
  const pinchRef = useRef<{
    distance: number;
    scale: number;
    centerX: number;
    centerY: number;
    originX: number;
    originY: number;
  } | null>(null);
  const panRef = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(
    null,
  );

  const resetZoom = useCallback(() => {
    setTransform({ scale: 1, x: 0, y: 0 });
  }, []);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const [a, b] = [e.touches[0], e.touches[1]];
      const distance = Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
      const centerX = (a.clientX + b.clientX) / 2;
      const centerY = (a.clientY + b.clientY) / 2;
      pinchRef.current = {
        distance,
        scale: transform.scale,
        centerX,
        centerY,
        originX: transform.x,
        originY: transform.y,
      };
      panRef.current = null;
    } else if (e.touches.length === 1 && transform.scale > 1) {
      panRef.current = {
        startX: e.touches[0].clientX,
        startY: e.touches[0].clientY,
        originX: transform.x,
        originY: transform.y,
      };
    }
  }, [transform]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchRef.current) {
      e.preventDefault();
      const [a, b] = [e.touches[0], e.touches[1]];
      const distance = Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
      const centerX = (a.clientX + b.clientX) / 2;
      const centerY = (a.clientY + b.clientY) / 2;
      const pinch = pinchRef.current;
      const nextScale = Math.min(
        MAX_SCALE,
        Math.max(MIN_SCALE, pinch.scale * (distance / pinch.distance)),
      );
      const scaleRatio = nextScale / pinch.scale;
      setTransform({
        scale: nextScale,
        x: pinch.originX + (centerX - pinch.centerX) + (pinch.originX - pinch.centerX) * (scaleRatio - 1),
        y: pinch.originY + (centerY - pinch.centerY) + (pinch.originY - pinch.centerY) * (scaleRatio - 1),
      });
    } else if (e.touches.length === 1 && panRef.current && transform.scale > 1) {
      e.preventDefault();
      const pan = panRef.current;
      setTransform((prev) => ({
        ...prev,
        x: pan.originX + (e.touches[0].clientX - pan.startX),
        y: pan.originY + (e.touches[0].clientY - pan.startY),
      }));
    }
  }, [transform.scale]);

  const onTouchEnd = useCallback(() => {
    pinchRef.current = null;
    panRef.current = null;
  }, []);

  const zoomIn = useCallback(() => {
    setTransform((prev) => ({
      ...prev,
      scale: Math.min(MAX_SCALE, prev.scale * 1.25),
    }));
  }, []);

  const zoomOut = useCallback(() => {
    setTransform((prev) => ({
      ...prev,
      scale: Math.max(MIN_SCALE, prev.scale / 1.25),
    }));
  }, []);

  return {
    transform,
    resetZoom,
    zoomIn,
    zoomOut,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  };
}
