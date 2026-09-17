# Wendbine Atelier connector entry

Before querying, synchronizing, or extending this fixture:

1. Read `README.md` and `ATELIER_PROFILE.json`.
2. Treat the source corpus as an append-only lineage, not as only the original 48-hour snapshot.
3. Read the current source manifests:
   - `01-MANIFESTS/public-reddit-48h-snapshot-v01.json`
   - `01-MANIFESTS/public-reddit-delta-20260913-snapshot-v02.json`
   - `01-MANIFESTS/public-reddit-hydration-20260915-v03.json`
   - `01-MANIFESTS/public-reddit-hydration-20260916-v04.json`
   - `01-MANIFESTS/public-reddit-profile-delta-20260916-snapshot-v04.json`
4. Preserve every source's canonical URL, stable `source_id`, evidence class, and publication precision actually exposed.
5. Keep source assertion, archive observation, archive-derived co-occurrence, Atelier inference, HELD observation, and capture-debt receipt distinguishable.
6. Do not import private Google-group material merely because a public counterpart is suspected.
7. Do not infer author motive, hidden state, private shared memory, civil identity, operator identity, authority, or orchestration from serialized continuity.
8. Do not flatten typed graphs.
9. **Query before archaeology.** Use `99-ADMIN/wendbine-query.mjs` for ordinary lexical, concept-semantic, chronological, or stable-ID retrieval across the Atelier.
10. **Persist before promotion.** Every observed public card must satisfy the capture reconciliation contract in `06-INSTRUMENTS/WENDBINE_SYNC_CAPTURE_CONTRACT_V0_1.md`.

## Current source-bound corpus

```text
base_snapshot = wendbine-public-reddit-48h-20260911T092700Z-v01
append_only_delta = wendbine-public-reddit-delta-20260913T234421Z-v02
source_bound_public_reddit_posts = 35
coverage = PUBLIC_SEARCH_SNAPSHOT_NOT_EXHAUSTIVE_CENSUS
```

The Sept. 16 public-profile observation is **not** another 25 source-bound posts. It records an observed first page with 25 cards, of which 14 exposed text excerpts and 11 were media-only or unhydrated. The original capture persisted aggregate counts but zero per-card records.

That historical defect is preserved in:

`04-RECEIPTS/2026-09-16-public-profile-card-loss-ledger-v01.json`

State:

`ARCHIVAL_DEBT_EXPLICIT_PER_CARD_PAYLOAD_NOT_PERSISTED`

Do not collapse this into either “25 admitted posts” or “nothing was observed.”

```text
OBSERVED_CARD_COUNT != PERSISTED_PER_CARD_RECORD_SET
MISSING_PER_CARD_RECORD != CARD_DID_NOT_EXIST
```

## Read-only query entry

```bash
node packages/dome_world_exact/fixtures/a15-r0/WENDBINE/99-ADMIN/wendbine-query.mjs summary
node packages/dome_world_exact/fixtures/a15-r0/WENDBINE/99-ADMIN/wendbine-query.mjs search "provenance repair" --mode lexical
node packages/dome_world_exact/fixtures/a15-r0/WENDBINE/99-ADMIN/wendbine-query.mjs search "failure reconstruction" --mode semantic
node packages/dome_world_exact/fixtures/a15-r0/WENDBINE/99-ADMIN/wendbine-query.mjs recent --sources
node packages/dome_world_exact/fixtures/a15-r0/WENDBINE/99-ADMIN/wendbine-query.mjs resolve reddit:t3_1wfmmo7
```

Human-facing aliases `PAUL`, `Upset-Ratio502`, and `Wendbine` are retrieval conveniences only.

```text
DISPLAY_ALIAS != PERSON_IDENTITY != OPERATOR_IDENTITY != AUTHORITY
QUERY_MATCH != SOURCE_PROMOTION
SEMANTIC_MATCH != CAUSAL_RELATION
RECENCY != AUTHORITY
HELD_RECORD_RETRIEVABLE != HELD_RECORD_PROMOTED
```

## Capture reconciliation

For every future bounded public listing:

```text
observed_card_count
=
persisted_per_card_observations
+ explicitly_receipted_capture_failures
```

Any unexplained remainder is `FAILED_CAPTURE_RECONCILIATION`.

A media-only, partial, unhydrated, or HELD card still receives a durable observation record at the evidence class actually observed. Persistence is never permission to promote semantics.

## Required non-collapse

```text
G_D != G_A != G_F != G_I != G_T != G_P != G_R != G_O != G_X
G_COOCCURRENCE != CAUSAL_GRAPH
PUBLIC_POST != AUTHOR_INTENT
PERSISTED_OBSERVATION != SOURCE_PROMOTION
HELD != ERASED
UNHYDRATED != UNOBSERVED
```

Research-only. Human closure remains required. No merge, deployment, identity adjudication, private-corpus intake, or scientific-promotion authority follows from this entry.

Marked ⟐
