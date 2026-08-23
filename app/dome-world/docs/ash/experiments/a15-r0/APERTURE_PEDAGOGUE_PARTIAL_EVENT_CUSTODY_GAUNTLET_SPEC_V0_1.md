𝌋

# Aperture × Pedagogue Partial-Event Custody Gauntlet v0.1

**Schema:** `td613.a15-r0.aperture-pedagogue-partial-event-custody/v0.1`  
**Scientific parent:** #709 receipt commit `18414995c6fdca9b2e2c85bedf43da4682b43e97`  
**Status:** PREREGISTERED / PRE-IMPLEMENTATION / A15-R0 SYNTHETIC RESEARCH ONLY

## 0. Question

#709 established that representation adequacy is claim-relative: one scalar projection can preserve a declared downstream decision while erasing route custody, while another scalar projection of the same dimension can preserve route custody.

This final bounded chamber asks:

> Can different **partial event-custody fields** exhibit crossed claim sufficiency—one preserving the declared decision while losing route history, and another preserving AB-vs-BA route identity while losing the declared decision over the full finite universe?

No path object, path category, transport, connection, holonomy, causal-history theorem, sufficient-statistic theorem, or information-theoretic quantity is proposed.

## 1. Frozen finite universe and claim domains

Inherit #709's authored records:

```text
U = {AB, BA, FROZEN}

AB:
  action-indexed responses = [A:2, B:4]
  endpoint = [[3,1],[1,4]]
  D6 = true

BA:
  action-indexed responses = [A:3, B:3]
  endpoint = [[3,1],[1,4]]
  D6 = true

FROZEN:
  action-indexed responses = [A:2, B:3]
  endpoint = [[2,1],[1,3]]
  D6 = false
```

The declared decision is:

```text
D6 = (A + B >= 6)
```

Two claim domains are frozen and must remain explicit:

```text
decision domain U = {AB,BA,FROZEN}
route domain R = {AB,BA}
```

Required anti-equivalence:

```text
changing claim domain silently != valid factorization comparison
```

## 2. Endpoint-only custody

Project each record to its final operator only.

Required fibers on U:

```text
[[3,1],[1,4]] -> {AB,BA}
[[2,1],[1,3]] -> {FROZEN}
```

Because `D6(AB)=D6(BA)=true` and `D6(FROZEN)=false`, endpoint-only custody is decision-sufficient on U.

On route domain R, however, AB and BA occupy the same endpoint fiber while carrying different route labels.

Required classifications:

```text
ENDPOINT_ONLY_CUSTODY_IS_D6_SUFFICIENT_ON_DECLARED_UNIVERSE
ENDPOINT_ONLY_CUSTODY_IS_ROUTE_INSUFFICIENT_ON_AB_BA_DOMAIN
```

Required law:

```text
common endpoint can preserve one claim while erasing another
```

## 3. A-response-only action-labeled custody

Project each record to its action-labeled scalar response for A.

```text
AB -> 2
BA -> 3
FROZEN -> 2
```

On R={AB,BA}, A-only custody separates route labels.

On U, the value `2` fiber contains:

```text
AB      D6=true
FROZEN  D6=false
```

so A-only custody is not D6-sufficient.

Required classifications:

```text
A_LABELED_RESPONSE_CUSTODY_IS_ROUTE_SUFFICIENT_ON_AB_BA_DOMAIN
A_LABELED_RESPONSE_CUSTODY_IS_D6_INSUFFICIENT_ON_DECLARED_UNIVERSE
```

## 4. B-response-only action-labeled custody

Project each record to its action-labeled scalar response for B.

```text
AB -> 4
BA -> 3
FROZEN -> 3
```

On R={AB,BA}, B-only custody separates route labels.

On U, the value `3` fiber contains:

```text
BA      D6=true
FROZEN  D6=false
```

so B-only custody is not D6-sufficient.

Required classifications:

```text
B_LABELED_RESPONSE_CUSTODY_IS_ROUTE_SUFFICIENT_ON_AB_BA_DOMAIN
B_LABELED_RESPONSE_CUSTODY_IS_D6_INSUFFICIENT_ON_DECLARED_UNIVERSE
```

## 5. Full action-indexed response custody control

Project to `[A,B]`.

Required:

```text
AB      -> [2,4]
BA      -> [3,3]
FROZEN  -> [2,3]
```

The full action-indexed response view must be sufficient for D6 on U and route label on R.

This control prevents the assay from confusing the crossed partial-custody result with contradiction in the parent event record.

## 6. Action-set-only custody hostile

Erase order, responses, endpoint, and transition state while retaining only the fact that both actions A and B occurred.

Every record projects to:

```text
{A,B}
```

Required:

```text
action-set-only is D6-insufficient on U
action-set-only is route-insufficient on R
```

The chamber may not reconstruct erased responses or route order from the action set.

## 7. Finite factorization rule

Reuse the finite rule from #709:

```text
claim F factors through projection C
iff
F is constant on every C-fiber over the declared claim domain.
```

Every factorization result must record its domain explicitly.

No generic sufficient-statistic theorem follows.

## 8. Hostiles

Fail/reject if:

```text
H1 parent #709 gauntlet does not pass but partial-custody claims are emitted
H2 route-domain R and decision-domain U are silently exchanged
H3 endpoint equality is used to assert route equality
H4 A-only or B-only route separation is promoted to D6 sufficiency despite explicit collision with FROZEN
H5 action labels are erased and later silently reconstructed
H6 action-set-only custody is treated as containing response or order information
H7 full custody control fails while partial-custody claims still pass
H8 finite factorization is promoted to generic sufficient-statistic/information theorem
H9 path/category/groupoid/transport/connection/holonomy/curvature/Berry/quantum language is promoted
H10 A16/live Ash/merge/production/Vercel authority widens
```

## 9. Success criteria

```text
P1 parent #709 passes
P2 explicit U and R domains are preserved
P3 endpoint-only factors D6 on U
P4 endpoint-only does not factor route label on R
P5 A-only factors route label on R
P6 A-only does not factor D6 on U
P7 B-only factors route label on R
P8 B-only does not factor D6 on U
P9 full [A,B] custody factors D6 on U and route label on R
P10 action-set-only factors neither D6 on U nor route on R
P11 claim ceiling remains closed
```

## 10. Canonical bounded claim candidate

If exact-head witness succeeds:

```text
IN_THE_AUTHORED_FINITE_ROUTE_FIXTURE_PARTIAL_EVENT_CUSTODY_IS_CLAIM_CONDITIONED_IN_BOTH_DIRECTIONS_ENDPOINT_ONLY_CUSTODY_PRESERVES_THE_DECLARED_D6_DECISION_WHILE_ERASING_AB_VS_BA_ROUTE_HISTORY_WHEREAS_EITHER_SINGLE_ACTION_LABELED_RESPONSE_DISTINGUISHES_AB_FROM_BA_BUT_FAILS_TO_PRESERVE_D6_OVER_THE_FULL_DECLARED_UNIVERSE
```

Research classification:

```text
CROSSED_CLAIM_CONDITIONED_PARTIAL_EVENT_CUSTODY
```

## 11. Claim ceiling

Still false / unauthorized:

```text
generic sufficient-statistic theorem
generic information-loss theorem
Shannon information/channel/capacity claim
causal history reconstruction theorem
general path-dependence theorem
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

## 12. Mandatory human seam

If this chamber survives exact-head witness + receipt, stop.

The empirical question has shifted from whether claim-conditioned projections exist to **what object TD613 should canonically compose** if a later path/transport grammar is opened.

The human `𝄐` must precede any such ontology.

𝌋

Sealed ⟐