# Preview changes before they ship

Use this workflow to **see and test changes** before they land on `main` and production.

## Quick preview (on your machine)

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Best for iPad testing: use your Mac’s local IP (e.g. `http://192.168.1.x:3000`) on the same Wi‑Fi.

**Production-like preview** (same build Vercel runs):

```bash
npm run preview
```

Open [http://localhost:3000](http://localhost:3000) after the build finishes.

## Preview from a Cloud Agent branch (recommended)

When an agent finishes work, it should **not** merge to `main` automatically. Instead:

1. Agent pushes a branch like `cursor/some-feature-2f95`
2. Agent opens a **draft Pull Request** on GitHub
3. Vercel creates a **Preview Deployment** for that PR (link appears in the PR checks)
4. You open the preview URL, test on iPad/desktop
5. When satisfied, tell the agent **“approve and merge”** or merge the PR yourself

Production (`main`) only updates after you merge.

### Enable PR previews on Vercel

In the [Vercel project](https://vercel.com) → **Settings → Git**:

- **Production Branch:** `main`
- **Preview Deployments:** enabled for pull requests

## Protect `main` on GitHub (one-time setup)

So nothing merges without your review:

1. GitHub → **Settings → Branches → Add branch protection rule**
2. Branch name pattern: `main`
3. Enable **Require a pull request before merging**
4. Optional: **Require approvals** (1) if you want a formal approve button

After this, agents (and you) must use PRs; direct pushes to `main` can be blocked.

## What to check before merging

- [ ] Library loads (no “couldn’t load” screen)
- [ ] + New menu and create flows work
- [ ] Folder/notebook icons and colors look right
- [ ] iPad Safari: touch targets, safe areas, Pencil if applicable
- [ ] `npm run build` passes (CI on the PR should be green)

## Agent instructions

Cloud agents for this repo must follow [AGENTS.md](./AGENTS.md): **branch + draft PR only** unless you explicitly say to merge.
