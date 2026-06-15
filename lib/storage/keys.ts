/** MVP flat-project keys (legacy — migrated to library on first load) */
export const PROJECTS_INDEX_KEY = "aleph:projects:index";
export const LAST_OPENED_KEY = "aleph:lastOpened";
export const MIGRATION_V1_KEY = "aleph:migration:v1";
export const MIGRATION_V2_KEY = "aleph:migration:v2";

/** Library keys */
export const LIBRARY_KEY = "aleph:library";
export const NOTEBOOKS_KEY = "aleph:notebooks";
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
