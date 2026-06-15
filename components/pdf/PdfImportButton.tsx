"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useLibraryInit } from "@/hooks/useLibraryInit";
import { createQuickStartPdf, pagePath } from "@/lib/library/storage";
import { defaultPdfTitle, PdfImportError, readPdfFile } from "@/lib/pdf/import";

interface PdfImportButtonProps {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

/** Opens the native file picker immediately — no paste screen. */
export function PdfImportButton({ children, className, disabled }: PdfImportButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ready = useLibraryInit();

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setBusy(true);
    setError(null);
    try {
      const { buffer, pageCount, fileName, sourceLanguage, writingDirection } =
        await readPdfFile(file);
      const title = defaultPdfTitle(fileName);
      const page = await createQuickStartPdf({
        name: title,
        title,
        fileName,
        pageCount,
        pdfBuffer: buffer,
        sourceLanguage,
        writingDirection,
      });
      router.push(pagePath(page));
    } catch (err) {
      setBusy(false);
      setError(err instanceof PdfImportError ? err.message : "Could not import PDF.");
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="sr-only"
        onChange={(e) => void handleFileChange(e)}
      />
      <button
        type="button"
        disabled={disabled || busy || !ready}
        className={className}
        onClick={() => inputRef.current?.click()}
      >
        {busy ? "Importing…" : children}
      </button>
      {error ? (
        <p className="absolute right-0 top-full z-50 mt-1 max-w-xs rounded-md border border-red-200 bg-white px-3 py-2 text-xs text-red-600 shadow-lg">
          {error}
        </p>
      ) : null}
    </>
  );
}
