import type { InkDocument } from "@/lib/ink/types";
import type { Page } from "@/lib/library/types";

export interface WorkspaceExportContext {
  folderName?: string;
  notebookName?: string;
  pdfText?: string;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

function summarizeInk(ink?: InkDocument): string {
  if (!ink) return "_No handwritten annotations._";

  const lines: string[] = [];
  const pageNums = Object.keys(ink.pages)
    .map(Number)
    .sort((a, b) => a - b);

  for (const pageNum of pageNums) {
    const data = ink.pages[pageNum];
    const strokes = data.strokes.filter((s) => s.tool !== "eraser");
    if (strokes.length === 0) continue;

    const pen = strokes.filter((s) => s.tool === "pen").length;
    const highlighter = strokes.filter((s) => s.tool === "highlighter").length;
    const parts: string[] = [];
    if (pen > 0) parts.push(`${pen} pen`);
    if (highlighter > 0) parts.push(`${highlighter} highlighter`);
    lines.push(`- PDF page ${pageNum}: ${strokes.length} strokes (${parts.join(", ")})`);
  }

  return lines.length > 0
    ? `${lines.join("\n")}\n\n_Note: ink strokes are visual handwriting on the PDF and are not transcribed here._`
    : "_No handwritten annotations._";
}

function formatVerses(page: Page): string {
  if (page.verses.length === 0) {
    return "_No verse blocks in this workspace._";
  }

  return page.verses
    .map((verse) => {
      const label = verse.reference ? `Verse ${verse.index + 1} (${verse.reference})` : `Verse ${verse.index + 1}`;
      const sections: string[] = [`### ${label}`];

      if (verse.original.trim()) {
        sections.push("**Original:**", "", `> ${verse.original.trim()}`, "");
      }
      if (verse.translation.trim()) {
        sections.push("**My translation:**", "", verse.translation.trim(), "");
      } else {
        sections.push("**My translation:**", "", "_Not yet translated._", "");
      }
      if (verse.notes.trim()) {
        sections.push("**Notes:**", "", verse.notes.trim(), "");
      }

      return sections.join("\n");
    })
    .join("\n---\n\n");
}

/** Build a markdown document optimized for pasting into ChatGPT. */
export function formatWorkspaceForChatGpt(page: Page, ctx: WorkspaceExportContext = {}): string {
  const location = [ctx.folderName, ctx.notebookName].filter(Boolean).join(" → ");
  const completion = page.completion;
  const lines: string[] = [
    `# Translation workspace: ${page.title}`,
    "",
    "_Exported from Aleph Translate. Paste this into ChatGPT and ask for feedback on my translations, notes, and completeness._",
    "",
    "## Instructions for the reviewer",
    "",
    "Please review my biblical translation work below. Comment on:",
    "- Accuracy and faithfulness to the original language",
    "- Clarity and natural English in my translations",
    "- Helpfulness and accuracy of my study notes",
    "- Anything missing, incomplete, or worth improving",
    "",
    "---",
    "",
    "## Document",
    "",
    `- **Title:** ${page.title}`,
  ];

  if (location) lines.push(`- **Location:** ${location}`);
  lines.push(
    `- **Source language:** ${page.sourceLanguage}`,
    `- **Content type:** ${page.contentKind}`,
    `- **Completion:** ${completion.percent}% (${completion.translatedCount}/${completion.totalVerses} verses)`,
    `- **Created:** ${formatDate(page.createdAt)}`,
    `- **Last updated:** ${formatDate(page.updatedAt)}`,
  );

  if (page.passageRef) {
    lines.push(`- **Passage reference:** ${page.passageRef}`);
  }

  if (page.pdf) {
    lines.push(
      `- **PDF file:** ${page.pdf.fileName} (${page.pdf.pageCount} pages)`,
      `- **Writing direction:** ${page.pdf.writingDirection ?? "ltr"}`,
    );
  }

  lines.push("", "## Translations", "", formatVerses(page));

  if (page.contentKind === "pdf") {
    lines.push("", "## Handwritten annotations", "", summarizeInk(page.ink));
  }

  if (ctx.pdfText) {
    lines.push("", "## Source PDF text (extracted)", "", ctx.pdfText);
  }

  lines.push(
    "",
    "---",
    "",
    "_End of export. You can ask ChatGPT to compare my translations against the original text, suggest improvements, or quiz me on vocabulary._",
  );

  return lines.join("\n");
}

export function sanitizeExportFilename(title: string): string {
  const base = title.trim() || "workspace";
  return base.replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").slice(0, 60);
}
