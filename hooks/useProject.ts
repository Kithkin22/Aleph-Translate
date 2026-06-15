"use client";

import { useCallback, useEffect, useState } from "react";
import { getProject } from "@/lib/storage/projects";
import type { ProjectId, TranslationProject } from "@/lib/types/project";

export function useProject(id: ProjectId) {
  const [project, setProject] = useState<TranslationProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    const loaded = getProject(id);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync from localStorage
    setProject(loaded);
    setMissing(!loaded);
    setLoading(false);
  }, [id]);

  const updateProject = useCallback(
    (updater: (prev: TranslationProject) => TranslationProject) => {
      setProject((prev) => (prev ? updater(prev) : prev));
    },
    [],
  );

  return { project, setProject, updateProject, loading, missing };
}
