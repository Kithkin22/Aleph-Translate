"use client";

import { useSyncExternalStore } from "react";
import { ensureLibrary, subscribeStorage } from "@/lib/library/storage";

function getInitSnapshot(): boolean {
  ensureLibrary();
  return true;
}

/** Ensures library is seeded/migrated before reading storage. */
export function useLibraryInit(): boolean {
  return useSyncExternalStore(subscribeStorage, getInitSnapshot, () => false);
}
