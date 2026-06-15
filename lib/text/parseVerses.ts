import { cleanText } from "@/lib/text/clean";
import { detectSourceLanguage } from "@/lib/text/detectLanguage";
import type { SourceLanguage, Verse } from "@/lib/types/project";

export interface ParseResult {
  verses: Verse[];
  passageRef?: string;
  sourceLanguage: SourceLanguage;
}

interface ParsedVerseChunk {
  reference?: string;
  text: string;
}

/** Logos-style passage header/footer, e.g. "Genesis 1:1–3 (BHS)" */
const PASSAGE_LINE =
  /^[1-3]?\s*[A-Za-z][A-Za-z0-9\s.'-]*\d+\s*:\s*\d+(?:\s*[–\-—]\s*\d+(?::\d+)?)?(?:\s*,\s*\d+(?::\d+)?(?:\s*[–\-—]\s*\d+(?::\d+)?)?)*\s*(?:\([A-Za-z0-9\s.]+\))?\s*$/;

const CHAPTER_VERSE_PREFIX = /^(\d{1,3})\s*:\s*(\d{1,3})\s+(.+)$/;
const VERSE_PREFIX = /^(\d{1,3})\s+(.+)$/;
const BRACKET_PREFIX = /^[\[(](\d{1,3})[\])]\s+(.+)$/;

const INLINE_CHAPTER_VERSE =
  /(\d{1,3})\s*:\s*(\d{1,3})\s+(?=[\u0590-\u05FF\u0370-\u03FF\u1F00-\u1FFF"A-Z(])/g;

const INLINE_VERSE =
  /(?:^|[.!?;]\s+|\s{2,})(\d{1,3})\s+(?=[\u0590-\u05FF\u0370-\u03FF\u1F00-\u1FFF"A-Z(])/g;

function isMetadataLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;
  if (PASSAGE_LINE.test(trimmed)) return true;
  if (/^\([A-Za-z0-9\s.]+\)$/.test(trimmed)) return true;
  return false;
}

function extractPassageRef(lines: string[]): string | undefined {
  for (const line of lines) {
    const trimmed = line.trim();
    if (PASSAGE_LINE.test(trimmed)) {
      return trimmed.replace(/\s*\([A-Za-z0-9\s.]+\)\s*$/, "").trim();
    }
  }
  return undefined;
}

function stripMetadataLines(text: string): { body: string; passageRef?: string } {
  const lines = text.split("\n");
  const passageRef = extractPassageRef(lines);
  const bodyLines = lines.filter((line) => !isMetadataLine(line));
  return { body: bodyLines.join("\n").trim(), passageRef };
}

function splitByPattern(
  text: string,
  pattern: RegExp,
  refFromMatch: (match: RegExpExecArray) => string,
): ParsedVerseChunk[] | null {
  const markers: { index: number; length: number; reference: string }[] = [];
  const re = new RegExp(pattern.source, pattern.flags);
  let match: RegExpExecArray | null;

  while ((match = re.exec(text)) !== null) {
    markers.push({
      index: match.index,
      length: match[0].length,
      reference: refFromMatch(match),
    });
  }

  if (markers.length === 0) return null;
  if (markers.length === 1 && markers[0].index === 0) {
    return [
      {
        reference: markers[0].reference,
        text: text.slice(markers[0].length).trim(),
      },
    ];
  }

  const chunks: ParsedVerseChunk[] = [];
  for (let i = 0; i < markers.length; i++) {
    const start = markers[i].index + markers[i].length;
    const end = i + 1 < markers.length ? markers[i + 1].index : text.length;
    const verseText = text.slice(start, end).trim();
    if (verseText) {
      chunks.push({ reference: markers[i].reference, text: verseText });
    }
  }

  return chunks.length > 0 ? chunks : null;
}

function parseLineChunk(line: string): ParsedVerseChunk[] {
  const trimmed = line.trim();
  if (!trimmed) return [];

  const chapterVerse = trimmed.match(CHAPTER_VERSE_PREFIX);
  if (chapterVerse) {
    return [
      {
        reference: `${chapterVerse[1]}:${chapterVerse[2]}`,
        text: chapterVerse[3].trim(),
      },
    ];
  }

  const bracket = trimmed.match(BRACKET_PREFIX);
  if (bracket) {
    return [{ reference: bracket[1], text: bracket[2].trim() }];
  }

  const verse = trimmed.match(VERSE_PREFIX);
  if (verse && !/^\d+\s*:\s*\d+/.test(trimmed)) {
    return [{ reference: verse[1], text: verse[2].trim() }];
  }

  const byChapterVerse = splitByPattern(trimmed, INLINE_CHAPTER_VERSE, (m) =>
    `${m[1]}:${m[2]}`,
  );
  if (byChapterVerse && byChapterVerse.length > 1) return byChapterVerse;

  const byVerse = splitByPattern(trimmed, INLINE_VERSE, (m) => m[1]);
  if (byVerse && byVerse.length > 1) return byVerse;

  return [{ text: trimmed }];
}

function mergeWrappedLines(body: string): string[] {
  const lines = body.split("\n");
  const merged: string[] = [];
  let buffer = "";

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (buffer) {
        merged.push(buffer);
        buffer = "";
      }
      continue;
    }

    const startsNewVerse =
      CHAPTER_VERSE_PREFIX.test(trimmed) ||
      BRACKET_PREFIX.test(trimmed) ||
      (VERSE_PREFIX.test(trimmed) && !/^\d+\s*:\s*\d+/.test(trimmed));

    if (startsNewVerse) {
      if (buffer) merged.push(buffer);
      buffer = trimmed;
    } else if (buffer) {
      buffer = `${buffer} ${trimmed}`;
    } else {
      buffer = trimmed;
    }
  }

  if (buffer) merged.push(buffer);
  return merged;
}

function toVerses(chunks: ParsedVerseChunk[]): Verse[] {
  return chunks.map((chunk, index) => ({
    index,
    original: chunk.text,
    translation: "",
    notes: "",
    reference: chunk.reference,
  }));
}

/** Parse Logos-style fully formatted pasted text into verse units. */
export function parseVerses(raw: string): ParseResult {
  const cleaned = cleanText(raw);
  const { body, passageRef } = stripMetadataLines(cleaned);
  const logicalLines = mergeWrappedLines(body);

  const chunks = logicalLines.flatMap((line) => parseLineChunk(line));

  const fallback =
    chunks.length > 0
      ? chunks
      : cleaned
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean)
          .map((text) => ({ text }));

  const verses = toVerses(fallback);
  const sourceLanguage = detectSourceLanguage(
    verses.map((v) => v.original).join("\n"),
  );

  return { verses, passageRef, sourceLanguage };
}

export function defaultTitle(parse: ParseResult, raw: string): string {
  if (parse.passageRef) return parse.passageRef;
  const firstLine = cleanText(raw).split("\n").find((l) => l.trim());
  if (!firstLine) return "Untitled";
  return firstLine.slice(0, 60).trim() || "Untitled";
}

export function verseCountLabel(count: number): string {
  return count === 1 ? "1 verse" : `${count} verses`;
}
