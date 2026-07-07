<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Agent workflow — preview before GitHub

**The user must be able to preview changes before they reach `main` or production.**

## Required git workflow

1. **Never merge to `main`** unless the user explicitly says to merge, approve, or commit to production.
2. **Always work on a feature branch:** `cursor/<descriptive-name>-2f95`
3. **Commit and push the branch** when implementation is ready for review.
4. **Open a draft Pull Request** to `main` — do not auto-merge.
5. **Tell the user** how to preview:
   - Vercel **Preview URL** on the PR (preferred), and/or
   - Local: `npm run dev` or `npm run preview` on the branch
6. **Wait for user approval** before merging the PR or pushing to `main`.

## Do not

- Fast-forward merge to `main` immediately after finishing a task
- Push directly to `main` for feature work
- Mark PRs as ready for review / merge without user confirmation

## When the user says “approve and merge”

1. Merge the PR (or fast-forward `main` if that is the project convention)
2. Confirm production will redeploy from `main`

## Preview commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Hot-reload dev server |
| `npm run preview` | Production build + `next start` |
| `npm run build` | Verify build before opening PR |
| `npm run lint` | Lint check |

See [PREVIEW.md](./PREVIEW.md) for the full human-facing guide.
