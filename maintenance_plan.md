# Maintenance Plan — Explore Alberta Trails

## Monitoring

After every deploy I check the live site: DevTools Console for errors, the
Network tab for failed requests, and the client-side error log in
localStorage (`trailErrorLog`, newest 20 entries, viewable in DevTools →
Application → Local Storage). I re-run Lighthouse monthly and record the four
scores; anything below 90 gets fixed before the next deploy. If the live
weather stops loading, I check the Open-Meteo API status first, then the
browser console, then the cache. If the live site breaks after a deploy, I
check the GitHub Pages status and the last deploy, read the console and the
error log, and roll back the last merge on `main` before fixing the problem
on a new branch — I never edit the live site directly.

## Updates and changes

Trail information (distances, seasons, conditions) is checked against official
park sources every three months and updated on a feature branch, never
directly on `main`. Links are checked at the same time — the map link, photo
credits and any outbound links must all still resolve. Every change goes
through a pull request with a squash-merge, the version query string on the
CSS/JS is bumped (`?v=YYYYMMDD`), and the page is re-tested before merging.
When the stack itself changes (a new Bootstrap version, a new font, a new
embed), I note the change and the reason in `decision_log.md` so the history
stays readable.

## Security checks

Monthly: confirm the site still loads over HTTPS with no mixed-content
warnings; review the Content Security Policy against the third-party hosts
actually used (jsDelivr, Google Fonts, Google Maps, Open-Meteo); check that no
API keys or secrets have been committed (the site needs none — Open-Meteo is
keyless); confirm the contact form still escapes output with `textContent`
only. Every change is committed through the branch workflow so nothing lands
on `main` unreviewed.

## Plugins and libraries

Monthly version check: Bootstrap (currently 5.3.9, the latest 5.3.x — version 6
is still alpha, so I stay on 5.3.x) and the Fraunces font via Google Fonts.
When an update lands, I apply it on a branch, replace any deprecated methods,
re-test in Chrome and a second browser at 360×640 and 414×896, and re-run
Lighthouse before merging.

## Ongoing care

Git history is the backup — every change is committed and pushed, so any
version can be restored from `main`. The repo stays private with the
instructor as a collaborator. If the site ever goes down, the first check is
the GitHub Pages status and the last deploy, then the browser console on the
live URL.
