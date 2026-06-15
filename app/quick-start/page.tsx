"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PdfImportForm } from "@/components/pdf/PdfImportForm";
import { useLibraryInit } from "@/hooks/useLibraryInit";
import { createQuickStartPdf, pagePath } from "@/lib/library/storage";

export default function QuickStartPage() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const ready = useLibraryInit();

  async function handleImport(input: {
    title: string;
    fileName: string;
    pageCount: number;
    buffer: ArrayBuffer;
  }) {
    setBusy(true);
    try {
      const page = await createQuickStartPdf({
        name: input.title,
        title: input.title,
        fileName: input.fileName,
        pageCount: input.pageCount,
        pdfBuffer: input.buffer,
      });
      router.push(pagePath(page));
    } catch {
      setBusy(false);
      alert("Could not save PDF. Your browser storage may be full.");
    }
  }

  if (!ready) {
    return (
      <AppShell title="Import PDF" backHref="/">
        <p className="text-stone-500">Loading…</p>
      </AppShell>
    );
  }

  return (
    <AppShell title="Import PDF" backHref="/">
      <PdfImportForm
        busy={busy}
        onImport={handleImport}
        hint="Import a translation assignment PDF. It will open in the translate workspace right away. You can file it into a folder later."
      />
    </AppShell>
  );
}
