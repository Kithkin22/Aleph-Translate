"use client";

import { useRef, useState } from "react";
import { defaultPdfTitle, PdfImportError, readPdfFile } from "@/lib/pdf/import";

interface PdfImportFormProps {
  busy: boolean;
  onImport: (input: {
    title: string;
    fileName: string;
    pageCount: number;
    buffer: ArrayBuffer;
    sourceLanguage: import("@/lib/types/project").SourceLanguage;
    writingDirection: import("@/lib/ink/types").WritingDirection;
  }) => void | Promise<void>;
  hint?: string;
}

export function PdfImportForm({ busy, onImport, hint }: PdfImportFormProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!file) {
      setError("Choose a PDF to import.");
      return;
    }
    setError(null);
    try {
      const { buffer, pageCount, fileName, sourceLanguage, writingDirection } =
        await readPdfFile(file);
      const title = name.trim() || defaultPdfTitle(fileName);
      await onImport({ title, fileName, pageCount, buffer, sourceLanguage, writingDirection });
    } catch (e) {
      setError(e instanceof PdfImportError ? e.message : "Could not import PDF.");
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <h2 className="text-xl font-semibold text-gray-900">Import PDF</h2>
      <p className="mt-2 text-sm text-gray-500">
        {hint ??
          "Import a translation assignment PDF. You can annotate, handwrite translations, and export when finished."}
      </p>

      <label className="mt-6 flex flex-col gap-2">
        <span className="text-sm font-medium text-gray-700">Document name</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Job 2 Translation"
          className="min-h-11 rounded-md border border-gray-200 bg-white px-3 text-base outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        />
      </label>

      <div className="mt-4">
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={(e) => {
            const picked = e.target.files?.[0] ?? null;
            setFile(picked);
            setError(null);
            if (picked && !name.trim()) {
              setName(defaultPdfTitle(picked.name));
            }
          }}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex min-h-[120px] w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 text-sm text-gray-600 transition hover:border-blue-400 hover:bg-blue-50/50"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <path d="M14 2v6h6M12 18v-6M9 15h6" />
          </svg>
          {file ? (
            <span className="font-medium text-gray-900">{file.name}</span>
          ) : (
            <span>Tap to choose a PDF (max 25 MB)</span>
          )}
        </button>
      </div>

      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

      <button
        type="button"
        disabled={busy || !file}
        onClick={() => void handleSubmit()}
        className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-md bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-40"
      >
        {busy ? "Importing…" : "Import and open"}
      </button>
    </div>
  );
}
