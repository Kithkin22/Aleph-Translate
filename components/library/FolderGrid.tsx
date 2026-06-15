"use client";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useEffect, useState } from "react";
import { FolderCard } from "@/components/library/FolderCard";
import {
  countNotebooksInFolder,
  listFolders,
  reorderFolders,
  subscribeStorage,
} from "@/lib/library/storage";
import type { FolderMeta } from "@/lib/library/types";

function SortableFolder({ folder }: { folder: FolderMeta }) {
  const sortable = useSortable({ id: folder.id, disabled: folder.isInbox });
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = sortable;

  return (
    <li
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.88 : 1,
        zIndex: isDragging ? 10 : undefined,
      }}
      {...(folder.isInbox ? {} : { ...attributes, ...listeners })}
      className={folder.isInbox ? "" : "touch-none cursor-grab active:cursor-grabbing"}
    >
      <FolderCard
        href={`/library/${folder.id}`}
        name={folder.name}
        notebookCount={countNotebooksInFolder(folder.id)}
        updatedAt={folder.updatedAt}
        colorId={folder.color}
      />
    </li>
  );
}

export function FolderGrid() {
  const [folders, setFolders] = useState<FolderMeta[]>([]);

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
    useSensor(PointerSensor, { activationConstraint: { distance: 12 } }),
  );

  const sortableIds = folders.filter((f) => !f.isInbox).map((f) => f.id);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const reorderable = folders.filter((f) => !f.isInbox);
    const oldIndex = reorderable.findIndex((f) => f.id === active.id);
    const newIndex = reorderable.findIndex((f) => f.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    reorderFolders(arrayMove(reorderable, oldIndex, newIndex).map((f) => f.id));
  }

  if (folders.length === 0) {
    return (
      <p className="py-12 text-center text-stone-500 dark:text-stone-400">
        Tap <span className="font-semibold text-blue-600">+ New</span> to add a folder or import a
        PDF.
      </p>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={sortableIds} strategy={rectSortingStrategy}>
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
          {folders.map((folder) => (
            <SortableFolder key={folder.id} folder={folder} />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}
