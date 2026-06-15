"use client";

import { useCallback, useEffect, useState } from "react";
import { getPage } from "@/lib/library/storage";
import type { Page, PageId } from "@/lib/library/types";

export function usePage(id: PageId) {
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    const loaded = getPage(id);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync from localStorage
    setPage(loaded);
    setMissing(!loaded);
    setLoading(false);
  }, [id]);

  const updatePage = useCallback((updater: (prev: Page) => Page) => {
    setPage((prev) => (prev ? updater(prev) : prev));
  }, []);

  return { page, updatePage, loading, missing };
}
