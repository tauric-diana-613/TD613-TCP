# Wendbine public-sync capture contract v0.1

A synchronization is not complete merely because an aggregate page count was observed.

Every observed public card must leave a durable, queryable observation record at the strongest evidence class actually available during that pass.

## Reconciliation law

For each bounded page or listing surface:

```text
observed_card_count
=
persisted_text_card_observations
+ persisted_media_or_unhydrated_card_observations
+ explicitly_receipted_capture_failures
```

A sync with a nonzero unexplained remainder is `FAILED_CAPTURE_RECONCILIATION`, even when its aggregate metadata is otherwise valid.

The per-card observation may remain HELD. Persistence and promotion are separate operations.

```text
PERSISTED_OBSERVATION != SOURCE_PROMOTION
HELD != ERASED
UNHYDRATED != UNOBSERVED
```

## Minimum durable observation

When a card exposes a canonical source identity, persist at minimum:

- stable source ID when available;
- canonical URL or permalink;
- platform / surface;
- observation time or observation day;
- source publication time only at the precision actually exposed;
- capture state (`TEXT_BOUND`, `MEDIA_UNHYDRATED`, `PARTIAL`, `HELD`, or a narrower source-specific state);
- bounded technical header / normalized summary only when text was actually observed;
- no inferred media semantics;
- recovery and parent-snapshot provenance.

When a card is visibly present but canonical identity cannot be retained, persist an opaque observation receipt generated **during the capture pass**. It may record page-local ordinal position if actually observed, but later reconstruction may never invent that position.

## Pagination

A visible next-page cursor is part of the capture state. The pass must persist whether it was followed, failed, or deliberately bounded out. An unvisited page remains missingness rather than a negative corpus finding.

## Searchability

Every persisted per-card observation, including HELD and media-unhydrated records, must enter the Wendbine read-only query surface. This ensures later questions can recover what was seen without confusing retrieval with scientific promotion.

## Forbidden collapse

```text
OBSERVED_PAGE != PERSISTED_PAGE
AGGREGATE_COUNT != PER_CARD_CUSTODY
PROFILE_ORDER != EXACT_TIMESTAMP
TEXT_EXCERPT != FULL_POST_BODY
MEDIA_CARD_OBSERVED != MEDIA_SEMANTICS_ADMITTED
QUERY_MATCH != SOURCE_PROMOTION
RECENCY != AUTHORITY
```

## September 16 scar

Snapshot `wendbine-public-reddit-profile-delta-20260916-v04` remains the permanent hostile fixture for this rule: 25 cards were observed, but zero per-card card objects were persisted. The associated loss ledger must remain queryable and the regression suite must reject any future capture fixture that reproduces that unexplained remainder.

Marked ⟐
