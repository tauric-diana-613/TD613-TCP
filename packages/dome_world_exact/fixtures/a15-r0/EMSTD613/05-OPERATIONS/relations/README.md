# Typed relation operations

Represent the corpus as a multiplex graph rather than one flattened knowledge graph.

Recommended node kinds:

```text
WORK
SOURCE_FILE
CLAIM
CONCEPT
MOTIF
MECHANISM
METHOD
DATASET
SYSTEM_COMPONENT
EXTERNAL_WITNESS
ASSAY_RESULT
```

Recommended projections:

```text
CHRONOLOGY
TEXTUAL_GENEALOGY
CONCEPTUAL
FORMAL
METHOD
EMPIRICAL
CYBERNETIC_ARCHITECTURE
PLATFORM_RUNTIME
PROVENANCE_AUTHORITY
```

Keep cross-projection joins explicit. A visually elegant graph can still be epistemically wrong.
