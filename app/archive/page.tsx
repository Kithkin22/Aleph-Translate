"use client";

import { AppShell } from "@/components/layout/AppShell";
import { ProjectList } from "@/components/archive/ProjectList";
import { useProjectsList } from "@/hooks/useProjectsList";

export default function ArchivePage() {
  const { projects, refresh } = useProjectsList();

  return (
    <AppShell title="Archive" backHref="/">
      <p className="mb-6 text-base text-stone-600 dark:text-stone-400">
        Reopen a saved translation project. Sorted by most recently updated.
      </p>
      <ProjectList projects={projects} onChanged={refresh} />
    </AppShell>
  );
}
