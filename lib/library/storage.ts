import {
  LIBRARY_KEY,
  MIGRATION_V1_KEY,
  NOTEBOOKS_KEY,
  PAGES_INDEX_KEY,
  pageKey,
  projectKey,
  PROJECTS_INDEX_KEY,
} from "@/lib/storage/keys";
import { computePageCompletion } from "@/lib/library/completion";
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
import {
  DEFAULT_FOLDER_NAMES,
  INBOX_FOLDER_NAME,
  INBOX_NOTEBOOK_NAME,
} from "@/lib/library/types";
import type { ProjectIndexEntry, TranslationProject } from "@/lib/types/project";

const STORAGE_EVENT = "aleph-storage-change";

export function notifyStorageChange(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(STORAGE_EVENT));
  }
}

export function subscribeStorage(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(STORAGE_EVENT, callback);
  return () => window.removeEventListener(STORAGE_EVENT, callback);
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    if (
      error instanceof DOMException &&
      (error.name === "QuotaExceededError" || error.code === 22)
    ) {
      throw new StorageQuotaError();
    }
    throw error;
  }
}

function now(): string {
  return new Date().toISOString();
}

function newId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function readLibraryRoot(): Library | null {
  return readJson<Library | null>(LIBRARY_KEY, null);
}

function writeLibraryRoot(library: Library): void {
  writeJson(LIBRARY_KEY, library);
}

function readNotebooks(): NotebookMeta[] {
  return readJson<NotebookMeta[]>(NOTEBOOKS_KEY, []);
}

function writeNotebooks(notebooks: NotebookMeta[]): void {
  writeJson(NOTEBOOKS_KEY, notebooks);
}

function readPagesIndex(): PageIndexEntry[] {
  return readJson<PageIndexEntry[]>(PAGES_INDEX_KEY, []);
}

function writePagesIndex(entries: PageIndexEntry[]): void {
  writeJson(PAGES_INDEX_KEY, entries);
}

function pageToIndexEntry(page: Page): PageIndexEntry {
  return {
    id: page.id,
    notebookId: page.notebookId,
    folderId: page.folderId,
    name: page.name,
    sortOrder: page.sortOrder,
    contentKind: page.contentKind,
    sourceLanguage: page.sourceLanguage,
    updatedAt: page.updatedAt,
    completion: computePageCompletion(page),
  };
}

function upsertPageIndex(page: Page): void {
  const entries = readPagesIndex().filter((e) => e.id !== page.id);
  entries.push(pageToIndexEntry(page));
  writePagesIndex(entries);
}

function seedDefaultFolders(): FolderMeta[] {
  const ts = now();
  return DEFAULT_FOLDER_NAMES.map((name, i) => ({
    id: newId(),
    name,
    sortOrder: i,
    isDefault: true,
    createdAt: ts,
    updatedAt: ts,
  }));
}

function folderForLanguage(
  folders: FolderMeta[],
  sourceLanguage: string,
): FolderMeta {
  if (sourceLanguage === "greek") {
    return folders.find((f) => f.name === "Greek") ?? folders[0];
  }
  return folders.find((f) => f.name === "Hebrew") ?? folders[0];
}

function migrateLegacyProjects(): void {
  try {
    if (localStorage.getItem(MIGRATION_V1_KEY)) return;

    const legacyIndex = readJson<ProjectIndexEntry[]>(PROJECTS_INDEX_KEY, []);
    if (legacyIndex.length === 0) {
      localStorage.setItem(MIGRATION_V1_KEY, "1");
      return;
    }

    const library = readLibraryRoot();
    if (!library) return;

    let notebooks = readNotebooks();
    const folders = library.folders;

    for (const entry of legacyIndex) {
      const raw = localStorage.getItem(projectKey(entry.id));
      if (!raw) continue;
      let project: TranslationProject;
      try {
        project = JSON.parse(raw) as TranslationProject;
      } catch {
        continue;
      }

      const folder = folderForLanguage(folders, project.sourceLanguage);
      if (!folder) continue;

      let notebook = notebooks.find(
        (n) => n.folderId === folder.id && n.name === "Imported",
      );
      if (!notebook) {
        const ts = now();
        notebook = {
          id: newId(),
          folderId: folder.id,
          name: "Imported",
          sortOrder: notebooks.filter((n) => n.folderId === folder.id).length,
          createdAt: ts,
          updatedAt: ts,
        };
        notebooks = [...notebooks, notebook];
      }

      const pageCount = readPagesIndex().filter(
        (p) => p.notebookId === notebook!.id,
      ).length;
      const ts = project.updatedAt || now();
      const page: Page = {
        id: project.id,
        notebookId: notebook.id,
        folderId: folder.id,
        name: project.title,
        sortOrder: pageCount,
        contentKind: "text",
        sourceLanguage: project.sourceLanguage,
        createdAt: project.createdAt,
        updatedAt: ts,
        title: project.title,
        verses: project.verses,
        passageRef: project.passageRef,
        completion: computePageCompletion({ verses: project.verses }),
      };

      writeJson(pageKey(page.id), page);
      upsertPageIndex(page);
    }

    writeNotebooks(notebooks);
    localStorage.setItem(MIGRATION_V1_KEY, "1");
    notifyStorageChange();
  } catch {
    localStorage.setItem(MIGRATION_V1_KEY, "1");
  }
}

export function ensureLibrary(): Library {
  if (typeof window === "undefined") {
    return { version: 1, folders: [] };
  }

  let library = readLibraryRoot();
  if (!library) {
    library = { version: 1, folders: seedDefaultFolders() };
    writeLibraryRoot(library);
    writeNotebooks([]);
    writePagesIndex([]);
  }

  migrateLegacyProjects();
  ensureInbox();
  return readLibraryRoot()!;
}

function ensureInbox(): { folderId: FolderId; notebookId: NotebookId } {
  const library = readLibraryRoot()!;
  if (library.inbox) {
    const folder = library.folders.find((f) => f.id === library.inbox!.folderId);
    const notebook = readNotebooks().find((n) => n.id === library.inbox!.notebookId);
    if (folder?.isInbox && notebook) return library.inbox;
  }

  const ts = now();
  const inboxFolder: FolderMeta = {
    id: newId(),
    name: INBOX_FOLDER_NAME,
    sortOrder: -1,
    isInbox: true,
    createdAt: ts,
    updatedAt: ts,
  };
  library.folders.push(inboxFolder);

  const inboxNotebook: NotebookMeta = {
    id: newId(),
    folderId: inboxFolder.id,
    name: INBOX_NOTEBOOK_NAME,
    sortOrder: 0,
    createdAt: ts,
    updatedAt: ts,
  };
  writeNotebooks([...readNotebooks(), inboxNotebook]);

  library.inbox = { folderId: inboxFolder.id, notebookId: inboxNotebook.id };
  writeLibraryRoot(library);
  return library.inbox;
}

export function getInbox(): { folderId: FolderId; notebookId: NotebookId } {
  return ensureInbox();
}

export function isInboxFolder(folderId: FolderId): boolean {
  const folder = ensureLibrary().folders.find((f) => f.id === folderId);
  return folder?.isInbox === true;
}

export function isPageInInbox(page: Pick<Page, "folderId">): boolean {
  return isInboxFolder(page.folderId);
}

export function listFilingFolders(): FolderMeta[] {
  return listFolders().filter((f) => !f.isInbox);
}

export function getLibrary(): Library {
  return ensureLibrary();
}

export function listFolders(): FolderMeta[] {
  return [...ensureLibrary().folders].sort((a, b) => {
    if (a.isInbox && !b.isInbox) return -1;
    if (!a.isInbox && b.isInbox) return 1;
    return a.sortOrder - b.sortOrder;
  });
}

export function getFolder(id: FolderId): FolderMeta | null {
  return listFolders().find((f) => f.id === id) ?? null;
}

export function createFolder(name: string): FolderMeta {
  const library = ensureLibrary();
  const ts = now();
  const folder: FolderMeta = {
    id: newId(),
    name: name.trim() || "New Folder",
    sortOrder: library.folders.length,
    createdAt: ts,
    updatedAt: ts,
  };
  library.folders.push(folder);
  writeLibraryRoot({ ...library, folders: library.folders });
  notifyStorageChange();
  return folder;
}

export function renameFolder(id: FolderId, name: string): FolderMeta {
  const library = ensureLibrary();
  const folder = library.folders.find((f) => f.id === id);
  if (!folder) throw new Error("Folder not found");
  folder.name = name.trim() || folder.name;
  folder.updatedAt = now();
  writeLibraryRoot(library);
  notifyStorageChange();
  return folder;
}

export function listNotebooks(folderId: FolderId): NotebookMeta[] {
  return readNotebooks()
    .filter((n) => n.folderId === folderId)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getNotebook(id: NotebookId): NotebookMeta | null {
  return readNotebooks().find((n) => n.id === id) ?? null;
}

export function createNotebook(folderId: FolderId, name: string): NotebookMeta {
  const notebooks = readNotebooks();
  const ts = now();
  const notebook: NotebookMeta = {
    id: newId(),
    folderId,
    name: name.trim() || "New Notebook",
    sortOrder: notebooks.filter((n) => n.folderId === folderId).length,
    createdAt: ts,
    updatedAt: ts,
  };
  writeNotebooks([...notebooks, notebook]);
  notifyStorageChange();
  return notebook;
}

export function renameNotebook(id: NotebookId, name: string): NotebookMeta {
  const notebooks = readNotebooks();
  const notebook = notebooks.find((n) => n.id === id);
  if (!notebook) throw new Error("Notebook not found");
  notebook.name = name.trim() || notebook.name;
  notebook.updatedAt = now();
  writeNotebooks(notebooks);
  notifyStorageChange();
  return notebook;
}

export function reorderNotebooks(
  folderId: FolderId,
  orderedIds: NotebookId[],
): void {
  const notebooks = readNotebooks();
  orderedIds.forEach((id, index) => {
    const nb = notebooks.find((n) => n.id === id && n.folderId === folderId);
    if (nb) {
      nb.sortOrder = index;
      nb.updatedAt = now();
    }
  });
  writeNotebooks(notebooks);
  notifyStorageChange();
}

export function listPages(notebookId: NotebookId): PageIndexEntry[] {
  return readPagesIndex()
    .filter((p) => p.notebookId === notebookId)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getPage(id: PageId): Page | null {
  if (typeof window === "undefined") return null;
  return readJson<Page | null>(pageKey(id), null);
}

export class StorageQuotaError extends Error {
  constructor(message = "Storage limit reached. Free space or remove old pages.") {
    super(message);
    this.name = "StorageQuotaError";
  }
}

export function savePage(page: Page): void {
  const updated: Page = {
    ...page,
    updatedAt: now(),
    completion: computePageCompletion(page),
  };
  try {
    writeJson(pageKey(updated.id), updated);
    upsertPageIndex(updated);

    const library = ensureLibrary();
    library.lastLocation = {
      folderId: updated.folderId,
      notebookId: updated.notebookId,
      pageId: updated.id,
    };
    writeLibraryRoot(library);
    notifyStorageChange();
  } catch (error) {
    if (
      error instanceof DOMException &&
      (error.name === "QuotaExceededError" || error.code === 22)
    ) {
      throw new StorageQuotaError();
    }
    throw error;
  }
}

export function savePageSafe(page: Page): void {
  savePage(page);
}

export function deletePage(id: PageId): void {
  localStorage.removeItem(pageKey(id));
  writePagesIndex(readPagesIndex().filter((e) => e.id !== id));

  const library = ensureLibrary();
  if (library.lastLocation?.pageId === id) {
    delete library.lastLocation;
    writeLibraryRoot(library);
  }
  notifyStorageChange();
}

export function getLastLocation(): LibraryLocation | null {
  return ensureLibrary().lastLocation ?? null;
}

export function setLastLocation(location: LibraryLocation): void {
  const library = ensureLibrary();
  library.lastLocation = location;
  writeLibraryRoot(library);
  notifyStorageChange();
}

export function pagePath(page: Page | PageIndexEntry): string {
  return `/library/${page.folderId}/${page.notebookId}/${page.id}`;
}

export function lastLocationPath(): string | null {
  const loc = getLastLocation();
  if (!loc) return null;
  const page = getPage(loc.pageId);
  if (!page) return null;
  return pagePath(page);
}

export interface CreatePageInput {
  folderId: FolderId;
  notebookId: NotebookId;
  name: string;
  title: string;
  sourceLanguage: Page["sourceLanguage"];
  verses: Page["verses"];
  passageRef?: string;
}

export function createPage(input: CreatePageInput): Page {
  const ts = now();
  const sortOrder = listPages(input.notebookId).length;
  const page: Page = {
    id: newId(),
    notebookId: input.notebookId,
    folderId: input.folderId,
    name: input.name.trim() || input.title,
    sortOrder,
    contentKind: "text",
    sourceLanguage: input.sourceLanguage,
    createdAt: ts,
    updatedAt: ts,
    title: input.title,
    verses: input.verses,
    passageRef: input.passageRef,
    completion: computePageCompletion({ verses: input.verses }),
  };
  savePage(page);
  return page;
}

export interface QuickStartInput {
  name?: string;
  title: string;
  sourceLanguage: Page["sourceLanguage"];
  verses: Page["verses"];
  passageRef?: string;
}

/** Create a chapter in the Inbox — file into a folder/notebook later. */
export function createQuickStartPage(input: QuickStartInput): Page {
  const inbox = getInbox();
  return createPage({
    folderId: inbox.folderId,
    notebookId: inbox.notebookId,
    name: input.name?.trim() || input.title,
    title: input.title,
    sourceLanguage: input.sourceLanguage,
    verses: input.verses,
    passageRef: input.passageRef,
  });
}

export function movePageToNotebook(
  pageId: PageId,
  folderId: FolderId,
  notebookId: NotebookId,
): Page {
  const page = getPage(pageId);
  if (!page) throw new Error("Page not found");
  if (isInboxFolder(folderId)) throw new Error("Choose a library folder, not Inbox");

  const moved: Page = {
    ...page,
    folderId,
    notebookId,
    sortOrder: listPages(notebookId).length,
  };
  savePage(moved);
  return moved;
}

export function notebookPageCount(notebookId: NotebookId): number {
  return listPages(notebookId).length;
}
