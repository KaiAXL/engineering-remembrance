# Engineering Remembrance

The website for **[engineeringremembrance.org](https://engineeringremembrance.org)** — a
Holocaust family-history research project recovering the Helman family of Tiszabogdány
(Subcarpathia) from fragmented, multilingual archives, and the repeatable, AI-assisted
record-linkage method built from that case.

It is a memorial site about real people who were murdered in the Holocaust. Names, dates,
photographs, and citations are factual claims — treat them with corresponding care. See the
[editorial standard](#editorial-standard) below.

Authored by Samantha Seligman-Grajewski · sgrajews@stanford.edu

## Tech stack

- **[Astro](https://astro.build) static-site generation.** Builds to plain HTML/CSS/JS in
  `dist/`. No client framework; near-zero JavaScript ships.
- Content lives in **typed JSON** under `data/`, read through a single data-access layer
  (`src/lib/data.ts`) — the seam for a future real database.
- Hosted on **GitHub Pages via GitHub Actions**. Push to `main` builds and deploys.
- One interactive feature: a Leaflet map, generated from the data at build time.

## Getting started

```bash
npm install          # first run: approve the esbuild/sharp install scripts if prompted
npm run dev          # dev server with live reload → http://localhost:4321
npm run build        # production build → dist/
npm run preview      # serve the built dist/ exactly as it deploys
node scripts/check-links.mjs   # verify every internal link resolves (run after build)
```

Requires Node 18+ (CI uses 20).

## Project structure

| Path | What it is |
|------|-----------|
| `src/pages/` | One file per route. `case.astro` → `/case.html`. `person/[id].astro` generates one page per person. |
| `src/layouts/Base.astro` | Shared page frame: `<head>`/metadata, sidebar, theme, footer chrome. |
| `src/components/` | `Sidebar.astro` (data-driven nav), `HelenDialog.astro`. |
| `src/lib/data.ts` | The **data-access layer** — the only module that reads `data/`. |
| `src/lib/types.ts` | The typed content contract the pages depend on. |
| `data/*.json` | The content "database": people, records, repositories, map sites, journeys, site copy. See [`data/README.md`](data/README.md). |
| `public/` | Static assets served at the root: `styles.css`, `theme.js`, `images/`, `audio/`, `CNAME`, and the standalone `brief.html`. |
| `_legacy/` | The original hand-written HTML, kept as a content reference. **Not built, not edited.** |
| `.github/workflows/deploy.yml` | CI: build + link-check on every push/PR; deploy on `main`. |

## Contributing

Please read **[CONTRIBUTING.md](CONTRIBUTING.md)** before making changes — it explains where
content lives and the one rule that matters most (edit the Astro pages and `data/`, never the
old HTML). Architecture notes for AI assistants are in [`CLAUDE.md`](CLAUDE.md).

## Editorial standard

An identification is admitted only where independent record types corroborate one another
without contradiction, and every linkage is verified against the primary document. Probable
conclusions are labelled probable, and conflicts are disclosed rather than reconciled by
preference. **Do not invent, embellish, or soften historical facts.** If a change touches a
date, name, record, or fate, confirm it against the source rather than guessing.
