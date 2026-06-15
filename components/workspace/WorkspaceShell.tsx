import Link from "next/link";
import { WorkspaceSidebar } from "@/components/workspace/WorkspaceSidebar";
import type { WorkspaceSnapshot } from "@/lib/library/workspaceData";

interface WorkspaceShellProps {
  children: React.ReactNode;
  data: WorkspaceSnapshot;
}

export function WorkspaceShell({ children, data }: WorkspaceShellProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-white text-gray-900 md:flex-row">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 md:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded bg-gray-900 text-xs font-serif text-white">
            א
          </div>
          <span className="font-semibold">Aleph Translate</span>
        </div>
        <Link href="/library" className="text-sm font-medium text-blue-600">
          Library
        </Link>
      </div>
      <WorkspaceSidebar folderCounts={data.folders} counts={data.counts} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}
