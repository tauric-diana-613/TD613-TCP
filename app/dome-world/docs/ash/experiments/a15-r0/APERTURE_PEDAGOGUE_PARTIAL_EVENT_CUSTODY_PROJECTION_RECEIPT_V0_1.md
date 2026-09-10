# A15-R0 · Aperture × Pedagogue Partial-Event Custody Projection Receipt v0.1

𝌋 TD613 · Tauric Diana 613

**Status:** WITNESSED / BOUNDED SYNTHETIC RESULT / HUMAN ONTOLOGY SEAM REACHED  
**Scientific parent:** #709 receipt `18414995c6fdca9b2e2c85bedf43da4682b43e97`  
**Pre-routing scientific head:** `9dcb199c4b9d86b5577eac44c2a82163c9c18011`  
**Exact witness head:** `8ad1aae73526255805d289bc7f135cb759e4d090`  
**Workflow:** `TD613 Consolidated Validation`  
**Run:** `32674490474` · run number `2067`  
**Static contract job:** `97280275599`  
**Outcome:** SUCCESS  
**Browser/full-repository/self-hosted lanes:** skipped; not required for this assay.

---

## 1. Research question

The chamber tested which selected event fields are sufficient for which declared claims, and what evidentiary capacity is lost when action identity, event history, or endpoint context is removed from custody.

It inherited rather than retyped the witnessed #709 finite records and the witnessed #708 robust interval boxes.

Two claim domains remained non-identical:

```text
decision domain U = {AB,BA,FROZEN}
route domain R = {AB,BA}
```

Claim sufficiency was evaluated only against the declared domain for each claim.

---

## 2. Exact finite crossed sufficiency

Inherited records:

```text
AB      [A,B]=[2,4]  sum=6  D6=true
BA      [A,B]=[3,3]  sum=6  D6=true
FROZEN  [A,B]=[2,3]  sum=5  D6=false
```

### Cumulative scalar

```text
AB -> 6
BA -> 6
FROZEN -> 5
```

Result:

```text
cumulative scalar sufficient for D6 on U
cumulative scalar insufficient for route label on R
```

### A-labeled event

```text
AB -> {A,2}
BA -> {A,3}
FROZEN -> {A,2}
```

Result:

```text
A-labeled event sufficient for route label on R
A-labeled event insufficient for D6 on U
```

The decision-breaking fiber is `{A,2} -> {AB,FROZEN}`.

### B-labeled event

```text
AB -> {B,4}
BA -> {B,3}
FROZEN -> {B,3}
```

Result:

```text
B-labeled event sufficient for route label on R
B-labeled event insufficient for D6 on U
```

The decision-breaking fiber is `{B,3} -> {BA,FROZEN}`.

### Joint bounded control

```text
{ cumulative_response, A_labeled_scalar }
```

separates the finite authored records sufficiently to support both the declared D6 claim and the declared history label on U.

This is a finite control only. It earns no minimal-representation, optimal-custody, or universal sufficient-statistic theorem.

---

## 3. Robust action-label custody

The chamber consumed #708's witnessed robust route boxes:

```text
AB:
  A ∈ [1.95,2.05]
  B ∈ [3.85,4.15]

BA:
  A ∈ [3.75,4.25]
  B ∈ [2.95,3.05]
```

Action-labeled partial custody remains route-separating:

```text
AB.A ∩ BA.A = ∅
AB.B ∩ BA.B = ∅
```

Required classifications survived:

```text
A_ACTION_LABELED_EVENT_RETAINS_ROUTE_SEPARATION
B_ACTION_LABELED_EVENT_RETAINS_ROUTE_SEPARATION
```

---

## 4. Action-label erasure hostile

When exactly one scalar-event interval is retained but its action identity is erased, the route-compatible supports overlap.

Explicit witnessed overlap:

```text
AB.B [3.85,4.15]
∩
BA.A [3.75,4.25]
=
[3.85,4.15]
```

Therefore:

```text
ACTION_LABEL_ERASURE_DESTROYS_UNIFORM_SINGLE_EVENT_ROUTE_SUFFICIENCY_IN_AUTHORED_FAMILY
```

The earned anti-equivalence is:

```text
one scalar event retained != action provenance retained
```

This is the chamber's strongest provenance result: a field that looks like mere metadata can be part of the evidentiary capacity of the custody object for a declared claim.

---

## 5. Endpoint-only and certificate-only controls

#708's shared endpoint family remains route-indifferent:

```text
COMMON_ENDPOINT_CUSTODY_DOES_NOT_IDENTIFY_ROUTE_HISTORY
```

And the family-level separation certificate remains a statement about distinguishability rather than an event instance:

```text
FAMILY_SEPARATION_CERTIFICATE_DOES_NOT_IDENTIFY_HISTORICAL_ROUTE
```

Therefore:

```text
claim about distinguishability != custody of a distinguished event
common endpoint != common route history
```

---

## 6. Custody non-deletion membrane

The chamber derived partial projections without replacing or mutating the parent records.

Pre/post snapshots of the inherited #709 universe and #708 robust-family/shared-endpoint objects remained identical.

Earned law:

```text
partial projection derived from custody
!=
permission to replace custody with the projection
```

---

## 7. Exact-head witness

#712 was temporarily based on locked `main` only to admit one pull-request-triggered consolidated static witness. The witness-routing note froze the claim domains, projections, parent dependencies, label-erasure hostile, non-deletion membrane, and claim ceiling before CI.

Exact witness head:

```text
8ad1aae73526255805d289bc7f135cb759e4d090
```

Consolidated validation run `32674490474` / `2067` completed successfully.

The static contract job `97280275599` recorded success for:

- the four-workflow estate and release membrane;
- Giving/Campaign Deputy import contracts;
- Dome-World and Phase IV static surfaces;
- Ash core through A14;
- **Ash A15 empirical profile journeys and the A15-R0 research field**;
- Ash demo hydration and production-closure static surfaces;
- Flow-Core P0-P10 and claim-separation contracts;
- the Flow-Core runtime browser contract.

Explicit self-hosted calibration, explicit full-repository validation, front-line browser, Giving/practice browser, and full-product browser witness lanes were skipped.

No browser witness is claimed as scientific evidence for this chamber.

---

## 8. Witness-routing cleanup

After run `2067` settled successfully, the branch was restored to #709 and the temporary routing note was removed.

```text
exact witness head = 8ad1aae73526255805d289bc7f135cb759e4d090
routing-note cleanup head = ba4462917d4a6c9d2627947d530ac16fa191777e
```

The only difference from exact witness head to cleanup head was removal of:

```text
APERTURE_PEDAGOGUE_PARTIAL_EVENT_CUSTODY_PROJECTION_WITNESS_TOPOLOGY_NOTE.md
```

No scientific values, executable behavior, tests, claim domains, projection maps, or claim ceilings changed after the witness.

---

## 9. Canonical bounded classification and claim

Classification:

```text
CLAIM_CONDITIONED_PARTIAL_EVENT_CUSTODY_WITH_ACTION_LABEL_PROVENANCE_EFFECT
```

Strongest permitted bounded claim:

```text
IN_THE_AUTHORED_FINITE_AND_ROBUST_ROUTE_FIXTURES_PARTIAL_EVENT_CUSTODY_IS_CLAIM_CONDITIONED_THE_CUMULATIVE_SCALAR_CAN_RETAIN_A_DECLARED_DECISION_WHILE_ERASING_THE_SAME_ENDPOINT_ROUTE_PAIR_AN_ACTION_LABELED_SINGLE_EVENT_CAN_RETAIN_THAT_ROUTE_PAIR_WHILE_FAILING_THE_DECISION_OVER_A_LARGER_FINITE_UNIVERSE_A_SMALL_JOINT_VIEW_CAN_SUPPORT_BOTH_DECLARED_CLAIMS_AND_ERASING_THE_ACTION_LABEL_FROM_ONE_ROBUST_EVENT_DESTROYS_UNIFORM_ROUTE_SUFFICIENCY_WITHOUT_DELETING_THE_UNDERLYING_CUSTODY
```

---

## 10. Anti-equivalences preserved

```text
smaller representation != weaker representation for every claim
route-pair sufficiency != decision sufficiency over a larger universe
decision sufficiency != historical-route custody
action-labeled scalar != unlabeled scalar event
family separation certificate != historical event custody
common endpoint != common route history
partial custody != custody deletion authority
one scalar event retained != action provenance retained
```

---

## 11. Claim ceiling

This receipt does **not** earn:

- a generic sufficient-statistic theorem;
- a generic information-loss theorem;
- Shannon information quantity or channel capacity;
- a minimal-representation theorem;
- an optimal custody schema;
- a causal-history reconstruction theorem;
- a general robust path-dependence theorem;
- a path object, path category, or path groupoid;
- a transport functor or connection;
- holonomy or curvature;
- Berry structure or quantum behavior;
- canonical operator-tomography promotion;
- Proto-Loom;
- a TD613-general theorem;
- A16 reopening;
- live Ash mutation;
- merge, production, or Vercel authority.

---

## 12. Human ontology seam

The bounded compression / partial-custody round is closed.

The next move is no longer another hostile inside the same representation grammar. It decides what TD613 intends to treat as the canonical object under any later composition.

The evidence now distinguishes at least:

```text
operator state only
operator + full action-indexed transcript
operator + claim-sufficient derived view
operator + append-only custody ledger with derived replay views
a typed/layered product whose components remain non-identical
```

The current results specifically warn against silently promoting a claim-sufficient derived view into canonical custody, because a view sufficient for one claim can erase route identity, action provenance, or another claim's discriminating structure.

Therefore:

```text
HUMAN_𝄐_REQUIRED_BEFORE_SELECTING_ANY_COMPOSITIONAL_PATH_OBJECT_OR_TRANSPORT_GRAMMAR
```

No path/category/transport object is authored by this receipt.

𝌋

Sealed ⟐