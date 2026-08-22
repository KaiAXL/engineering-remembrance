# The Method skill — design

**Date:** 2026-08-22
**Status:** draft for discussion
**Context:** Engineering Remembrance (engineeringremembrance.org)
**Companion to:** [`2026-08-20-archives-mcp-design.md`](2026-08-20-archives-mcp-design.md)

## Purpose

The Archives MCP gives Claude the *capability* to reach 17 archives — resolve a place,
plan across collections, open or run a search, describe an archive, explain a record. But
capability is not method. A researcher handed six tools can still search one spelling, stop
at an index card, or read a deportation roster as a death list and bury three survivors.

The `method` page encodes the discipline that prevents exactly those failures: seven steps
in order, two rules, and one evidentiary standard. This spec turns that page into a **skill**
— the procedure and judgment that drives the MCP's tools in the right order, to the
project's standard.

## The central split

The MCP and the skill are two layers with a clean boundary. Naming it is the whole design.

| Layer | Owns | Nature |
|---|---|---|
| **MCP — capability** | archive knowledge, place gazetteer, URL building, live adapters, record parsing | deterministic, stateless, testable |
| **Skill — method** | the seven steps in order, the name-variant strategy, the convergence/evidence standard, the verification gate, conflict disclosure, the plain-language dialogue with the researcher | judgment, procedure |

The MCP is usable without the skill (raw tools). The skill without the MCP is just advice.
Together they are guided research. The boundary is enforced from both sides: **the skill
never hardcodes an archive URL** (it asks the MCP), and **the MCP never decides an
identification is proven** (it returns candidates; the skill and the human decide).

## The skill's trigger and shape

A `SKILL.md` that activates when the user is doing genealogical / Holocaust-era
record-linkage research: searching for a person across archives, tracing a family, "help me
find my grandmother", reading a camp card or census sheet. On activation it loads the
method and assumes the Archives MCP is connected — degrading to deep-links and advice if it
is not, so the skill is still useful with no server attached.

The skill is the layer the researcher talks to. The MCP is silent plumbing.

## Method → tools

Each of the seven steps, the MCP tool(s) it drives, and what the skill adds on top.

| # | Method step | MCP tool(s) | What the skill adds |
|---|---|---|---|
| 1 | Normalise the name | *(none today — see gap A)* | Builds the variant set: family spelling, German, Hungarian, Cyrillic→G, **and the mother's maiden name**. Keeps it as working state across every later search. |
| 2 | Search both surnames | `plan_research`, `open_search` | Enforces "every search runs twice — father's surname and mother's — always." The rule the MCP can't self-impose. |
| 3 | Reconstruct the paper trail | `plan_research` | Supplies the stage list (arrest → ghetto → transport → camp → transfer → liberation → DP → emigration) when a name search fails, so the search shifts from person to *stage*. |
| 4 | Read the sequence | `open_search` / `search` *(see gap B)* | When a hit carries a number or page position, instructs reading the neighbours — the lines above and below, the adjacent pages. |
| 5 | Cross-check with AI | `search` | Consumes the merged cross-archive candidates and runs the convergence logic (below). This is the step that is *native* to Claude + the skill. |
| 6 | Verify against the original | `explain_record` | **The hard gate.** `explain_record` helps read the document; the skill forbids any candidate becoming a conclusion until the primary image is opened and the parents confirmed. The one step the tools must not automate away. |
| 7 | Search the people around them | `plan_research`, `open_search` | When the target left no record, pivots the search to the village and the relatives — the neighbour whose file names your family. |

`plan_research` is the workhorse (steps 2, 3, 7). Step 6 is where the skill deliberately
*refuses* to let a tool close the loop.

## The two rules, as machine-usable criteria

The method's two rules are not prose here — they are the skill's decision logic.

**Spelling drift is not contradiction** → the candidate-matching rule. Variants returned by
`resolve_place` (and `resolve_name`, gap A) are the *same* entity. The skill rejects a
candidate only on a divergent **parent, place, or date** — never on a divergent spelling.
This directly governs how it scores what `search` returns.

**One document is a lead, three are a finding** → the skill's claim state machine:

```
lead      — one source. Interesting, cited, unverified.
probable  — ≥2 independent record types agree, no contradiction,
            but the primary documents have not yet been read.
verified  — independent record types corroborate AND each linkage
            has been checked against the primary document.
```

Only **step 6** moves a claim from `probable` to `verified`. No tool output can. This is the
convergence standard from `index.html` and `site-content.json.standard`, made operational.

## Inherited editorial constraints

The skill inherits every constraint in the MCP spec's *Editorial and ethical constraints*
section, and — because it is the layer that speaks to the researcher — it is the layer that
*says them out loud*:

- Results are candidates, never conclusions; each carries its citation and stays unverified
  until checked against the primary document.
- Probable stays probable. No step upgrades a probable identification to a stated fact.
- Conflicts are surfaced as conflicts (mirroring `site-content.json.conflicts`), not resolved
  by preference.
- No storage; no credential bypass; no `permission-pending` archive queried until the
  institution answers in writing.

## Responsibility boundary — two gaps to decide

Where a step's mechanical part could migrate from skill to MCP.

**Gap A — name resolution.** Today, building name variants is skill-side. But the mechanical
transliterations (Cyrillic H→G, German orthography, Hungarian registrar forms) are
deterministic and testable — exactly like `resolve_place`. *Recommendation:* add a thin MCP
`resolve_name` for the mechanical variants, and keep the *judgment* (which variants matter
for which archive, when to stop) in the skill. Symmetry with `resolve_place`, testable in CI.

**Gap B — read the sequence.** Today, step 4 is skill behaviour via `open_search` on adjacent
entries. A first-class `neighbors(record)` tool would make "read the lines either side"
reliable rather than improvised. *Recommendation:* Phase 2, once live adapters that can page
exist — it depends on `search` returning a positioned record.

## Phases (aligned to the MCP spec)

- **Phase 1** — MCP has `plan_research`, `resolve_place`, `open_search`, `describe_archive`,
  no live search. The skill already drives steps 1–3 and 7 as guided deep-linking, plus the
  discipline of step 6. **Most of the method's value is procedure, which needs no live API** —
  so the skill is demoable on the same timeline as MCP Phase 1.
- **Phase 2** — live `search` (archive.org, then Arolsen/USHMM if permission lands). Steps 4
  and 5 get teeth; `neighbors` (gap B) lands here.
- **Phase 3** — `explain_record`. The reading half of step 6.

## Open questions

- **Skill framework.** A superpowers-style shareable skill, or repo-local? It documents the
  method this site is *about*, so it may ship with the MCP connector as one product.
- **`resolve_name` as an MCP tool** (gap A) — in or out?
- **Autonomy.** Does the skill drive the MCP in an agentic loop (plan → search → converge) or
  propose each step for the researcher to run? The verification gate implies a human in the
  loop at step 6; planning and searching could be autonomous up to that line.
- **Where the skill lives** relative to this repo, and whether the site's `method` page and
  the skill stay in sync automatically (as `repositories.json` ↔ the MCP registry do).
