import Link from "next/link";
import { DocumentThumbnail } from "@/components/workspace/DocumentThumbnail";
import { IconMore } from "@/components/workspace/WorkspaceIcons";
import { formatEditedLabel } from "@/lib/library/formatTime";
import type { WorkspaceDocument } from "@/lib/library/workspaceData";

interface ContinueTranslatingCardProps {
  doc: WorkspaceDocument;
}

export function ContinueTranslatingCard({ doc }: ContinueTranslatingCardProps) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-lg font-semibold text-gray-900">Continue Translating</h2>
      <Link
        href={doc.href}
        className="flex items-stretch gap-5 rounded-lg border border-gray-200 bg-white p-4 transition hover:border-gray-300 hover:shadow-sm"
      >
        <DocumentThumbnail doc={doc} size="lg" />
        <div className="flex min-w-0 flex-1 flex-col justify-center">
          <p className="truncate text-base font-semibold text-gray-900">{doc.name}</p>
          <p className="mt-0.5 text-sm text-gray-500">{formatEditedLabel(doc.updatedAt)}</p>
          <div className="mt-3 flex items-center gap-3">
            <div className="h-1.5 flex-1 max-w-xs overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-blue-600 transition-all"
                style={{ width: `${Math.max(doc.percent, 4)}%` }}
              />
            </div>
            <span className="text-sm font-medium text-gray-600">{doc.percent}% complete</span>
          </div>
        </div>
        <span
          className="shrink-0 self-start rounded p-1 text-gray-400"
          aria-hidden
        >
          <IconMore />
        </span>
      </Link>
    </section>
  );
}
