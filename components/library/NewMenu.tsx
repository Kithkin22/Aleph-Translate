"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ColorSwatches } from "@/components/library/ColorSwatches";
import { GoodNotesFolderIcon } from "@/components/library/GoodNotesFolderIcon";
import { GoodNotesNotebookIcon } from "@/components/library/GoodNotesNotebookIcon";
import { PaperSwatches } from "@/components/library/PaperSwatches";
import {
  DEFAULT_FOLDER_COLOR,
  DEFAULT_NOTEBOOK_PAPER,
  type FolderColorId,
  type NotebookPaper,
} from "@/lib/library/appearance";
import { createFolder, createNotebook } from "@/lib/library/storage";
import type { FolderId } from "@/lib/library/types";

export type CreateKind = "folder" | "notebook";

interface CreateItemSheetProps {
  kind: CreateKind;
  folderId?: FolderId;
  open: boolean;
  onClose: () => void;
}

export function CreateItemSheet({ kind, folderId, open, onClose }: CreateItemSheetProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState<FolderColorId>(DEFAULT_FOLDER_COLOR);
  const [paper, setPaper] = useState<NotebookPaper>(DEFAULT_NOTEBOOK_PAPER);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setName("");
      setColor(DEFAULT_FOLDER_COLOR);
      setPaper(DEFAULT_NOTEBOOK_PAPER);
      const t = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(t);
    }
  }, [open, kind]);

  if (!open) return null;

  function handleCreate() {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (kind === "folder") {
      createFolder(trimmed, color);
    } else if (folderId) {
      createNotebook(folderId, trimmed, paper, color);
    }
    onClose();
  }

  const title = kind === "folder" ? "New Folder" : "New Notebook";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-sheet-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-stone-900"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="create-sheet-title" className="text-xl font-semibold">
          {title}
        </h2>

        <div className="my-6 flex justify-center">
          {kind === "folder" ? (
            <GoodNotesFolderIcon colorId={color} size={110} />
          ) : (
            <GoodNotesNotebookIcon paper={paper} size={100} />
          )}
        </div>

        <label className="mb-4 flex flex-col gap-2">
          <span className="text-sm font-medium text-stone-600 dark:text-stone-400">Name</span>
          <input
            ref={inputRef}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={kind === "folder" ? "e.g. Hebrew, Research" : "e.g. Job, John"}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreate();
              if (e.key === "Escape") onClose();
            }}
            className="min-h-12 rounded-xl border border-stone-200 bg-stone-50 px-4 text-base outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-500/15 dark:border-stone-700 dark:bg-stone-950"
          />
        </label>

        {kind === "folder" ? (
          <ColorSwatches value={color} onChange={setColor} label="Folder color" size="md" />
        ) : (
          <>
            <PaperSwatches value={paper} onChange={setPaper} />
            <div className="mt-4">
              <ColorSwatches value={color} onChange={setColor} label="Cover accent" size="md" />
            </div>
          </>
        )}

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-12 flex-1 items-center justify-center rounded-xl border border-stone-300 font-medium dark:border-stone-600"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCreate}
            disabled={!name.trim()}
            className="inline-flex min-h-12 flex-1 items-center justify-center rounded-xl bg-sky-500 font-semibold text-white hover:bg-sky-400 disabled:opacity-40"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

export type NewMenuContext = "library" | "folder";

interface NewMenuProps {
  context: NewMenuContext;
  folderId?: FolderId;
}

export function NewMenu({ context, folderId }: NewMenuProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [createKind, setCreateKind] = useState<CreateKind | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function onPointerDown(e: PointerEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [menuOpen]);

  function openCreate(kind: CreateKind) {
    setMenuOpen(false);
    setCreateKind(kind);
  }

  const menuItems = [
    {
      id: "quick",
      label: "Quick",
      description: "Start translating now",
      icon: "✦",
      onClick: () => {
        setMenuOpen(false);
        router.push("/quick-start");
      },
    },
    {
      id: "import",
      label: "Import",
      description: "Import a PDF",
      icon: "↓",
      onClick: () => {
        setMenuOpen(false);
        router.push("/quick-start");
      },
    },
    {
      id: "notebook",
      label: "Notebook",
      description: "Group related PDFs",
      icon: "📓",
      hidden: context === "library",
      onClick: () => openCreate("notebook"),
    },
    {
      id: "folder",
      label: "Folder",
      description: "Organize notebooks",
      icon: "📁",
      hidden: context === "folder",
      onClick: () => openCreate("folder"),
    },
  ].filter((item) => !item.hidden);

  return (
    <>
      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-sky-500 px-4 text-sm font-semibold text-white shadow-sm hover:bg-sky-400"
        >
          <span className="text-lg leading-none">+</span>
          New
        </button>

        {menuOpen ? (
          <div className="absolute right-0 top-full z-50 mt-2 w-[min(100vw-2rem,320px)] overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xl dark:border-stone-700 dark:bg-stone-900">
            <div className="grid grid-cols-2 gap-px bg-stone-100 p-2 dark:bg-stone-800">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={item.onClick}
                  className="flex min-h-[88px] flex-col items-center justify-center gap-2 rounded-xl bg-white p-3 text-center transition hover:bg-stone-50 active:bg-stone-100 dark:bg-stone-900 dark:hover:bg-stone-800"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-100 text-xl dark:bg-stone-800">
                    {item.icon}
                  </span>
                  <span className="text-sm font-semibold">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <CreateItemSheet
        kind={createKind!}
        folderId={folderId}
        open={createKind !== null}
        onClose={() => setCreateKind(null)}
      />
    </>
  );
}
