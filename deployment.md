# Deployment — Explore Alberta Trails (Part 4)

## Hosting choice

GitHub Pages. It fits this project: a static one-page site, no server code, no
database, and the code already lives in a GitHub repo. No API keys exist
(Open-Meteo is keyless), so there are no environment variables or secrets to
configure — nothing secret is committed to the repo.

## Steps (repeatable)

1. Push the Part 4 branch to `main` (pull request + squash-merge, as in
   Parts 1–3). Every push to `main` redeploys the site automatically.
2. In the repo, go to **Settings → Pages**.
3. Under **Build and deployment → Source**, choose **Deploy from a branch**.
4. Set **Branch** to `main` and the folder to `/ (root)`, then **Save**.
5. Wait for the build (about a minute). The Pages settings page shows the
   live URL when it is ready.
6. Open the live URL and verify (see below).

Live URL: `https://sumeeran-ai.github.io/prairieweb-101-Sumeeran-ai/`

## Verification after deploy

- The live URL loads over HTTPS (padlock, no mixed-content warnings).
- DevTools Console is clean (no errors).
- Network tab: no failed requests.
- Live weather shows on all three trail cards.
- The map embed loads (with the fallback link if it does not).
- The contact form validates and submits without a page reload.
- Mobile sizes 360×640 and 414×896: no cut-off content, touch targets work.
- Lighthouse re-run after the updates (rubric 10.2).

## Build files

The live build references the readable files with cache-busting versions:
`css/styles.css?v=20261123` and `js/script.js?v=20261123`. Bump the version
on every deploy so returning visitors get the new files. The stale Part 3
minified files (`styles.min.css`, `script.min.js`) were removed from the repo
because the live build never used them and they were out of date after the
Part 4 edits.

## Rollback

Revert the merge commit (or the PR) on GitHub and push to `main` — Pages
rebuilds from `main` automatically. No database or server state to restore.
