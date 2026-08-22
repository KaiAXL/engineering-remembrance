# Contributing

Thanks for working on Engineering Remembrance. This guide keeps changes consistent — and
keeps the site (a Holocaust memorial) accurate. If you are an AI assistant, read this and
[`CLAUDE.md`](CLAUDE.md) before editing anything.

## The one rule that matters most

**This is an Astro app. Edit `src/` and `data/` — never the old HTML.**

The site used to be hand-written HTML pages. Those now live in `_legacy/` purely as a
content reference and are **not part of the build**. Do not edit them, and do not add or edit
`*.html` files in the repo root. If you change a `_legacy/` file, nothing happens on the
site, and the change will be confusing to the next person.

- Want to change page text or structure? Edit the matching file in `src/pages/`.
- Want to change data (a person, a record, an archive, a map pin)? Edit `data/*.json`.
- Want to change styling? Edit `public/styles.css`.

## How content is organised

The site splits into two kinds of content:

1. **Data-shaped content lives in `data/*.json`** and is rendered by the page automatically.
   Change the JSON, and the page updates. This covers:
   - **People** → `data/people.json` (drives `/people.html` and every `/person/<id>.html`)
   - **Records / documents** → `data/records.json`
   - **Archives on the Databases page** → `data/repositories.json`
   - **Map pins, routes, journeys** → `data/map-sites.json`, `data/journeys.json`
   - **Site-wide copy** (nav, quotes, method steps, audio) → `data/site-content.json`

2. **Narrative pages are written directly in `src/pages/*.astro`** (Case, Method, Records,
   About, Home, Start, Map). These are prose with specific documents, so they are authored
   in the page, not in JSON. They still use the shared layout, so the nav/header/footer come
   from components — you only write the page body.

Everything flows through **`src/lib/data.ts`**. Nothing outside that file reads `data/`
directly. If you need a new way to query the data, add an `async` accessor there.

## Common recipes

**Add or edit a person**: edit `data/people.json`. Give a unique `id`; link relatives by
their `id` (`parents`, `spouse`, `sons`). A new page appears at `/person/<id>.html`
automatically. Fields are all optional — include what the records support.

**Attach a document to a person**: add an entry to `data/records.json` with `subject`
(or `subjects` for several) set to the person `id`, and `repository` set to a
`data/repositories.json` `id`. Put the image in `public/images/` and reference it as
`/images/<file>`.

**Add an archive to the Databases page**: add an object to `data/repositories.json` with a
`category` (it groups automatically) and `costTag` of `"free"` or `"part"`.

**Add a map pin or route**: edit `data/map-sites.json` (pins, star-houses, timeline order)
or `data/journeys.json` (routes, per-person paths). See `data/README.md` for the shapes.

**Add an image or audio file**: put it in `public/images/` or `public/audio/` and reference
it with an absolute path (`/images/…`, `/audio/…`).

## Before you commit

Always run, and make sure both pass:

```bash
npm run build
node scripts/check-links.mjs
```

The build fails on broken references; the link checker catches dead internal links. CI runs
both on every pull request, so a red check blocks the merge.

## Before you push (Claude sessions)

**Always run `/code-review low` before pushing.** If you are Claude and about to `git push`
(or open a PR), run a low-effort code review on the working diff first, and address anything
it surfaces. No push goes out unreviewed.

```
/code-review low
```

Keep it at `low` for routine pushes — high-confidence findings, low noise. Reach for a
higher effort level only when the change is large or risky. This is in addition to the build
and link check above, not a replacement for them.

## Keeping in sync with the old static site

Historically the site author edited the original HTML directly. **That should stop now** —
all edits belong in this Astro structure. If a batch of old-style edits still lands on
`main`, reconcile them: merge `main` into your branch (git routes edited assets/pages into
`public/` and `_legacy/`), move any new assets into `public/`, then port the changed content
into `data/` + `src/pages`. Verify with the two commands above. (`CLAUDE.md` has the details.)

## Git

- Branch off `main`; open a pull request. Do not commit straight to `main`.
- Keep commits focused, with a clear message describing the content or code change.
- Don't commit `dist/` or `node_modules/` (both are gitignored).

## Editorial standard (non-negotiable)

This is a memorial to real people who were murdered in the Holocaust. Names, dates,
photographs, and citations are factual claims.

- Do not invent, embellish, or soften historical facts.
- An identification requires corroborating independent record types, each verified against
  the primary document. Label probable conclusions as probable; disclose conflicts rather
  than quietly resolving them.
- If a change touches a date, name, record, or fate, confirm it against the source. When in
  doubt, ask — don't guess.
