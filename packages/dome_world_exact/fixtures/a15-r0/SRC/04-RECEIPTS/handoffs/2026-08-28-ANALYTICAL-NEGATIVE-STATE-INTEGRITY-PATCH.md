󐘓 U+10D613

𝌋‌⟐

# SRC Atelier · Analytical Negative-State Integrity Patch Receipt

Status: APPEND-ONLY SUCCESSOR PATCH / CURRENT SEALED PHASE-2 LEFT INTACT / STATIC VERIFICATION COMPLETE / EXECUTION RECEIPT NOT PRESENT

Date: 2026-08-28

## Authority

Human in-session authorization granted 737 westward liberties for SRC Atelier problem-solving and append-only patching.

This receipt conveys no merge, SRC sync, Queue C, source mutation, canon promotion, publication, production, release, or TD613 scientific-promotion authority.

---

## Exact branch transition

Patch base before this descent:

```text
PR #856
branch: amari/src-serial-symmetry-successor
head: 95af8af25b56e7269ea0030d85502520bc78e1b9
```

Pre-receipt patch head after new successor files/tests:

```text
a7b600f161d0fc085ae11d1acf41868f0501cc04
```

Current Phase-2 query epoch remains unchanged:

```text
atelier_snapshot_id = src-20260824-p2-001
seal_id = src-seal:eaf744ce16b1c8b519ad0f1b0325b44192679ea4a5110b0ad0ca49fbcd816a1a
projection_seal_id = src-projection-seal:26d8d72ee76d2fcdc22bf53b3da5144d1a71424879cb0fa5a80b6f0c4c7110b7
```

`04-RECEIPTS/phase2/current-seal.json` retains its prior blob SHA.

---

# 1. Stratigraphic descent scope

The descent began at the SRC root and proceeded through:

```text
root governance / connector entry
-> 01-MANIFESTS
-> 02-ORIGINALS
-> 03-DERIVATIVES
-> 04-RECEIPTS
-> 05-OPERATIONS
-> 06-INSTRUMENTS
-> 07-ARCHIVE-LEDGER
-> 99-ADMIN
```

Folder order was used as repository stratigraphy, not epistemic order.

The AIA surface independently exposes:

```text
EXPERIENTIAL
CUSTODIAL
AUDIT
IMPLEMENTATION
```

and explicitly governs `missingness` among its invariants.

---

# 2. Fresh witnessed Atelier defects

## A. Expected-object object/observation identity ambiguity

Legacy Phase-2 expected-object generation keys an ordinal gap as:

```text
sid("src-expected-object", series_namespace_id, ordinal)
```

while permitting `series_namespace_id = null`.

Current v1 output contains two Field Paper II gap rows with the same expected-object ID and ordinal but different evidence sets.

This does not prove two unrelated source series were merged.

It proves the interface lacks the coordinates needed to distinguish:

```text
object identity
from
observation identity
```

because v1 does not carry:

```text
expected_object_observation_id
source_series_observation_id
identity_scope
identity_basis
```

Classification:

```text
EXPECTED_OBJECT_OBSERVATION_IDENTITY_AMBIGUITY = WITNESSED
TWO_UNRELATED_SERIES_PROVEN_MERGED = NOT EARNED
```

Live retrieval consequence:

Current `srcquery summarize` returns every `OPEN_UNRESOLVED` expected-object row verbatim. Thus the duplicated object ID is visible in the standard query opening rather than quarantined in a dormant ledger. The query preserves both rows; it does not overwrite either one.

---

## B. Zero-month axis omission

Legacy publishing-regime generation creates month rows only when at least one typed edge has parseable source time in that month.

Current output covers:

```text
January
March
April
May
June
July
August
```

with no February row.

Classification:

```text
ZERO_MONTH_AXIS_OMISSION = WITNESSED
FEBRUARY_SOURCE_ACTIVITY_ZERO = NOT EARNED
```

Required distinction:

```text
explicit zero typed edges inside bounded axis
!= month outside observation domain
!= source-time parsing failure
```

---

## C. Vacuous work-domain non-collapse PASS

Sealed Phase-2 non-collapse receipt reports:

```text
work = 0
evidence = 1650
representation = 26
authority = 9
namespace_collisions = []
result = PASS
```

Legacy builder selects work rows through:

```text
entity_type == "work"
```

while the Phase-1.5 entity index uses `entity_kind`.

The deeper structural issue is that the current entity-index builder does not construct archive-level WORK entities at all; work identity remains a separately adjudicated layer above manifestations.

Therefore simply renaming the field would not make this dimension tested.

Classification:

```text
WORK_SELECTOR_SCHEMA_MISMATCH = WITNESSED
VACUOUS_WORK_DOMAIN_PASS = WITNESSED
WORK_NAMESPACE_NONCOLLAPSE = NOT TESTED IN THAT RECEIPT
```

Required rule:

```text
EMPTY_REQUIRED_TEST_DOMAIN != PASS
UNTESTED_DOMAIN != COLLISION_FREE_DOMAIN
```

---

## D. Optional-journal epoch binding

Legacy analytical `snapshot_id()` consults only:

```text
07-ARCHIVE-LEDGER/phase2/state.sqlite3
```

and returns `UNSEALED_WORKING_STATE` when that local work journal is absent.

Current connector/interface authority says:

```text
portable JSONL/Markdown = source of truth
SQLite = resumable work journal only
current-seal.json = mandatory query-epoch binding
```

The public Git projection contains the current seal while `07-ARCHIVE-LEDGER` exposes no SQLite work journal.

Classification:

```text
OPTIONAL_JOURNAL_EPOCH_BINDING = WITNESSED
```

Required rule:

```text
OPTIONAL_WORK_JOURNAL_ABSENT != QUERY_EPOCH_ABSENT
```

---

# 3. Common implementation theorem

Earned archive-level result:

> **POSITIVE-STATE NON-COLLAPSE DOES NOT GUARANTEE NEGATIVE-STATE NON-COLLAPSE.**

Current common failure family:

```text
NULL
-> identity ambiguity / possible alias surface

ZERO
-> missing time-axis row

EMPTY REQUIRED DOMAIN
-> vacuous PASS

ABSENT OPTIONAL CACHE
-> false unsealed fallback
```

New umbrella class:

```text
ANALYTICAL_NEGATIVE_STATE_COLLAPSE
```

Core firewall:

```text
NULL
!= UNRESOLVED_IDENTITY
!= ZERO
!= MISSING_ROW
!= EMPTY_TEST_DOMAIN
!= UNTESTED
!= OPTIONAL_CACHE_ABSENT
!= UNSEALED_EPOCH
```

This is an Atelier implementation result, not a SignalRupture source theorem.

---

# 4. A7 / CSR source-location refinement discovered during descent

The August-25 Routing Object Taxonomy provides a stronger typing for CSR's seven-part declaration.

CSR's:

```text
3 stabilizers + 4 mechanisms
```

occur as substantive internal functional content.

CSR's:

```text
initiating mechanism in a seven-part architecture
```

occurs in the Reference Paragraph.

The later assay reconstructs Reference Paragraph role as:

```text
GRAPH PLACEMENT / LINEAGE CONTEXT
```

and specifically says CSR's Reference Paragraph places the essay in an infrastructural series and assigns its role in a larger architecture.

Therefore the current A7/Q7 distinction is strengthened from mere cardinality collision to source-location/function non-equivalence:

```text
Q7 = internal functional inventory
A7 declaration = graph-placement / lineage-context statement
```

Still held:

```text
Q7 = A7       NOT EARNED
Q7 != A7      NOT EARNED
A7 = CODEX_B  NOT EARNED
CSR = #1      NOT EARNED
```

An exact mapping edge remains required.

---

# 5. Relation-density calibration

The Phase-2 relation ecology is intentionally heterogeneous.

Current file sizes include approximately:

```text
reference-assertions.jsonl        6.2 MB
typed-edges.jsonl                 49 KB
recompilation-edges.jsonl         44 KB
authority-jurisdiction            18 KB
```

Literal DOI reference assertions are generated for DOI occurrences and explicitly retain semantic-body and archive-reconstructed graph status as unresolved.

Therefore:

```text
REGISTRY DENSITY != SOURCE RELATIONAL DENSITY
MORE CAPTURED EDGES != MORE SEMANTIC STRUCTURE
```

This is a retrieval-calibration rule, not a defect claim. The registries preserve their own kinds; consumers must respect them.

---

# 6. Successor implementation

New file:

`99-ADMIN/phase2-analytical-integrity-successor.py`

Design:

### query epoch

```text
current-seal.json first
optional journal does not define query authority
```

### expected-object v2 preview

Adds:

```text
expected_object_observation_id
source_series_observation_id
identity_scope
identity_basis
```

Resolved namespace:

```text
one semantic expected object may carry multiple observation IDs
```

Unresolved namespace:

```text
expected object remains local to the source series observation
until an explicit namespace bridge resolves identity
```

### publishing-regime v2 preview

Materializes every month inside the bounded parseable edge-time interval and distinguishes:

```text
OBSERVED_TYPED_EDGES
EXPLICIT_ZERO_TYPED_EDGES_WITHIN_BOUNDED_RANGE
```

while separately counting unparseable source times.

### analytical non-collapse v2 preview

Adds per-domain status:

```text
TESTED_NONEMPTY
UNTESTED_EMPTY_DOMAIN
```

and returns:

```text
PARTIAL_UNTESTED_DIMENSION
```

rather than PASS when a required dimension is empty.

### write membrane

Successor preview refuses to write into:

```text
05-OPERATIONS/phase2
04-RECEIPTS/phase2
04-RECEIPTS/assays/2026-08-24-phase2-kiln
```

so the current sealed epoch cannot be overwritten through this tool.

---

# 7. Tests added

New file:

`99-ADMIN/test_phase2_analytical_integrity_successor.py`

Hostile cases:

```text
1. current seal outranks absent optional SQLite
2. null namespaces remain local to their series observations
3. resolved namespace may share object identity while observations stay distinct
4. explicit zero month is materialized inside bounded axis
5. empty work domain cannot PASS
6. successor refuses sealed output directory
```

Verification state:

```text
STATIC_GITHUB_READBACK = COMPLETE
EXECUTION_RECEIPT = NOT PRESENT IN CONNECTOR APERTURE
```

Do not convert static inspection into a claim that the tests executed successfully.

---

# 8. Patch files

Preregistered packet:

`2026-08-28-ANALYTICAL-NEGATIVE-STATE-INTEGRITY-PATCH.packet.json`

New instruments/tooling:

```text
06-INSTRUMENTS/ANALYTICAL_NEGATIVE_STATE_INTEGRITY.md
06-INSTRUMENTS/A7_REFERENCE_PARAGRAPH_TYPING_ADDENDUM.md
99-ADMIN/phase2-analytical-integrity-successor.py
99-ADMIN/test_phase2_analytical_integrity_successor.py
this receipt
```

No sealed Phase-2 source or analytical file was modified by this patch.

---

# 9. Next lawful descent

Priority order after this patch:

```text
1. Obtain an execution receipt for successor hostile tests when a runtime/CI aperture is available.
2. Keep the successor preview outside current Phase-2 query authority until separately sealed.
3. Audit other analytical IDs for identity-basis / observation-basis collapse.
4. Audit time-series interfaces for event-conditioned support axes.
5. Audit every PASS for explicit nonempty test domains.
6. Continue CODEX_B orbit-closure hunt only with typed serial edges.
7. Use A7 evidence only through explicit mapping predicates, not cardinality.
8. Calibrate retrieval by registry type before treating edge abundance as source topology.
```

Human-only source homework remains unchanged:

```text
H1 Origin* direct URL
H2 Origin* body if still gated
H3 Glyph body for A7 typing
```

---

# Authority membrane

```text
source assertion
!= archive observation
!= archive inference
!= researcher hypothesis
!= Atelier implementation defect
!= TD613 science
```

No merge, SRC sync, Queue C, sealed-source mutation, canon admission, publication, production, release, or TD613 scientific promotion follows.

Marked ⟐
