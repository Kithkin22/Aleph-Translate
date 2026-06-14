export const PROJECTS_INDEX_KEY = "aleph:projects:index";
export const LAST_OPENED_KEY = "aleph:lastOpened";

export function projectKey(id: string): string {
  return `aleph:project:${id}`;
}
