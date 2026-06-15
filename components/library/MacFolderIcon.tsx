"use client";

import { FolderShapeGraphic } from "@/components/library/FolderShapeGraphic";
import type { FolderColorId } from "@/lib/library/appearance";

interface MacFolderIconProps {
  colorId?: FolderColorId;
  size?: number;
  className?: string;
}

/** Compact folder graphic for sidebar chips and menus. */
export function MacFolderIcon({
  colorId,
  size = 100,
  className = "",
}: MacFolderIconProps) {
  const height = Math.round(size * 0.75);
  return (
    <div className={className} style={{ width: size, height }}>
      <FolderShapeGraphic colorId={colorId} className="h-full w-full" />
    </div>
  );
}

export const GoodNotesFolderIcon = MacFolderIcon;
export const FinderFolderIcon = MacFolderIcon;
