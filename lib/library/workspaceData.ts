import type { FolderMeta, PageIndexEntry } from "@/lib/library/types";
import {
  countPagesInFolder,
  ensureLibrary,
  getLastLocation,
  getPage,
  listAllPages,
  listFolders,
  pagePath,
} from "@/lib/library/storage";

export interface WorkspaceDocument {
  id: string;
  name: string;
  href: string;
  updatedAt: string;
  percent: number;
  sourceLanguage: PageIndexEntry["sourceLanguage"];
  contentKind: PageIndexEntry["contentKind"];
}

export interface WorkspaceFolderSummary extends FolderMeta {
  documentCount: number;
}

export interface WorkspaceSnapshot {
  continueDoc: WorkspaceDocument | null;
  recentDocs: WorkspaceDocument[];
  folders: WorkspaceFolderSummary[];
  counts: {
    all: number;
    recent: number;
    favorites: number;
    trash: number;
  };
}

function toDocument(page: PageIndexEntry): WorkspaceDocument {
  return {
    id: page.id,
    name: page.name,
    href: pagePath(page),
    updatedAt: page.updatedAt,
    percent: page.completion.percent,
    sourceLanguage: page.sourceLanguage,
    contentKind: page.contentKind,
  };
}

export function getWorkspaceSnapshot(): WorkspaceSnapshot {
  ensureLibrary();
  const pages = listAllPages();
  const continueId = getLastLocation()?.pageId;
  let continueDoc: WorkspaceDocument | null = null;

  if (continueId) {
    const page =
      pages.find((p) => p.id === continueId) ??
      (getPage(continueId) as PageIndexEntry | null);
    if (page) continueDoc = toDocument(page);
  }

  const recentDocs = pages
    .filter((p) => p.id !== continueDoc?.id)
    .slice(0, 5)
    .map(toDocument);

  const folders: WorkspaceFolderSummary[] = listFolders()
    .filter((f) => !f.isInbox)
    .map((folder) => ({
      ...folder,
      documentCount: countPagesInFolder(folder.id),
    }));

  return {
    continueDoc,
    recentDocs,
    folders,
    counts: {
      all: pages.length,
      recent: pages.length,
      favorites: 0,
      trash: 0,
    },
  };
}
