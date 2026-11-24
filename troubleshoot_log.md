# Troubleshoot Log — Explore Alberta Trails (Part 4)

How I found each issue, what I fixed, and how I checked it. The site was run
unchanged on localhost and checked in Chrome DevTools (Console, Network,
Application, Lighthouse) on 23 Nov 2026.

| Issue | Fix & Evidence Link |
|---|---|
| **Console error — CSP blocks the font.** The Fraunces font link used an inline `onload="this.media='all'"` handler. Our Content Security Policy (`script-src 'self'`) blocks inline event handlers, so Chrome logged "Executing inline event handler violates the following Content Security Policy directive 'script-src 'self''" and the font stylesheet stayed on `media="print"` — headings rendered in the Georgia fallback, not Fraunces. | Removed the inline handler from `index.html`. The font is now loaded from `js/script.js` (creates the link element and attaches the `load` listener with `addEventListener`), which keeps it async and CSP-clean. Verified: the fixed copy logs **no console errors** in headless Chrome (23 Nov 2026); the old copy logged the error within seconds. Evidence: [js/script.js — loadDisplayFont](https://github.com/Sumeeran-ai/prairieweb-101-Sumeeran-ai/blob/main/js/script.js) |
| **Network failure — Bootstrap source map.** During the 23 Nov Lighthouse session, DevTools showed the `bootstrap.min.css.map` fetch blocked by CSP. | The map is only fetched when DevTools is open, so it is not a visitor-facing error. After the Bootstrap 5.3.9 update I re-checked in DevTools during the video recording — see the video. Evidence: [live site](https://sumeeran-ai.github.io/prairieweb-101-Sumeeran-ai/) |
| **Network failure — DevTools discovery file.** DevTools showed a 404 for `.com.chrome.devtools.json`. | No fix needed: this is a Chrome DevTools artifact, not a file our site requests. Recorded so it is not mistaken for a site error. |
| **Weather fetched one trail at a time.** The three Open-Meteo requests ran in sequence (`for...of` + `await`), so the last card waited for the first two. | All three now run in parallel with `Promise.all`. Verified by loading the page: all three weather lines appear together. Evidence: [js/script.js — loadTrailWeather](https://github.com/Sumeeran-ai/prairieweb-101-Sumeeran-ai/blob/main/js/script.js) |
| **Weather could crash if storage is blocked.** `sessionStorage.getItem` / `setItem` were called with no guard; in private mode or with storage disabled they throw, and the uncaught error stopped the weather load. | Cache read/write moved into `readWeatherCache()` / `writeWeatherCache()` wrapped in try/catch — if storage is unavailable the page fetches fresh data and still renders. Evidence: [js/script.js — readWeatherCache / writeWeatherCache](https://github.com/Sumeeran-ai/prairieweb-101-Sumeeran-ai/blob/main/js/script.js) |
| **Weather cache poisoned by a failed fetch.** Found on the live site check, 24 Nov 2026: the first load failed all three Open-Meteo requests, and the empty result was still written to sessionStorage with a 30-minute life. Reloading the same tab then returned the empty cache early and left all three cards stuck on "Loading trail weather…" for 30 minutes, with no retry. | The cache is now only written when at least one trail returned data, an empty cached result is ignored, and the page always fetches fresh data after showing any cached values — a failed card retries on the next load instead of staying stuck. A failed fetch also only shows "unavailable" when the card still says "Loading…", so a cached value is never wiped by a later failure. Evidence: [js/script.js — loadTrailWeather / readWeatherCache](https://github.com/Sumeeran-ai/prairieweb-101-Sumeeran-ai/blob/main/js/script.js) |
| **Section headings hidden under the sticky header.** Found on the live site check, 24 Nov 2026: clicking a nav link (e.g. #trails) scrolled the section heading partly under the sticky header. | Added `scroll-margin-top: 4.5rem` to `.section`, so anchor jumps land with the heading below the header. Evidence: [css/styles.css — .section](https://github.com/Sumeeran-ai/prairieweb-101-Sumeeran-ai/blob/main/css/styles.css) |
| **Small repeat in the form code.** The submit handler re-queried `document.getElementById('name')` instead of reusing the field already looked up. | Changed to `fields[0].input.value.trim()`. No behaviour change. Evidence: [js/script.js — submit handler](https://github.com/Sumeeran-ai/prairieweb-101-Sumeeran-ai/blob/main/js/script.js) |
| **No cache-busting on local files.** `css/styles.css` and `js/script.js` had no version, so after a deploy a returning visitor's browser could keep serving the old files. | Added version query strings: `css/styles.css?v=20261123` and `js/script.js?v=20261123`. Bumped on every deploy. Verified both URLs return 200. Evidence: [index.html](https://github.com/Sumeeran-ai/prairieweb-101-Sumeeran-ai/blob/main/index.html) |
| **Split CSS rules.** The `.site-nav` rules were written in two separate blocks (one for `display: none`, one for positioning). | Merged into a single `.site-nav` rule. No visual change. Evidence: [css/styles.css](https://github.com/Sumeeran-ai/prairieweb-101-Sumeeran-ai/blob/main/css/styles.css) |
| **Images uncompressed.** Johnston Canyon 14.7 MB, Ptarmigan Cirque 15.6 MB, Lake Louise 1.08 MB. | Kept the original JPGs (owner decision, 23 Nov 2026). Mitigation in place: all three images lazy-load and carry width/height attributes against layout shift. WebP versions (800w: 105 KB / 93 KB / 58 KB) are prepared in `images/` if they are needed later. Evidence: [index.html — trail cards](https://github.com/Sumeeran-ai/prairieweb-101-Sumeeran-ai/blob/main/index.html) |
| **GitHub Pages not enabled.** The live URL `https://sumeeran-ai.github.io/prairieweb-101-Sumeeran-ai/` returned 404. | Enabled in repo Settings → Pages (deploy from `main`, root). Steps in `deployment.md`. Live URL verified after enabling. Evidence: [live site](https://sumeeran-ai.github.io/prairieweb-101-Sumeeran-ai/) |
| **No cookies set.** Checked the whole site: no `document.cookie` use in the HTML, CSS or JS. | Nothing to secure. Recorded the check. The only cookies involved are third-party ones from the Google Maps embed, already disclosed in the map privacy note on the page. Evidence: [live site — DevTools Application tab, shown in the video](https://sumeeran-ai.github.io/prairieweb-101-Sumeeran-ai/) |
| **No error monitoring.** Nothing tracked site errors after deployment. | Added a small client-side error log in `js/script.js`: `error` and `unhandledrejection` events are saved to localStorage (`trailErrorLog`, newest 20), viewable in DevTools → Application → Local Storage. Evidence: [js/script.js — installErrorLog](https://github.com/Sumeeran-ai/prairieweb-101-Sumeeran-ai/blob/main/js/script.js) |
| **Stale minified files.** The Part 3 `styles.min.css` / `script.min.js` were out of date after the Part 4 edits, and the live build never referenced them. | Removed them from the repo (`git rm`). The live build uses the readable files with cache-busting, as recorded in the Part 3 decision log. Evidence: [repo file list](https://github.com/Sumeeran-ai/prairieweb-101-Sumeeran-ai) |

## Scaffold comparison (the Part 4 provided flawed index.html)

| Scaffold flaw | Our site |
|---|---|
| No `lang` | `lang="en"` present |
| Missing viewport | Present |
| 150 kB unused framework dump | Bootstrap 5.3.3 CSS-only via CDN, updated to 5.3.9; it is actually used (`.container` comes from Bootstrap) and is the Part 1 framework choice, so it stays |
| Conflicting styles | None observed; our stylesheet loads after Bootstrap and wins ties |
| 1 MB PNG | No PNGs; the JPGs were the weight problem — see the image row above |
| Stale `Cache-Control max-age=31536000` | Not applicable (GitHub Pages controls headers); fixed with version query strings instead |
| Bootstrap 3.3.7 `@import` | We use a 5.3.9 CDN link |
| `.background` desktop.jpg 100vh/100% | No such rule; the hero uses a CSS gradient |

## Cache and cookies check (23 Nov 2026)

Cleared browser cache and cookies, reloaded the page, and confirmed the issue
was resolved: console clean, weather loads on all three cards, map and form
work, and the versioned CSS/JS (`?v=20261123`) load fresh. No cookies are set
by the site itself.
