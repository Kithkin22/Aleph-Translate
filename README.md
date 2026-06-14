# Aleph Translate

iPad/Safari-first translation workspace for Hebrew and Greek reading practice.

Built with Next.js, TypeScript, and Tailwind CSS. Deploy-ready on Vercel.

## Features (MVP)

- **Home** — New Translation, Open Saved, Archive
- **New Translation** — Paste text, clean formatting, Logos-style verse splitting
- **Workspace** — Verse-by-verse translation and notes with local autosave
- **Archive** — Reopen or delete saved projects

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy on Vercel

Push to GitHub and import the repository in Vercel, or:

```bash
npx vercel
```

## Paste format

Aleph handles Logos **Fully Formatted** copy output, including:

- Passage headers/footers (e.g. `Genesis 1:1–3 (BHS)`)
- `chapter:verse` prefixes (`1:1 …`)
- Verse numbers at line starts (`1 …`, `[1] …`)
- Wrapped continuation lines and inline verse boundaries

Hebrew vs Greek is detected automatically from the pasted characters.

## Storage

All projects are saved in the browser via `localStorage`. No account or server required for MVP.
