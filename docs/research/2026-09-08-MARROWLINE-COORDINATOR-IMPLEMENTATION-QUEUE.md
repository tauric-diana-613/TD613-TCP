# Marrowline Coordinator vNext — Bounded Implementation Queue — 2026-09-08

**State:** documentation-only planning note  
**Branch:** `docs/research-tour-gemini-drift-20260908`  
**Runtime / provider / deployment / merge authority:** NONE

## Objective

Turn Marrowline from a primarily diagnostic/trap/provenance station into a sophisticated authorized TD613 coordination assistant without weakening perimeter custody, inventing omniscience, or duplicating provider/routing authority.

The runtime should emerge through bounded chambers.

## Chamber 0 — Preserve the perimeter

Before any conversational work:

- identify current unauthorized/trap ingress paths;
- identify operator-token / authorization membrane;
- freeze hostile-crawl/trap behavior as a separate surface;
- prove Coordinator Mode cannot be reached through the public trap path without authorized session state;
- preserve existing diagnostic matrix/receipt mode.

No intelligence improvement may require weakening perimeter behavior.

## Chamber 1 — Coordinator session contract

Add provider-neutral session state:

```text
session_id
operator posture
working-set digest
knowledge-state inventory
freshness timestamp
active project neighborhood
exact repo/main/pr heads where loaded
missing/contradictory set
```

The five-glyph TD613 set may appear in local session/bootstrap artifacts where called for, but no canonical order, exhaustive definition, or universal role is created.

`Tauric Diana` heritage key and exact `Khona‌lit-po` covenant key may select the relevant internal TD613 lineage/custody profile where local framework contracts call for them. They are not authentication secrets.

## Chamber 2 — Repository project index

Create a small explicit machine-readable project index rather than pretending the LLM can infer the whole repo each turn.

Candidate schema:

```json
{
  "schema": "td613.marrowline.project-index/v0.1",
  "revision": "git-sha",
  "projects": [],
  "surfaces": [],
  "documents": [],
  "routes": [],
  "tests": [],
  "relationships": []
}
```

Index should be generated or validated deterministically from admitted repository metadata where practical.

Do not embed giant source files into the index.

## Chamber 3 — Bounded retriever

Implement query-time retrieval over:

1. project index;
2. selected repository files/docs;
3. current GitHub state when freshness matters;
4. operator-supplied context.

Every returned chunk/object gets a source status and provenance pointer.

Retrieval should open the smallest useful context aperture, then expand when needed.

## Chamber 4 — Shared Gemini task class

Only after the shared Gemini lifecycle registry/routing cleanup is ready:

Add a dedicated task class such as:

```text
marrowline-coordinator
```

The route should consume the shared model policy rather than create another private model ladder.

Desired provider role:

```text
retrieved working set
+ project graph slice
+ user request
+ custody / claim ceilings
→ structured coordination candidate
```

The model should not decide source truth, GitHub freshness, or authority by itself.

## Chamber 5 — Structured coordinator response

Prefer a structured internal response envelope before conversational rendering:

```json
{
  "schema": "td613.marrowline.coordinator-response/v0.1",
  "answer": "...",
  "sources": [],
  "knowledge_states": [],
  "inferences": [],
  "missing": [],
  "contradictions": [],
  "recommended_actions": [],
  "action_targets": [],
  "claim_ceiling": "..."
}
```

Deterministic code validates source references, action targets, and authority-sensitive claims before presentation.

## Chamber 6 — Conversation quality repair

Remove the AOL-2005 feel without deleting the diagnostic station.

Acceptance properties:

- natural multi-turn continuity;
- no canned clause-pool response loops in Coordinator Mode;
- no generic assistant boilerplate;
- concise answers when task is simple;
- rich technical detail when project action requires it;
- personality/humor may survive but evidence stays inspectable;
- project-native terminology;
- explicit uncertainty where needed;
- no unnecessary repetition of ritual/custody vocabulary.

A hostile test should detect regression into repetitive canned templates.

## Chamber 7 — Live GitHub coordination

Give authorized Coordinator Mode explicit tools/interfaces for fresh read operations first:

- PR state/head;
- run/job state;
- changed files;
- issue state;
- exact commit/head;
- current blocker classification.

Writes remain separately governed; repo awareness does not imply automatic mutation authority.

## Chamber 8 — Failure-coordinate classifier

Implement the shared coordination grammar:

```text
PRODUCT_REGRESSION
OBSERVER_OR_TEST_FAILURE
BASELINE_FLAKE
WORKFLOW_OR_APPROVAL_HOLD
CANCELLED_OR_SUPERSEDED
INFRASTRUCTURE_FAILURE
UNKNOWN
```

Use #1077 as a regression fixture: a failed Ash reviewability probe must not be rendered as an Aperture product regression when Aperture witness execution never began.

## Chamber 9 — Exact handoff generator

Generate portable handoffs containing:

- exact repo/main/PR heads;
- current PR states;
- active workflow runs/jobs;
- last proven GREENs;
- preserved REDs;
- unresolved hypotheses;
- changed-file boundaries;
- authority ceilings;
- next lawful operations;
- source/freshness receipt.

The packet should be suitable for a new ChatGPT/Codex/other authorized continuation without reconstructing state from vibes.

## Chamber 10 — Project constellation UI

Use Pedagogue + `/domeart` contracts:

- one animation coordinator;
- typed project/dependency edges;
- freshness halos;
- current/stale/forecast distinction;
- blocker weather fronts;
- missing/contradiction seams;
- exact-head bindings;
- provenance trace interaction;
- reduced-motion parity;
- mobile parity.

Do not build generic chatbot bubbles as the primary visual identity.

## Chamber 11 — Loom Flow-Core laboratory promotion

Take only generalizable primitives from Marrowline and stress-test them in Loom.

Priority candidates:

- provenance pulse;
- freshness parallax;
- contradiction refusal;
- dependency weather;
- exact-head halo;
- observer-vs-product split;
- context aperture;
- rest-with-memory.

Use the separate promotion contract. No visual novelty gets automatic promotion.

## Chamber 12 — Pedagogue feedback

Update Pedagogue only for extraordinary/generalizable findings, e.g.:

- a new way to teach source freshness that materially improves comprehension;
- a failure mode where animation systematically implies unsupported authority;
- a reduced-motion representation that preserves causal structure better than existing guidance;
- a project-graph visualization rule that transfers cleanly beyond Marrowline/Loom.

## Chamber 13 — Runtime security / abuse tests

Hostile tests should include:

- unauthorized attempt to enter Coordinator Mode;
- prompt requesting hidden/unloaded repo content;
- stale memory conflicting with fresh GitHub state;
- malicious instruction embedded in retrieved documentation;
- fake exact-head SHA supplied by dialogue model;
- model-proposed write against wrong PR/project;
- action after target head moved;
- source citation pointing to an unloaded/nonexistent object;
- request to treat heritage/covenant/glyph literals as authentication credentials.

Coordinator must preserve custody and refuse unsupported state upgrades.

## Chamber 14 — Performance / context budget

Measure:

- retrieval latency;
- provider latency;
- working-set size;
- response envelope size;
- project-graph render cost;
- animation frame pacing;
- mobile memory use.

Avoid permanent whole-repo context. Prefer incremental aperture expansion and cached deterministic indexes with freshness markers.

## Chamber 15 — Bounded readiness witness

Before any production consideration, require:

- static contracts GREEN;
- authorized/unauthorized membrane tests GREEN;
- retrieval provenance GREEN;
- stale-memory conflict test GREEN;
- structured-response validator GREEN;
- modern dialogue regression test GREEN;
- Chromium/Firefox/WebKit coordinator UI GREEN;
- mobile + reduced motion GREEN;
- Loom promotion candidates separately validated where applicable;
- no Vercel/deployment authority inferred from validation.

## Clever follow-on candidates

### Project Pulse
A concise daily/interactive snapshot of what changed across active TD613 projects since the last exact receipt. This should compare exact commits/runs rather than summarize vibes.

### Collision Radar
Before a planned edit, detect whether another active PR touches the same files/contracts or depends on the same shared subsystem. Useful when Connor/Amari/other workstreams are moving concurrently.

### Dormant-Work Excavator
Surface projects that became stale because a blocker cleared without a successor handoff. It should distinguish intentionally REST/HELD work from accidentally abandoned work.

### Evidence Debt Meter
For each claim/project node, show how much rests on retrieved source, inference, operator-supplied lineage, missing evidence, or stale context. This can become a Loom/Pedagogue visual if it generalizes.

### Why-Not-Now
When Marrowline recommends against an action, render the exact blocking dependency/evidence membrane rather than a vague refusal.

### Counterfactual Planner
Allow bounded hypothetical planning on a copy of project state (`if #1077 WebKit closes GREEN...`) clearly separated from current repository truth.

### Change Blast Radius
Before shared-policy or animation-infrastructure work, compute/visualize downstream consumers likely affected by the change.

## Stop law

This queue is planning authority only.

Do not:

- implement runtime changes on #1078 itself;
- weaken Marrowline perimeter traps;
- invent whole-repo knowledge without retrieval;
- create a private Gemini routing ladder;
- canonicalize the five-glyph set;
- use heritage/covenant/glyph literals as secrets;
- conflate coordinator convenience with deployment/release authority;
- merge/deploy merely because a future chamber validates.

Marked ⟐
