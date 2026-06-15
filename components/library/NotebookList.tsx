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
import { NotebookIcon } from "@/components/library/NotebookIcon";
import { PaperSwatches } from "@/components/library/PaperSwatches";
import {
  DEFAULT_FOLDER_COLOR,
  DEFAULT_NOTEBOOK_PAPER,
  type FolderColorId,
  type NotebookPaper,
} from "@/lib/library/appearance";
import {
  createNotebook,
  deleteNotebook,
  listNotebooks,
  notebookPageCount,
  renameNotebook,
  reorderNotebooks,
  subscribeStorage,
  updateNotebookColor,
  updateNotebookPaper,
} from "@/lib/library/storage";
import type { FolderId, NotebookMeta } from "@/lib/library/types";

interface NotebookListProps {
  folderId: FolderId;
}

function SortableNotebookItem({
  notebook,
  expanded,
  onToggleCustomize,
}: {
  notebook: NotebookMeta;
  expanded: boolean;
  onToggleCustomize: (id: string | null) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: notebook.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
  };

  const pdfCount = notebookPageCount(notebook.id);

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
          href={`/library/${notebook.folderId}/${notebook.id}`}
          className="flex flex-col items-center"
          aria-label={`Open ${notebook.name}`}
        >
          <NotebookIcon
            paper={notebook.paper ?? DEFAULT_NOTEBOOK_PAPER}
            colorId={notebook.color ?? DEFAULT_FOLDER_COLOR}
            size={80}
          />
        </Link>
        <button
          type="button"
          className="absolute -right-1 -top-1 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs font-bold text-stone-500 opacity-80 shadow-sm ring-1 ring-stone-200 transition sm:opacity-0 sm:group-hover:opacity-100 dark:bg-stone-800 dark:ring-stone-600"
          aria-label={`Customize ${notebook.name}`}
          onClick={(e) => {
            e.preventDefault();
            onToggleCustomize(expanded ? null : notebook.id);
          }}
        >
          ···
        </button>
        <button
          type="button"
          className="absolute -left-1 top-1/2 -translate-y-1/2 cursor-grab touch-none rounded-lg p-1 text-stone-400 opacity-60 transition sm:opacity-0 sm:group-hover:opacity-100 active:cursor-grabbing"
          aria-label={`Drag ${notebook.name}`}
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
      </div>

      <EditableName
        value={notebook.name}
        onSave={(name) => renameNotebook(notebook.id, name)}
        className="mt-2 max-w-[120px] truncate text-center text-sm font-medium"
        inputClassName="mt-2 w-full min-h-9 rounded-lg border border-amber-400 bg-white px-2 text-center text-sm font-medium outline-none ring-4 ring-amber-500/15 dark:bg-stone-900"
        ariaLabel="Notebook name"
      />

      <p className="mt-0.5 text-center text-xs text-stone-500 dark:text-stone-400">
        {pdfCount} PDF{pdfCount === 1 ? "" : "s"}
      </p>

      {expanded ? (
        <div
          className="mt-3 w-full max-w-[180px] rounded-xl border border-stone-200 bg-white p-3 shadow-sm dark:border-stone-700 dark:bg-stone-900"
          onClick={(e) => e.stopPropagation()}
        >
          <PaperSwatches
            value={notebook.paper ?? DEFAULT_NOTEBOOK_PAPER}
            onChange={(paper) => updateNotebookPaper(notebook.id, paper)}
          />
          <div className="mt-3">
            <ColorSwatches
              value={notebook.color ?? DEFAULT_FOLDER_COLOR}
              onChange={(color) => updateNotebookColor(notebook.id, color)}
              label="Cover color"
            />
          </div>
          <button
            type="button"
            onClick={() => {
              if (confirm(`Delete notebook "${notebook.name}" and all its PDFs?`)) {
                deleteNotebook(notebook.id);
                onToggleCustomize(null);
              }
            }}
            className="mt-3 w-full rounded-lg px-2 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
          >
            Delete notebook
          </button>
        </div>
      ) : null}
    </li>
  );
}

export function NotebookList({ folderId }: NotebookListProps) {
  const [notebooks, setNotebooks] = useState<NotebookMeta[]>([]);
  const [newName, setNewName] = useState("");
  const [newPaper, setNewPaper] = useState<NotebookPaper>(DEFAULT_NOTEBOOK_PAPER);
  const [newColor, setNewColor] = useState<FolderColorId>(DEFAULT_FOLDER_COLOR);
  const [customizeId, setCustomizeId] = useState<string | null>(null);

  useEffect(() => {
    function refresh() {
      try {
        setNotebooks(listNotebooks(folderId));
      } catch {
        setNotebooks([]);
      }
    }
    refresh();
    return subscribeStorage(refresh);
  }, [folderId]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = notebooks.findIndex((n) => n.id === active.id);
    const newIndex = notebooks.findIndex((n) => n.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const reordered = arrayMove(notebooks, oldIndex, newIndex);
    reorderNotebooks(
      folderId,
      reordered.map((n) => n.id),
    );
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    createNotebook(folderId, newName.trim(), newPaper, newColor);
    setNewName("");
  }

  return (
    <div className="flex flex-col gap-6">
      {notebooks.length === 0 ? (
        <p className="rounded-xl bg-stone-100 px-4 py-3 text-center text-sm text-stone-600 dark:bg-stone-900 dark:text-stone-400">
          No notebooks yet. Create one below to group related PDFs.
        </p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext
            items={notebooks.map((n) => n.id)}
            strategy={rectSortingStrategy}
          >
            <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
              {notebooks.map((notebook) => (
                <SortableNotebookItem
                  key={notebook.id}
                  notebook={notebook}
                  expanded={customizeId === notebook.id}
                  onToggleCustomize={setCustomizeId}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}

      <form
        onSubmit={handleCreate}
        className="rounded-2xl border border-dashed border-stone-300 bg-stone-50/50 p-4 dark:border-stone-700 dark:bg-stone-900/30"
      >
        <p className="mb-3 text-sm font-medium text-stone-600 dark:text-stone-400">
          New notebook
        </p>
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="e.g. Job, John"
          className="mb-3 min-h-12 w-full rounded-xl border border-stone-200 bg-white px-4 outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-500/15 dark:border-stone-700 dark:bg-stone-900"
        />
        <PaperSwatches value={newPaper} onChange={setNewPaper} />
        <div className="mt-3">
          <ColorSwatches value={newColor} onChange={setNewColor} label="Cover color" />
        </div>
        <button
          type="submit"
          disabled={!newName.trim()}
          className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-amber-600 px-5 font-semibold text-white hover:bg-amber-500 disabled:opacity-40"
        >
          Add Notebook
        </button>
      </form>
    </div>
  );
}
