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
import {
  GoodNotesFolderIcon,
  LibraryGridItem,
} from "@/components/library/LibraryGridItem";
import {
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
        opacity: isDragging ? 0.85 : 1,
      }}
      {...(folder.isInbox ? {} : { ...attributes, ...listeners })}
      className={folder.isInbox ? "" : "touch-none cursor-grab active:cursor-grabbing"}
    >
      <LibraryGridItem
        href={`/library/${folder.id}`}
        name={folder.name}
        updatedAt={folder.updatedAt}
      >
        <GoodNotesFolderIcon colorId={folder.color} size={100} />
      </LibraryGridItem>
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
      <p className="py-12 text-center text-stone-500">
        Tap <span className="font-semibold text-sky-500">+ New</span> to add a folder or import a
        PDF.
      </p>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={sortableIds} strategy={rectSortingStrategy}>
        <ul className="grid grid-cols-2 gap-x-2 gap-y-6 sm:grid-cols-3 md:grid-cols-4">
          {folders.map((folder) => (
            <SortableFolder key={folder.id} folder={folder} />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}
