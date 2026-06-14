# Shift Swap

A lightweight shift swap MVP built with Next.js, TypeScript, and Tailwind CSS. The app uses local mock data only — no backend, database, or authentication required.

## Features

- Dashboard with upcoming shifts and pending swap activity
- My Shifts page to offer your shifts for swap
- Swap board to browse open coworker shifts and send requests
- Accept, decline, or cancel swap requests in the browser
- In-memory mock store that resets on page refresh

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Mock user

The app signs you in as **Alex Rivera** (`emp-alex`) using seeded mock employees, shifts, and swap requests in `lib/mock/data.ts`.

## Routes

| Route | Purpose |
|-------|---------|
| `/` | Dashboard overview |
| `/my-shifts` | View and offer your shifts |
| `/swaps` | Browse open swaps and manage requests |

## Tech stack

- Next.js App Router
- TypeScript
- Tailwind CSS v4
- React client state via `SwapStoreProvider`
