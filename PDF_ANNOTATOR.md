# PDF Annotator Workspace — Design Proposal

> **Status:** Proposal — not yet implemented.  
> **Context:** Evaluate replacing or augmenting the current textarea-based translation workspace with an embedded PDF annotator.

---

## Problem

The MVP workspace is optimized for **pasted text** (Logos Fully Formatted copy). Many students also work from:

- Exported PDF readers (BHS, NA28, commentaries)
- Scanned or publisher PDFs with original-language layout
- Handwritten-style workflows (Apple Pencil highlights, margin notes, ink parsing)

A plain textarea per verse does not preserve **document layout**, **visual context**, or **spatial annotation** — all of which matter for translation and exegesis on iPad.

---

## Recommendation

**Do not replace the text workspace.** Add a second project mode: **PDF Document Workspace**.

| Mode | Best for | Input |
|------|----------|-------|
| **Text** (current) | Logos copy-paste, verse-by-verse translation | Paste → parse verses |
| **PDF** (proposed) | Reader PDFs, visual layout, ink/highlight parsing | Upload PDF → annotate in place |

Use a **hybrid layout** in PDF mode rather than annotations alone:

```
┌─────────────────────────────────────────┐
│  Toolbar: pen · highlight · text box ·  │
│           verse pin · translation panel   │
├──────────────────┬──────────────────────┤
│                  │  Verse list (collapsible)
│   PDF viewer     │  ─────────────────────
│   + annotations  │  Translation textarea
│                  │  Notes textarea
│                  │  (linked to selected pin)
└──────────────────┴──────────────────────┘
     iPad landscape          iPad portrait: stacked
```

**Why hybrid:** PDF annotators excel at reading and marking up source text, but structured translation notes are easier to search, export, and later sync to Aleph in a side panel linked to verse anchors (PDF coordinates + optional reference label).

---

## Library evaluation

### Tier 1 — Recommended for Aleph (open source)

| Library | Pros | Cons | Fit |
|---------|------|------|-----|
| **[Fresh Air PDF](https://github.com/VeARCTechnologies/FRESH-AIR-PDF)** | Drop-in React 18/19 component; highlight, ink, shapes, text boxes; JSON export; PDF.js; no server | Newer project; bundle size; verify Safari/iPad Pencil | **Best OSS drop-in** |
| **[pdf-reader-js](https://github.com/suhasTeju/pdf-reader-js)** | Next.js-compatible; touch/pinch; programmatic annotation API; export/import | Heavier UI opinion; less customizable | Good if we want hooks-first API |
| **[Papyrus SDK](https://github.com/solrachix/Papyrus)** | Modular (core + engine + UI); RN path later; EPUB/TXT future | More integration work; younger ecosystem | Best long-term platform bet |

### Tier 2 — Commercial (if budget allows)

| Library | Pros | Cons |
|---------|------|------|
| **Nutrient (PSPDFKit)** | Best iPad/Apple Pencil; production-grade; Instant JSON sync | License cost; vendor lock-in |
| **Apryse WebViewer** | Full annotation suite; enterprise support | Cost; heavier bundle |

### Tier 3 — Not recommended alone

| Library | Why skip as primary |
|---------|---------------------|
| `react-pdf` | Render only — no annotations |
| `@react-pdf-viewer/core` | Needs separate annotation plugins; more assembly |
| Raw PDF.js | Maximum control, maximum build cost |

### Aleph pick

**Phase 1 spike:** Fresh Air PDF or pdf-reader-js (whichever passes iPad Safari + Apple Pencil QA first).  
**Phase 2 production:** Papyrus if we need EPUB/readers beyond PDF.  
**Enterprise:** Nutrient if OSS touch/ink quality is insufficient.

---

## Architecture changes

### Project types

```typescript
type ProjectKind = "text" | "pdf";

interface TranslationProjectBase {
  id: ProjectId;
  kind: ProjectKind;
  title: string;
  sourceLanguage: SourceLanguage;
  createdAt: string;
  updatedAt: string;
  passageRef?: string;
}

interface TextTranslationProject extends TranslationProjectBase {
  kind: "text";
  verses: Verse[];
}

interface PdfTranslationProject extends TranslationProjectBase {
  kind: "pdf";
  pdf: {
    fileName: string;
    pageCount: number;
    /** Blob stored in IndexedDB, keyed by project id */
    blobKey: string;
  };
  annotations: PdfAnnotation[];
  /** Structured translations linked to verse pins */
  verseLinks: PdfVerseLink[];
}

interface PdfVerseLink {
  id: string;
  reference?: string;       // user or OCR label, e.g. "1:3"
  page: number;
  /** Normalized rect on page (0–1) for anchor */
  rect: { x: number; y: number; w: number; h: number };
  translation: string;
  notes: string;
}

interface PdfAnnotation {
  id: string;
  type: "highlight" | "ink" | "text" | "pin" | "rectangle";
  page: number;
  payload: unknown;         // library-specific; normalize on export
  verseLinkId?: string;
}
```

### Storage migration

| Data | Current | PDF mode |
|------|---------|----------|
| Project metadata + verses | `localStorage` (~5 MB total) | `localStorage` (index + JSON metadata) |
| PDF binary | — | **IndexedDB** (`aleph:pdf:{id}`) |
| Annotations | — | JSON in project blob or separate IDB key |

`localStorage` cannot hold PDF files. IndexedDB is required before PDF support ships.

### New routes

| Route | Purpose |
|-------|---------|
| `/new/pdf` | Upload PDF, set title, start |
| `/workspace/pdf/[id]` | PDF viewer + annotation + linked translation panel |

Existing `/new` and `/workspace/[id]` remain for text projects.

### Component structure (proposed)

```
components/pdf/
  PdfWorkspace.tsx          # Hybrid layout orchestrator
  PdfViewer.tsx             # Dynamic import, SSR-safe wrapper
  PdfAnnotationToolbar.tsx  # Pen, highlight, text, verse pin
  PdfVersePanel.tsx         # Translation/notes for selected pin
  PdfUpload.tsx             # File picker + validation

lib/storage/
  indexedDb.ts              # PDF blob CRUD
  pdfProjects.ts            # Extends projects CRUD for kind=pdf
```

**SSR note:** PDF.js and annotators must load via `next/dynamic({ ssr: false })` to avoid `window` errors on Vercel.

---

## Translation-specific annotation model

Generic PDF annotators are not translation tools out of the box. Aleph should define **verse pins**:

1. User selects **Verse Pin** tool and taps/draws a region on the PDF (or selects highlighted text if text layer exists).
2. A `PdfVerseLink` is created; side panel opens for translation + notes.
3. Optional: user enters reference (`1:3`) or Aleph auto-suggests later.
4. Highlights/ink on the same page can attach to the active verse link.

This preserves the MVP's structured translation data while gaining PDF spatial context.

### Text-layer PDFs vs scanned PDFs

| PDF type | Behavior |
|----------|----------|
| Digital (selectable text) | Text selection → create verse pin; optional auto-split by verse numbers in text layer (future) |
| Scanned (image only) | Manual verse pins + ink only; no auto verse detection |

---

## iPad / Safari requirements

Must pass before shipping PDF mode:

- [ ] Apple Pencil pressure / palm rejection (library-dependent)
- [ ] Pinch-zoom and two-finger scroll without breaking ink strokes
- [ ] 16px+ tool UI; toolbar reachable in landscape with keyboard attached
- [ ] `visualViewport` resize when iPad keyboard opens (side panel must not collapse)
- [ ] Memory: large PDFs (100+ page readers) — lazy page render only
- [ ] Offline: PDF + annotations persist in IDB after first load

---

## Aleph integration points (future)

| Feature | PDF hook |
|---------|----------|
| Lemma lookup | Select text in PDF text layer → `alephRef` on `PdfVerseLink` |
| Passage detection | OCR or text-layer parse → pre-populate `reference` |
| Sync | Upload PDF + Instant JSON (Nutrient) or custom annotation export |
| Export | PDF with burned-in annotations + parallel translation Markdown |

---

## Phased rollout

### Phase A — Spike (1 library, 1 PDF, no verse links)
- Add `/new/pdf` upload → IndexedDB
- Embed Fresh Air PDF or pdf-reader-js in `/workspace/pdf/[id]`
- Persist annotation JSON only
- Validate iPad Safari manually

### Phase B — Hybrid translation panel
- Verse pin tool + `PdfVerseLink` side panel
- Autosave annotations + links to IndexedDB
- Archive shows project kind badge (Text / PDF)

### Phase C — Polish
- Thumbnails, jump to page, search in PDF
- Export annotated PDF
- Migrate text projects unchanged

### Out of scope (same as MVP)
- Flashcards, vocab drills, Quizlet, Aleph API

---

## Risks

| Risk | Mitigation |
|------|------------|
| Bundle size (+2–5 MB PDF.js) | Dynamic import; route-level code split |
| Safari PDF rendering bugs | Test on real iPad; fallback message |
| Storage quota (large PDFs) | Warn at upload; compress where possible; delete blob on project delete |
| Verse structure lost in PDF | Hybrid panel keeps structured translation data |
| Library abandonment | Wrap behind `PdfEngine` interface; Papyrus as swap-in |

---

## Decision needed

1. **Approve hybrid PDF mode** (recommended) vs PDF-only workspace?
2. **Approve IndexedDB** storage layer for PDF blobs?
3. **Spike library:** Fresh Air PDF first, or pdf-reader-js?
4. **Upload limit:** Max PDF size for MVP (e.g. 25 MB)?

Once approved, implementation starts on `cursor/pdf-workspace-2f95` without removing the existing text workflow.
