"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ColorSwatches } from "@/components/library/ColorSwatches";
import { EditableName } from "@/components/library/EditableName";
import { FinderFolderIcon } from "@/components/library/FinderFolderIcon";
import {
  DEFAULT_FOLDER_COLOR,
  type FolderColorId,
} from "@/lib/library/appearance";
import {
  createFolder,
  deleteFolder,
  listFolders,
  listNotebooks,
  notebookPageCount,
  renameFolder,
  reorderFolders,
  subscribeStorage,
  updateFolderColor,
} from "@/lib/library/storage";
import type { FolderMeta } from "@/lib/library/types";

function SortableFolderItem({
  folder,
  expanded,
  onToggleCustomize,
}: {
  folder: FolderMeta;
  expanded: boolean;
  onToggleCustomize: (id: string | null) => void;
}) {
  const sortable = useSortable({
    id: folder.id,
    disabled: folder.isInbox,
  });
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = sortable;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
  };

  const notebookCount = listNotebooks(folder.id).length;
  const pdfCount = listNotebooks(folder.id).reduce(
    (sum, nb) => sum + notebookPageCount(nb.id),
    0,
  );

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`group relative flex flex-col items-center rounded-xl p-3 transition ${
        isDragging ? "opacity-90 shadow-lg" : "hover:bg-stone-100/80 dark:hover:bg-stone-800/50"
      } ${expanded ? "bg-stone-100 ring-2 ring-amber-400/60 dark:bg-stone-800/60" : ""}`}
    >
      <div className="relative">
        <Link
          href={`/library/${folder.id}`}
          className="flex flex-col items-center"
          aria-label={`Open ${folder.name}`}
        >
          <FinderFolderIcon colorId={folder.color} size={80} />
        </Link>
        {!folder.isInbox ? (
          <button
            type="button"
            className="absolute -right-1 -top-1 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs font-bold text-stone-500 opacity-80 shadow-sm ring-1 ring-stone-200 transition sm:opacity-0 sm:group-hover:opacity-100 dark:bg-stone-800 dark:ring-stone-600"
            aria-label={`Customize ${folder.name}`}
            onClick={(e) => {
              e.preventDefault();
              onToggleCustomize(expanded ? null : folder.id);
            }}
          >
            ···
          </button>
        ) : null}
        {!folder.isInbox ? (
          <button
            type="button"
            className="absolute -left-1 top-1/2 -translate-y-1/2 cursor-grab touch-none rounded-lg p-1 text-stone-400 opacity-60 transition sm:opacity-0 sm:group-hover:opacity-100 active:cursor-grabbing"
            aria-label={`Drag ${folder.name}`}
            {...attributes}
            {...listeners}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <circle cx="9" cy="7" r="1.5" />
              <circle cx="15" cy="7" r="1.5" />
              <circle cx="9" cy="12" r="1.5" />
              <circle cx="15" cy="12" r="1.5" />
            </svg>
          </button>
        ) : null}
      </div>

      <EditableName
        value={folder.name}
        onSave={(name) => renameFolder(folder.id, name)}
        className="mt-2 max-w-[120px] truncate text-center text-sm font-medium"
        inputClassName="mt-2 w-full min-h-9 rounded-lg border border-amber-400 bg-white px-2 text-center text-sm font-medium outline-none ring-4 ring-amber-500/15 dark:bg-stone-900"
        ariaLabel="Folder name"
      />

      <p className="mt-0.5 max-w-[120px] truncate text-center text-xs text-stone-500 dark:text-stone-400">
        {folder.isInbox
          ? "Imports"
          : `${notebookCount} nb · ${pdfCount} PDF${pdfCount === 1 ? "" : "s"}`}
      </p>

      {expanded && !folder.isInbox ? (
        <div
          className="mt-3 w-full max-w-[160px] rounded-xl border border-stone-200 bg-white p-3 shadow-sm dark:border-stone-700 dark:bg-stone-900"
          onClick={(e) => e.stopPropagation()}
        >
          <ColorSwatches
            value={folder.color ?? DEFAULT_FOLDER_COLOR}
            onChange={(color) => updateFolderColor(folder.id, color)}
          />
          <button
            type="button"
            onClick={() => {
              if (confirm(`Delete folder "${folder.name}" and all its notebooks?`)) {
                deleteFolder(folder.id);
                onToggleCustomize(null);
              }
            }}
            className="mt-3 w-full rounded-lg px-2 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
          >
            Delete folder
          </button>
        </div>
      ) : null}
    </li>
  );
}

export function FolderGrid() {
  const [folders, setFolders] = useState<FolderMeta[]>([]);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState<FolderColorId>(DEFAULT_FOLDER_COLOR);
  const [customizeId, setCustomizeId] = useState<string | null>(null);

  useEffect(() => {
    function refresh() {
      try {
        setFolders(listFolders());
      } catch {
        setFolders([]);
      }
    }
    refresh();
    return subscribeStorage(refresh);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const sortableIds = folders.filter((f) => !f.isInbox).map((f) => f.id);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const reorderable = folders.filter((f) => !f.isInbox);
    const oldIndex = reorderable.findIndex((f) => f.id === active.id);
    const newIndex = reorderable.findIndex((f) => f.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const reordered = arrayMove(reorderable, oldIndex, newIndex);
    reorderFolders(reordered.map((f) => f.id));
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    createFolder(newName.trim(), newColor);
    setNewName("");
  }

  return (
    <div className="flex flex-col gap-6">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={sortableIds} strategy={rectSortingStrategy}>
          <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
            {folders.map((folder) => (
              <SortableFolderItem
                key={folder.id}
                folder={folder}
                expanded={customizeId === folder.id}
                onToggleCustomize={setCustomizeId}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>

      <form
        onSubmit={handleCreate}
        className="rounded-2xl border border-dashed border-stone-300 bg-stone-50/50 p-4 dark:border-stone-700 dark:bg-stone-900/30"
      >
        <p className="mb-3 text-sm font-medium text-stone-600 dark:text-stone-400">
          New folder
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="e.g. Hebrew, Research"
            className="min-h-12 flex-1 rounded-xl border border-stone-200 bg-white px-4 outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-500/15 dark:border-stone-700 dark:bg-stone-900"
          />
          <ColorSwatches
            value={newColor}
            onChange={setNewColor}
            label="Folder color"
            size="md"
          />
          <button
            type="submit"
            disabled={!newName.trim()}
            className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-xl bg-amber-600 px-6 font-semibold text-white hover:bg-amber-500 disabled:opacity-40"
          >
            Add Folder
          </button>
        </div>
      </form>
    </div>
  );
}
