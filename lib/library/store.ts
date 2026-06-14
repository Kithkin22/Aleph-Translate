/**
 * Library persistence contract — implement in L1; MVP still uses projects.ts.
 * @see LIBRARY_STRUCTURE.md
 */

import type {
  FolderId,
  FolderMeta,
  Library,
  LibraryLocation,
  NotebookId,
  NotebookMeta,
  Page,
  PageId,
  PageIndexEntry,
} from "@/lib/library/types";
import type { PageCompletion } from "@/lib/library/types";

export interface LibraryStore {
  getLibrary(): Library;
  seedDefaultsIfEmpty(): Library;

  listFolders(): FolderMeta[];
  getFolder(id: FolderId): FolderMeta | null;
  createFolder(name: string): FolderMeta;
  renameFolder(id: FolderId, name: string): FolderMeta;

  listNotebooks(folderId: FolderId): NotebookMeta[];
  getNotebook(id: NotebookId): NotebookMeta | null;
  createNotebook(folderId: FolderId, name: string): NotebookMeta;
  renameNotebook(id: NotebookId, name: string): NotebookMeta;
  /** Drag-and-drop reorder within a folder; rewrites sortOrder on each NotebookMeta. */
  reorderNotebooks(folderId: FolderId, orderedIds: NotebookId[]): void;

  listPages(notebookId: NotebookId): PageIndexEntry[];
  getPage(id: PageId): Page | null;
  savePage(page: Page): void;
  deletePage(id: PageId): void;

  getLastLocation(): LibraryLocation | null;
  setLastLocation(location: LibraryLocation): void;

  computeCompletion(page: Page): PageCompletion;
}

/** Maps MVP TranslationProject id to library Page id (1:1 during migration). */
export type LegacyProjectId = PageId;
