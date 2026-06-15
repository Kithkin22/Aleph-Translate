"use client";

import { useEffect, useState } from "react";
import { ensureLibrary, subscribeStorage } from "@/lib/library/storage";

/** Ensures library is seeded/migrated after mount (avoids SSR hydration crashes). */
export function useLibraryInit(): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      ensureLibrary();
    } catch {
      // Storage blocked or quota exceeded — pages show empty/error states.
    }
    // Client-only storage init after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mount gate for localStorage
    setReady(true);
    return subscribeStorage(() => {
      try {
        ensureLibrary();
      } catch {
        // Ignore refresh failures.
      }
    });
  }, []);

  return ready;
}
