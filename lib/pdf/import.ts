import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import { MAX_PDF_BYTES } from "@/lib/pdf/constants";

let workerConfigured = false;

function ensurePdfWorker(): void {
  if (workerConfigured || typeof window === "undefined") return;
  GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
  ).toString();
  workerConfigured = true;
}

export class PdfImportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PdfImportError";
  }
}

export function validatePdfFile(file: File): void {
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    throw new PdfImportError("Please choose a PDF file.");
  }
  if (file.size > MAX_PDF_BYTES) {
    throw new PdfImportError("PDF must be 25 MB or smaller.");
  }
  if (file.size === 0) {
    throw new PdfImportError("That PDF file is empty.");
  }
}

export async function readPdfFile(file: File): Promise<{
  buffer: ArrayBuffer;
  pageCount: number;
  fileName: string;
}> {
  validatePdfFile(file);
  const buffer = await file.arrayBuffer();
  ensurePdfWorker();
  const doc = await getDocument({ data: buffer.slice(0) }).promise;
  const pageCount = doc.numPages;
  await doc.destroy();
  if (pageCount < 1) {
    throw new PdfImportError("Could not read pages from that PDF.");
  }
  return { buffer, pageCount, fileName: file.name };
}

export function defaultPdfTitle(fileName: string): string {
  return fileName.replace(/\.pdf$/i, "").trim() || "Untitled PDF";
}
