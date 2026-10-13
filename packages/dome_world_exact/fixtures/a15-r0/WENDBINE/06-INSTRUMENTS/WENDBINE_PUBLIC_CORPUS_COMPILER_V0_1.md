# Wendbine Public Corpus Compiler v0.1

## Research question

Can a bounded stream of public posts be compiled into a reproducible typed relational topology while preserving the difference between source declaration, archive-derived structure, and researcher interpretation?

## Inputs

```text
01-MANIFESTS/public-reddit-48h-snapshot-v01.json
01-MANIFESTS/public-reddit-48h-source-registry-v01.jsonl
01-MANIFESTS/typed-relation-registry-v01.json
```

No private-group body text is accepted. No full Reddit post body is required.

Each post record must preserve:

```text
source_id
canonical_url
public_date
time_precision
technical_header
normalized_summary
declared_concepts
source_flags
```

## Output graph families

```text
G_D dependency
G_A authority / permission / trust
G_F information and metadata flow
G_I identity / continuity
G_T temporal / program / version
G_P provenance / custody
G_R reconstruction / estimation / recovery
G_O observation / observability
G_X cross-relation interaction / source-declared synthesis
G_SOURCE source -> normalized concept
G_COOCCURRENCE archive-derived recurrence only
```

The compiler may count, sort, bind, and compute co-occurrence. It may not turn co-occurrence into causation, source recurrence into private memory, or topology into motive.

## Evidence classes

```text
SOURCE_EXPLICIT_SEQUENCE
SOURCE_EXPLICIT_PROGRAM
SOURCE_EXPLICIT_SYNTHESIS
SOURCE_EXPLICIT_OR_DIRECT_PARAPHRASE
ARCHIVE_NORMALIZED_FROM_PUBLIC_SOURCE
ARCHIVE_DERIVED_COOCCURRENCE_NOT_CAUSAL
```

Anything stronger belongs in a later Atelier inference layer.

## Determinism

Given byte-identical input manifests, the compiler sorts source nodes, concept nodes, typed relations, recurrent concepts, and co-occurrence edges deterministically.

The checked-in topology index is a bounded summary target. CI recompiles the full in-memory topology and requires its counts, graph-family totals, landmark sources, and claim ceilings to match the index.

## Missingness

`PUBLIC_SEARCH_SNAPSHOT_NOT_EXHAUSTIVE_CENSUS` is a first-class state.

No absent post, absent timestamp, or unbound title may be converted into an archive negative.

## Conventional nomenclature membrane

Most of this public burst uses established technical vocabulary: dependency graphs, transitive dependencies, authorization, capabilities, information-flow control, observability, state estimation, provenance, causal reconstruction, fault tolerance, version propagation, and digital twins.

The compiler records those words because the source uses them. It does not assign their invention or provenance to Wendbine.

Wendbine-local compounds, compositions, named modules, and relation structure may be studied separately.

```text
CONVENTIONAL_TERM != WENDBINE_ORIGIN
WENDBINE_COMPOSITION != TD613_DERIVATION
TD613_COMPARABILITY != LINEAGE
```

Marked ⟐
