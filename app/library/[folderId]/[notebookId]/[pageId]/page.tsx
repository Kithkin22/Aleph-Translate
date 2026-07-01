"use client";

import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ChapterNav } from "@/components/library/ChapterNav";
import { PageOrganizer } from "@/components/library/PageOrganizer";
import { VerseBlock } from "@/components/translation/VerseBlock";
import { WorkspaceToolbar } from "@/components/translation/WorkspaceToolbar";
import { ExportForChatGptButton } from "@/components/export/ExportForChatGptButton";
import { useAutosave } from "@/hooks/useAutosave";
import { usePage } from "@/hooks/usePage";
import { computePageCompletion } from "@/lib/library/completion";
import { useLibraryInit } from "@/hooks/useLibraryInit";
import { getNotebook, isPageInInbox, setLastLocation } from "@/lib/library/storage";
import type { Page } from "@/lib/library/types";

const PdfWorkspace = dynamic(
  () => import("@/components/pdf/PdfWorkspace").then((m) => m.PdfWorkspace),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-dvh items-center justify-center bg-white text-gray-500">
        Loading translate workspace…
      </div>
    ),
  },
);

export default function PageWorkspace() {
  const params = useParams<{ folderId: string; notebookId: string; pageId: string }>();
  const router = useRouter();
  const { page, updatePage, loading, missing } = usePage(params.pageId);
  const { status, scheduleSave } = useAutosave(page);
  const libraryReady = useLibraryInit();

  const backHref = `/library/${params.folderId}/${params.notebookId}`;

  useEffect(() => {
    if (libraryReady && !loading && missing) {
      router.replace(backHref);
    }
  }, [libraryReady, loading, missing, router, backHref]);

  useEffect(() => {
    if (!page) return;
    setLastLocation({
      folderId: page.folderId,
      notebookId: page.notebookId,
      pageId: page.id,
    });
  }, [page]);

  function patchPage(updater: (prev: Page) => Page) {
    updatePage((prev) => {
      if (!prev) return prev;
      const next = updater(prev);
      next.completion = computePageCompletion(next);
      scheduleSave(next);
      return next;
    });
  }

  const notebook = page ? getNotebook(page.notebookId) : null;
  const inInbox = page ? isPageInInbox(page) : false;

  if (loading || !page) {
    return (
      <AppShell title="Document" backHref={backHref}>
        <p className="text-stone-500">Loading…</p>
      </AppShell>
    );
  }

  if (page.contentKind === "pdf") {
    return (
      <PdfWorkspace
        page={page}
        backHref={backHref}
        onPageChange={updatePage}
      />
    );
  }

  return (
    <AppShell
      title={page.name}
      backHref={backHref}
      trailing={
        <>
          <ExportForChatGptButton page={page} />
          <WorkspaceToolbar status={status} />
        </>
      }
    >
      <PageOrganizer page={page} />
      {!inInbox ? <ChapterNav page={page} /> : null}

      <div className="mb-6 flex flex-col gap-3">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-stone-600 dark:text-stone-400">
            Page title
          </span>
          <input
            type="text"
            value={page.title}
            onChange={(e) =>
              patchPage((prev) => ({ ...prev, title: e.target.value, name: e.target.value }))
            }
            className="min-h-12 w-full rounded-xl border border-stone-200 bg-white px-4 text-base font-medium outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-500/15 dark:border-stone-700 dark:bg-stone-900"
          />
        </label>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          {inInbox
            ? "Inbox · quick start"
            : `${notebook?.name ?? "Notebook"} ·`}{" "}
          {page.verses.length}{" "}
          {page.verses.length === 1 ? "verse" : "verses"}
          {page.sourceLanguage !== "unknown" ? ` · ${page.sourceLanguage}` : ""}
          {page.passageRef ? ` · ${page.passageRef}` : ""}
        </p>
      </div>

      <div className="flex flex-col gap-5">
        {page.verses.map((verse) => (
          <VerseBlock
            key={verse.index}
            verse={verse}
            sourceLanguage={page.sourceLanguage}
            onTranslationChange={(value) =>
              patchPage((prev) => ({
                ...prev,
                verses: prev.verses.map((v) =>
                  v.index === verse.index ? { ...v, translation: value } : v,
                ),
              }))
            }
            onNotesChange={(value) =>
              patchPage((prev) => ({
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
