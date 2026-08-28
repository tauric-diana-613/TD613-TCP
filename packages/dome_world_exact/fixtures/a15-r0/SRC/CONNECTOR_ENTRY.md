# SRC connector entry

> **Independent preservation fixture.** SignalRupture materials remain the work of their stated author(s). The archive operator, TD613, and TD613-TCP claim no authorship, ownership, origin, derivation, provenance, affiliation, endorsement, or authority over the preserved corpus.

## Mandatory epoch binding

Resolve `04-RECEIPTS/phase2/current-seal.json` in `tauric-diana-613/TD613-TCP`. Open a session only when both `seal_id` and `atelier_snapshot_id` are present and the projection seal verifies. Every query result, hypothesis packet, and proposed patch must carry both values.

```text
desktop vault = custody authority
sealed TD613-TCP projection = query authority for epoch S_k
unsealed working state != connector query authority
```

Never join epochs implicitly. An explicit cross-epoch assay must name both seals and every crossed identifier. On absence or mismatch return `SEAL_EPOCH_UNAVAILABLE` and stop.

## Resolution path

1. Read `01-MANIFESTS/phase2/interface-registry.json`.
2. Resolve identifiers through `01-MANIFESTS/phase2/entity-resolver-v2.jsonl`.
3. Follow work → edition → manifestation → capture → derivative/source span without skipping layers.
4. For any request to read, quote, summarize, compare, or search paper contents, apply the **connector readability contract** below before any web/search-engine fallback.
5. Treat opaque `src-private-locator:*` values as evidence that a body was verified in desktop custody at the named seal. They disclose no path and confer no connector access; never misreport such a manifestation as uncaptured or nonexistent.
6. Treat `PLACEHOLDER`, `OPEN_UNRESOLVED`, `HUMAN_GATED`, `PRIVATE_UNAVAILABLE`, and contradictions as terminal query states until new evidence is sealed or an authorized readable sibling is resolved.
7. Search formal theory, fictional universe, and governance/provenance as overlapping projections, never exclusive bins.

## Connector readability contract

Content retrieval is archive-first. Search-engine visibility is never a prerequisite for reading a preserved work.

Use `99-ADMIN/srcquery.py ... read <query>` semantics, or reproduce the same resolution order directly from the ledgers:

```text
READABLE_DIRECT
  manifestation/capture → public text derivative

READABLE_EQUIVALENT
  manifestation → explicit DOI-linked or normalized-title-exact sibling
  → public text derivative of the same work

HUMAN_GATED
  verified private capture exists, but no connector-readable text derivative
  and no strong readable sibling exists

MISSING_DERIVATIVE_BUG
  public formal manifestation/capture exists but its intended text derivative is absent
```

Required precedence:

```text
direct derivative
> explicit platform DOI link
> normalized-title-exact crosswalk
> explicit blocker
> external web discovery
```

Rules:

- Never use fuzzy-title candidates to establish work identity or to substitute one body for another.
- Never infer that a search-engine miss means a paper is absent from custody.
- A `VERIFIED_PRIVATE_CUSTODY` page with no public derivative is `HUMAN_GATED`, not `UNRESOLVED_TARGET`.
- When an exact-title or DOI-linked formal sibling is available, return its readable derivative while preserving the requested manifestation's platform-specific framing as a separate representation.
- If a public Zenodo/DOI capture lacks a readable derivative, return `MISSING_DERIVATIVE_BUG`; do not silently fall back to metadata.
- Web search may supplement current availability or external visibility only after the archive readability path is exhausted. It never outranks sealed custody for corpus contents.

## Current is authority, not chronology

Seek an exact `CURRENT_CONTROLS` or scope-specific `SUPERSEDES_SCOPE` path. Without one, return all applicable witnessed formulations with dates, scopes, authority states, and evidence. This rule is forbidden:

```text
sorted(records, key=date)[-1] => controlling formulation
```

Newest manifestation is a chronological fact. A controlling formulation is an authority relation.

## Non-collapse requirements

- work, evidence, representation, and authority multiplicities remain separate;
- historical, conceptual, navigational, operational, manifestation, bibliography, and authority graphs remain separate;
- every evidence-independence assertion names ancestry, basis, data/method/case/result-generation dimensions, and unresolved shared inputs;
- source declaration, archive observation, archive inference, hypothesis, and researcher proposal remain separate;
- unavailable never means suppressed;
- theorem label never means proof or empirical validation;
- contradiction is a receipt, not permission to repair;
- model/archive edges remain candidates until exact source-span evidence and human/Amari disposition exist.

## Query opening

Begin by returning the matched seal and coverage state, target/capture counts by platform and rights state, unresolved expected objects, compiler and authority-jurisdiction maps, evidence-lineage groups, and highest-value open tomography trails. Then ask which trail to enter.

You have read/query/proposal authority only unless the human gives explicit repository-mutation authority in the active session. Any authorized repository patch must still carry a `td613-amari-patch/v1` proposal with exact paths, anchors, evidence IDs, claim ceiling, and rollback conditions. Human mutation authority does not imply merge, release, publication, or TD613 scientific-promotion authority.
