# Preservation Entity Model

The archive must remain capable of saying *what existed*, *where*, *in which version*, *when it was seen*, and *what the archive later inferred* without collapsing those answers.

## Entities

### Work

An intellectual object. A work ID is archive-assigned only after DOI/content/linkage evidence or human adjudication. It is not a platform ID.

### Edition

A distinguishable version of a work. Editions can be related by `revises`, `supersedes`, `abridges`, `compiles`, `serializes`, or `retitles` without being merged byte-for-byte.

### Manifestation

A platform appearance: Zenodo record, Academia upload, Substack post, Medium story, or later surface. Each retains platform ID, canonical URL, platform title, byline, claimed publication date, license/copyright statement, and discovery evidence.

### Capture

One retrieved byte sequence from one manifestation. Minimum custody tuple:

```text
A_i = (
  manifestation_id,
  canonical_url,
  platform,
  platform_title,
  author_attribution,
  published_at,
  retrieved_at,
  media_type,
  byte_length,
  sha256,
  stated_license_or_copyright,
  archive_path,
  acquisition_method,
  archive_lineage
)
```

An HTTP response, rendered HTML capture, downloadable attachment, PDF, DOCX, image, or video is its own capture. Screenshots supplement source bytes; they do not replace them.

### Derivative

OCR, extracted text, normalized Markdown, thumbnails, embeddings, and indexes. Every derivative points to its capture hash and records tool/version. Derivatives are reproducible aids, never silent replacements for originals.

### Interpretation

Concept labels, corpus-room assignments, chronology arguments, provenance hypotheses, TD613 comparisons, and audit judgments. Interpretations carry author/reviewer, date, confidence, evidence pointers, and status. They cannot mutate source metadata.

### Authority assertion

A time-indexed source or archive assertion about an object's genealogical retention, canonical authority, empirical authority, field-defining authority, and controlling-formulation status. These five axes are required and may remain `UNSTATED` or `NOT_ASSESSED`; they are never collapsed into one `canonical` boolean. A class-level policy does not silently cascade to individual works.

### Claim-status event

A witnessed or proposed change in the status of one stable claim atom: declared law, candidate mechanism, supported, partial, not established, rejected as universal, legacy, contested, or unclassified. Keyword matches generate candidates only. The event preserves its raw source phrase, evidence-schema namespace, source publication/update time, archive observation time, and prior-event links.

### Canon-map snapshot

An immutable, time-indexed observation of SR's declared self-model. A later map never overwrites an earlier map. Related titles and chronology create a comparison family, not an edition merge. Cross-map correspondences such as persists, renames, splits, merges, is absorbed into, or is not enumerated in a later map remain separate assertions.

### Epistemic-object state

A six-axis assertion for a work or concept at a specified time: existence/custody, visibility, retrievability, provenance integrity, lineage coherence, and current authority (`E,V,R,P,L,A`). Each dimension carries its own evidence and may remain unknown. Preservation therefore cannot silently imply visibility, retrieval, lineage, or authority.

### Transformation assertion

A source-declared or archive-proposed relation between representations. Surface translation and epistemic lift are distinct types. Every candidate transformation records what happened to semantic core, scope, causality, universality, variables, falsifiers, and caveats; "formalizes" never automatically means "preserves."

### Typed graph assertion

Historical, conceptual, operational, navigational, manifestation, and authority graphs are separate projections. A conceptual or operational cycle is not a chronological contradiction. Every relation also records whether it was contemporaneous, forward-declared, retrospective, inferred, or unresolved.

### Connector entity-resolution entry

`01-MANIFESTS/entity-index.jsonl` is the connector's identity join, not a substitute for the canonical registries. Each `entity_id` reports its kind, definition status, defining path, defining record ID, source entities, and interpretive limit.

- `DEFINED` means the connector may follow `defined_in_path` and `defined_by_record_id` to the canonical record.
- `PLACEHOLDER` means a canonical record references the object but the bounded vault does not independently define it.
- `UNRESOLVED` means the missing identity or target is itself a preserved result.

Neither non-defined state authorizes title matching, ordinal completion, or a synthetic target. Evidence IDs resolve separately through the `evidence_resolver` declared in `01-MANIFESTS/registry-index.json`.

## Required relationship rules

- one work may have many editions;
- one edition may have many manifestations;
- one manifestation may have many captures over time;
- identical SHA-256 hashes prove byte identity only, not identity of all surrounding platform context;
- different hashes prove different captured bytes, not why they differ;
- a DOI is strong lineage evidence, not permission to discard alternate surfaces;
- corpus rooms and concepts are many-to-many labels with evidence spans;
- inference never overwrites observation.
- source assertion, archive normalization, archive inference, and a derived current view remain separate objects;
- publication time, platform creation time, platform update time, capture time, assertion time, and effective time are separate clocks;
- a later publication does not become controlling merely because it is later;
- a source-declared role and a later manuscript's retrospective type assignment are different historical facts;
- equal ordinals are not contradictory until their series namespace is established;
- map absence is `NOT_ENUMERATED_IN_TARGET`, not disappearance;
- a global first-appearance claim requires a bounded, hashed, demonstrably complete search universe;
- a simulated surface withdrawal never deletes bytes or writes a real availability event.

## Connector-first resolution contract

Machine readers must begin with `01-MANIFESTS/registry-index.json`, not by guessing paths from an identifier prefix.

1. Resolve the requested ID in `01-MANIFESTS/entity-index.jsonl`.
2. If `definition_status` is `DEFINED`, load the exact row named by `defined_in_path` and `defined_by_record_id`, using the primary key declared for that registry.
3. If the status is `PLACEHOLDER` or `UNRESOLVED`, return that state and its `source_entity_ids`; do not autocomplete the object.
4. Resolve every `evidence_id` through the registry index's `evidence_resolver`, then follow its exact source path and locator.
5. Treat registry records as canonical and the entity index as a generated resolver. A connector must not write interpretation back into either source metadata or evidence receipts.

## Graph-assay v2 contract

`graph-assay-observation/v2` uses a discriminator-specific `payload`. A `TYPED_CYCLE` is executable only when its payload carries `node_ids`, `graph_projections`, and `ordered_edge_ids`. Every ordered edge ID must resolve to a concrete `relation-assertion/v2` record in `05-OPERATIONS/relations/typed-edges.jsonl`; prose summaries and predicate triples cannot stand in for missing edges. Per-projection `orders` preserve historical, conceptual, operational, navigational, manifestation, and authority order without collapsing them into one chronology.

The graph observation reports what the assay concluded. The typed-edge registry retains the relations that make the observation reproducible.

## Authority query contract

An authority query returns **all witnessed time slices and scopes** for the subject or corpus-level role. It may derive a current view only through an explicit `CURRENT_CONTROLS` or `SUPERSEDES_SCOPE` path. In the absence of that path, the answer must preserve every overlapping assertion and report authority continuity as unresolved. Sorting by publication or update time and choosing the last row is forbidden.

## Coverage ledger states

Coverage uses two typed axes rather than one optimistic status string:

- `audit_status`: `IMPLEMENTED`, `PARTIAL`, `BLOCKED`, `SCHEMA_ONLY`, or `HUMAN_GATED`;
- `reachability`: `SCHEMA_ONLY`, `SEEDED`, `BOUNDED_EXECUTED`, `BLOCKED_BY_SOURCE`, or `HUMAN_GATED`.

`source_status_raw` preserves the prior human-readable status, `implemented_in` names the concrete surfaces, and `blocker_ids` identifies resolvable blockers or gates. These axes are not interchangeable: a schema can exist without a run, a trail can be seeded without being adjudicated, and a human-gated trail is not merely incomplete. Every Phase 1.5 coverage row keeps `phase_2_run: false` while the acquisition gate is closed.

## Availability states

Allowed observations include `AVAILABLE`, `PARTIAL`, `AUTH_REQUIRED`, `RATE_LIMITED`, `UNAVAILABLE`, and `UNKNOWN`. A transition to `UNAVAILABLE` records the observation time, request/result evidence, previous URL, and last preserved hash. `SUPPRESSED` is a causal interpretation and must never be inferred from unavailability alone.
