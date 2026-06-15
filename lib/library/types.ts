/**
 * Library organizational model — Folder → Notebook → Page.
 * Core structure for Aleph Translate; replaces flat archive long-term.
 * @see LIBRARY_STRUCTURE.md
 */

import type { FolderColorId, NotebookPaper } from "@/lib/library/appearance";
import type { InkDocument, WritingDirection } from "@/lib/ink/types";
import type { SourceLanguage, Verse } from "@/lib/types/project";

export type FolderId = string;
export type NotebookId = string;
export type PageId = string;

export type PageContentKind = "text" | "pdf" | "handwritten";

export type PageCompletionStatus = "not_started" | "in_progress" | "complete";

export interface PageCompletion {
  status: PageCompletionStatus;
  translatedCount: number;
  totalVerses: number;
  percent: number;
}

export interface LibraryLocation {
  folderId: FolderId;
  notebookId: NotebookId;
  pageId: PageId;
}

export interface FolderMeta {
  id: FolderId;
  name: string;
  sortOrder: number;
  /** Finder-style folder color */
  color?: FolderColorId;
  /** System folder for quick-start imports awaiting filing */
  isInbox?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotebookMeta {
  id: NotebookId;
  folderId: FolderId;
  name: string;
  sortOrder: number;
  /** White or black paper for the notebook icon and future PDF workspace */
  paper?: NotebookPaper;
  /** Accent color on notebook cover */
  color?: FolderColorId;
  createdAt: string;
  updatedAt: string;
}

/** Lightweight entry for notebook page lists and library overview */
export interface PageIndexEntry {
  id: PageId;
  notebookId: NotebookId;
  folderId: FolderId;
  name: string;
  sortOrder: number;
  contentKind: PageContentKind;
  sourceLanguage: SourceLanguage;
  updatedAt: string;
  completion: PageCompletion;
}

/** PDF attachment for translation workspace */
export interface PdfPageRef {
  fileName: string;
  pageCount: number;
  blobKey: string;
  writingDirection?: WritingDirection;
  /** Last viewed page (1-based) for resume */
  currentPage?: number;
}

/** Full page content (successor to TranslationProject) */
export interface Page extends PageIndexEntry {
  createdAt: string;
  title: string;
  verses: Verse[];
  passageRef?: string;
  pdf?: PdfPageRef;
  ink?: InkDocument;
}

export interface Library {
  version: 1;
  folders: FolderMeta[];
  inbox?: { folderId: FolderId; notebookId: NotebookId };
  lastLocation?: LibraryLocation;
}

export const INBOX_FOLDER_NAME = "Inbox";
export const INBOX_NOTEBOOK_NAME = "Quick Start";
