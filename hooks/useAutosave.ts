"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { saveProjectSafe } from "@/lib/storage/projects";
import type { SaveStatus, TranslationProject } from "@/lib/types/project";

const DEBOUNCE_MS = 400;

export function useAutosave(project: TranslationProject | null) {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const projectRef = useRef<TranslationProject | null>(project);

  useEffect(() => {
    projectRef.current = project;
  }, [project]);

  const flush = useCallback(() => {
    const current = projectRef.current;
    if (!current) return;
    setStatus("saving");
    try {
      saveProjectSafe(current);
      setStatus("saved");
    } catch {
      setStatus("error");
    }
  }, []);

  const scheduleSave = useCallback(
    (next?: TranslationProject) => {
      if (next) projectRef.current = next;
      if (!projectRef.current) return;
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
