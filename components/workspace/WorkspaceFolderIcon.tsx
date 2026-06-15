import { MacFolderIcon } from "@/components/library/MacFolderIcon";
import type { FolderColorId } from "@/lib/library/appearance";

interface WorkspaceFolderIconProps {
  colorId?: FolderColorId;
  size?: number;
  className?: string;
}

/** Compact macOS folder for sidebar and folder cards. */
export function WorkspaceFolderIcon({
  colorId = "blue",
  size = 22,
  className = "",
}: WorkspaceFolderIconProps) {
  return <MacFolderIcon colorId={colorId} size={size} className={className} />;
}
