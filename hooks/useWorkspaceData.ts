"use client";

import { useEffect, useState } from "react";
import {
  getWorkspaceSnapshot,
  type WorkspaceSnapshot,
} from "@/lib/library/workspaceData";
import { subscribeStorage } from "@/lib/library/storage";

const EMPTY: WorkspaceSnapshot = {
  continueDoc: null,
  recentDocs: [],
  folders: [],
  counts: { all: 0, recent: 0, favorites: 0, trash: 0 },
};

export function useWorkspaceData(): { data: WorkspaceSnapshot; ready: boolean } {
  const [data, setData] = useState<WorkspaceSnapshot>(EMPTY);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    function refresh() {
      try {
        setData(getWorkspaceSnapshot());
      } catch {
        setData(EMPTY);
      }
    }
    refresh();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mount gate
    setReady(true);
    return subscribeStorage(refresh);
  }, []);

  return { data, ready };
}
