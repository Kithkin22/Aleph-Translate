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
  GoodNotesNotebookIcon,
  LibraryGridItem,
} from "@/components/library/LibraryGridItem";
import { DEFAULT_NOTEBOOK_PAPER } from "@/lib/library/appearance";
import {
  listNotebooks,
  reorderNotebooks,
  subscribeStorage,
} from "@/lib/library/storage";
import type { FolderId, NotebookMeta } from "@/lib/library/types";

interface NotebookListProps {
  folderId: FolderId;
}

function SortableNotebook({ notebook }: { notebook: NotebookMeta }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: notebook.id,
  });

  return (
    <li
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.85 : 1,
      }}
      {...attributes}
      {...listeners}
      className="touch-none cursor-grab active:cursor-grabbing"
    >
      <LibraryGridItem
        href={`/library/${notebook.folderId}/${notebook.id}`}
        name={notebook.name}
        updatedAt={notebook.updatedAt}
      >
        <GoodNotesNotebookIcon
          paper={notebook.paper ?? DEFAULT_NOTEBOOK_PAPER}
          size={100}
        />
      </LibraryGridItem>
    </li>
  );
}

export function NotebookList({ folderId }: NotebookListProps) {
  const [notebooks, setNotebooks] = useState<NotebookMeta[]>([]);

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
    useSensor(PointerSensor, { activationConstraint: { distance: 12 } }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = notebooks.findIndex((n) => n.id === active.id);
    const newIndex = notebooks.findIndex((n) => n.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    reorderNotebooks(folderId, arrayMove(notebooks, oldIndex, newIndex).map((n) => n.id));
  }

  if (notebooks.length === 0) {
    return (
      <p className="py-12 text-center text-stone-500">
        Tap <span className="font-semibold text-sky-500">+ New</span> to add a notebook or import a
        PDF.
      </p>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={notebooks.map((n) => n.id)} strategy={rectSortingStrategy}>
        <ul className="grid grid-cols-2 gap-x-2 gap-y-6 sm:grid-cols-3 md:grid-cols-4">
          {notebooks.map((notebook) => (
            <SortableNotebook key={notebook.id} notebook={notebook} />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}
