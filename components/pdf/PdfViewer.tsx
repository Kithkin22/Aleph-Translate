"use client";

import { useEffect, useRef, useState } from "react";
import { getDocument, GlobalWorkerOptions, type PDFDocumentProxy } from "pdfjs-dist";
import type { FocusRegion, Stroke } from "@/lib/ink/types";
import { FocusRectOverlay, InkLayer } from "@/components/pdf/InkLayer";
import type { AnnotationTool } from "@/components/pdf/PdfAnnotationToolbar";

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
  onStroke: (stroke: Stroke) => void;
  onStrokeBounds: (bounds: { x: number; y: number; w: number; h: number }) => void;
  onFocusDrag: (rect: FocusRegion["rect"]) => void;
}

function PdfPageView({
  pdf,
  pageNumber,
  strokes,
  tool,
  focus,
  showFocus,
  onStroke,
  onStrokeBounds,
  onFocusDrag,
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

  const interactive = tool !== "pan";

  return (
    <div className="relative mx-auto w-fit bg-white shadow-sm ring-1 ring-gray-200">
      <canvas ref={canvasRef} className="block max-w-full" />
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
  onStroke: (stroke: Stroke) => void;
  onStrokeBounds: (page: number, bounds: { x: number; y: number; w: number; h: number }) => void;
  onFocusDrag: (page: number, rect: FocusRegion["rect"]) => void;
  onPageVisible: (page: number) => void;
}

export function PdfViewer({
  blob,
  pageCount,
  currentPage,
  strokesByPage,
  tool,
  focusByPage,
  showFocus,
  onStroke,
  onStrokeBounds,
  onFocusDrag,
  onPageVisible,
}: PdfViewerProps) {
  const [doc, setDoc] = useState<PDFDocumentProxy | null>(null);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

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

  return (
    <div ref={scrollRef} className="h-full overflow-y-auto bg-[#e8eaed] px-4 py-6">
      <div className="mx-auto flex max-w-4xl flex-col gap-8">
        {Array.from({ length: pageCount }, (_, i) => i + 1).map((pageNumber) => (
          <div key={pageNumber} data-page={pageNumber}>
            <PdfPageView
              pdf={doc}
              pageNumber={pageNumber}
              strokes={strokesByPage[pageNumber] ?? []}
              tool={tool}
              focus={focusByPage[pageNumber] ?? null}
              showFocus={showFocus}
              onStroke={onStroke}
              onStrokeBounds={(bounds) => onStrokeBounds(pageNumber, bounds)}
              onFocusDrag={(rect) => onFocusDrag(pageNumber, rect)}
            />
            <p className="mt-2 text-center text-xs text-gray-500">Page {pageNumber}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
