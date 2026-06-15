/** Folder colors — macOS Finder–style gradient tints. */

export const FOLDER_COLORS = {
  purple: { label: "Purple", front: "#C9B3F5", back: "#7B4FD4", depth: "#5B38A8" },
  blue: { label: "Blue", front: "#9DC8FA", back: "#4A8AD4", depth: "#3568B0" },
  cyan: { label: "Cyan", front: "#8EEDED", back: "#3BB8B8", depth: "#2A9494" },
  green: { label: "Green", front: "#9EE0A3", back: "#4AAF50", depth: "#388A3C" },
  yellow: { label: "Yellow", front: "#F5E08A", back: "#D4AD2A", depth: "#B08E1E" },
  orange: { label: "Orange", front: "#F5C49A", back: "#E07A30", depth: "#B85E20" },
  red: { label: "Red", front: "#F5A0A0", back: "#D44A4A", depth: "#B03838" },
  gray: { label: "Gray", front: "#D4D4D4", back: "#9A9A9A", depth: "#787878" },
} as const;

export type FolderColorId = keyof typeof FOLDER_COLORS;

export const FOLDER_COLOR_IDS = Object.keys(FOLDER_COLORS) as FolderColorId[];

export const NOTEBOOK_PAPERS = {
  white: { label: "White paper", page: "#FAFAF8", line: "#D4D4D4", cover: "#E8E4DC" },
  black: { label: "Black paper", page: "#1A1A1A", line: "#404040", cover: "#2D2D2D" },
} as const;

export type NotebookPaper = keyof typeof NOTEBOOK_PAPERS;

export const DEFAULT_FOLDER_COLOR: FolderColorId = "blue";
export const DEFAULT_NOTEBOOK_PAPER: NotebookPaper = "white";

export function folderColor(id: FolderColorId | undefined) {
  return FOLDER_COLORS[id ?? DEFAULT_FOLDER_COLOR];
}

export function notebookPaper(id: NotebookPaper | undefined) {
  return NOTEBOOK_PAPERS[id ?? DEFAULT_NOTEBOOK_PAPER];
}
