󐘓 U+10D613

𝌋‌⟐

# SRC Atelier · Analytical Negative-State Integrity

Status: RESEARCH INSTRUMENT / ATELIER-IMPLEMENTATION AUDIT / APPEND-ONLY SUCCESSOR PATCH / NO SOURCE PROMOTION

Bound source/query epoch under assay:

```text
atelier_snapshot_id = src-20260824-p2-001
seal_id = src-seal:eaf744ce16b1c8b519ad0f1b0325b44192679ea4a5110b0ad0ca49fbcd816a1a
```

This instrument records implementation-level defects discovered by a top-down stratigraphic descent through the SRC fixture after the Ordinal Identity + Type Projection patch.

It does **not** alter SignalRupture source facts and does **not** rewrite the sealed Phase-2 projection.

---

# Governing mark

> **𝄐 MAJOR — POSITIVE-STATE NON-COLLAPSE DOES NOT GUARANTEE NEGATIVE-STATE NON-COLLAPSE. NULL, UNRESOLVED IDENTITY, ZERO, MISSING ROW, EMPTY TEST DOMAIN, ABSENT OPTIONAL CACHE, AND UNSEALED EPOCH ARE NON-EQUIVALENT STATES.**

The current AIA surface explicitly lists `missingness` among its governed invariants.

The Phase-2 analytical layer nevertheless contains four separate mechanisms through which a negative or absent value can erase a distinction.

Archive shorthand:

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

The phrase `analytical negative-state integrity` is archive-authored terminology.

---

## 1. Expected-object identity and observation identity are collapsed in v1

Historical generator:

`99-ADMIN/build-phase2-assays.py`

For each gap in an ordinal-series observation, v1 assigns:

```text
expected_object_id = sid(
  "src-expected-object",
  series_namespace_id,
  expected_ordinal
)
```

When `series_namespace_id` is unresolved, Python serializes `None` into the stable-ID input.

Current retained v1 output contains two Field Paper II gap observations with the same:

```text
expected_object_id = src-expected-object:1793b8250856b0ce57d0b181
series_namespace_id = null
expected_ordinal = 1
```

while their evidence sets differ: one includes the Epistemic Substrate compiler context and one does not.

Those two rows may be repeated observations of one unresolved expected object, or two unresolved namespace models that remain distinguishable until a namespace bridge closes them.

The v1 interface cannot express that distinction because it has:

```text
expected_object_id
```

but no:

```text
expected_object_observation_id
source_series_observation_id
identity_scope
identity_basis
```

Therefore the earned defect is **not**:

```text
TWO_UNRELATED_SERIES_PROVEN_MERGED
```

The earned defect is:

```text
OBJECT_IDENTITY
!= OBSERVATION_IDENTITY
```

while v1 does not preserve both coordinates.

Further, a global null namespace is not a witnessed namespace identity.

Safe successor rule:

```text
resolved namespace:
  expected object may be namespace-scoped

unresolved namespace:
  expected object identity remains local to the source series observation
  until a source/registry bridge resolves the namespace
```

This avoids both premature merger and unnecessary denial of later identity closure.

---

## 2. Zero-event months disappear from the publishing-regime axis

Historical generator:

`publishing_regime()` in `99-ADMIN/build-phase2-assays.py`

creates the monthly dictionary only when a typed edge has a parseable `source_time` in that month.

Current output contains:

```text
2026-01
2026-03
2026-04
2026-05
2026-06
2026-07
2026-08
```

while February is absent.

The builder therefore conditions the time axis on event presence.

Within a bounded change-point / coverage diagnostic:

```text
month with zero typed edges observed
!= month absent from the observation domain
!= month whose edges have unparseable times
```

An absent February row cannot carry that distinction.

Safe successor rule:

- derive an explicit bounded month interval from the minimum and maximum parseable typed-edge month;
- materialize every month inside that interval;
- preserve zero as an explicit state;
- separately count edges with unparseable source times.

No publishing-regime interpretation follows from an explicit zero.

---

## 3. The Phase-2 non-collapse audit passes with a vacuous work arm

Historical sealed receipt:

`04-RECEIPTS/assays/2026-08-24-phase2-kiln/non-collapse-audit.json`

reports:

```text
work = 0
evidence = 1650
representation = 26
authority = 9
namespace_collisions = []
result = PASS
```

Historical builder attempts to construct the work set with:

```text
row.get("entity_type") == "work"
```

but `01-MANIFESTS/entity-index.jsonl` is generated with the field:

```text
entity_kind
```

not `entity_type`.

More importantly, the current Phase-1.5 entity builder does not construct archive-level `WORK` entities at all. It constructs manifestations and typed registry objects while preserving work identity for later DOI/content/linkage/human adjudication.

Thus simply changing the field name would still leave the present bounded work audit domain empty.

The scientific consequence is narrower and stronger:

```text
EMPTY_REQUIRED_TEST_DOMAIN
!= EVIDENCE_OF_NO_COLLISION
```

and:

```text
UNTESTED_DOMAIN
!= PASSED_DOMAIN
```

A future non-collapse audit must report per-domain testability.

If a required namespace is absent, the overall result may be:

```text
PARTIAL_UNTESTED_DIMENSION
```

but must not become `PASS` merely because an empty set has no intersections.

---

## 4. Optional SQLite absence can be converted into false epoch absence

Historical analytical builder function:

```text
snapshot_id(root)
```

looks for:

```text
07-ARCHIVE-LEDGER/phase2/state.sqlite3
```

and returns:

```text
UNSEALED_WORKING_STATE
```

when the SQLite work journal is absent.

But current SRC authority contracts explicitly say:

```text
portable source of truth = JSONL_AND_MARKDOWN
SQLite role = RESUMABLE_WORK_JOURNAL_ONLY
```

and:

```text
04-RECEIPTS/phase2/current-seal.json
= mandatory connector query-epoch binding
```

The public Git projection intentionally exposes `07-ARCHIVE-LEDGER/README.md` without the local SQLite work journal while retaining the exact current seal.

Therefore:

```text
OPTIONAL_WORK_JOURNAL_ABSENT
!= QUERY_EPOCH_ABSENT
```

A portable analytical rebuild must resolve `current-seal.json` before consulting any optional local journal.

The journal may assist local build state. It cannot outrank sealed query authority.

---

# 5. Common failure family

The four defects share one structural form.

Let `X` be a richer analytical state and `q(X)` a lower-capacity implementation representation.

Current defect family admits cases in which:

```text
q(X_1) = q(X_2)
```

because a missing discriminator is converted into:

```text
None
0 rows
empty set
fallback string
```

rather than preserved as a typed state.

This is an implementation analogue of the already-retained Coarse Observational State Aliasing result, but no SignalRupture terminology or theorem is transferred into the archive defect.

Archive classification:

```text
ANALYTICAL_NEGATIVE_STATE_COLLAPSE = WITNESSED_AS_COMMON_IMPLEMENTATION_FAILURE_FAMILY
```

Subclasses:

```text
EXPECTED_OBJECT_OBSERVATION_IDENTITY_AMBIGUITY
ZERO_MONTH_AXIS_OMISSION
VACUOUS_WORK_DOMAIN_PASS
OPTIONAL_JOURNAL_EPOCH_BINDING
```

---

# 6. Non-equivalence firewall

Every future analytical interface must preserve:

```text
OBJECT_IDENTITY != OBSERVATION_IDENTITY

UNRESOLVED_NAMESPACE != SHARED_NAMESPACE

ZERO_OBSERVED_EVENTS != MONTH_NOT_IN_DOMAIN

EMPTY_DOMAIN != COLLISION_FREE_DOMAIN

UNTESTED != PASS

OPTIONAL_CACHE_ABSENT != AUTHORITY_RECORD_ABSENT

PORTABLE_SEAL_AUTHORITY != LOCAL_WORK_JOURNAL_AVAILABILITY
```

An implementation may compress these only when the lost distinction is proven irrelevant to the query and the compression is itself typed.

---

# 7. Successor design

Append-only successor tooling is introduced under:

`99-ADMIN/phase2-analytical-integrity-successor.py`

It does not overwrite the sealed v1 outputs.

Successor expected-object observations add:

```text
expected_object_observation_id
source_series_observation_id
identity_scope
identity_basis
```

When a series namespace remains unresolved:

```text
identity_scope = SERIES_OBSERVATION_LOCAL
```

rather than globally hashing `(None, ordinal)` as though `None` were a namespace.

Successor publishing-regime output materializes explicit zero months inside its bounded axis.

Successor non-collapse output reports:

```text
TESTED_NONEMPTY
or
UNTESTED_EMPTY_DOMAIN
```

per audited namespace and refuses a global PASS while a required dimension remains untested.

Successor epoch resolution reads the portable current seal first.

---

# 8. Relation to existing SRC science

Existing instruments already preserve the methodological side of this rule:

```text
coarse state != richer state
present state != provenance-complete history
historical absence != permission to synthesize a singleton past
Indeterminate != Confirmed
Indeterminate != Falsified
```

The current patch applies analogous discipline to **Atelier analytical machinery**, not to SignalRupture source claims.

Therefore:

```text
SOURCE-SIDE NONCOLLAPSE LESSON
!= PROOF OF ATELIER BUG
```

The bugs are established independently by repository code/output inspection.

The source-side instruments merely show that the repair is methodologically consonant with the archive's existing non-collapse discipline.

---

# 9. Claim ceiling

Earned:

```text
POSITIVE_STATE_NONCOLLAPSE_DOES_NOT_GUARANTEE_NEGATIVE_STATE_NONCOLLAPSE
EXPECTED_OBJECT_V1_DOES_NOT_SEPARATE_OBJECT_AND_OBSERVATION_IDENTITY
ZERO_MONTH_AXIS_OMISSION_WITNESSED
VACUOUS_WORK_DOMAIN_PASS_WITNESSED
OPTIONAL_JOURNAL_EPOCH_BINDING_WITNESSED
ANALYTICAL_NEGATIVE_STATE_COLLAPSE_COMMON_FAILURE_FAMILY_SUPPORTED
```

Not earned:

```text
TWO_UNRELATED_FIELD_PAPER_SERIES_PROVEN_MERGED
FEBRUARY_SOURCE_ACTIVITY_PROVEN_ZERO
WORK_IDENTITY_RESOLVED
SEALED_PHASE2_INVALID
SIGNALRUPTURE_SOURCE_ANOMALY_FROM_ATELIER_BUG
TD613_SCIENTIFIC_CORE_PROMOTION
```

---

# Authority membrane

This instrument authorizes no rewrite of:

- current Phase-2 seal;
- projection seal;
- sealed v1 analytical outputs;
- source bodies;
- historical assay receipts.

The current sealed epoch remains evidence for the defect.

Any corrected analytical output is a **successor preview** until separately sealed and human-promoted through the authorized custody path.

No merge, SRC sync, Queue C action, canon promotion, publication, production, release, or TD613 scientific promotion follows.

Marked ⟐
