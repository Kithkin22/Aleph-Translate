# Aleph Translate

iPad/Safari-first translation workspace for Hebrew and Greek reading practice.

**Version 1.0** — Library-organized notebooks with local autosave.

Built with Next.js, TypeScript, and Tailwind CSS. Deploy-ready on Vercel.

**Live app:** [https://aleph-translate.vercel.app](https://aleph-translate.vercel.app)

## Features

### Library (core model)

```
Hebrew/
  Job/
    Job 1, Job 2, Job 3
Greek/
  John/
    John 1, John 2
```

- Default **Hebrew** and **Greek** folders (names editable)
- **Notebooks** per book — empty notebooks allowed
- **Drag to reorder** notebooks within a folder
- **Pages/chapters** with completion status
- **Continue** where you left off
- **Chapter navigation** in the workspace

### Translation workspace

- Paste Logos Fully Formatted text — automatic verse splitting
- Verse-by-verse translation and notes
- Hebrew/Greek auto-detection
- Debounced autosave to browser storage
- Legacy MVP projects migrate automatically on first load

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Preview before merging

See **[PREVIEW.md](./PREVIEW.md)** — local dev, production-like `npm run preview`, and Vercel PR preview URLs. Agents should open **draft PRs** and wait for your approval before merging to `main`.

## Deploy on Vercel

Push to GitHub and import the repository in Vercel, or:

```bash
npx vercel
```

## Roadmap (post-1.0)

- PDF annotator pages — see `PDF_ANNOTATOR.md`
- GoodNotes-style zoom writing lane — see `GOODNOTES_ZOOM.md`
- Aleph API integration

## Storage

All library metadata and page content save in the browser via `localStorage`. No account or server required.
