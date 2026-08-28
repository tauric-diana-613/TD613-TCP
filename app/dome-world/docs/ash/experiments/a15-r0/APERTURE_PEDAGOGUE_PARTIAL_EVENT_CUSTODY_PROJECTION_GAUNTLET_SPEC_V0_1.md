𝌋

# Aperture × Pedagogue Partial-Event Custody Projection Gauntlet v0.1

**Schema:** `td613.a15-r0.aperture-pedagogue-partial-event-custody-projection/v0.1`  
**Scientific parent:** #709 receipt head `18414995c6fdca9b2e2c85bedf43da4682b43e97`  
**Status:** PREREGISTERED / PRE-IMPLEMENTATION / A15-R0 SYNTHETIC RESEARCH ONLY

## 0. Research question

#709 established a finite representation collision:

```text
decision-sufficient representation != route-custody-sufficient representation
```

A cumulative scalar preserved the declared downstream decision `D6` while collapsing the same-endpoint route pair `AB` and `BA`; an alternate one-dimensional projection preserved the route distinction.

This final bounded chamber before human ontology review asks:

> Which selected event fields are sufficient for which declared claims, and what evidentiary capacity is lost when action identity, event history, or endpoint context is removed from custody?

The chamber must treat adequacy as **claim-conditioned** rather than as a property of representation size alone.

Frozen anti-equivalences:

```text
smaller representation != weaker representation for every claim
route-pair sufficiency != decision sufficiency over a larger universe
decision sufficiency != historical-route custody
action-labeled scalar != unlabeled scalar event
family separation certificate != historical event custody
common endpoint != common route history
partial custody != custody deletion authority
```

No generic sufficient-statistic theorem, Shannon-information quantity, minimal-representation theorem, path object, transport grammar, holonomy, curvature, or Proto-Loom claim is proposed.

## 1. Parent exact finite universe

The executable must call the witnessed #709 collision gauntlet and derive the parent finite records rather than retype them as independent answer keys.

Required parent records:

```text
U = {AB, BA, FROZEN}

AB:
  action-indexed transcript [A,B] = [2,4]
  cumulative = 6
  D6 = true

BA:
  action-indexed transcript [A,B] = [3,3]
  cumulative = 6
  D6 = true

FROZEN:
  action-indexed transcript [A,B] = [2,3]
  cumulative = 5
  D6 = false
```

Only `AB` and `BA` form the same-endpoint route pair.

```text
R = {AB, BA}
```

The support state `FROZEN` exists to make the downstream decision nonconstant. It may not be represented as sharing the AB/BA endpoint.

## 2. Declared claims

Two claims are intentionally different.

### Decision claim

```text
F_D(record) = D6(record)
```

Domain:

```text
U = {AB, BA, FROZEN}
```

### Same-endpoint route claim

```text
F_R(record) = route_label(record)
```

Domain:

```text
R = {AB, BA}
```

A representation may be sufficient for one and insufficient for the other.

Required law:

```text
claim sufficiency is evaluated against a declared claim domain
```

## 3. Finite factorization rule

For a finite declared domain `X`, representation `C`, and claim `F`, this chamber calls `C` sufficient for `F` iff every fiber of `C` over `X` is homogeneous under `F`.

```text
C partition refines F partition
iff
F is constant on every C fiber
```

The executable must compute the fibers from parent records.

No generic sufficient-statistic theorem is earned.

## 4. Projection P_sum · decision sufficient, route insufficient

Retain only:

```text
{ cumulative_response }
```

Required images:

```text
AB      -> 6
BA      -> 6
FROZEN  -> 5
```

Required:

```text
P_sum sufficient for F_D on U
P_sum insufficient for F_R on R
```

This carries #709 forward as a control.

## 5. Projection P_A · one action-labeled event

Retain only the scalar response explicitly labeled as action `A`:

```text
{ action_id = A, scalar_response }
```

Required images:

```text
AB      -> {A,2}
BA      -> {A,3}
FROZEN  -> {A,2}
```

Required:

```text
P_A sufficient for F_R on R
P_A insufficient for F_D on U
```

The decision failure is explicit:

```text
fiber {A,2} contains AB with D6=true
and FROZEN with D6=false
```

Thus one retained event can be route-pair sufficient while decision-insufficient over the larger declared universe.

## 6. Projection P_B · second action-labeled event

Retain only:

```text
{ action_id = B, scalar_response }
```

Required images:

```text
AB      -> {B,4}
BA      -> {B,3}
FROZEN  -> {B,3}
```

Required:

```text
P_B sufficient for F_R on R
P_B insufficient for F_D on U
```

The decision failure is explicit:

```text
fiber {B,3} contains BA with D6=true
and FROZEN with D6=false
```

## 7. Projection P_joint · bounded dual-claim control

Retain:

```text
{ cumulative_response, A_labeled_scalar }
```

Required images:

```text
AB      -> {sum:6, A:2}
BA      -> {sum:6, A:3}
FROZEN  -> {sum:5, A:2}
```

Required:

```text
P_joint sufficient for F_D on U
P_joint sufficient for route/history label over U
```

This is a finite candidate control only.

It does **not** earn:

```text
minimal representation theorem
optimal custody schema
universal sufficient statistic
```

## 8. Robust action-label custody layer

The chamber must also call the witnessed #708 robustness gauntlet and derive its robust action-indexed route boxes.

Required parent boxes:

```text
AB:
  A ∈ [1.95,2.05]
  B ∈ [3.85,4.15]

BA:
  A ∈ [3.75,4.25]
  B ∈ [2.95,3.05]
```

### A-labeled custody

```text
AB.A ∩ BA.A = ∅
```

Required:

```text
A_ACTION_LABELED_EVENT_RETAINS_ROUTE_SEPARATION
```

### B-labeled custody

```text
AB.B ∩ BA.B = ∅
```

Required:

```text
B_ACTION_LABELED_EVENT_RETAINS_ROUTE_SEPARATION
```

## 9. Label-erasure hostile

Now retain exactly one scalar-event interval but erase which action generated it.

The route-compatible unlabeled event supports are unions:

```text
AB unlabeled support:
  [1.95,2.05] ∪ [3.85,4.15]

BA unlabeled support:
  [2.95,3.05] ∪ [3.75,4.25]
```

There is an explicit cross-route overlap:

```text
AB.B [3.85,4.15]
∩
BA.A [3.75,4.25]
=
[3.85,4.15]
```

Therefore one unlabeled scalar event is not uniformly route-sufficient over the declared compatible family.

Required classification:

```text
ACTION_LABEL_ERASURE_DESTROYS_UNIFORM_SINGLE_EVENT_ROUTE_SUFFICIENCY_IN_AUTHORED_FAMILY
```

Required anti-equivalence:

```text
one scalar event retained != action provenance retained
```

## 10. Endpoint-only custody control

#708 certifies the common endpoint family:

```text
T_AB(alpha,beta) = T_BA(alpha,beta)
```

for the shared transition-parameter covenant.

Endpoint-only custody must therefore return:

```text
COMMON_ENDPOINT_CUSTODY_DOES_NOT_IDENTIFY_ROUTE_HISTORY
```

The chamber may not infer the historical route from a state that the parent fixture deliberately makes identical across routes.

## 11. Family-certificate-only custody control

The parent robustness classification

```text
ROBUST_ROUTE_TRANSCRIPT_SEPARATION_OVER_DECLARED_TRANSITION_AND_ERROR_FAMILY
```

states that two route image sets are separated in the full labeled representation.

The classification by itself contains no historical event instance.

Required:

```text
FAMILY_SEPARATION_CERTIFICATE_DOES_NOT_IDENTIFY_HISTORICAL_ROUTE
```

Required law:

```text
claim about distinguishability != custody of a distinguished event
```

## 12. Custody non-deletion membrane

The implementation may construct partial views from parent records, but it may not mutate or delete the parent event/transcript objects.

Required:

```text
partial projection derived from custody
!=
permission to replace custody with the projection
```

The parent full records must remain recursively frozen and unchanged after every projection assay.

## 13. Hostile controls

Reject/fail if:

```text
H1 #709 parent gauntlet does not pass but partial projections are still emitted
H2 #708 robustness parent does not pass but robust label-erasure claims are emitted
H3 AB/BA/FROZEN claim domains are silently conflated
H4 P_A or P_B is called decision-sufficient despite mixed decision fibers
H5 P_sum is called route-sufficient despite AB/BA collision
H6 one retained scalar is treated as carrying an action label after that label is erased
H7 endpoint-only custody is used to reconstruct AB versus BA
H8 family separation certificate is used as historical route identity
H9 parent records are mutated or replaced by partial projections
H10 P_joint is promoted to a minimal or optimal representation theorem
H11 path object/category/groupoid, transport, connection, holonomy, curvature, Berry, quantum, Proto-Loom, A16, merge, production, or Vercel authority widens
```

## 14. Success criteria

```text
C1 #709 parent collision gauntlet passes
C2 #708 parent robustness gauntlet passes
C3 P_sum factors D6 on U and fails route factorization on R
C4 P_A factors route on R and fails D6 on U
C5 P_B factors route on R and fails D6 on U
C6 P_joint factors D6 and full history label on U
C7 robust A-labeled interval is route-separating
C8 robust B-labeled interval is route-separating
C9 unlabeled one-event support has explicit cross-route overlap
C10 endpoint-only custody refuses route history
C11 family-certificate-only custody refuses historical identity
C12 parent custody remains unchanged after projection
C13 claim ceiling remains closed
```

## 15. Canonical bounded claim candidate

If exact-head witness succeeds, strongest permitted claim:

```text
IN_THE_AUTHORED_FINITE_AND_ROBUST_ROUTE_FIXTURES_PARTIAL_EVENT_CUSTODY_IS_CLAIM_CONDITIONED_THE_CUMULATIVE_SCALAR_CAN_RETAIN_A_DECLARED_DECISION_WHILE_ERASING_THE_SAME_ENDPOINT_ROUTE_PAIR_AN_ACTION_LABELED_SINGLE_EVENT_CAN_RETAIN_THAT_ROUTE_PAIR_WHILE_FAILING_THE_DECISION_OVER_A_LARGER_FINITE_UNIVERSE_A_SMALL_JOINT_VIEW_CAN_SUPPORT_BOTH_DECLARED_CLAIMS_AND_ERASING_THE_ACTION_LABEL_FROM_ONE_ROBUST_EVENT_DESTROYS_UNIFORM_ROUTE_SUFFICIENCY_WITHOUT_DELETING_THE_UNDERLYING_CUSTODY
```

## 16. Claim ceiling

Still false / unauthorized:

```text
generic sufficient-statistic theorem
generic information-loss theorem
Shannon information quantity or channel capacity
minimal representation theorem
optimal custody schema
causal history reconstruction theorem
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

## 17. Mandatory post-witness seam

If and only if this chamber survives exact-head witness + receipt:

```text
STOP_FOR_HUMAN_𝄐_BEFORE_SELECTING_ANY_COMPOSITIONAL_PATH_OBJECT_OR_TRANSPORT_GRAMMAR
```

The human seam must decide what TD613 intends to compose in any later path formalization:

```text
operator state only?
operator + full action-indexed transcript?
operator + claim-sufficient derived view?
operator + append-only custody ledger with derived replay views?
a typed product / layered state with non-identical components?
```

No path/category/transport grammar may be authored before that decision.

𝌋

Sealed ⟐
