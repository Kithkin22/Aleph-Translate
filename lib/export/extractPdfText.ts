import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";

let workerReady = false;

function ensureWorker(): void {
  if (workerReady || typeof window === "undefined") return;
  GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
  ).toString();
  workerReady = true;
}

/** Extract selectable text from every page of a PDF for export. */
export async function extractPdfText(buffer: ArrayBuffer): Promise<string> {
  ensureWorker();
  const doc = await getDocument({ data: buffer.slice(0) }).promise;
  try {
    const parts: string[] = [];
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item) => ("str" in item && typeof item.str === "string" ? item.str : ""))
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
      if (pageText) {
        parts.push(`### PDF page ${i}\n\n${pageText}`);
      }
    }
    return parts.length > 0 ? parts.join("\n\n") : "_No selectable text found in this PDF._";
  } finally {
    await doc.destroy();
  }
}
