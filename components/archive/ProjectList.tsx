"use client";

import Link from "next/link";
import { deleteProject, notifyStorageChange } from "@/lib/storage/projects";
import type { ProjectIndexEntry, SourceLanguage } from "@/lib/types/project";

interface ProjectListProps {
  projects: ProjectIndexEntry[];
  onChanged: () => void;
}

function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

function languageBadge(language: SourceLanguage): string {
  if (language === "hebrew") return "Hebrew";
  if (language === "greek") return "Greek";
  return "Mixed";
}

export function ProjectList({ projects, onChanged }: ProjectListProps) {
  function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    deleteProject(id);
    notifyStorageChange();
    onChanged();
  }

  if (projects.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center dark:border-stone-700 dark:bg-stone-900">
        <p className="text-lg font-medium">No saved projects yet</p>
        <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
          Start a new translation to build your archive.
        </p>
        <Link
          href="/new"
          className="mt-6 inline-flex min-h-12 items-center justify-center rounded-xl bg-amber-600 px-6 font-semibold text-white hover:bg-amber-500"
        >
          New Translation
        </Link>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {projects.map((project) => (
        <li
          key={project.id}
          className="rounded-2xl border border-stone-200 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-900"
        >
          <Link
            href={`/workspace/${project.id}`}
            className="block p-4 sm:p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-lg font-semibold">{project.title}</p>
                <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
                  {project.verseCount}{" "}
                  {project.verseCount === 1 ? "verse" : "verses"} ·{" "}
                  {languageBadge(project.sourceLanguage)} ·{" "}
                  {formatRelativeTime(project.updatedAt)}
                </p>
              </div>
            </div>
          </Link>
          <div className="border-t border-stone-100 px-4 py-2 dark:border-stone-800 sm:px-5">
            <button
              type="button"
              onClick={() => handleDelete(project.id, project.title)}
              className="inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
            >
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
