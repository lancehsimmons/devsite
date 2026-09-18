# devsite

Developer resume/portfolio site with an animated Hydra video synth background.

## Stack

Plain HTML/CSS/JS. No framework, no build step, no npm/bundler. This is a
deliberate choice for simplicity: Hydra-synth only needs a `<canvas>` and a
script tag, and a static resume page has no state/routing that would justify
React, Next, or even a static site generator like Astro. Deploys anywhere
(GitHub Pages, Netlify drag-and-drop, any static host) with zero config.

## File structure

```
devsite/
  index.html          minimal landing page — photo, contact line, email/GitHub icons
  engnr/index.html    software engineering version
  sprt/index.html     technical support engineering version
  styles.css          shared by all three pages
  script-custom.js    shared — Hydra background init + sketch
  ui-controls.js      shared — gaze toggle, opacity/morph sliders
  script.js           UNUSED — superseded by script-custom.js, still tracked
  CNAME               custom domain for GitHub Pages
  assets/
    resume-engnr.pdf  linked from /engnr/
    resume-sprt.pdf   linked from /sprt/
    profile.jpg       hero photo
    *_blue.png        email / github / resume icon links
    *-thumbnail*.png  project card images
```

There is no `favicon.ico`, so `/favicon.ico` 404s on every page load.

## Role variants

The site serves two audience-specific versions of the same resume from one
repo, as paths rather than subdomains. GitHub Pages allows only one custom
domain per repository (that is what `CNAME` is), so `engnr.lancesimmons.fyi`
and `sprt.lancesimmons.fyi` would require two additional repos, two more DNS
records, two more certs, and three hand-synced copies of `styles.css`,
`script-custom.js`, and `assets/`. Paths avoid all of that.

- Root `index.html` is deliberately sparse: photo, a contact line, and
  email/GitHub icons. No bio, no portfolio, no resume link — and no links
  to the variants: `/engnr/` and `/sprt/` are reachable only by direct URL,
  so each is handed out deliberately rather than browsed to.
- `engnr/` and `sprt/` share the same layout and differ in tagline, About
  copy, `<title>`/meta, and which resume PDF they link. The portfolio cards
  are identical on both pages.
- Both variants link their brand/heading back to `../` (the landing page).
  They do not cross-link to each other, and nothing links forward into them.
- When editing shared chrome (header controls, footer, background), change
  `styles.css` / `ui-controls.js` / `script-custom.js` once; when editing
  copy, remember there are two HTML files to keep in sync.
- Each variant sets its own `og:url` (`https://lancesimmons.fyi/engnr/`,
  `.../sprt/`) so link previews are correct per version. Note that
  `og:title`, `description`, and the photo's `alt` still read "Lance
  Simmons" while `<title>` reads "Lance Howard Simmons" — left as is
  deliberately.

## Hydra background

- Loaded via CDN in all three pages:
  `<script src="https://cdn.jsdelivr.net/npm/hydra-synth/dist/hydra-synth.js"></script>`
- `<canvas id="hydra-bg">` is `position: fixed`, full viewport, `z-index: -2`,
  behind all page content, defined in `styles.css`
- `script-custom.js` initializes Hydra against that canvas
  (`new Hydra({ canvas, detectAudio: false, autoLoop: false, makeGlobal: true })`)
  and runs a hand-tuned sketch (noise/mask/modulate/blend chain) — subtle and
  professional-feeling, not distracting, since real text sits on top
- `autoLoop: false` matters: the render loop is driven manually via
  `hydra.tick(dt)` inside a `requestAnimationFrame` loop, which is what makes
  the visibility pause below possible
- Hydra reads `canvas.width`/`canvas.height` directly when a canvas is passed
  in — its own width/height constructor options are ignored in that case, so
  the buffer size is set on the element first
- The animation runs behind the **entire page**, not just a hero section, and
  keeps animating as the user scrolls

### Performance/UX safeguards (required, not optional)

- Respect `prefers-reduced-motion`: skip Hydra entirely, falling back to a
  CSS gradient background (`body.static-bg`)
- Pause the Hydra render loop on `visibilitychange` (tab hidden) to save
  GPU/battery
- Lower resolution/detail on small viewports — `isMobile` caps the pixel
  ratio at 1.5 under 700px
- Wrap Hydra init in try/catch with a CSS gradient fallback if WebGL is
  unavailable

### Readability

A single translucent, blurred wash (`.bg-overlay`) covers the whole viewport
above the animation and below all page content, so the window reads as one
legible layer rather than as boxes around each section. Its opacity is
live-adjustable through the `--overlay-alpha` custom property, driven by the
header's opacity slider.

## Page content

Three pages, all real content — no placeholders remain.

Root `index.html`: photo, one contact sentence, email and GitHub icons.
Nothing else.

`engnr/index.html` and `sprt/index.html`, in order:

1. Hero — photo, tagline, email/GitHub/resume icon links
2. About — three short paragraphs (current work, sound practice, personal)
3. Portfolio — two project cards (Shrug Private Press, Roast)
4. Contact — email link and resume link

All three carry the same header: brand link, `gaze` content toggle, and the
opacity and morph sliders.

## Styling

- Dark theme by default (pairs with a glowing synth background)
- Responsive layout via flexbox/grid, mobile-friendly breakpoints
- Semantic HTML (`header`, `main`, `section`, `footer`)
- `prefers-reduced-motion` respected for CSS transitions/animations too

## Verification

Serve over HTTP — `python3 -m http.server` in this directory — and visit
`/`, `/engnr/`, and `/sprt/`.

Do **not** verify by opening the files directly. Over `file://` there is no
directory-index resolution, so a link to `engnr/` yields a directory listing
or an error instead of the page. Only the root page works that way.

Confirm:

- Hydra background renders and animates behind all sections while scrolling
- Text stays readable over the animation
- Mobile-width layout stays usable and animation stays performant
- OS "reduce motion" setting falls back to a static/non-animated background
- No console errors if WebGL/Hydra fails to load (gradient fallback shows)

## Deployment (GitHub Pages + custom domain)

No build step — Pages serves the branch contents directly.

**Pages builds from the `production` branch, root folder — not `main`.**
Commits pushed to `main` do not go live. To publish:

```
git checkout production
git merge main
git push origin production
git checkout main
```

A build takes roughly 40–60s. Watch it in the repo's Actions tab under
"pages build and deployment", at Settings → Pages, or with
`gh run list --workflow "pages build and deployment"`.

This split is useful: `main` is effectively a staging branch, so work can be
committed and pushed there freely without touching the live site.

Current configuration:

- custom domain `lancesimmons.fyi`, HTTPS enforced; the cert covers the apex
  and `www`
- `CNAME` at the repo root holds the domain. Changing the domain in
  Settings → Pages makes GitHub commit that file directly to `production`,
  so that branch can carry commits that never existed on `main`
- DNS: apex → four `A` records (`185.199.108.153`, `185.199.109.153`,
  `185.199.110.153`, `185.199.111.153`); `www` → `CNAME` to
  `lancehsimmons.github.io`

Path constraints this imposes on the code:

- All asset/script references (`assets/...`, `styles.css`,
  `script-custom.js`) must stay relative — no leading `/` — since the site
  may also be briefly reachable at `username.github.io/repo` before DNS
  cuts over. Pages inside `engnr/` and `sprt/` are one level deeper, so they
  reference shared files as `../styles.css`, `../assets/...`, etc.
- GitHub Pages' filesystem is case-sensitive (unlike macOS by default), so
  asset filenames must match their references' case exactly. A local
  `http.server` check will not catch a case mismatch, since macOS is
  case-insensitive; compare references against `git ls-files` instead.
- `assets/resume-engnr.pdf` and `assets/resume-sprt.pdf` are each referenced
  from their variant's hero and contact sections. Both hold real,
  role-targeted resumes.

## Known gaps

Identified but not yet addressed:

- the four project `<img>` tags in `engnr/` and `sprt/` have no `alt`
  attribute
- `assets/email_blue.png`, `github_blue.png`, and `resume_blue.png` are
  roughly 1.1–1.4 MB each but render at ~48px; they dominate page weight
- `script.js` is tracked but referenced by nothing
- `.DS_Store` is tracked, and there is no `.gitignore`
- no page has a real `<h1>`; the brand link uses `role="heading"` with
  `aria-level="1"` on a `div` instead
