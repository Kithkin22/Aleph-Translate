import type { SourceLanguage } from "@/lib/types/project";

const HEBREW_RE = /[\u0590-\u05FF]/g;
const GREEK_RE = /[\u0370-\u03FF\u1F00-\u1FFF]/g;

export function detectSourceLanguage(text: string): SourceLanguage {
  const hebrew = (text.match(HEBREW_RE) ?? []).length;
  const greek = (text.match(GREEK_RE) ?? []).length;

  if (hebrew === 0 && greek === 0) return "unknown";
  if (hebrew >= greek * 1.2) return "hebrew";
  if (greek >= hebrew * 1.2) return "greek";
  return hebrew >= greek ? "hebrew" : "greek";
}
