"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { savePageSafe } from "@/lib/library/storage";
import type { Page } from "@/lib/library/types";
import type { SaveStatus } from "@/lib/types/project";

const DEBOUNCE_MS = 400;

export function useAutosave(page: Page | null) {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pageRef = useRef<Page | null>(page);

  useEffect(() => {
    pageRef.current = page;
  }, [page]);

  const flush = useCallback(() => {
    const current = pageRef.current;
    if (!current) return;
    setStatus("saving");
    try {
      savePageSafe(current);
      setStatus("saved");
    } catch {
      setStatus("error");
    }
  }, []);

  const scheduleSave = useCallback(
    (next?: Page) => {
      if (next) pageRef.current = next;
      if (!pageRef.current) return;
      setStatus("saving");
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(flush, DEBOUNCE_MS);
    },
    [flush],
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return { status, scheduleSave, flush };
}
