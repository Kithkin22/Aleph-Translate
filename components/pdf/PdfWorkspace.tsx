"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { PdfAnnotationToolbar, type AnnotationTool } from "@/components/pdf/PdfAnnotationToolbar";
import { TranslateWorkspaceShell } from "@/components/pdf/TranslateWorkspaceShell";
import { ZoomWritingLane } from "@/components/pdf/zoom/ZoomWritingLane";
import { focusRectAtPoint } from "@/components/pdf/zoom/ZoomWritingWindow";
import { useAutosave } from "@/hooks/useAutosave";
import { defaultFocusRect } from "@/lib/ink/focusRect";
import { createZoomLaneController } from "@/lib/ink/zoomLaneController";
import type { FocusRegion, InkDocument, PageInkData, Stroke, WritingDirection } from "@/lib/ink/types";
import { computePageCompletion } from "@/lib/library/completion";
import type { Page } from "@/lib/library/types";
import {
  detectPdfLanguage,
  resolvePdfLanguage,
  writingDirectionForLanguage,
} from "@/lib/pdf/detectLanguage";
import { findStrokesToErase, isScribbleEraseGesture } from "@/lib/ink/scribbleErase";
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
  const [focusScrollToken, setFocusScrollToken] = useState(0);
  const languageDetected = useRef(false);

  const writingDirection: WritingDirection = page.pdf?.writingDirection ?? "ltr";

  const zoomController = useMemo(
    () => createZoomLaneController(2.5, writingDirection),
    // Recreate only when document changes — direction updates go through setDirection
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [page.id],
  );
  const { status, scheduleSave } = useAutosave(page);

  const pageCount = page.pdf?.pageCount ?? 0;

  useEffect(() => {
    const key = page.pdf?.blobKey;
    if (!key) return;
    let cancelled = false;
    void getBlob(key).then(async (data) => {
      if (cancelled) return;
      if (!data) {
        setBlobError(true);
        return;
      }
      setBlob(data);

      if (!languageDetected.current && page.sourceLanguage === "unknown") {
        languageDetected.current = true;
        const fromText = await detectPdfLanguage(data);
        const sourceLanguage = resolvePdfLanguage(fromText, page.pdf?.fileName ?? "");
        if (sourceLanguage !== "unknown") {
          const dir = writingDirectionForLanguage(sourceLanguage);
          onPageChange((prev) => {
            const next: Page = {
              ...prev,
              sourceLanguage,
              pdf: prev.pdf ? { ...prev.pdf, writingDirection: dir } : prev.pdf,
            };
            scheduleSave(next);
            return next;
          });
          zoomController.setDirection(currentPage, dir);
        }
      }
    });
    return () => {
      cancelled = true;
    };
  }, [page.pdf?.blobKey, page.sourceLanguage, page.pdf?.fileName, onPageChange, scheduleSave, zoomController, currentPage]);

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
          rect: defaultFocusRect(writingDirection),
          direction: writingDirection,
          zoomFactor: 2.5,
        } satisfies FocusRegion);
      map[i] = { ...focus, direction: writingDirection };
      if (!fromController) zoomController.regions.set(i, map[i]);
    }
    return map;
  }, [page.ink, pageCount, writingDirection, zoomController]);

  function handleEraseStrokes(pageNum: number, strokeIds: string[]) {
    if (strokeIds.length === 0) return;
    patchInk(pageNum, (data) => ({
      ...data,
      strokes: data.strokes.filter((s) => !strokeIds.includes(s.id)),
    }));
  }

  function handleInkStroke(stroke: Stroke) {
    const existing = strokesByPage[stroke.page] ?? [];

    if (stroke.tool === "eraser") {
      const ids = findStrokesToErase(stroke, existing, 22);
      handleEraseStrokes(stroke.page, ids);
      return;
    }

    if (stroke.tool === "pen" && isScribbleEraseGesture(stroke)) {
      const ids = findStrokesToErase(stroke, existing);
      if (ids.length > 0) {
        handleEraseStrokes(stroke.page, ids);
        return;
      }
    }

    patchInk(stroke.page, (data) => ({
      ...data,
      strokes: [...data.strokes, stroke],
    }));
  }

  function handleStroke(stroke: Stroke) {
    handleInkStroke(stroke);
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
        setFocusScrollToken((t) => t + 1);
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

  function handleWritingDirectionChange(dir: WritingDirection) {
    onPageChange((prev) => {
      const next: Page = {
        ...prev,
        pdf: prev.pdf ? { ...prev.pdf, writingDirection: dir } : prev.pdf,
      };
      scheduleSave(next);
      return next;
    });
    zoomController.setDirection(currentPage, dir);
    const focus = zoomController.getFocus(currentPage);
    if (focus) {
      patchInk(currentPage, (data) => ({
        ...data,
        focusRegions: [focus],
      }));
      setFocusScrollToken((t) => t + 1);
    }
  }

  function handleNudge(direction: "left" | "right") {
    const focus = focusByPage[currentPage];
    if (!focus) return;
    const step = focus.rect.w * 0.7;
    const nextRect =
      direction === "left"
        ? { ...focus.rect, x: Math.max(0, focus.rect.x - step) }
        : { ...focus.rect, x: Math.min(1 - focus.rect.w, focus.rect.x + step) };
    handleFocusDrag(currentPage, nextRect);
    setFocusScrollToken((t) => t + 1);
  }

  function handleTapPlaceFocus(pageNum: number, nx: number, ny: number) {
    if (!zoomLaneEnabled) return;
    const existing = focusByPage[pageNum];
    const size = existing?.rect ?? defaultFocusRect(writingDirection);
    const nextRect = focusRectAtPoint(nx, ny, size);
    setCurrentPage(pageNum);
    handleFocusDrag(pageNum, nextRect);
    setFocusScrollToken((t) => t + 1);
  }

  // Keep page canvas in sync for zoom lane magnification
  useEffect(() => {
    function refreshCanvas() {
      const pdfCanvas = document.querySelector(
        `[data-page="${currentPage}"] [data-pdf-canvas]`,
      );
      if (pdfCanvas instanceof HTMLCanvasElement) {
        setPageCanvas(pdfCanvas);
      }
    }
    refreshCanvas();
    const interval = setInterval(refreshCanvas, 500);
    return () => clearInterval(interval);
  }, [currentPage, blob, focusByPage[currentPage]?.rect.x, focusScrollToken]);

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
          detectedLanguage={page.sourceLanguage}
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
          detectedLanguage={page.sourceLanguage}
          onStroke={handleStroke}
          onStrokeBounds={(bounds) => handleStrokeBounds(currentPage, bounds)}
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
          zoomWindowMode={zoomLaneEnabled}
          allowDirectInk={!zoomLaneEnabled}
          focusScrollToken={focusScrollToken}
          onStroke={handleStroke}
          onStrokeBounds={handleStrokeBounds}
          onFocusDrag={handleFocusDrag}
          onTapPlaceFocus={handleTapPlaceFocus}
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
