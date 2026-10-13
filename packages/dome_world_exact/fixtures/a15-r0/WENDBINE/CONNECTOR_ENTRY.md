# Wendbine Atelier connector entry

Before querying or extending this fixture:

1. Read `README.md`.
2. Read `01-MANIFESTS/public-reddit-48h-snapshot-v01.json`.
3. Preserve `snapshot_id` in every derivative or assay.
4. Preserve each source's canonical Reddit URL and `source_id`.
5. Keep source assertion, archive observation, archive-derived co-occurrence, and Atelier inference distinguishable.
6. Do not import private Google-group material merely because a public counterpart is suspected.
7. Do not infer author motive, hidden state, private shared memory, identity, or orchestration from serialized continuity.
8. Do not flatten typed graphs.

Current snapshot:

```text
atelier_snapshot_id = wendbine-public-reddit-48h-20260911T092700Z-v01
coverage = PUBLIC_SEARCH_SNAPSHOT_NOT_EXHAUSTIVE_CENSUS
source_count = 33
```

Required non-collapse:

```text
G_D != G_A != G_F != G_I != G_T != G_P != G_R != G_O != G_X
G_COOCCURRENCE != CAUSAL_GRAPH
PUBLIC_POST != AUTHOR_INTENT
```

Human closure remains required.

Marked ⟐
