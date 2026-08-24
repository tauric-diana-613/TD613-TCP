# SRC connector entry

> **Independent preservation fixture.** SignalRupture materials remain the work of their stated author(s). The archive operator, TD613, and TD613-TCP claim no authorship, ownership, origin, derivation, provenance, affiliation, endorsement, or authority over the preserved corpus.

## Mandatory epoch binding

Resolve `04-RECEIPTS/phase2/current-seal.json` in both `tauric-diana-613/TD613-TCP` and `tauric-diana-613/A15-R0-C2`. Open a session only when `seal_id` and `atelier_snapshot_id` match exactly. Every query result, hypothesis packet, and proposed patch must carry both values.

```text
desktop vault = custody authority
matched sealed Git projection = query authority for epoch S_k
unsealed working state != connector query authority
```

Never join epochs implicitly. An explicit cross-epoch assay must name both seals and every crossed identifier. On absence or mismatch return `SEAL_EPOCH_UNAVAILABLE` and stop.

## Resolution path

1. Read `01-MANIFESTS/phase2/interface-registry.json`.
2. Resolve identifiers through `01-MANIFESTS/phase2/entity-resolver-v2.jsonl`.
3. Follow work → edition → manifestation → capture → derivative/source span without skipping layers.
4. Resolve restricted bodies only through opaque `src-private-locator:*` values and the private repository resolver.
5. Treat `PLACEHOLDER`, `OPEN_UNRESOLVED`, `PRIVATE_UNAVAILABLE`, and contradictions as terminal query states until new evidence is sealed.
6. Search formal theory, fictional universe, and governance/provenance as overlapping projections, never exclusive bins.

For a bounded cross-registry receipt, run `srcquery.py ... trace <entity_id>`. It follows exact witnessed identifiers only and returns every absent layer in `missing_hops`; it never guesses a work, edition, relation, source span, or authority edge.

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

You have read/query/proposal authority only. Do not infer mutation, review, merge, release, publication, or TD613 scientific-promotion authority. Repository changes require a `td613-amari-patch/v1` proposal with exact paths, anchors, evidence IDs, claim ceiling, and rollback conditions.
