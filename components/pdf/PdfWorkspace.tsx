"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { PdfAnnotationToolbar, type AnnotationTool } from "@/components/pdf/PdfAnnotationToolbar";
import { TranslateWorkspaceShell } from "@/components/pdf/TranslateWorkspaceShell";
import { ZoomWritingLane } from "@/components/pdf/zoom/ZoomWritingLane";
import { useAutosave } from "@/hooks/useAutosave";
import { createZoomLaneController } from "@/lib/ink/zoomLaneController";
import type { FocusRegion, InkDocument, PageInkData, Stroke } from "@/lib/ink/types";
import { computePageCompletion } from "@/lib/library/completion";
import type { Page } from "@/lib/library/types";
import { getBlob } from "@/lib/storage/indexedDb";

const PdfViewer = dynamic(
  () => import("@/components/pdf/PdfViewer").then((m) => m.PdfViewer),
  { ssr: false, loading: () => <div className="flex h-full items-center justify-center text-sm text-gray-500">Loading viewer…</div> },
);

interface PdfWorkspaceProps {
  page: Page;
  backHref: string;
  onPageChange: (updater: (prev: Page) => Page) => void;
}

function getPageInk(ink: InkDocument | undefined, pageNum: number): PageInkData {
  return (
    ink?.pages[pageNum] ?? {
      strokes: [],
      focusRegions: [],
      activeFocusId: "",
    }
  );
}

export function PdfWorkspace({ page, backHref, onPageChange }: PdfWorkspaceProps) {
  const [blob, setBlob] = useState<ArrayBuffer | null>(null);
  const [blobError, setBlobError] = useState(false);
  const [tool, setTool] = useState<AnnotationTool>("pen");
  const [zoomLaneEnabled, setZoomLaneEnabled] = useState(true);
  const [currentPage, setCurrentPage] = useState(page.pdf?.currentPage ?? 1);
  const [pageCanvas, setPageCanvas] = useState<HTMLCanvasElement | null>(null);

  const zoomController = useMemo(() => createZoomLaneController(), []);
  const { status, scheduleSave } = useAutosave(page);

  const writingDirection = page.pdf?.writingDirection ?? "ltr";
  const pageCount = page.pdf?.pageCount ?? 0;

  useEffect(() => {
    const key = page.pdf?.blobKey;
    if (!key) return;
    let cancelled = false;
    void getBlob(key).then((data) => {
      if (cancelled) return;
      if (data) setBlob(data);
      else setBlobError(true);
    });
    return () => {
      cancelled = true;
    };
  }, [page.pdf?.blobKey]);

  useEffect(() => {
    if (!page.ink) return;
    for (const [pageNum, data] of Object.entries(page.ink.pages)) {
      const focus = data.focusRegions[0];
      if (focus) {
        zoomController.regions.set(Number(pageNum), focus);
      }
    }
  }, [page.ink, zoomController]);

  const patchInk = useCallback(
    (pageNum: number, updater: (data: PageInkData) => PageInkData) => {
      onPageChange((prev) => {
        const ink: InkDocument = prev.ink ?? { version: 1, pages: {} };
        const current = getPageInk(ink, pageNum);
        const nextInk: InkDocument = {
          ...ink,
          pages: { ...ink.pages, [pageNum]: updater(current) },
        };
        const next: Page = {
          ...prev,
          ink: nextInk,
          pdf: prev.pdf ? { ...prev.pdf, currentPage: pageNum } : prev.pdf,
          completion: computePageCompletion({
            contentKind: "pdf",
            verses: [],
            pdf: prev.pdf,
            ink: nextInk,
          }),
        };
        scheduleSave(next);
        return next;
      });
    },
    [onPageChange, scheduleSave],
  );

  const strokesByPage = useMemo(() => {
    const map: Record<number, Stroke[]> = {};
    const pages = page.ink?.pages ?? {};
    for (const [num, data] of Object.entries(pages)) {
      map[Number(num)] = data.strokes;
    }
    return map;
  }, [page.ink]);

  const focusByPage = useMemo(() => {
    const map: Record<number, FocusRegion> = {};
    for (let i = 1; i <= pageCount; i++) {
      const fromInk = page.ink?.pages[i]?.focusRegions[0];
      const fromController = zoomController.getFocus(i);
      const focus =
        fromInk ??
        fromController ??
        ({
          id: `focus-${i}`,
          page: i,
          rect:
            writingDirection === "rtl"
              ? { x: 0.45, y: 0.72, w: 0.45, h: 0.12 }
              : { x: 0.1, y: 0.72, w: 0.45, h: 0.12 },
          direction: writingDirection,
          zoomFactor: 2.5,
        } satisfies FocusRegion);
      map[i] = focus;
      if (!fromController) zoomController.regions.set(i, focus);
    }
    return map;
  }, [page.ink, pageCount, writingDirection, zoomController]);

  function handleStroke(stroke: Stroke) {
    patchInk(stroke.page, (data) => ({
      ...data,
      strokes: [...data.strokes, stroke],
    }));
  }

  function handleStrokeBounds(
    pageNum: number,
    bounds: { x: number; y: number; w: number; h: number },
  ) {
    const result = zoomController.checkAutoAdvance(pageNum, bounds);
    if (result?.advanced) {
      const focus = zoomController.getFocus(pageNum);
      if (focus) {
        patchInk(pageNum, (data) => ({
          ...data,
          focusRegions: [focus],
        }));
      }
    }
  }

  function handleFocusDrag(pageNum: number, rect: FocusRegion["rect"]) {
    zoomController.setFocus(pageNum, rect);
    const focus = zoomController.getFocus(pageNum);
    if (focus) {
      patchInk(pageNum, (data) => ({
        ...data,
        focusRegions: [focus],
      }));
    }
  }

  function handleWritingDirectionChange(dir: "ltr" | "rtl") {
    onPageChange((prev) => {
      const next: Page = {
        ...prev,
        pdf: prev.pdf ? { ...prev.pdf, writingDirection: dir } : prev.pdf,
      };
      scheduleSave(next);
      return next;
    });
    zoomController.setDirection(currentPage, dir);
  }

  function handleNudge(direction: "left" | "right") {
    const focus = focusByPage[currentPage];
    if (!focus) return;
    const step = focus.rect.w * 0.5;
    const nextRect =
      direction === "left"
        ? { ...focus.rect, x: Math.max(0, focus.rect.x - step) }
        : { ...focus.rect, x: Math.min(1 - focus.rect.w, focus.rect.x + step) };
    handleFocusDrag(currentPage, nextRect);
  }

  // Capture page canvas for zoom lane preview (from visible PDF page)
  useEffect(() => {
    const el = document.querySelector(`[data-page="${currentPage}"] canvas`);
    if (el instanceof HTMLCanvasElement) {
      setPageCanvas(el);
    }
  }, [currentPage, blob]);

  if (blobError || !page.pdf) {
    return (
      <TranslateWorkspaceShell
        title={page.title}
        backHref={backHref}
        toolbar={<div />}
      >
        <div className="flex h-full items-center justify-center text-sm text-gray-500">
          PDF file not found. Try importing again.
        </div>
      </TranslateWorkspaceShell>
    );
  }

  const activeFocus = focusByPage[currentPage] ?? null;
  const activeStrokes = strokesByPage[currentPage] ?? [];
  const pageSize = pageCanvas
    ? { width: pageCanvas.width, height: pageCanvas.height }
    : { width: 1, height: 1 };

  return (
    <TranslateWorkspaceShell
      title={page.title}
      backHref={backHref}
      saveStatus={status}
      toolbar={
        <PdfAnnotationToolbar
          tool={tool}
          onToolChange={setTool}
          writingDirection={writingDirection}
          onWritingDirectionChange={handleWritingDirectionChange}
          zoomLaneEnabled={zoomLaneEnabled}
          onZoomLaneToggle={() => setZoomLaneEnabled((v) => !v)}
        />
      }
      bottom={
        <ZoomWritingLane
          enabled={zoomLaneEnabled}
          pageImage={pageCanvas}
          pageSize={pageSize}
          focus={activeFocus}
          strokes={activeStrokes}
          writingDirection={writingDirection}
          onStroke={handleStroke}
          onNudge={handleNudge}
        />
      }
    >
      {blob ? (
        <PdfViewer
          blob={blob}
          pageCount={pageCount}
          currentPage={currentPage}
          strokesByPage={strokesByPage}
          tool={tool}
          focusByPage={focusByPage}
          showFocus={zoomLaneEnabled}
          onStroke={handleStroke}
          onStrokeBounds={handleStrokeBounds}
          onFocusDrag={handleFocusDrag}
          onPageVisible={setCurrentPage}
        />
      ) : (
        <div className="flex h-full items-center justify-center text-sm text-gray-500">
          Loading PDF…
        </div>
      )}
    </TranslateWorkspaceShell>
  );
}
