/** Finder-style folder colors and notebook paper options. */

export const FOLDER_COLORS = {
  blue: { label: "Blue", tab: "#7CB9F5", body: "#5A9FE8", shadow: "#3A7BC8" },
  cyan: { label: "Cyan", tab: "#7EE8E8", body: "#5AD4D4", shadow: "#3AB8B8" },
  green: { label: "Green", tab: "#8FD694", body: "#6BCB71", shadow: "#4AAF50" },
  yellow: { label: "Yellow", tab: "#F5D76E", body: "#E8C547", shadow: "#C9A82E" },
  orange: { label: "Orange", tab: "#F5B07A", body: "#E8954F", shadow: "#C97530" },
  red: { label: "Red", tab: "#F58A8A", body: "#E86B6B", shadow: "#C94A4A" },
  purple: { label: "Purple", tab: "#C4A0F5", body: "#A87EE8", shadow: "#8A5CC9" },
  gray: { label: "Gray", tab: "#C8C8C8", body: "#A8A8A8", shadow: "#888888" },
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
