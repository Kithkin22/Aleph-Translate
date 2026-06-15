import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import { detectSourceLanguage } from "@/lib/text/detectLanguage";
import { defaultWritingDirection, type WritingDirection } from "@/lib/ink/types";
import type { SourceLanguage } from "@/lib/types/project";

let workerReady = false;

function ensureWorker(): void {
  if (workerReady || typeof window === "undefined") return;
  GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
  ).toString();
  workerReady = true;
}

/** Sample PDF text layers to detect Hebrew, Greek, or English content. */
export async function detectPdfLanguage(buffer: ArrayBuffer): Promise<SourceLanguage> {
  ensureWorker();
  const doc = await getDocument({ data: buffer.slice(0) }).promise;
  try {
    const samplePages = Math.min(3, doc.numPages);
    let text = "";
    for (let i = 1; i <= samplePages; i++) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      for (const item of content.items) {
        if ("str" in item && typeof item.str === "string") {
          text += `${item.str} `;
        }
      }
    }
    const detected = detectSourceLanguage(text);
    return detected;
  } finally {
    await doc.destroy();
  }
}

export function detectLanguageFromFileName(fileName: string): SourceLanguage {
  const lower = fileName.toLowerCase();
  if (/hebrew|bhs|תנ|job|ruth|psalm|genesis|exodus|isaiah/i.test(lower)) {
    if (/greek|na28|john|matthew|romans/i.test(lower)) return "unknown";
    return "hebrew";
  }
  if (/greek|na28|gnt|septuagint|lxx/i.test(lower)) return "greek";
  return "unknown";
}

export function resolvePdfLanguage(
  fromText: SourceLanguage,
  fileName: string,
): SourceLanguage {
  if (fromText !== "unknown") return fromText;
  return detectLanguageFromFileName(fileName);
}

export function writingDirectionForLanguage(
  language: SourceLanguage,
  override?: WritingDirection,
): WritingDirection {
  return defaultWritingDirection(
    language === "unknown" ? "unknown" : language,
    override,
  );
}
