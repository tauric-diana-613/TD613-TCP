󐘓 U+10D613

𝌋‌⟐

# SRC Atelier · Cardinality / Ordinal Namespace Firewall

Status: RESEARCH INSTRUMENT / SCHEMA-MIGRATION PROPOSAL / NO SEALED-RECEIPT REWRITE / NO CANON OR TD613 PROMOTION

## Governing mark

> **𝄐 MAJOR — CARDINALITY COMPARISON AND ORDINAL NAMESPACE ARE DIFFERENT OBSERVATION TYPES. A SCHEMA THAT NESTS THE FORMER INSIDE THE LATTER CREATES TYPE-CONTAINER CONTAMINATION EVEN WHEN THE INNER PAYLOAD REMAINS GUARDED.**

This instrument records an Atelier-model defect discovered while patching the CODEX_B / A7 frontier.

It does not alter SignalRupture source facts.

---

## 1. Exact defect witness

Historical sealed graph observation:

`04-RECEIPTS/assays/2026-08-24-phase15-authority-recompilation/graph-assay-observations.jsonl`

Observation:

```text
observation_id: sr-graph-observation:declared-seven-vs-twelve
observation_kind: ORDINAL_NAMESPACE
payload.case_type: CROSS_ARCHITECTURE_CARDINALITY
payload.ordinal_token: null
payload.candidate_namespace_ids: []
payload.expected_predecessor: null
payload.predecessor_identified: null
```

Its compared structures are:

```text
sr-architecture:csr:seven-part
sr-genealogy:codex:twelve-phase
```

and its interpretive limit correctly says to maintain A7 != L12 absent an exact source bridge.

Therefore the receipt itself does not assert an ordinal relation.

The problem is the outer container type.

---

## 2. Schema-level witness

Historical schema:

`01-MANIFESTS/schemas/graph-assay-observation.schema.json`

`graph-assay-observation/v2` defines `ORDINAL_NAMESPACE` payloads through `ordinalNamespace`, and that payload explicitly permits both:

```text
SERIES_ORDINAL
CROSS_ARCHITECTURE_CARDINALITY
```

inside the same observation kind.

Thus:

```text
CROSS_ARCHITECTURE_CARDINALITY
is schema-valid under
ORDINAL_NAMESPACE
```

This is an ontology/container overload, not a source claim.

---

## 3. Builder-level witness

Historical builder:

`99-ADMIN/build-phase15-curated-outputs.py`

The builder contains an explicit one-off branch:

```text
if observation_kind == ORDINAL_NAMESPACE:
    cross_architecture = observation_id == declared-seven-vs-twelve

    if cross_architecture:
        case_type = CROSS_ARCHITECTURE_CARDINALITY
        ordinal_token = null
        candidate_namespace_ids = []
        expected_predecessor = null
```

The builder therefore knew this case was not serial in the ordinary sense, but the available v2 observation taxonomy had no independent cardinality-comparison container.

The workaround preserved local payload semantics while leaking the case into an ordinal outer namespace.

---

## 4. Current downstream audit

Current repository code search does not expose a consumer that demonstrably:

```text
selects observation_kind == ORDINAL_NAMESPACE
and then discards payload.case_type
```

The visible entity-index builder treats graph observations as referenced records rather than serial evidence, and the schema/validator path retains the payload.

Therefore current safe status is:

```text
TYPE_CONTAINER_CONTAMINATION = WITNESSED
DOWNSTREAM_FALSE_SERIAL_INFERENCE = NOT WITNESSED
```

Do not upgrade a schema risk into a realized downstream error without a consumer receipt.

---

## 5. Why the defect matters for CODEX_B

The CODEX_B investigation repeatedly encountered:

```text
A7 cardinality = 7
Origin ordinal = 2
possible Codex essay sequence
```

The source layer never equated those objects.

The witnessed edge ledger explicitly warns that Origin's #2 does not establish identity between the SR Codex series and the seven-part architecture.

Yet the graph-assay ontology placed an A7-vs-L12 cardinality comparison inside `ORDINAL_NAMESPACE`.

A coarse retrieval/query layer that indexes primarily by outer observation kind could therefore place:

```text
A7 cardinality comparison
```

closer to:

```text
Field Paper ordinals
Five-Theorem ordinals
CODEX_B ordinals
```

than its source semantics warrant.

This is **schema-induced retrieval affinity**.

It remains a researcher-level architecture result until a specific retrieval consumer is tested.

---

## 6. Cardinality collision now inside CSR itself

Current retained CSR body:

`03-DERIVATIVES/text/zenodo/zenodo-18364461-file-0.md`

source-witnesses:

```text
THREE STABILIZERS
1. Redundant Indexing
2. Semantic Anchoring
3. Lineage Formation

FOUR INFRASTRUCTURAL MECHANISMS
A. Surface Translation
B. Stylometric Coherence
C. Referential Density
D. Temporal Recurrence
```

and separately declares CSR the initiating mechanism in a `seven-part architecture`.

Define:

```text
Q7 = the 3 + 4 internally named functional items
A7 = the declared seven-part architecture
```

Current evidence:

```text
|Q7| = 7
|A7| = 7
Q7 = A7       NOT EARNED
A7 = CODEX_B  NOT EARNED
```

This same-source cardinality collision further demonstrates why cardinality must not inherit ordinal semantics.

---

# 𝄐 CARDINALITY / ORDINAL NON-EQUIVALENCE

For any structure `X`:

```text
CARDINALITY(X) = n
```

does not imply:

```text
X has ordinal namespace {1,...,n}
```

For structures `X` and `Y`:

```text
CARDINALITY(X) = CARDINALITY(Y)
```

does not imply:

```text
X = Y
member homology
slot homology
serial alignment
shared namespace
```

Therefore:

```text
CARDINALITY
!= ORDINALITY

ARCHITECTURE SIZE
!= SERIAL MEMBER POSITION

EQUAL CARDINALITY
!= HOMOLOGY

OUTER SCHEMA NEIGHBORHOOD
!= SOURCE SEMANTIC NEIGHBORHOOD
```

---

## 7. Query firewall for all current v2 receipts

Until a future schema migration occurs, every consumer of `graph-assay-observation/v2` must apply:

```text
IF observation_kind == ORDINAL_NAMESPACE:
    inspect payload.case_type BEFORE any ordinal inference
```

Safe ordinal gate:

```text
payload.case_type == SERIES_ORDINAL
```

and at least one of:

```text
ordinal_token != null
candidate_namespace_ids non-empty
explicit source ordinal object independently witnessed
```

Cardinality gate:

```text
payload.case_type == CROSS_ARCHITECTURE_CARDINALITY
=> ZERO ordinal resolving power by container membership alone
```

---

## 8. Proposed graph-assay-observation/v3 migration

Do not rewrite v2 or sealed receipts.

A future append-only `graph-assay-observation/v3` should introduce a distinct outer kind:

```text
CARDINALITY_COMPARISON
```

Suggested payload:

```text
{
  comparison_type,
  structure_ids,
  witnessed_cardinalities,
  role_scopes,
  homology_status,
  source_bridge_ids,
  summary
}
```

with:

```text
homology_status ∈ {
  EXPLICITLY_IDENTICAL,
  EXPLICITLY_DISTINCT,
  UNRESOLVED,
  REJECTED
}
```

`ORDINAL_NAMESPACE` in v3 should accept only true serial/ordinal cases.

### Deterministic v2 -> v3 adapter

Historical records satisfying:

```text
observation_kind == ORDINAL_NAMESPACE
and
payload.case_type == CROSS_ARCHITECTURE_CARDINALITY
```

map to:

```text
observation_kind = CARDINALITY_COMPARISON
```

while preserving:

```text
original observation_id
original evidence_ids
original status
original interpretive_limit
original v2 record as provenance
```

No historical receipt is deleted or silently rewritten.

---

## 9. New anomaly class

Register:

```text
SCHEMA_TYPE_CONTAINER_LEAK
```

Definition:

> A record's inner payload is semantically typed one way while the outer schema container belongs to a different inference family, creating a risk of false retrieval or aggregation affinity.

Evidence value:

```text
ZERO about source intent
ZERO about source contradiction
ZERO about platform visibility
```

It is an Atelier-model anomaly.

---

## 10. Consequence for the mystery box

A7 no longer contributes serial evidence merely by:

```text
being seven-part
sharing a graph-assay outer container with ordinals
appearing near Codex language in CSR
```

To affect CODEX_B's slot-1 orbit, A7 evidence must provide an exact bridge such as:

```text
A7 part identity -> named essay manifestation
A7 role -> CODEX_B serial slot
A7 = Codex-composing essay series
exhaustive compiler mapping
```

Absent such a bridge:

```text
A7 CARDINALITY EVIDENCE
has zero direct CODEX_B ordinal resolving power
```

The hunt therefore moves further away from numerical resemblance and closer to typed identity-bearing relations.

---

## Authority membrane

This instrument proposes a future schema firewall.

It does not mutate:

- sealed v2 receipts;
- retained source bodies;
- Phase-2 custody;
- source assertions;
- canonical graph outputs.

No merge, sync, Queue C action, canon promotion, publication, production, release, or TD613 promotion follows.

Marked ⟐
