"use client";

import { useState } from "react";
import { copyOrDownload } from "@/lib/export/copyOrDownload";
import { extractPdfText } from "@/lib/export/extractPdfText";
import { formatWorkspaceForChatGpt, sanitizeExportFilename } from "@/lib/export/toChatGpt";
import { getFolder, getNotebook } from "@/lib/library/storage";
import type { Page } from "@/lib/library/types";

type ExportStatus = "idle" | "loading" | "copied" | "downloaded" | "error";

interface ExportForChatGptButtonProps {
  page: Page;
  pdfBlob?: ArrayBuffer | null;
  className?: string;
  compact?: boolean;
}

export function ExportForChatGptButton({
  page,
  pdfBlob,
  className = "",
  compact = false,
}: ExportForChatGptButtonProps) {
  const [status, setStatus] = useState<ExportStatus>("idle");

  async function handleExport() {
    if (status === "loading") return;
    setStatus("loading");

    try {
      let pdfText: string | undefined;
      if (page.contentKind === "pdf" && pdfBlob) {
        pdfText = await extractPdfText(pdfBlob);
      }

      const folder = getFolder(page.folderId);
      const notebook = getNotebook(page.notebookId);
      const markdown = formatWorkspaceForChatGpt(page, {
        folderName: folder?.name,
        notebookName: notebook?.name,
        pdfText,
      });

      const filename = `${sanitizeExportFilename(page.title)}-chatgpt-review.md`;
      const result = await copyOrDownload(markdown, filename);
      setStatus(result);
      window.setTimeout(() => setStatus("idle"), 2500);
    } catch {
      setStatus("error");
      window.setTimeout(() => setStatus("idle"), 3000);
    }
  }

  const label =
    status === "loading"
      ? "Preparing…"
      : status === "copied"
        ? "Copied!"
        : status === "downloaded"
          ? "Downloaded"
          : status === "error"
            ? "Export failed"
            : compact
              ? "ChatGPT"
              : "Export for ChatGPT";

  return (
    <button
      type="button"
      onClick={() => void handleExport()}
      disabled={status === "loading"}
      title="Copy workspace history as markdown for ChatGPT review"
      aria-label="Export workspace for ChatGPT review"
      className={`inline-flex min-h-9 shrink-0 items-center justify-center gap-1.5 rounded-md border border-gray-200 bg-white px-2.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-60 ${className}`}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden
      >
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      <span>{label}</span>
    </button>
  );
}
