"use client";

import { useEffect, useState } from "react";
import type { FolderMeta } from "@/lib/library/types";
import {
  ensureLibrary,
  listFolders,
  subscribeStorage,
} from "@/lib/library/storage";

/** Load library folders after mount to avoid SSR/hydration crashes. */
export function useLibraryFolders(): {
  folders: FolderMeta[];
  ready: boolean;
} {
  const [folders, setFolders] = useState<FolderMeta[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    function refresh() {
      try {
        ensureLibrary();
        setFolders(listFolders());
      } catch {
        setFolders([]);
      }
    }

    refresh();
    // Client-only storage init after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mount gate for localStorage
    setReady(true);
    return subscribeStorage(refresh);
  }, []);

  return { folders, ready };
}
