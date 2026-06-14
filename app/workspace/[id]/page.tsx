"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { VerseBlock } from "@/components/translation/VerseBlock";
import { WorkspaceToolbar } from "@/components/translation/WorkspaceToolbar";
import { useAutosave } from "@/hooks/useAutosave";
import { useProject } from "@/hooks/useProject";
import type { TranslationProject } from "@/lib/types/project";

export default function WorkspacePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { project, updateProject, loading, missing } = useProject(params.id);
  const { status, scheduleSave } = useAutosave(project);

  useEffect(() => {
    if (!loading && missing) {
      router.replace("/archive");
    }
  }, [loading, missing, router]);

  function patchProject(
    updater: (prev: TranslationProject) => TranslationProject,
  ) {
    updateProject((prev) => {
      if (!prev) return prev;
      const next = updater(prev);
      scheduleSave(next);
      return next;
    });
  }

  if (loading || !project) {
    return (
      <AppShell title="Workspace" backHref="/">
        <p className="text-stone-500">Loading…</p>
      </AppShell>
    );
  }

  return (
    <AppShell
      title={project.title || "Workspace"}
      backHref="/"
      trailing={<WorkspaceToolbar status={status} />}
    >
      <div className="mb-6 flex flex-col gap-3">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-stone-600 dark:text-stone-400">
            Project title
          </span>
          <input
            type="text"
            value={project.title}
            onChange={(e) =>
              patchProject((prev) => ({ ...prev, title: e.target.value }))
            }
            className="min-h-12 w-full rounded-xl border border-stone-200 bg-white px-4 text-base font-medium outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-500/15 dark:border-stone-700 dark:bg-stone-900"
          />
        </label>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          {project.verses.length}{" "}
          {project.verses.length === 1 ? "verse" : "verses"}
          {project.sourceLanguage !== "unknown"
            ? ` · ${project.sourceLanguage}`
            : ""}
          {project.passageRef ? ` · ${project.passageRef}` : ""}
        </p>
      </div>

      <div className="flex flex-col gap-5">
        {project.verses.map((verse) => (
          <VerseBlock
            key={verse.index}
            verse={verse}
            sourceLanguage={project.sourceLanguage}
            onTranslationChange={(value) =>
              patchProject((prev) => ({
                ...prev,
                verses: prev.verses.map((v) =>
                  v.index === verse.index ? { ...v, translation: value } : v,
                ),
              }))
            }
            onNotesChange={(value) =>
              patchProject((prev) => ({
                ...prev,
                verses: prev.verses.map((v) =>
                  v.index === verse.index ? { ...v, notes: value } : v,
                ),
              }))
            }
          />
        ))}
      </div>
    </AppShell>
  );
}
