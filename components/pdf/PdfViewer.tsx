"use client";

import { useEffect, useRef, useState } from "react";
import { getDocument, GlobalWorkerOptions, type PDFDocumentProxy } from "pdfjs-dist";
import type { FocusRegion, Stroke } from "@/lib/ink/types";
import { FocusRectOverlay, InkLayer } from "@/components/pdf/InkLayer";
import type { AnnotationTool } from "@/components/pdf/PdfAnnotationToolbar";
import { usePinchZoom } from "@/hooks/usePinchZoom";

let workerReady = false;

function ensureWorker(): void {
  if (workerReady || typeof window === "undefined") return;
  GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
  ).toString();
  workerReady = true;
}

interface PdfPageViewProps {
  pdf: PDFDocumentProxy;
  pageNumber: number;
  strokes: Stroke[];
  tool: AnnotationTool;
  focus: FocusRegion | null;
  showFocus: boolean;
  zoomWindowMode: boolean;
  allowDirectInk: boolean;
  onStroke: (stroke: Stroke) => void;
  onStrokeBounds: (bounds: { x: number; y: number; w: number; h: number }) => void;
  onFocusDrag: (rect: FocusRegion["rect"]) => void;
  onTapPlaceFocus: (nx: number, ny: number) => void;
}

function PdfPageView({
  pdf,
  pageNumber,
  strokes,
  tool,
  focus,
  showFocus,
  zoomWindowMode,
  allowDirectInk,
  onStroke,
  onStrokeBounds,
  onFocusDrag,
  onTapPlaceFocus,
}: PdfPageViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    let cancelled = false;
    async function render() {
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = canvasRef.current;
      if (!canvas || cancelled) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      setSize({ width: viewport.width, height: viewport.height });
      await page.render({ canvasContext: ctx, viewport }).promise;
    }
    void render();
    return () => {
      cancelled = true;
    };
  }, [pdf, pageNumber]);

  const penOnPage = allowDirectInk && tool !== "pan";
  const interactive = tool !== "pan" && penOnPage;
  const tapToPlace = zoomWindowMode && tool === "pen";
  const tapStartRef = useRef<{ x: number; y: number } | null>(null);

  function handleTapPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (!tapToPlace) return;
    tapStartRef.current = { x: e.clientX, y: e.clientY };
  }

  function handleTapPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (!tapToPlace || !tapStartRef.current) return;
    const start = tapStartRef.current;
    tapStartRef.current = null;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (Math.hypot(dx, dy) > 14) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const bounds = canvas.getBoundingClientRect();
    const nx = (e.clientX - bounds.left) / bounds.width;
    const ny = (e.clientY - bounds.top) / bounds.height;
    if (nx < 0 || nx > 1 || ny < 0 || ny > 1) return;
    onTapPlaceFocus(nx, ny);
  }

  return (
    <div className="relative mx-auto w-fit bg-white shadow-sm ring-1 ring-gray-200">
      <canvas ref={canvasRef} data-pdf-canvas className="block max-w-full" />
      {size.width > 0 ? (
        <>
          <InkLayer
            width={size.width}
            height={size.height}
            strokes={strokes}
            interactive={interactive}
            tool={tool === "eraser" ? "eraser" : tool === "highlighter" ? "highlighter" : "pen"}
            onStrokeComplete={(stroke) => onStroke({ ...stroke, page: pageNumber })}
            onStrokeBounds={onStrokeBounds}
          />
          {tapToPlace ? (
            <div
              className="absolute inset-0 z-[8] cursor-crosshair touch-none"
              onPointerDown={handleTapPointerDown}
              onPointerUp={handleTapPointerUp}
              onPointerCancel={() => {
                tapStartRef.current = null;
              }}
              aria-label="Tap to place zoom writing window"
            />
          ) : null}
          {showFocus && focus ? (
            <FocusRectOverlay
              rect={focus.rect}
              pageWidth={size.width}
              pageHeight={size.height}
              onDrag={onFocusDrag}
            />
          ) : null}
        </>
      ) : null}
    </div>
  );
}

interface PdfViewerProps {
  blob: ArrayBuffer;
  pageCount: number;
  currentPage: number;
  strokesByPage: Record<number, Stroke[]>;
  tool: AnnotationTool;
  focusByPage: Record<number, FocusRegion>;
  showFocus: boolean;
  zoomWindowMode: boolean;
  allowDirectInk: boolean;
  onStroke: (stroke: Stroke) => void;
  onStrokeBounds: (page: number, bounds: { x: number; y: number; w: number; h: number }) => void;
  onFocusDrag: (page: number, rect: FocusRegion["rect"]) => void;
  onTapPlaceFocus: (page: number, nx: number, ny: number) => void;
  onPageVisible: (page: number) => void;
  focusScrollToken?: number;
}

export function PdfViewer({
  blob,
  pageCount,
  currentPage,
  strokesByPage,
  tool,
  focusByPage,
  showFocus,
  zoomWindowMode,
  allowDirectInk,
  onStroke,
  onStrokeBounds,
  onFocusDrag,
  onTapPlaceFocus,
  onPageVisible,
  focusScrollToken = 0,
}: PdfViewerProps) {
  const [doc, setDoc] = useState<PDFDocumentProxy | null>(null);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const {
    transform,
    resetZoom,
    zoomIn,
    zoomOut,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  } = usePinchZoom();

  useEffect(() => {
    let cancelled = false;
    let loaded: PDFDocumentProxy | null = null;
    async function load() {
      try {
        ensureWorker();
        const pdf = await getDocument({ data: blob.slice(0) }).promise;
        if (cancelled) {
          await pdf.destroy();
          return;
        }
        loaded = pdf;
        setDoc(pdf);
        setError(null);
      } catch {
        if (!cancelled) setError("Could not load PDF.");
      }
    }
    void load();
    return () => {
      cancelled = true;
      void loaded?.destroy();
    };
  }, [blob]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const target = container.querySelector(`[data-page="${currentPage}"]`);
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [currentPage, doc]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container || focusScrollToken === 0) return;
    const focusEl = container.querySelector(
      `[data-page="${currentPage}"] [data-focus-rect]`,
    );
    focusEl?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [focusScrollToken, currentPage]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const page = Number((entry.target as HTMLElement).dataset.page);
            if (!Number.isNaN(page)) onPageVisible(page);
          }
        }
      },
      { root: container, threshold: 0.4 },
    );
    container.querySelectorAll("[data-page]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [doc, pageCount, onPageVisible]);

  if (error) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-sm text-gray-500">
        {error}
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-sm text-gray-500">
        Loading PDF…
      </div>
    );
  }

  const panMode = tool === "pan" || transform.scale > 1;

  return (
    <div className="relative h-full">
      {/* PDF zoom controls */}
      <div className="absolute right-3 top-3 z-20 flex flex-col gap-1 rounded-lg border border-gray-200 bg-white/95 p-1 shadow-md backdrop-blur-sm">
        <button
          type="button"
          onClick={zoomIn}
          className="inline-flex min-h-9 min-w-9 items-center justify-center rounded-md text-lg font-medium text-gray-700 hover:bg-gray-100"
          aria-label="Zoom in"
        >
          +
        </button>
        <button
          type="button"
          onClick={zoomOut}
          className="inline-flex min-h-9 min-w-9 items-center justify-center rounded-md text-lg font-medium text-gray-700 hover:bg-gray-100"
          aria-label="Zoom out"
        >
          −
        </button>
        <button
          type="button"
          onClick={resetZoom}
          className="inline-flex min-h-8 items-center justify-center rounded-md px-1.5 text-[10px] font-medium text-gray-500 hover:bg-gray-100"
        >
          {Math.round(transform.scale * 100)}%
        </button>
      </div>

      <div
        ref={scrollRef}
        className={`h-full overflow-auto bg-[#e8eaed] px-4 py-6 ${panMode ? "touch-pan-x touch-pan-y" : ""}`}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{ touchAction: panMode ? "none" : "pan-y pinch-zoom" }}
      >
        <div
          className="mx-auto flex max-w-4xl origin-top flex-col gap-8 transition-transform duration-75"
          style={{
            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          }}
        >
          {Array.from({ length: pageCount }, (_, i) => i + 1).map((pageNumber) => (
            <div key={pageNumber} data-page={pageNumber}>
              <PdfPageView
                pdf={doc}
                pageNumber={pageNumber}
                strokes={strokesByPage[pageNumber] ?? []}
                tool={tool}
                focus={focusByPage[pageNumber] ?? null}
                showFocus={showFocus}
                zoomWindowMode={zoomWindowMode}
                allowDirectInk={allowDirectInk}
                onStroke={onStroke}
                onStrokeBounds={(bounds) => onStrokeBounds(pageNumber, bounds)}
                onFocusDrag={(rect) => onFocusDrag(pageNumber, rect)}
                onTapPlaceFocus={(nx, ny) => onTapPlaceFocus(pageNumber, nx, ny)}
              />
              <p className="mt-2 text-center text-xs text-gray-500">Page {pageNumber}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
