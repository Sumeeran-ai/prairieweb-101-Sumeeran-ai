# Explore Alberta Trails

One-page microsite for Prairie Pixel Studio — a trail guide for Alberta. Built for SODV1401-02 Competency Assessment Parts 1–4.

## What it does

- Three featured trails (Lake Louise Lakeshore, Johnston Canyon, Ptarmigan Cirque) with distance, difficulty, best season and a photo each.
- Live trail weather from Open-Meteo (no API key), cached 30 minutes, with an offline/error message.
- Lazy-loaded Google Maps embed of the Lake Louise trailhead, with a fallback link.
- Contact form with real-time validation, accessible errors and a console JSON log — no page reload.
- FAQ, responsive layout (640px / 1024px breakpoints), reduced-motion support.
- Client-side error log (localStorage `trailErrorLog`) for post-deployment monitoring.

## Tech

- Semantic HTML with ARIA landmarks
- Bootstrap 5.3.9 CSS-only via CDN + custom BEM stylesheet
- Fraunces display font (weights 600/700), loaded asynchronously from JavaScript with Georgia fallback
- Vanilla JS module (`js/script.js`): form validation, weather fetch
- No build step

## Run it

Open `index.html` in a browser, or serve it locally (for example `npx serve`, or VS Code Live Server) — Lighthouse needs `http://localhost`.

Live site: https://sumeeran-ai.github.io/prairieweb-101-Sumeeran-ai/

## Project structure

- `index.html`
- `css/styles.css`
- `js/script.js`
- `images/` — trail photos (JPG + WebP)
- `decision_log.md` — Part 3 decisions, privacy, optimisation and Lighthouse scores
- `troubleshoot_log.md` — Part 4 debugging log
- `deployment.md` — Part 4 deployment steps
- `maintenance_plan.md` — Part 4 maintenance plan

## Photo credits

- Lake Louise: Hedwig Storch, CC BY-SA 3.0
- Johnston Canyon: Chris Woodrich, CC BY-SA 4.0
- Ptarmigan Cirque: Khoshhat, CC BY-SA 4.0

## Lighthouse (23 Nov 2026, localhost)

Performance 100, Accessibility 100, Best Practices 92, SEO 100.

## Git workflow

Feature branches, pull requests, squash-merge into main. Part 3: PR #1 (live weather, map, fonts, SEO, photos) and PR #2 (decision log). Part 4: feature branch with the debug, refactor and deploy fixes.
