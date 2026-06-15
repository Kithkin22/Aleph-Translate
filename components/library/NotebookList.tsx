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
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Link from "next/link";
import { useEffect, useState } from "react";
import { EditableName } from "@/components/library/EditableName";
import {
  createNotebook,
  listNotebooks,
  notebookPageCount,
  reorderNotebooks,
  renameNotebook,
  subscribeStorage,
} from "@/lib/library/storage";
import type { FolderId, NotebookMeta } from "@/lib/library/types";

interface NotebookListProps {
  folderId: FolderId;
}

function SortableNotebookRow({
  notebook,
  onRenamed,
}: {
  notebook: NotebookMeta;
  onRenamed: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: notebook.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.85 : 1,
  };

  const pageCount = notebookPageCount(notebook.id);

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="rounded-2xl border border-stone-200 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-900"
    >
      <div className="flex items-center gap-2 p-3 sm:p-4">
        <button
          type="button"
          className="inline-flex min-h-11 min-w-11 shrink-0 cursor-grab items-center justify-center rounded-xl text-stone-400 active:cursor-grabbing hover:bg-stone-100 dark:hover:bg-stone-800"
          aria-label={`Drag to reorder ${notebook.name}`}
          {...attributes}
          {...listeners}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <circle cx="9" cy="7" r="1.5" />
            <circle cx="15" cy="7" r="1.5" />
            <circle cx="9" cy="12" r="1.5" />
            <circle cx="15" cy="12" r="1.5" />
            <circle cx="9" cy="17" r="1.5" />
            <circle cx="15" cy="17" r="1.5" />
          </svg>
        </button>
        <div className="min-w-0 flex-1">
          <EditableName
            value={notebook.name}
            onSave={(name) => {
              renameNotebook(notebook.id, name);
              onRenamed();
            }}
            ariaLabel="Notebook name"
          />
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            {pageCount} {pageCount === 1 ? "page" : "pages"}
            {pageCount === 0 ? " · empty" : ""}
          </p>
        </div>
        <Link
          href={`/library/${notebook.folderId}/${notebook.id}`}
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
          aria-label={`Open ${notebook.name}`}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M9 18l6-6-6-6" />
          </svg>
        </Link>
      </div>
    </li>
  );
}

export function NotebookList({ folderId }: NotebookListProps) {
  const [notebooks, setNotebooks] = useState<NotebookMeta[]>([]);
  const [newName, setNewName] = useState("");

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
    createNotebook(folderId, newName.trim());
    setNewName("");
  }

  return (
    <div className="flex flex-col gap-4">
      {notebooks.length === 0 ? (
        <p className="rounded-xl bg-stone-100 px-4 py-3 text-sm text-stone-600 dark:bg-stone-900 dark:text-stone-400">
          No notebooks yet. Create one below — empty notebooks are fine.
        </p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={notebooks.map((n) => n.id)}
            strategy={verticalListSortingStrategy}
          >
            <ul className="flex flex-col gap-3">
              {notebooks.map((notebook) => (
                <SortableNotebookRow
                  key={notebook.id}
                  notebook={notebook}
                  onRenamed={() => {}}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}

      <form onSubmit={handleCreate} className="flex flex-col gap-2 sm:flex-row">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New notebook (e.g. Job)"
          className="min-h-12 flex-1 rounded-xl border border-stone-200 bg-white px-4 outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-500/15 dark:border-stone-700 dark:bg-stone-900"
        />
        <button
          type="submit"
          disabled={!newName.trim()}
          className="inline-flex min-h-12 items-center justify-center rounded-xl bg-amber-600 px-5 font-semibold text-white hover:bg-amber-500 disabled:opacity-40"
        >
          Add Notebook
        </button>
      </form>
    </div>
  );
}
