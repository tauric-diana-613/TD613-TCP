𝌋

# Aperture × Pedagogue Transcript Compression / Partial Custody Gauntlet v0.1

**Schema:** `td613.a15-r0.aperture-pedagogue-transcript-compression-partial-custody/v0.1`  
**Scientific parent:** #708 exact-head witness `a492e805baf0e85287754fcdcbedf113007015e0` · consolidated run `32673493614` / `2064` SUCCESS  
**Status:** PREREGISTERED / PRE-WITNESS / A15-R0 SYNTHETIC RESEARCH ONLY

## 0. Research question

#708 established deterministic set-wise separation between two action-indexed route transcript boxes under a shared transition-parameter family and bounded measurement error:

```text
AB:
  A ∈ [1.95, 2.05]
  B ∈ [3.85, 4.15]

BA:
  A ∈ [3.75, 4.25]
  B ∈ [2.95, 3.05]
```

This chamber asks a narrower question:

> Which bounded compressions or partial-custody views preserve the route claim in this authored fixture, and which erase it even though the full action-indexed transcript remains separating?

The chamber studies deterministic image sets only. It does not introduce probability, information-theoretic channel capacity, a path object, transport, connection, holonomy, or a general sufficient-statistic theorem.

Frozen distinctions:

```text
smaller representation != weaker representation for every claim
same output dimension != same claim sufficiency
family-level separation certificate != event-level route custody
endpoint custody != route-history custody
unlabeled retained event != action-labeled retained event
overlapping compressed images != route effect disproved
```

## 1. Parent custody

The implementation must derive the primary boxes from the witnessed #708 executable rather than hard-code them as independent answer keys.

Required parent conditions:

```text
#708 robust gauntlet passes
observation timing = sample_before_transition
shared endpoint identity remains certified over the declared family
```

If the parent robustness object does not pass, this chamber must abstain.

## 2. Scalar linear compression

For a route transcript box

```text
A ∈ [a_lo, a_hi]
B ∈ [b_lo, b_hi]
```

and declared fixed weights `(w_A,w_B)`, define

```text
C_w = w_A A + w_B B.
```

The image interval must be computed from interval geometry, including weight sign. No midpoint substitution is allowed.

### 2.1 Separation-preserving one-scalar compression

Freeze:

```text
C_sum = A + B
```

Required images:

```text
AB -> [5.80, 6.20]
BA -> [6.70, 7.30]
```

They are disjoint.

Required classification:

```text
SCALAR_COMPRESSION_RETAINS_ROUTE_SEPARATION_FOR_DECLARED_FIXTURE
```

### 2.2 Separation-erasing one-scalar compression

Freeze:

```text
C_collision = A + 2B
```

Required images:

```text
AB -> [9.65, 10.35]
BA -> [9.65, 10.35]
```

They are identical.

Required classification:

```text
SCALAR_COMPRESSION_ERASES_ROUTE_SEPARATION_FOR_DECLARED_FIXTURE
```

Required law:

```text
one scalar retained != route claim retained
same compressed dimension != same route-custody sufficiency
```

## 3. Action-labeled single-coordinate custody

Retain exactly one action-labeled coordinate.

### A-only custody

```text
AB -> A:[1.95,2.05]
BA -> A:[3.75,4.25]
```

Disjoint.

### B-only custody

```text
AB -> B:[3.85,4.15]
BA -> B:[2.95,3.05]
```

Disjoint.

Each action-labeled coordinate is independently route-separating in this authored family.

Required classification:

```text
SINGLE_ACTION_LABELED_COORDINATE_RETAINS_ROUTE_SEPARATION_FOR_DECLARED_FIXTURE
```

This is fixture-relative only. It does not establish that one coordinate is generally sufficient.

## 4. Unlabeled single-event partial custody

Now retain exactly one observed event interval but erase which action produced it.

Possible retained intervals are:

```text
AB: { [1.95,2.05], [3.85,4.15] }
BA: { [3.75,4.25], [2.95,3.05] }
```

Because

```text
AB.B [3.85,4.15]
intersects
BA.A [3.75,4.25]
```

there exists admissible unlabeled retained evidence compatible with either route.

Required classification:

```text
UNLABELED_SINGLE_EVENT_CUSTODY_NOT_UNIFORMLY_ROUTE_SUFFICIENT
```

The implementation may not infer route identity merely because some unlabeled observed values happen to be discriminating.

Required law:

```text
sometimes discriminating != uniformly claim-sufficient over the compatible family
```

## 5. Endpoint-only custody

#708 certified the two routes share the same endpoint formula over the declared shared parameter family:

```text
T_AB(alpha,beta) = T_BA(alpha,beta)
                 = [[2+beta,1],[1,3+alpha]].
```

Therefore endpoint-only custody cannot identify which route produced that endpoint within this fixture.

Required classification:

```text
COMMON_ENDPOINT_CUSTODY_DOES_NOT_IDENTIFY_ROUTE_HISTORY
```

This is not a statement that endpoints are generally useless. It is a statement about this authored counterfactual family.

## 6. Separation-certificate-only custody

A family-level certificate such as

```text
ROBUST_ROUTE_TRANSCRIPT_SEPARATION_OVER_DECLARED_TRANSITION_AND_ERROR_FAMILY
```

states that the two route image sets are disjoint in the full action-indexed transcript representation.

The certificate does not encode which route an individual historical event followed.

Required classification:

```text
FAMILY_SEPARATION_CERTIFICATE_DOES_NOT_IDENTIFY_HISTORICAL_ROUTE
```

Required law:

```text
claim about distinguishability != custody of the distinguished event
```

## 7. Claim-sufficiency rule for this chamber

For a declared deterministic summary map `S`, this chamber calls `S` route-sufficient only when the complete summary image of AB is disjoint from the complete summary image of BA.

```text
S(AB_box) ∩ S(BA_box) = ∅
  -> route separation retained for this fixture

S(AB_box) ∩ S(BA_box) != ∅
  -> route separation unresolved under that summary
```

This rule is deliberately claim-relative and fixture-relative.

It does not promote a general sufficient-statistic theorem, Shannon information claim, or category-theoretic quotient.

## 8. Hostile controls

Reject/fail if:

```text
H1 parent #708 robustness does not pass but compression results are still emitted
H2 interval images are replaced by midpoint images
H3 output dimension alone is used to rank route sufficiency
H4 the A+2B collision is forced into a route label
H5 an unlabeled one-event observation is treated as uniformly route-sufficient despite cross-route overlap
H6 common endpoint custody is used to infer route history
H7 family separation certificate is used as event-level route identity
H8 action labels are silently reconstructed after custody loss
H9 path/category/groupoid/transport/connection/holonomy/curvature/Berry/quantum language is promoted
H10 A16/live Ash/merge/production/Vercel authority widens
```

## 9. Success criteria

```text
C1 parent #708 robust result passes
C2 A+B images are computed from parent boxes and equal [5.8,6.2] / [6.7,7.3]
C3 A+B images are disjoint
C4 A+2B images are computed from parent boxes and both equal [9.65,10.35]
C5 A+2B images overlap / collapse route separation
C6 A-labeled custody is disjoint across routes
C7 B-labeled custody is disjoint across routes
C8 unlabeled one-event custody has an explicit cross-route overlap witness
C9 endpoint-only custody refuses route identity
C10 family separation certificate refuses historical route identity
C11 claim ceiling remains closed
```

## 10. Canonical bounded claim candidate

If exact-head witness succeeds:

```text
IN_THE_AUTHORED_ROBUST_2X2_ROUTE_FIXTURE_ROUTE_CUSTODY_IS_REPRESENTATION_DEPENDENT_A_ONE_SCALAR_SUM_COMPRESSION_AND_EITHER_SINGLE_ACTION_LABELED_COORDINATE_RETAIN_SET_WISE_ROUTE_SEPARATION_WHILE_A_DIFFERENT_ONE_SCALAR_LINEAR_COMPRESSION_COLLAPSES_BOTH_ROUTE_BOXES_TO_THE_SAME_INTERVAL_UNLABELED_SINGLE_EVENT_CUSTODY_IS_NOT_UNIFORMLY_ROUTE_SUFFICIENT_AND_COMMON_ENDPOINT_OR_FAMILY_SEPARATION_CERTIFICATE_CUSTODY_ALONE_DOES_NOT_IDENTIFY_THE_HISTORICAL_ROUTE
```

## 11. Claim ceiling

Still false / unauthorized:

```text
general sufficient-statistic theorem
general information-loss theorem
Shannon channel/capacity claim
probabilistic route classification
general robust path-dependence theorem
path object
path category
path groupoid
transport functor
connection
holonomy
curvature
Berry structure
quantum behavior
canonical operator-tomography promotion
Proto-Loom
TD613-general theorem
A16 reopening
live Ash mutation
merge authority
production authority
Vercel authority
```

## 12. Mandatory next seam

If this chamber survives exact-head witness + receipt, stop.

The next move changes scientific ontology rather than merely hardening the same transcript result. Human review must decide what TD613 is willing to compose:

```text
operator state only
operator + full action-indexed transcript
operator + claim-sufficient compressed view
operator + custody-bearing event ledger with derived views
```

No path/category/transport grammar may be authored before that `𝄐`.

𝌋

Sealed ⟐