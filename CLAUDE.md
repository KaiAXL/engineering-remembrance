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

- **Plain static HTML/CSS/JS.** No build step, no framework, no package manager, no
  dependencies. Just open the `.html` files in a browser, or serve the folder.
- Hosted on **GitHub Pages** with a custom domain (`CNAME` → `engineeringremembrance.org`).
  Commits to `main` deploy the site.
- One external dependency: Google Fonts (Newsreader + IBM Plex Mono), loaded via `<link>`.
  Everything else (CSS, JS, images, audio) is self-hosted in the repo.

## Layout

- `index.html` and the numbered pages: `case.html`, `records.html`, `map.html`,
  `method.html`, `databases.html`, `brief.html`, `about.html`. Plus `start.html`,
  `budapest-map.html`.
- `styles.css` — single global stylesheet for the whole site.
- `theme.js` — single global script (light/dark toggle, sidebar show/hide, mobile nav,
  the audio `<dialog>`, the hero "three faces" interactive cards, scroll reveal).
- `images/`, `audio/` — assets. `favicon.svg`, `CNAME`, `og-image.jpg`.

## Conventions (match these when editing)

- **Every page shares the same chrome**: the `<aside class="sidebar">` nav block and the
  inline `<head>` theme-bootstrap script are duplicated across pages. If you change the
  nav, the brand SVG, or the head boilerplate, apply the same change to **every** HTML
  file — there is no templating.
- **Theming**: `data-theme` (`dark` default / `light`) and `data-side` (`on`/`off`) are set
  on `<html>` by an inline script before paint to avoid flash, and persisted in
  `localStorage` (`er-theme`, `er-side`). Colors come from CSS custom properties in
  `:root` at the top of `styles.css`.
- **Cache-busting**: `styles.css` and `theme.js` are referenced with a `?v=YYYYMMDDHHMMSS`
  query string (e.g. `?v=20260820131653`). When you change either file, bump that version
  string across all HTML pages so browsers pick up the change.
- **Typography/entities**: prose uses HTML entities for punctuation (`&middot;`,
  `&rsquo;`, `&ldquo;`, `&oacute;`, `&aacute;`, etc.). Fonts: serif (`--serif`) for body,
  mono (`--mono`) for labels/nav/eyebrows.
- **JS style**: `theme.js` is vanilla ES5-ish, uses delegated `document` click listeners,
  wraps features in IIFEs, and guards for feature support. No modules, no libraries.
- **Accessibility**: interactive elements carry `aria-label`/`aria-current`; scroll reveal
  respects `prefers-reduced-motion`. Preserve these.

## Editorial standard

The project holds itself to a documented evidentiary standard (see the "The standard"
panel on `index.html`): identifications require corroborating independent record types,
every linkage is verified against the primary document, and probable conclusions are
labeled as probable. Do not invent, embellish, or soften historical facts. If asked to
change dates, names, records, or fates, treat them as factual claims — confirm rather than
guess.
