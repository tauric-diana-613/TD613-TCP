󐘓 U+10D613

𝌋‌⟐

# SRC Atelier · Type Projection Non-Commutation

Status: RESEARCH INSTRUMENT / ARCHIVE-MODEL RESULT / NO SOURCE PROMOTION / NO SEALED-RECEIPT REWRITE

## Governing mark

> **𝄐 MAJOR — OBJECT TYPE CAN REMAIN CORRECT WHILE OBSERVATION TYPE LEAKS ACROSS INFERENCE FAMILIES. TYPE PROJECTION ACROSS ARCHIVE LAYERS DOES NOT AUTOMATICALLY COMMUTE.**

This instrument extends the Cardinality / Ordinal Namespace Firewall by locating the defect across archive layers rather than only inside one schema payload.

---

## 1. Object-layer witness

Historical Phase-1.5 entity index:

`01-MANIFESTS/entity-index.jsonl`

The compared objects from `sr-graph-observation:declared-seven-vs-twelve` resolve as:

```text
sr-architecture:csr:seven-part
entity_kind = ARCHITECTURE
definition_status = PLACEHOLDER
interpretive_limit = referenced by a canonical record but not independently defined; never autocomplete
```

and:

```text
sr-genealogy:codex:twelve-phase
entity_kind = GENEALOGY
definition_status = PLACEHOLDER
interpretive_limit = referenced by a canonical record but not independently defined; never autocomplete
```

Thus the entity layer preserves:

```text
ARCHITECTURE != GENEALOGY
```

and preserves unresolved-definition status for both.

---

## 2. Observation-layer witness

Historical sealed observation:

`04-RECEIPTS/assays/2026-08-24-phase15-authority-recompilation/graph-assay-observations.jsonl`

The comparison of those two objects is wrapped as:

```text
observation_kind = ORDINAL_NAMESPACE
payload.case_type = CROSS_ARCHITECTURE_CARDINALITY
ordinal_token = null
candidate_namespace_ids = []
expected_predecessor = null
predecessor_identified = null
```

The payload itself therefore resists ordinal interpretation while the outer observation family belongs to the ordinal namespace.

---

# 𝄐 TYPE PROJECTION NON-COMMUTATION

Let:

```text
T_e(x) = entity-layer type of object x
T_o(r) = outer observation type of relation/comparison r
C(r)   = inner case/payload type of r
```

For the A7/L12 observation:

```text
T_e(A7)  = ARCHITECTURE
T_e(L12) = GENEALOGY

T_o(compare(A7,L12)) = ORDINAL_NAMESPACE
C(compare(A7,L12))   = CROSS_ARCHITECTURE_CARDINALITY
```

The object-layer distinctions survive, but the observation-layer projection enters a different inference family.

Therefore:

```text
ENTITY_TYPE_SEPARATION
!= OBSERVATION_TYPE_SEPARATION
```

and:

```text
TYPE PRESERVATION AT LAYER k
DOES NOT ENTAIL
TYPE PRESERVATION AT LAYER k+1
```

This is **Type Projection Non-Commutation**.

---

## 3. What this does not prove

Current repository audit has not identified a consumer that demonstrably:

```text
selects ORDINAL_NAMESPACE
and discards payload.case_type
and then derives a serial relation from A7/L12
```

Therefore:

```text
CROSS_LAYER_TYPE_MISMATCH = WITNESSED
REALIZED_FALSE_SERIAL_INFERENCE = NOT WITNESSED
```

Do not turn a latent architecture defect into a claimed historical inference event.

---

## 4. Current connector epoch control

`CONNECTOR_ENTRY.md` explicitly makes current query authority depend on:

```text
04-RECEIPTS/phase2/current-seal.json
01-MANIFESTS/phase2/interface-registry.json
01-MANIFESTS/phase2/entity-resolver-v2.jsonl
```

The older `01-MANIFESTS/registry-index.json` still identifies itself as a Phase-1.5 surface.

Therefore:

```text
LEGACY_PHASE15_REGISTRY
!= CURRENT_PHASE2_CONNECTOR_AUTHORITY
```

The stale Phase-1.5 phase flag is not, by itself, a current connector defect.

This instrument uses the historical entity index only to diagnose the historical graph-assay type projection that produced the sealed v2 observation.

---

## 5. Separate migration axis — custody can advance while relations lag

Current Phase-2 resolver contains direct captures and readable derivatives for Origin Gravity, including:

```text
doi:zenodo:18382146
zenodo:18382146:file:0
zenodo:18382146:metadata
```

with retained derivatives for both body and metadata.

Yet current `05-OPERATIONS/relations/ordinal-series-observations.jsonl` contains no Origin 18382146 stage, while `05-OPERATIONS/relations/typed-edges.jsonl` preserves Origin's conceptual-precedence relation with `ordinal = null`.

The older `05-OPERATIONS/relations/witnessed-edges.jsonl` does preserve the source ordinal through the normalized `PART_OF_DECLARED_SERIES ... position:2` record.

Therefore the archive currently exhibits:

```text
CUSTODY_MIGRATION_COMPLETE_ENOUGH_FOR_BODY_READ
RELATION_MIGRATION_INCOMPLETE_FOR_ORDINAL_OBJECT
```

These are different axes.

Safe name:

```text
RELATION_MIGRATION_LAG
```

This is a refinement of the existing `NORMALIZATION_MIGRATION_GAP` class, not a new source anomaly.

---

# 𝄐 CUSTODY / RELATION MIGRATION NON-EQUIVALENCE

```text
BODY_CAPTURED
!= RELATION_TYPED

BODY_READABLE
!= ORDINAL_MIGRATED

ENTITY_RESOLVED
!= SERIAL_NAMESPACE_RESOLVED
```

A successful Phase-2 capture cannot be used to infer that all relations asserted inside the body have already migrated into every canonical relation registry.

Conversely, absence from a newer relation registry cannot negate a source-witnessed predicate retained in an older evidence layer.

---

## 6. Consequence for CODEX_B

CODEX_B currently sits at the intersection of two independent model risks:

```text
A. type projection risk
   architecture/cardinality comparison can enter an ordinal outer container

B. relation migration lag
   Origin's source-witnessed #2 has not migrated into the canonical ordinal-series registry
```

Neither supplies a new source clue about #1.

Both can distort retrieval or inference if their coordinates are ignored.

Therefore every Codex clue now requires a five-coordinate header:

```text
OBJECT TYPE
SOURCE APERTURE
GRAPH / ORDER COORDINATE
OUTER OBSERVATION TYPE
RELATION-MIGRATION STATE
```

Only after those are fixed should the clue be allowed to contract `O1(E)`.

---

## 7. New anti-equivalence constraints

```text
ENTITY_TYPE != OBSERVATION_TYPE
INNER_CASE != OUTER_CONTAINER
LEGACY_REGISTRY_EPOCH != CURRENT_CONNECTOR_EPOCH
CAPTURE_MIGRATION != RELATION_MIGRATION
READABILITY != RELATION_NORMALIZATION
SCHEMA_NEIGHBORHOOD != SOURCE_SEMANTIC_NEIGHBORHOOD
```

---

## 8. Patch implications

Future graph/ordinal instrumentation should:

1. preserve object type on every graph observation;
2. preserve outer observation family separately from inner case type;
3. reject cardinality comparisons from ordinal-only consumers unless an explicit serial bridge exists;
4. record relation-migration state so source silence and registry silence cannot be conflated;
5. bind every query to the current connector seal/epoch before consulting legacy Phase-1.5 registries.

A future schema-v3 migration should implement the separate `CARDINALITY_COMPARISON` outer kind proposed in `CARDINALITY_NAMESPACE_FIREWALL.md`.

---

## Authority membrane

This is an archive-model result.

It does not rewrite:

- SignalRupture source bodies;
- sealed Phase-1.5 receipts;
- v2 schema history;
- Phase-2 capture custody;
- canonical relation outputs.

No merge, sync, Queue C action, canon promotion, publication, production, release, or TD613 promotion follows.

Marked ⟐
