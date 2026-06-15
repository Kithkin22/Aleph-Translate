import Link from "next/link";
import { DocumentThumbnail } from "@/components/workspace/DocumentThumbnail";
import { IconMore } from "@/components/workspace/WorkspaceIcons";
import { formatEditedLabel } from "@/lib/library/formatTime";
import type { WorkspaceDocument } from "@/lib/library/workspaceData";

interface RecentDocumentsListProps {
  documents: WorkspaceDocument[];
}

export function RecentDocumentsList({ documents }: RecentDocumentsListProps) {
  return (
    <section className="mb-8">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Recent Documents</h2>
        <Link href="/library" className="text-sm font-medium text-blue-600 hover:text-blue-700">
          View All
        </Link>
      </div>
      {documents.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-200 px-4 py-8 text-center text-sm text-gray-500">
          No documents yet. Import a PDF to get started.
        </div>
      ) : (
        <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
          {documents.map((doc) => (
            <li key={doc.id}>
              <Link
                href={doc.href}
                className="flex items-center gap-4 px-4 py-3 transition hover:bg-gray-50"
              >
                <DocumentThumbnail doc={doc} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-gray-900">{doc.name}</p>
                  <p className="text-sm text-gray-500">{formatEditedLabel(doc.updatedAt)}</p>
                </div>
                <span className="shrink-0 text-gray-400" aria-hidden>
                  <IconMore />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
