"use client";

import { ContinueTranslatingCard } from "@/components/workspace/ContinueTranslatingCard";
import { FolderSummaryGrid } from "@/components/workspace/FolderSummaryGrid";
import { RecentDocumentsList } from "@/components/workspace/RecentDocumentsList";
import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";
import { WorkspaceToolbar } from "@/components/workspace/WorkspaceToolbar";
import { useWorkspaceData } from "@/hooks/useWorkspaceData";

export function WorkspaceHome() {
  const { data, ready } = useWorkspaceData();

  if (!ready) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-white text-gray-500">
        Loading…
      </div>
    );
  }

  return (
    <WorkspaceShell data={data}>
      <WorkspaceToolbar />
      <div className="flex-1 overflow-y-auto px-6 py-6 md:px-8 md:py-8">
        {data.continueDoc ? (
          <ContinueTranslatingCard doc={data.continueDoc} />
        ) : (
          <section className="mb-8">
            <h2 className="mb-3 text-lg font-semibold text-gray-900">
              Continue Translating
            </h2>
            <div className="rounded-lg border border-dashed border-gray-200 px-4 py-10 text-center text-sm text-gray-500">
              Import a PDF or open a document to begin translating.
            </div>
          </section>
        )}
        <RecentDocumentsList documents={data.recentDocs} />
        <FolderSummaryGrid folders={data.folders} />
      </div>
    </WorkspaceShell>
  );
}
