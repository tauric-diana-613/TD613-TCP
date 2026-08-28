# SRC Bibliographic Target Migration Lag

Status: **ATELIER IMPLEMENTATION ASSAY / APPEND-ONLY SUCCESSOR / NO SEALED-PHASE2 REWRITE**

Date: 2026-08-28

Bound query epoch:

```text
atelier_snapshot_id = src-20260824-p2-001
seal_id = src-seal:eaf744ce16b1c8b519ad0f1b0325b44192679ea4a5110b0ad0ca49fbcd816a1a
```

Authority boundary:

```text
source assertion
!= archive observation
!= archive inference
!= researcher hypothesis
!= Atelier implementation defect
!= TD613 science
```

This instrument does not alter the sealed Phase-2 reference registry. It records an implementation migration gap and defines a conservative successor projection.

## 1. The legacy reference interface preserves the literal DOI but not the local target entity

`reference-assertion/v1` records, among other fields:

```text
cited_doi_raw
source_bibliography_graph_status = WITNESSED_LITERAL_DOI
semantic_body_graph_status       = UNRESOLVED
archive_reconstructed_graph_status = UNRESOLVED
```

The schema has no required field for the exact local manifestation targeted by the DOI.

This correctly refuses to infer citation semantics from a literal identifier. It also means an independently resolvable target-identity coordinate is absent from the analytical row.

## 2. Exact DOI identity already exists elsewhere in bounded custody

The retained Zenodo metadata for:

```text
Origin Gravity
zenodo:18382146
DOI 10.5281/zenodo.18382146

Cross-Surface Recurrence
zenodo:18364461
DOI 10.5281/zenodo.18364461
```

binds record identity and DOI directly.

The Phase-1.5 local assay independently constructs each Zenodo manifestation from `candidate-corpus.jsonl` as:

```text
manifestation_id = zenodo:<source_record_id>
doi              = candidate-corpus.doi
```

Therefore the bounded archive already supports an exact local join:

```text
reference_assertion.cited_doi_raw
    -> candidate_corpus.doi
    -> zenodo:<source_record_id>
```

No title similarity, semantic inference, web lookup, or work-level merge is required.

## 3. Three coordinates must remain non-equivalent

```text
DOI_LITERAL_WITNESS
!=
LOCAL_TARGET_IDENTITY
!=
CITATION_SEMANTICS
```

A literal DOI can uniquely identify a locally indexed manifestation while the semantic relation carried by that citation remains completely unresolved.

Examples of semantic questions the DOI alone cannot answer:

```text
supports
criticizes
extends
merely cites
serially precedes
serially follows
belongs to same Codex namespace
shares conceptual lineage
```

The successor may resolve target identity and must leave those predicates untouched unless separately source-witnessed.

## 4. Conservative resolution states

For normalized exact DOI `d`, let:

```text
T(d) = { zenodo:<source_record_id> | candidate_corpus.doi = d }
```

Successor target status is:

```text
|T(d)| = 0 -> NO_LOCAL_TARGET
|T(d)| = 1 -> UNIQUE_LOCAL_TARGET
|T(d)| > 1 -> AMBIGUOUS_LOCAL_TARGET
```

An ambiguous result returns the entire candidate set and crowns none.

DOI normalization is lexical only: strip an optional `doi:` or `https://doi.org/` wrapper, trim surrounding whitespace/punctuation conservatively, and case-fold the DOI string. It does not rewrite DOI components or infer related versions.

## 5. Retrieval consequence

The current `srcquery trace <entity_id>` follows exact identifiers through relation rows.

A legacy reference row containing only:

```text
cited_doi_raw = 10.5281/zenodo.18382146
```

need not be returned when tracing:

```text
zenodo:18382146
```

because the entity identifier was never migrated into that row.

Therefore:

```text
REFERENCE_CAPTURED
!=
REFERENCE_TARGET_MIGRATED_TO_ENTITY_GRAPH
```

Archive class:

```text
BIBLIOGRAPHIC_TARGET_MIGRATION_LAG
```

This is a relation-migration / query-reachability defect, not evidence that any missed citation contains a stronger semantic relation.

## 6. CODEX_B relevance

Origin Gravity is independently source-witnessed as Codex essay #2. CSR remains the dominant visible #1 reconstruction without a source-witnessed #1 ordinal or immediate same-namespace serial-predecessor relation.

Resolving incoming DOI targets creates a lawful downstream-neighborhood search surface:

```text
all retained source derivatives citing Origin DOI
all retained source derivatives citing CSR DOI
```

Each body must then be inspected for an actual identity-bearing serial predicate.

Classification ladder:

```text
CITATION_ONLY / INVARIANT
NAMESPACE_BRIDGE
SYMMETRY_BREAKING
ORBIT_COLLAPSING
```

A citation has zero serial resolving power merely by existing.

## 7. Claim ceiling

Permitted:

```text
EXACT_LOCAL_DOI_TARGET_RESOLUTION_SUPPORTED
BIBLIOGRAPHIC_TARGET_MIGRATION_LAG_WITNESSED
REFERENCE_TARGET_IDENTITY_CAN_BE_ADDED_WITHOUT_SEMANTIC_PROMOTION
INCOMING_CITATION_NEIGHBORHOOD_CAN_BE_WIDENED_CONSERVATIVELY
```

Not permitted:

```text
DOI_CITATION_IMPLIES_CONCEPTUAL_DEPENDENCE
DOI_CITATION_IMPLIES_SERIAL_ORDER
DOI_CITATION_IMPLIES_SAME_CODEX_NAMESPACE
CSR_IS_CODEX_B_ESSAY_I
ORIGIN_CITATION_PROVES_PREDECESSOR_IDENTITY
AMBIGUOUS_DOI_TARGET_CAN_BE_AUTOSELECTED
```

## 8. Non-collapse

```text
identifier equality != semantic relation
manifestation target != work identity
record DOI != concept DOI
citation target != citation purpose
incoming citation != predecessor
bibliographic neighborhood != serial namespace
migration repair != historical source mutation
```

## 9. Successor implementation requirement

The append-only successor should emit a separate projection with:

```text
reference_assertion_id
source_derivative_id
source_capture_id
source_span
cited_doi_raw
cited_doi_normalized
local_target_resolution_status
local_target_entity_ids
source_bibliography_graph_status
semantic_body_graph_status
archive_reconstructed_graph_status
interpretive_limit
```

It must never rewrite the sealed v1 registry and must mechanically refuse current/sealed Phase-2 output paths.

𝌋

Marked ⟐
