/** Folder colors — GoodNotes / Mac-style two-tone folders. */

export const FOLDER_COLORS = {
  purple: { label: "Purple", front: "#D4C0F5", back: "#8B5FD4", depth: "#6A42B5" },
  blue: { label: "Blue", front: "#A8D4FF", back: "#4F94E8", depth: "#3A76C4" },
  cyan: { label: "Cyan", front: "#96EAEA", back: "#3DB8B8", depth: "#2A9494" },
  green: { label: "Green", front: "#A8E6AC", back: "#4CAF50", depth: "#388E3C" },
  yellow: { label: "Yellow", front: "#F5E6A3", back: "#D4AF37", depth: "#B8942E" },
  orange: { label: "Orange", front: "#F5C99A", back: "#E8873A", depth: "#C46A28" },
  red: { label: "Red", front: "#F5A8A8", back: "#E05252", depth: "#C03838" },
  gray: { label: "Gray", front: "#D8D8D8", back: "#A0A0A0", depth: "#808080" },
} as const;

export type FolderColorId = keyof typeof FOLDER_COLORS;

export const FOLDER_COLOR_IDS = Object.keys(FOLDER_COLORS) as FolderColorId[];

export const NOTEBOOK_PAPERS = {
  white: { label: "White paper", page: "#FAFAF8", line: "#D4D4D4", cover: "#E8E4DC" },
  black: { label: "Black paper", page: "#1A1A1A", line: "#404040", cover: "#2D2D2D" },
} as const;

export type NotebookPaper = keyof typeof NOTEBOOK_PAPERS;

export const DEFAULT_FOLDER_COLOR: FolderColorId = "purple";
export const DEFAULT_NOTEBOOK_PAPER: NotebookPaper = "white";

export function folderColor(id: FolderColorId | undefined) {
  return FOLDER_COLORS[id ?? DEFAULT_FOLDER_COLOR];
}

export function notebookPaper(id: NotebookPaper | undefined) {
  return NOTEBOOK_PAPERS[id ?? DEFAULT_NOTEBOOK_PAPER];
}
