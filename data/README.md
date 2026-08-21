# Mock database — `/data`

All hard-coded content from the site, extracted into JSON collections. This is a **mock
NoSQL-style database**: each file is one collection of documents, and cross-collection
links are string IDs (like foreign keys) so the data could migrate to a real document
store (MongoDB/Firestore) or a relational DB later without reshaping.

## Why JSON (NoSQL), not CSV/SQL

The `people → records → repositories` chain is relational and would map fine to SQL. But
the map data (`map-sites.json`, `journeys.json`) is **nested and irregular** — each
journey is an *ordered array of coordinate waypoints*, routes are polylines of coordinate
pairs, and sites carry optional flags. That structure does not flatten into CSV rows
without shredding it across join tables and losing order. Since this is **read-mostly
content for a static site** (load file → render), document JSON keeps the shape natural and
needs no query engine. IDs are kept explicit so a future SQL migration stays open.

## Collections

| File | Documents | Notes |
|------|-----------|-------|
| `people.json` | The Helman / Landó / Katz individuals | `parents`/`spouse` reference other people by `id`. `faceCard` powers the hero on `index.html`. |
| `records.json` | Documents/archival records | `subject`/`subjects` → `people.id`; `repository` → `repositories.id`. |
| `repositories.json` | The archives on `databases.html` | `costTag`: `free` \| `part`. `category` groups them. |
| `map-sites.json` | Leaflet pins for `budapest-map.html` | `sites` (Budapest) + `journey` (wider) + `specialMarkers`. `timelineOrder` drives display numbering. `color` keys resolve via `colors`. |
| `journeys.json` | Routes + per-person paths | `routes` reference `waypoints` by name; `personPaths` are ordered `[lat,lng]` / `[lat,lng,label]`. |
| `site-content.json` | Editorial copy | Nav, quotes, audio, method steps, evidentiary conflicts, case narrative, brief. |

## Referential integrity

IDs are the join keys. Examples:

- `records.json[].subject` → `people.json[].id`
- `records.json[].repository` → `repositories.json[].id`
- `people.json[].parents[]` / `.spouse` → `people.json[].id`
- `map-sites.json.timelineOrder` (numbers) → `sites`/`journey` `id`; (strings) → `specialMarkers.id`

## Caveats

HTML entities from the source (`&aacute;`, `&rsquo;`, …) were decoded to plain UTF-8.
Prose is preserved verbatim otherwise. This data describes real Holocaust victims and
survivors — dates, names, and citations are factual claims; verify before editing. Several
records carry deliberate, documented **conflicts** (see `site-content.json.conflicts`);
those are data, not errors to "fix."
