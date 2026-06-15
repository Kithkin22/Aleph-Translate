import Link from "next/link";
import { WorkspaceFolderIcon } from "@/components/workspace/WorkspaceIcons";
import type { WorkspaceFolderSummary } from "@/lib/library/workspaceData";

interface FolderSummaryGridProps {
  folders: WorkspaceFolderSummary[];
}

export function FolderSummaryGrid({ folders }: FolderSummaryGridProps) {
  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold text-gray-900">Folders</h2>
      {folders.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-200 px-4 py-8 text-center text-sm text-gray-500">
          Create a folder from{" "}
          <Link href="/library" className="font-medium text-blue-600">
            Library
          </Link>{" "}
          to organize your translations.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {folders.map((folder) => (
            <Link
              key={folder.id}
              href={`/library/${folder.id}`}
              className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3.5 transition hover:border-gray-300 hover:shadow-sm"
            >
              <WorkspaceFolderIcon />
              <div className="min-w-0">
                <p className="font-medium text-gray-900">{folder.name}</p>
                <p className="text-sm text-gray-500">
                  {folder.documentCount}{" "}
                  {folder.documentCount === 1 ? "document" : "documents"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
