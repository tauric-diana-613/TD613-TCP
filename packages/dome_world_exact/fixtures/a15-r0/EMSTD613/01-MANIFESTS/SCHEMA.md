# EMSTD613 preservation and assay entity model

The archive must be able to answer independently:

- what file existed;
- which work it instantiates;
- what the source actually says;
- which motifs recur;
- which mechanisms are proposed;
- which relations are witnessed versus inferred;
- which external evidence bears on the claim;
- what remains unresolved.

## Core entities

### SourceFile

One preserved byte sequence. Required tuple:

```text
(source_file_id, relative_path, original_filename, extension, byte_length,
sha256, imported_at, source_clock_if_known, author_attribution_raw,
provenance_basis, media_type)
```

### Work

An intellectual object inferred only after strong filename/content/version evidence or human adjudication. Multiple files may instantiate one work; title similarity alone never forces a merge.

### ClaimAtom

A minimal source-grounded proposition with exact page/section/line or extraction span. Record raw wording, normalized proposition, modality, scope, and source_file_id.

### Concept

A source term or archive-normalized analytical handle. Preserve source vocabulary and normalized vocabulary as separate fields.

### Motif

A recurrent rhetorical, visual, mathematical, metaphorical, or narrative pattern. Motifs may guide search but carry no mechanism authority by themselves.

### MechanismCandidate

A proposed causal, computational, institutional, cybernetic, mathematical, or information-theoretic structure. Minimum fields include inputs, transformations, outputs, boundary conditions, predicted observations, falsifiers, and evidence IDs.

### RelationAssertion

A typed directed edge or hyperedge. Every relation carries:

```text
relation_type
source_entity_ids
target_entity_ids
projection
basis
evidence_ids
status
confidence_rationale
alternative_models
disconfirmers
asserted_by
asserted_at
```

### ExternalWitness

A primary paper, dataset, standard, vendor document, benchmark, source code artifact, or reproduced experiment used for comparison. Preserve DOI/URL/version/date and source class.

### AssayResult

One bounded analytical result with exact input hashes, method version, output status, and unresolved states.

## Typed relation vocabulary

Initial relation types:

```text
DERIVES_FROM
BRANCHES_FROM
CONVERGES_WITH
DIVERGES_FROM
CONTRADICTS
REFINES
GENERALIZES
SPECIALIZES
FORMALIZES
OPERATIONALIZES
IMPLEMENTS
ANALOGOUS_TO
SHARES_MOTIF_WITH
SHARES_MECHANISM_WITH
PRECEDES_CHRONOLOGICALLY
PRECEDES_CONCEPTUALLY
COEVOLVES_WITH
INDEPENDENTLY_REDISCOVERS
EVIDENCE_FOR
EVIDENCE_AGAINST
UNRESOLVED_RELATION
```

`SHARES_MOTIF_WITH` can never be silently upgraded to `SHARES_MECHANISM_WITH`.

## Projection separation

Maintain distinct graphs for:

- source chronology;
- publication chronology;
- textual genealogy;
- conceptual relation;
- formal/mathematical relation;
- method relation;
- empirical support;
- cybernetic/system architecture;
- platform/runtime observation;
- provenance/authority.

A path in one projection never automatically becomes a path in another.

## Status ladder

```text
SOURCE_WITNESSED
ARCHIVE_OBSERVED
CANDIDATE
SUPPORTED
PARTIAL
CONTESTED
FALSIFIED
UNRESOLVED
HUMAN_GATED
NOT_TESTED
```

Scientific promotion belongs outside this status ladder and requires a separate TD613 decision.

## Clock separation

Preserve source publication/creation time, file-modification metadata when trustworthy, import time, assay time, external-witness publication time, and Git commit time separately. Git chronology never substitutes for source chronology.

## Negative-state integrity

```text
NULL
!= UNKNOWN
!= ABSENT_FROM_SOURCE
!= NOT_EXTRACTED
!= NOT_TESTED
!= UNRESOLVED_IDENTITY
!= HUMAN_GATED
!= FALSIFIED
```

Negative states are analytical data, not whitespace.
