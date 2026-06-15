import Link from "next/link";
import { FolderCard } from "@/components/library/FolderCard";
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {folders.map((folder) => (
            <FolderCard
              key={folder.id}
              href={`/library/${folder.id}`}
              name={folder.name}
              notebookCount={folder.notebookCount}
              updatedAt={folder.updatedAt}
              colorId={folder.color}
            />
          ))}
        </div>
      )}
    </section>
  );
}
