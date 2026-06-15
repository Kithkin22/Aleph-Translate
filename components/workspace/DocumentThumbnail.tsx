import type { WorkspaceDocument } from "@/lib/library/workspaceData";

interface DocumentThumbnailProps {
  doc?: Pick<WorkspaceDocument, "sourceLanguage" | "contentKind">;
  size?: "sm" | "lg";
}

/** Minimal document preview placeholder for list rows and continue card. */
export function DocumentThumbnail({ doc, size = "sm" }: DocumentThumbnailProps) {
  const isLarge = size === "lg";
  const isRtl = doc?.sourceLanguage === "hebrew";

  return (
    <div
      className={`shrink-0 overflow-hidden rounded border border-gray-200 bg-white ${
        isLarge ? "h-[88px] w-[68px]" : "h-14 w-11"
      }`}
    >
      <div className="flex h-full flex-col gap-1 p-1.5">
        <div className="h-1 w-3/4 rounded-sm bg-gray-200" />
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-0.5 rounded-full bg-gray-100 ${isRtl ? "mr-auto" : "ml-0"}`}
            style={{ width: `${55 + (i % 3) * 12}%` }}
          />
        ))}
        {doc?.contentKind === "pdf" ? (
          <div className="mt-auto text-[6px] font-medium uppercase tracking-wide text-blue-500">
            PDF
          </div>
        ) : null}
      </div>
    </div>
  );
}
