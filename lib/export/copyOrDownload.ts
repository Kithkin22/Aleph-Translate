/** Copy text to the clipboard, falling back to a file download on iPad/Safari. */
export async function copyOrDownload(text: string, filename: string): Promise<"copied" | "downloaded"> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return "copied";
    } catch {
      // Fall through to download.
    }
  }

  const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename.endsWith(".md") ? filename : `${filename}.md`;
  anchor.click();
  URL.revokeObjectURL(url);
  return "downloaded";
}
