export type ProjectId = string;

export type SourceLanguage = "hebrew" | "greek" | "unknown";

/**
 * Text-mode project (MVP). PDF and ink layers are future kinds —
 * @see PDF_ANNOTATOR.md, GOODNOTES_ZOOM.md, lib/ink/
 */

export interface Verse {
  index: number;
  original: string;
  translation: string;
  notes: string;
  /** Parsed reference label, e.g. "1:1" or "3" */
  reference?: string;
}

export interface TranslationProject {
  id: ProjectId;
  title: string;
  sourceLanguage: SourceLanguage;
  createdAt: string;
  updatedAt: string;
  verses: Verse[];
  /** Optional passage reference from Logos header, e.g. "Genesis 1:1–3" */
  passageRef?: string;
}

export interface ProjectIndexEntry {
  id: ProjectId;
  title: string;
  updatedAt: string;
  verseCount: number;
  sourceLanguage: SourceLanguage;
}

export type SaveStatus = "idle" | "saving" | "saved" | "error";
