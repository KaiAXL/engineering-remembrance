# Archives MCP — design

**Date:** 2026-08-20
**Status:** approved for implementation (Phase 1)
**Context:** Engineering Remembrance (engineeringremembrance.org)

## Purpose

The `databases` page lists 17 archives that the Helman research depended on. Each is
described well — coverage, cost, and the one tip that makes it work — but a reader still
has to walk all 17 by hand: 17 search forms, four languages, and village names that change
with whichever state governed the village when the record was written.

This spec describes an MCP server that gives Claude that knowledge and does the walking.
The intended user is a family researcher at a Holocaust history conference who installs one
connector and then asks questions in plain language.

## Decisions taken

| Decision | Choice | Why |
|---|---|---|
| Server count | One server, not one per archive | 17 connectors is a non-starter for the audience; cross-archive strategy is the product |
| Tool shape | Six task-shaped tools | Named for what a researcher wants, not for archives; keeps the surface small as archives grow |
| Deployment | Remote HTTP (streamable) | Paste one URL; no Node, no terminal, no reinstall to ship a fix |
| State | Stateless | Nothing about a family is stored; the honest answer when someone asks where their grandmother's data goes |
| No-API archives | Deep-link, never scrape | Legally clean, works for all 17 on day one, respects login-gated sites |
| Language | TypeScript | Matches the site's existing Astro/TS toolchain |

## Architecture

Three layers inside one server.

**1. Tools** — the only thing Claude sees.

**2. Place resolver** — a gazetteer of historical place names for the region, mapping a
modern or remembered name to every variant an archive might index it under, with the
governing state by period. This is the component with the highest research value and the
lowest technical risk.

**3. Archive registry** — each of the 17 archives as a declarative record. A registry entry
is a superset of the existing `data/repositories.json` entry:

```ts
type Archive = {
  id: string;              // matches data/repositories.json id
  name: string;
  url: string;
  category: string;
  cost: string;
  costTag: 'free' | 'part';
  description: string;
  tip: string | null;
  // added by the MCP:
  coverage: {
    places: string[];      // regions/countries, not individual towns
    years: [number, number] | null;
    recordTypes: RecordType[];
    languages: string[];
  };
  access: 'open-api' | 'permission-pending' | 'link-only' | 'credentialed';
  searchUrl: (q: Query) => string;   // always present
  adapter?: Adapter;                 // only where access === 'open-api'
};
```

`data/repositories.json` stays the single source of truth for the fields it already owns.
The MCP imports it and joins its own metadata by `id`. A tip edited on the site changes
what the MCP says. CI fails if the two id sets diverge.

## Tools

| Tool | Input | Output |
|---|---|---|
| `plan_research` | what the researcher knows (name, place, dates, what they have) | staged plan: archive, query, reason, prefilled URL |
| `resolve_place` | a place name, any language or spelling | variants, governing state by period, per-archive indexing name |
| `open_search` | archive id + query | one prefilled search URL |
| `search` | query | merged candidate records from live-adapter archives only |
| `describe_archive` | archive id | coverage, cost, quirks, syntax, tip |
| `explain_record` | pasted text or a record URL | plain-English reading, abbreviations expanded |

`plan_research` is the entry point and calls `resolve_place` internally before ranking.

## Access status per archive

Verified by probe on 2026-08-20. This table is the reason Phase 1 does almost no live
searching.

| Archive | Access | Finding |
|---|---|---|
| archive.org | `open-api` | `advancedsearch.php?…&output=json` is public and documented. Serves the scanned yizkor books. |
| Arolsen Archives | `permission-pending` | Working JSON endpoint found (see appendix). Not a published API. Do not use until they answer. |
| USHMM Collections | `permission-pending` | `?format=json` returns clean Solr, but `robots.txt` is `Disallow: /` with only `Allow: /search/catalog/`. The search path is disallowed. Do not use until they answer. |
| Hungaricana | `link-only` | Returns 403 to scripted requests, including on `robots.txt`. Respect it. |
| JewishGen, USC Shoah | `credentialed` | Login required. Never automate; the researcher holds the credentials. |
| The other 12 | `link-only` | No public interface. Prefilled searches only. |

## Prototype access policy (amended 2026-08-22)

This is a prototype for development and a conference pitch, not production. For **soft-blocked**
sources we may bend access a little to demonstrate value — but only under heavy limiters and a
tiny footprint, and never past a hard refusal. The tiers:

| Signal | Archives | Prototype stance |
|---|---|---|
| Open by policy | archive.org | Use freely, within the limiters below. No bending needed. |
| Soft block (unpublished-but-reachable endpoint; robots `Allow`) | Arolsen | May prototype against the observed endpoint under the limiters, **in parallel with** the written outreach — never instead of it. |
| Hard refusal (scripted 403, robots `Disallow` on the search path) | Hungaricana, USHMM search path | **Not bent.** Honor the refusal; deep-link only. Honoring it *is* treating the API nicely. |
| Credentialed | JewishGen, USC Shoah | **Never automated.** The researcher holds the credentials. Not a rule to bend. |

**The limiters are inviolable and enforced in the MCP layer, not left to the caller:**

- **Overloading with volume, or inefficient/wildcard queries, is a hard NO — always.** Smallest query that answers the question (surname + town, not wildcards); first page only unless the researcher asks for more.
- **Retries capped at 1** — one retry with backoff, then stop. Never a retry loop.
- Per-archive rate limit, target **≤1 request/second**; a per-session request budget; single-flight (no wide parallel fan-out).
- Aggressive response caching — never re-fetch the same normalised query.
- Query-driven, never crawling — fetch only what the researcher explicitly asked for.
- Honor `robots.txt`, `Retry-After`, and any 429/403 by backing off and stopping. Send a truthful User-Agent with a contact address.

This amends, for the prototype phase only, the "No archive's data without permission" line
below: soft-blocked sources may be prototyped against under these limiters while permission is
pursued; hard refusals and credentials are respected exactly as stated.

## Data flow

**`plan_research`** — resolve the place; filter the registry to archives whose coverage
envelope intersects place, date range and record type; rank by likely yield then by cost
(free first); emit a staged plan where every step carries the archive's own tip and a
prefilled URL. Fetches nothing.

**`search`** — fan out to `open-api` archives only, in parallel, with per-adapter timeouts
and a shared rate limiter. Normalize to a common candidate shape: name, dates, place,
record type, archive, confidence, permalink, citation, and the raw source fields
unmodified. Partial failure is expected and reported per archive; a failed adapter degrades
to that archive's deep-link rather than disappearing.

## Editorial and ethical constraints

These are requirements, not guidance. They follow the standard documented on `index.html`.

- Results are **candidates**, never conclusions. Every candidate carries its citation and is
  labelled unverified until checked against the primary document. Tool descriptions state
  this so Claude repeats it.
- **Probable stays probable.** No tool output may upgrade a probable identification to a
  stated fact.
- **No storage.** No accounts, no logs of query content, no persistence of names or places
  between calls.
- **No archive's data without permission.** `permission-pending` archives are not queried
  until the institution answers in writing. If the answer is no, the entry becomes
  `link-only` permanently.
- **No credential bypass.** `credentialed` archives are never automated.
- Conflicting records are surfaced as conflicts, mirroring `site-content.json.conflicts` —
  they are data, not errors to resolve.

## Error handling

- Adapter timeout or error → that archive degrades to a deep-link, reported explicitly.
- Unknown place → return the variants that were found plus a statement of what is
  unresolved; never silently search one spelling.
- Empty result → distinguish "searched and found nothing" from "could not search." The
  former is evidence; the latter is not.
- Rate limit hit → back off, report, do not retry in a loop.

## Testing

- **Registry schema validation in CI.** Every archive has a resolvable URL template; every
  id matches `data/repositories.json`; every `open-api` entry has an adapter.
- **Place resolver fixtures** built from the real Helman case: Tiszabogdány/Bohdan and the
  other Subcarpathian localities in `map-sites.json`, with expected variant sets.
- **Adapter tests against recorded HTTP fixtures**, so the suite runs offline.
- **A scheduled canary** hitting live endpoints, alerting when an archive changes shape.
  These endpoints will change without notice; the canary is how we find out first.

## Phases

**Phase 1 — all 17 archives, no live search.** Registry, place resolver, `plan_research`,
`resolve_place`, `open_search`, `describe_archive`. Deployed and demoable. Nothing to ask
permission for and nothing that can fail on stage.

**Phase 1.5 — outreach.** Write to the Arolsen Archives and to the USHMM: what the tool is,
who uses it, expected query volume, and a request to use their search programmatically on
behalf of individual researchers. Each adapter is roughly a day's work once an answer
arrives.

**Phase 2 — live search.** archive.org immediately; Arolsen and USHMM if and when
permission lands. Adding an adapter must not change any tool's interface.

**Phase 3 — `explain_record`.** Translation and explanation of camp cards and census
sheets.

## Open questions

- Hosting target for the remote server is not chosen. Any platform that terminates TLS and
  runs a Node process is fine; pick during Phase 1 implementation.
- The place resolver's data source is not settled. Options are hand-authoring the
  Subcarpathian set from the existing project data (accurate, narrow) or seeding from
  JewishGen's Communities Database or GeoNames (broad, needs verification). Phase 1 ships
  the hand-authored regional set; breadth is a later question.

## Appendix — Arolsen endpoint map (blocked on permission)

Recorded 2026-08-20 by observing the collections site's own network traffic. Documented so
the adapter is quick to build **if** permission is granted. Not to be used before then.

Host: `collections-server.arolsen-archives.org`, JSON over POST.

1. `POST /ITS-WS.asmx/BuildQueryGlobalForAngular` — body
   `{ uniqueId, lang, archiveIds: [], strSearch, synSearch: true }` → `{"d": true}`.
   Registers the query server-side against `uniqueId` and sets an `ASP.NET_SessionId` cookie.
2. `POST /ITS-WS.asmx/GetPersonList` — body
   `{ uniqueId, lang, rowNum, orderBy: "LastName", orderType: "asc" }` → `{"d": [...]}`.
3. `POST /ITS-WS.asmx/GetCount` — totals for paging.

Person fields returned: `ObjId`, `LastName`, `FirstName`, `MaidenName`, `PlaceBirth`,
`Dob`, `PrisonerNumber`, `Father`, `Mother`, `Nationality`, `Religion`, `Date_of_decease`,
a full `Last_residence_*` breakdown, and `Signature` — the fonds citation (e.g. `1.1.46.1`),
which is what makes a result citable.

Notes: the session also carries an F5-style `TS…` bot-protection cookie; CORS is pinned to
their own origin, which does not constrain a server-side caller. `robots.txt` is `Allow: /`.
None of this constitutes permission.
