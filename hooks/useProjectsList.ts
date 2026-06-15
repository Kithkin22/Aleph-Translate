"use client";

import { useSyncExternalStore } from "react";
import { listProjects, subscribeStorage } from "@/lib/storage/projects";
import type { ProjectIndexEntry } from "@/lib/types/project";

export function useProjectsList() {
  const projects = useSyncExternalStore(
    subscribeStorage,
    listProjects,
    (): ProjectIndexEntry[] => [],
  );

  return { projects, refresh: () => {} };
}
