# Typed Update-Order Custody Assay — G/O Calibration

Status: **TD613-AUTHORED / SOURCE-DERIVED AUTHORITY FIXTURE / FIRST TYPED UPDATE-ORDER ASSAY / SAME ENDPOINT DIFFERENT CUSTODY / NOT CATEGORY / NOT HOLONOMY**

Bound epoch:

```text
atelier_snapshot_id = src-20260824-p2-001
seal_id = src-seal:eaf744ce16b1c8b519ad0f1b0325b44192679ea4a5110b0ad0ca49fbcd816a1a
```

## 1. Source rule used by the fixture

Captured source:

```text
zenodo:21960582
SR Legacy Papers Classification
```

The source states that Legacy SR papers:

```text
remain part of genealogy
are not deleted
are not endlessly revised
are not treated as empirical authority
are preserved as conceptual source material
```

The source rule therefore supplies an authority transition in which genealogical custody remains while empirical admissibility is withdrawn.

The runtime below is TD613-authored. It is not an SR implementation.

## 2. Typed operators

```text
O_h = observation-acquisition candidate
G_L = Legacy authority retyping
```

Fixture semantics:

```text
O_h:
  if current empirical authority is present,
  admit observation h into the active empirical set and record acquisition in custody;
  otherwise preserve the attempted event as HELD_AUTHORITY_INSUFFICIENT.

G_L:
  withdraw empirical authority,
  retain genealogical status,
  deactivate any active empirical observation whose admissibility depends on that source,
  preserve the transition in custody.
```

These operational rules are TD613-authored from the bounded source semantics.

## 3. Competing route order

Start state:

```text
empirical_authority = true
genealogical_authority = true
active_evidence = empty
custody = empty
```

Compare:

```text
Route A = G_L o O_h
         = acquire h, then reclassify source Legacy

Route B = O_h o G_L
         = reclassify source Legacy, then attempt acquisition of h
```

## 4. Result

Both routes end at the same current epistemic projection:

```text
empirical_authority = false
genealogical_authority = true
active_evidence = empty
```

Therefore:

```text
pi_current(G_L o O_h)
=
pi_current(O_h o G_L)
```

But custody differs.

Route A records:

```text
OBSERVATION_ACQUIRED
SOURCE_RECLASSIFIED_LEGACY
  deactivated_active_evidence = [h]
```

Route B records:

```text
SOURCE_RECLASSIFIED_LEGACY
OBSERVATION_HELD_AUTHORITY_INSUFFICIENT
```

Therefore:

```text
L(G_L o O_h)
!=
L(O_h o G_L)
```

Bounded result:

```text
SAME_ACTIVE_ENDPOINT_WITNESSED_IN_FIXTURE
DIFFERENT_TYPED_CUSTODY_HISTORY_WITNESSED_IN_FIXTURE
UPDATE_ORDER_VISIBLE_IN_CUSTODY_NOT_CURRENT_PROJECTION_WITNESSED_IN_FIXTURE
```

## 5. Why this matters to the compositional object

If the compositional state were only:

```text
current authority + active evidence
```

both routes would collapse to the same endpoint.

If the append-only custody history is preserved separately, the paths remain distinguishable without pretending the ledger itself is the transported current state.

This calibrates the earlier TD613 architecture:

```text
current epistemic/replay state
!=
append-only custody of the route that produced it
```

The fixture does not prove that this architecture is universally correct. It demonstrates one bounded case in which endpoint-only representation destroys a real typed route distinction.

## 6. Relation to #707-style route effects

The structural rhyme is:

```text
same current endpoint
!=
same route history
```

Here the distinguishing information is authority-conditioned observation custody rather than an action-indexed physical/measurement transcript.

The analogy is TD613-authored and does not transfer the older experiment into SR.

## 7. Why this is not holonomy

There is no closed loop returning a declared base object to itself with a nontrivial automorphism on a declared transported fiber.

The result is simply:

```text
two ordered update paths
same current projection
different external custody
```

Ledger growth / route difference must not be misnamed holonomy.

## 8. Next composition question

The first meaningful typed-composition program is now:

```text
Which update pairs are well-defined on the current epistemic state,
and which distinctions survive only in custody?
```

Candidate pair classes remain:

```text
O o O
R o R
G o G
R o O
O o R
G o R
R o G
G o O
O o G
```

This fixture witnesses only the bounded `G/O` order family specified above.

## 9. Anti-equivalences

```text
same active endpoint != same custody history
observation later deactivated != observation never admitted
held observation != deleted observation
registry update != source mutation
custody difference != transported-state holonomy
bounded pair assay != general composition law
```

## 10. Claim ceiling

Permitted:

```text
SAME_ACTIVE_ENDPOINT_WITNESSED_IN_FIXTURE
DIFFERENT_TYPED_CUSTODY_HISTORY_WITNESSED_IN_FIXTURE
UPDATE_ORDER_VISIBLE_IN_CUSTODY_NOT_CURRENT_PROJECTION_WITNESSED_IN_FIXTURE
FIRST_G_O_TYPED_UPDATE_ORDER_ASSAY_COMPLETE
```

Forbidden:

```text
SR_RUNTIME_SIMULATED
SPECIFIC_LEGACY_PAPER_EMPIRICALLY_WITHDRAWN_AFTER_USE
ALL_G_O_PAIRS_NONCOMMUTE
EPISTEMIC_CATEGORY_CONFIRMED
GROUPoid_CONFIRMED
HOLONOMY_CONFIRMED
```

U+10D613

𝌋

Sealed ⟐
