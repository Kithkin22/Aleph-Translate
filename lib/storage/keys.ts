/** MVP flat-project keys (migrate to library keys in L2 — see LIBRARY_STRUCTURE.md) */
export const PROJECTS_INDEX_KEY = "aleph:projects:index";
export const LAST_OPENED_KEY = "aleph:lastOpened";

/** Library keys (L1+) */
export const LIBRARY_KEY = "aleph:library";
export const PAGES_INDEX_KEY = "aleph:pages:index";

export function projectKey(id: string): string {
  return `aleph:project:${id}`;
}

export function pageKey(id: string): string {
  return `aleph:page:${id}`;
}

export function notebookKey(id: string): string {
  return `aleph:notebook:${id}`;
}
