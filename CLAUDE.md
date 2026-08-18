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
  index.html
  styles.css
  script.js
  assets/
    resume.pdf     (placeholder — real file dropped in later)
    favicon.ico     (optional)
```

## Hydra background

- Loaded via CDN in `index.html`: `<script src="https://unpkg.com/hydra-synth"></script>`
- `<canvas id="hydra-bg">` is `position: fixed`, full viewport, `z-index: -1`,
  behind all page content, defined in `styles.css`
- `script.js` initializes Hydra against that canvas
  (`new Hydra({ canvas, detail: false, makeGlobal: true })`) and runs a
  hand-tuned sketch (osc/shape/modulate/color chains) — subtle and
  professional-feeling, not distracting, since real text sits on top
- The animation runs behind the **entire page**, not just a hero section, and
  keeps animating as the user scrolls

### Performance/UX safeguards (required, not optional)

- Respect `prefers-reduced-motion`: render a single static frame or skip
  Hydra entirely, falling back to a plain CSS gradient background
- Pause the Hydra render loop on `visibilitychange` (tab hidden) to save
  GPU/battery
- Lower resolution/detail on small viewports (mobile)
- Wrap Hydra init in try/catch with a CSS gradient fallback if WebGL is
  unavailable

### Readability

Content panels use a semi-transparent dark background + `backdrop-filter:
blur(...)` so text stays legible over the animation for the full scroll
length.

## Page content

Single scrolling page, currently placeholder content (clearly marked, e.g.
`[Company Name]`, `[Describe project here]`) to be replaced later:

1. Hero — name, title/tagline, contact links (email, GitHub, LinkedIn)
2. About — short bio
3. Skills — tag/list of technologies
4. Experience — 2–3 job entries (title, company, dates, bullets)
5. Projects — 2–3 project cards (name, description, tech, link)
6. Contact/footer — email, links, resume PDF download

## Styling

- Dark theme by default (pairs with a glowing synth background)
- Responsive layout via flexbox/grid, mobile-friendly breakpoints
- Semantic HTML (`header`, `main`, `section`, `footer`)
- `prefers-reduced-motion` respected for CSS transitions/animations too

## Verification

Open `index.html` directly in a browser, or serve via
`python3 -m http.server` in this directory, and confirm:

- Hydra background renders and animates behind all sections while scrolling
- Text panels stay readable over the animation
- Mobile-width layout stays usable and animation stays performant
- OS "reduce motion" setting falls back to a static/non-animated background
- No console errors if WebGL/Hydra fails to load (gradient fallback shows)

## Deployment (GitHub Pages + custom domain)

Site deploys via GitHub Pages — no build step needed, it serves the repo
contents directly.

1. Push this repo to GitHub.
2. In repo Settings → Pages, set source to the `main` branch, root folder.
3. Add a `CNAME` file at the repo root containing the custom domain (e.g.
   `yourname.com`) — GitHub Pages reads this automatically.
4. At the domain registrar, point DNS at GitHub:
   - Apex domain (`yourname.com`): four `A` records to
     `185.199.108.153`, `185.199.109.153`, `185.199.110.153`,
     `185.199.111.153`
   - `www` subdomain: `CNAME` record to `<username>.github.io`
5. Back in Settings → Pages, enter the custom domain and enable "Enforce
   HTTPS" once DNS propagates (minutes to ~24h).

Path constraints this imposes on the code:

- All asset/script references (`assets/...`, `styles.css`,
  `script-custom.js`) must stay relative — no leading `/` — since the site
  may also be briefly reachable at `username.github.io/repo` before DNS
  cuts over.
- GitHub Pages' filesystem is case-sensitive (unlike macOS by default), so
  asset filenames must match their references' case exactly.
- `assets/resume.pdf` is referenced from the hero and contact sections but
  is not yet present in `assets/` — must be added before deploy or those
  links 404.
