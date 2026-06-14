import {
  LAST_OPENED_KEY,
  PROJECTS_INDEX_KEY,
  projectKey,
} from "@/lib/storage/keys";
import type {
  ProjectId,
  ProjectIndexEntry,
  TranslationProject,
} from "@/lib/types/project";
import { defaultTitle, parseVerses } from "@/lib/text/parseVerses";

const STORAGE_EVENT = "aleph-storage-change";

export function notifyStorageChange(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(STORAGE_EVENT));
  }
}

export function subscribeStorage(callback: () => void): () => void {
  window.addEventListener(STORAGE_EVENT, callback);
  return () => window.removeEventListener(STORAGE_EVENT, callback);
}

function readIndex(): ProjectIndexEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(PROJECTS_INDEX_KEY);
    return raw ? (JSON.parse(raw) as ProjectIndexEntry[]) : [];
  } catch {
    return [];
  }
}

function writeIndex(entries: ProjectIndexEntry[]): void {
  localStorage.setItem(PROJECTS_INDEX_KEY, JSON.stringify(entries));
}

function upsertIndexEntry(project: TranslationProject): void {
  const entries = readIndex().filter((e) => e.id !== project.id);
  entries.push({
    id: project.id,
    title: project.title,
    updatedAt: project.updatedAt,
    verseCount: project.verses.length,
    sourceLanguage: project.sourceLanguage,
  });
  entries.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
  writeIndex(entries);
}

export function listProjects(): ProjectIndexEntry[] {
  return readIndex();
}

export function getProject(id: ProjectId): TranslationProject | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(projectKey(id));
    return raw ? (JSON.parse(raw) as TranslationProject) : null;
  } catch {
    return null;
  }
}

export function saveProject(project: TranslationProject): void {
  const updated: TranslationProject = {
    ...project,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(projectKey(updated.id), JSON.stringify(updated));
  upsertIndexEntry(updated);
  localStorage.setItem(LAST_OPENED_KEY, updated.id);
  notifyStorageChange();
}

export function deleteProject(id: ProjectId): void {
  localStorage.removeItem(projectKey(id));
  writeIndex(readIndex().filter((e) => e.id !== id));
  if (localStorage.getItem(LAST_OPENED_KEY) === id) {
    localStorage.removeItem(LAST_OPENED_KEY);
  }
  notifyStorageChange();
}

export function getLastOpenedId(): ProjectId | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(LAST_OPENED_KEY);
}

export function createProject(rawText: string): TranslationProject {
  const parsed = parseVerses(rawText);
  const now = new Date().toISOString();
  const project: TranslationProject = {
    id: crypto.randomUUID(),
    title: defaultTitle(parsed, rawText),
    sourceLanguage: parsed.sourceLanguage,
    createdAt: now,
    updatedAt: now,
    verses: parsed.verses,
    passageRef: parsed.passageRef,
  };
  saveProject(project);
  return project;
}

export class StorageQuotaError extends Error {
  constructor(message = "Storage limit reached. Free space or remove old projects.") {
    super(message);
    this.name = "StorageQuotaError";
  }
}

export function saveProjectSafe(project: TranslationProject): void {
  try {
    saveProject(project);
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
