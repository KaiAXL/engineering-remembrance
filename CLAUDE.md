# CLAUDE.md

## What this is

**Engineering Remembrance** (engineeringremembrance.org) is a static website presenting a
Holocaust family-history research project — the recovery of the Helman family of
Tiszabogdány (Subcarpathia) from fragmented, multilingual archives, and a repeatable
AI-assisted record-linkage method built from that case.

It is authored by Samantha Seligman-Grajewski (sgrajews@stanford.edu). This is a public,
memorial-quality site about real people who were murdered in the Holocaust — treat all
content, names, dates, and photographs with corresponding care and accuracy.

## Stack & hosting

- **Astro (static site generation).** `npm run dev` to develop, `npm run build` to emit
  static HTML/CSS/JS to `dist/`, `npm run preview` to serve the built output.
- Node 18+ (CI uses 20; local dev has used 26). One-time after `npm install`, the esbuild
  and sharp install scripts must be approved (`npm approve-scripts …`) — already recorded
  in `package.json` under `allowScripts`.
- Hosted on **GitHub Pages via GitHub Actions** (`.github/workflows/deploy.yml`): every push
  and PR builds and link-checks; pushes to `main` deploy. The Pages source must be set to
  **GitHub Actions** in repo settings (not "deploy from a branch"). `public/CNAME` →
  `engineeringremembrance.org` carries the custom domain into `dist/`.
- Only external runtime dependency: Google Fonts (Newsreader + IBM Plex Mono) via `<link>`,
  and Leaflet (from unpkg) inside the standalone map page. Everything else is self-hosted.

## Layout

- `src/pages/` — one file per route. `.astro` pages emit `.html` (build format is `file`,
  so `case.astro` → `/case.html`). `person/[id].astro` is a dynamic route: `getStaticPaths`
  generates one page per person. `budapest-map.astro` is a standalone Leaflet document (no
  site chrome) injected with data at build time; `map.astro` embeds it in an iframe.
- `src/layouts/Base.astro` — the shared page frame: `<head>`/OG metadata, the theme
  bootstrap script, `<Sidebar>`, the `<main class="main"><div class="wrap">` wrapper,
  `<HelenDialog>`, and `theme.js`. Every content page renders inside `<Base>`.
- `src/components/` — `Sidebar.astro` (nav is data-driven), `HelenDialog.astro`.
- `src/lib/data.ts` — **the data-access layer**. The ONLY module that reads `/data`. Every
  accessor is `async` and returns the typed interfaces in `src/lib/types.ts`. This is the
  single seam for a future DB (Supabase/Postgres): swapping file reads for queries touches
  only this file. Nothing else imports from `@data/*`.
- `data/*.json` — the content "database": `people`, `records`, `repositories`, `map-sites`,
  `journeys`, `site-content`. See `data/README.md`. IDs are the join keys between files.
- `public/` — static assets copied verbatim to the site root: `styles.css`, `theme.js`,
  `images/`, `audio/`, `favicon.svg`, `CNAME`, and the standalone `brief.html` print sheet.
- `_legacy/` — the original hand-written HTML pages, kept as the content source of truth to
  port from. Not part of the build (excluded in `tsconfig.json`).
- `scripts/check-links.mjs` — post-build internal-link checker; run it after every build.

## Conventions (match these when editing)

- **Content is data-driven where the content is data-shaped** (databases, people, records,
  map). Prose-heavy narrative pages (case, method, about, start, index) are faithful ports
  in `.astro`, still through `<Base>`. When a page's content changes, update the relevant
  `data/*.json` or the page's `.astro`, not the `_legacy/` copy.
- **Path aliases**: `@lib/*`, `@components/*`, `@layouts/*`, `@data/*` (see `tsconfig.json`).
- **Asset paths are absolute from the site root**: `/images/…`, `/audio/…`.
- **Theming**: `data-theme` (`dark` default / `light`) and `data-side` (`on`/`off`) set on
  `<html>` by the inline bootstrap in `Base.astro` before paint, persisted in `localStorage`
  (`er-theme`, `er-side`). Colors are CSS custom properties in `:root` in `public/styles.css`.
- **Scripts served from `public/`** (like `/theme.js`) must be referenced with `is:inline`
  so Astro doesn't try to bundle them.
- **Typography/entities**: prose uses HTML entities (`&middot;`, `&rsquo;`, `&oacute;`, …).
  Serif (`--serif`) for body, mono (`--mono`) for labels/nav/eyebrows. `theme.js` is
  vanilla ES5-ish (delegated listeners, IIFEs, feature guards) — no modules, no libraries.
- **Accessibility**: interactive elements carry `aria-label`/`aria-current`; scroll reveal
  respects `prefers-reduced-motion`. Preserve these.

## Keeping in sync with `main`

The site author edits the original static HTML directly on `main`. When `main` moves ahead,
merge it into the working branch: git rename-detection routes edited `styles.css`/`theme.js`/
images into `public/` and edited pages into `_legacy/`. Then move any brand-new assets into
`public/`, and re-port the changed page content into `/data` + `src/pages`. Verify with
`npm run build` and `node scripts/check-links.mjs`.

## Editorial standard

The project holds itself to a documented evidentiary standard (see the "The standard" panel
on the home page): identifications require corroborating independent record types, every
linkage is verified against the primary document, and probable conclusions are labeled as
probable. Do not invent, embellish, or soften historical facts. If asked to change dates,
names, records, or fates, treat them as factual claims — confirm rather than guess.
