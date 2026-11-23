# Decision Log — Part 3: Integration and Optimization

## Live data — Open-Meteo (rubric 5.2)
I chose Open-Meteo instead of the OpenWeatherMap named on the assessment page because it needs no API key, so no key is ever exposed in client-side code. The page fetches current temperature, weather code and wind for all three trailheads, with an 8-second timeout, a plain "unavailable" message when the fetch fails or the user is offline, and a 30-minute sessionStorage cache so repeat visits do not call the API again. All API data is written with textContent only, never as HTML, so it cannot inject markup.

## Embed — Google Maps (rubric 5.3)
The Trailhead Map section embeds Google Maps centred on Lake Louise. The iframe has loading="lazy" so it only loads when scrolled to, a title for screen readers, and a fallback link ("Open Lake Louise on Google Maps") if the embed fails. A privacy note under the map tells visitors the map is provided by Google and loading it shares the visit with Google.

## Fonts (rubric 5.4)
Fraunces (weights 600 and 700 only) loads asynchronously with media="print" onload="this.media='all'", plus a noscript fallback. The font stack falls back to Georgia, then Times New Roman, then serif, so text is never invisible while the font loads. Only the two weights used by headings are loaded.

## Optimisation (rubric 6.1–6.3)
The three unused gradient placeholder classes were removed from the stylesheet. Images and the map iframe lazy-load, and every image has width and height attributes to prevent layout shift. I kept the original JPEG photos instead of the WebP versions I generated, so the files are large (Johnston Canyon about 15 MB, Ptarmigan Cirque about 16 MB); lazy-loading limits that cost to when a visitor scrolls to the cards. Minified CSS and JS were generated (styles.min.css 10,569 to 8,481 bytes; script.min.js 5,930 to 4,643 bytes) but the live build references the readable files so the code stays reviewable.

## SEO and AIO metadata (rubric 6.2)
Added: robots (index, follow), author (Sumeeran Khawas), canonical (GitHub Pages URL), og:title, og:description, og:type (website), og:url and og:image. Every image has a meaningful alt, headings stay in logical order, and the page keeps the meta description from Part 1.

## Privacy
No API keys anywhere in client code. The weather API is keyless; the only third-party tracking is the Google Maps embed, disclosed in the privacy note, and the map iframe uses referrerpolicy="no-referrer-when-downgrade".

## Lighthouse (Chrome DevTools, localhost, 23 Nov 2026)
Performance 100, Accessibility 100, Best Practices 92, SEO 100 — all above the 90 target. Best Practices was the lowest of the four and still above 90.

## Git (rubric 7.1–7.2)
One feature branch (feature/part3-integration), one commit, pull request #1 with a description, squash-merged into main.
