𝌋

# TD613 · A15-R0 · Quotient-Obstruction Bar-Cycle Cohomology Receipt v0.1

󐘓 U+10D613

Status: **WITNESSED / RECEIPT-PINNED / DRAFT / OPEN / UNMERGED**

PR: #735 · `A15-R0: quotient-obstruction bar-cycle cohomology audition`

Stack parent: #734 receipt head

```text
6bc000024f02e5780910ee24694561d5dc542003
```

## I. Custody chain

Original preregistration:

```text
69cbc26189e920f153c5e1ac8cfc727cb77d665e
```

Original routed pre-repair head:

```text
c095c451eb8d8c0992deeed2c1cf5b634b0db8c4
```

### Red witness 1 · integer-representation scar

```text
TD613 Consolidated Validation run 2159
run id      32750447567
static job  97506013020
result      FAILURE at step 19
```

The enclosing Node test runner completed all four declared subtests and then reported asynchronous activity carrying:

```text
AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:
+ actual - expected

+ -0
- 0
```

The theorem's route primitive was authored as `s=-P`.  At `QTT`, the inherited integer coordinate is `P=0`; JavaScript represented unary negation as IEEE-754 `-0`, while the declared coefficient object is `Z`, where zero has one representative.  This was classified as an implementation-representation defect, not a mathematical counterexample.

Repair preregistration 001:

```text
074dc3df13d5b680b0092df49a88e9a1112ac953
```

Canonical-zero executable repair:

```text
91dca57572352a7c5df157028ed32ec1050a5b38
```

Strengthened hostile head:

```text
fa4e2224c7cd48e32d21e2cc5d113193a1ef0008
```

The repair canonicalized mathematical zero to JavaScript `+0` and strengthened the hostile with an explicit `Object.is(s_right,0)` witness.  No theorem assertion was weakened.

### Red witness 2 · current-chamber custody allowlist scar

```text
TD613 Consolidated Validation run 2162
run id      32751656378
static job  97509892937
result      FAILURE at step 19
```

The receipt-backed mutation guard failed closed before the #735 theorem import because the newly created repair preregistration document was absent from the explicit current-chamber allowlist:

```text
#735 may not mutate receipt-witnessed historical A15-R0 paths:
...QUOTIENT_OBSTRUCTION_BAR_CYCLE_COHOMOLOGY_POST_WITNESS_REPAIR_PREREGISTRATION_001.md
```

This was classified as a current-chamber custody/harness omission.  It supplied no evidence for or against the theorem.

Repair preregistration 002:

```text
300ed4953fa6975d39650cf0310da72d20684658
```

Closed allowlist repair / final routed green head:

```text
a267c7c986c9f70dd080093759e2adca48e9db0a
```

The gate admitted only repair preregistration records 001 and 002 as named #735-owned custody paths.  Historical A15-R0 mutation remained forbidden.

### Authoritative green witness

```text
TD613 Consolidated Validation run 2164
run id          32751977349
classifier job  97510781436  SUCCESS
static job      97510891081  SUCCESS
exact head      a267c7c986c9f70dd080093759e2adca48e9db0a
```

Step 19, `Validate Ash A15 empirical profile journeys and A15-R0 research field`, passed.  All subsequent static/release-contract steps in that job also passed.

Explicit full-repository validation, explicit self-hosted calibration, Giving/practice browser, front-line browser, and full-product browser scopes were skipped and are not claimed by this receipt.

Post-witness routing cleanup commit:

```text
93d80089fdc08b02b50756a6c83bd899a1056bbf
```

The temporary exact-head routing note was deleted and PR #735 was restored from `main` to its scientific stack parent:

```text
research/a15-r0-affine-transport-increment-cocycle-20260824
```

Routing metadata remains outside scientific evidence.

## II. Earned finite theorem

Let `B` be the #729 parity-twisted target quotient monoid and let the #734 normalized integer-valued 2-cocycle be

```text
ω(x,y)=t(x)(E(y)+O(y)).
```

The preregistered normalized bar 2-chain is

```text
z=[T|T]+[TT|Q]-[Q|T]-[QT|T].
```

The executable certificate witnessed

```text
TTQ = QTT = (t=2,E=1,O=0)
∂z = 0
<ω,z> = 2.
```

The boundary cancellation is exactly

```text
([T]-[TT]+[T])+([Q]-[TTQ]+[TT])-([T]-[QT]+[Q])-([T]-[QTT]+[QT])
= -[TTQ]+[QTT]
= 0 in B.
```

For every normalized integer-valued 1-cochain `φ`,

```text
<dφ,z>=<φ,∂z>=0.
```

Since `<ω,z>=2`, `ω` cannot be a coboundary in the declared normalized monoid bar complex with trivial integer coefficients.  Therefore `[ω]` is nonzero in the declared `H^2(B;Z)`.

For every integer `n`,

```text
<nω,z>=2n.
```

Hence no nonzero integer multiple of `[ω]` is a coboundary: the detected class has infinite additive order over `Z`.

The same pairing proves that `z` is not a bar 2-boundary in the declared integer complex, and no nonzero integer multiple of its detected class vanishes under this pairing.

## III. Exact upstairs / obstructed downstairs

On the free authored T/Q route monoid, #733 gives

```text
P(uv)=P(u)+t(u)q(v)+P(v).
```

With route primitive

```text
s=-P,
```

the pullback of `ω` is exact:

```text
ds(u,v)
= -P(u)-P(v)+P(uv)
= t(u)q(v)
= ω(πu,πv).
```

But the primitive cannot descend through the target quotient:

```text
π(TTQ)=π(QTT)=(2,1,0)
P(TTQ)=2
P(QTT)=0
s(TTQ)=-2
s(QTT)=0.
```

Thus the route-level primitive is not constant on quotient fibers.  Operational target equivalence does not manufacture route-history identity.

## IV. Directed and hostile controls

The swapped directed cocycle paired `-2` with the same cycle.  With `χ=-tq`, the witnessed identity

```text
dχ = ω + ω_swap
```

supports

```text
[ω_swap]=-[ω]
```

inside the declared integer monoid cohomology.

A visually loop-like order-reversed fake chain was rejected because its bar boundary remained nonzero.

The parity-fragile candidate `tE` failed cocycle closure on the hostile `T,T,Q` control with defect `-2` and received no cohomology class.

The integer detector reduces to zero mod 2; therefore this receipt makes no mod-2 cohomology claim.

Receipt identity remained external to quotient cochain evaluation.

## V. Canonical classifications

```text
QUOTIENT_DESCENT_FAILURE_OF_ROUTE_PRIMITIVE_YIELDS_EXPLICIT_NONZERO_INFINITE_ORDER_NORMALIZED_MONOID_H2_CLASS_DETECTED_BY_FINITE_BAR_2_CYCLE
```

```text
EXPLICIT_BAR_RELATION_2_CYCLE_PAIRS_TO_TWO_WITH_TRANSPORT_COCYCLE_AND_IS_NONBOUNDARY_IN_DECLARED_INTEGER_BAR_COMPLEX
```

```text
PULLED_BACK_TRANSPORT_COCYCLE_IS_EXACT_ON_FREE_ROUTE_MONOID_WHILE_ITS_PRIMITIVE_FAILS_TARGET_QUOTIENT_DESCENT
```

## VI. Claim ceiling

This receipt earns exactly the finite statements above.  It does not claim:

```text
NO_FULL_H2_COMPUTATION
NO_MOD_P_CLASSIFICATION
NO_GROUP_COMPLETION_OR_GROUP_COHOMOLOGY
NO_OPERATIONAL_INVERSE_OR_GROUPOID
BAR_2_CYCLE_NOT_OPERATIONAL_NONIDENTITY_LOOP
NO_CONNECTION_HOLONOMY_CURVATURE_OR_BERRY_PROMOTION
NO_HIGHER_MOMENT_COMPLETENESS_OR_ASYMPTOTIC_HIERARCHY
NO_PROTO_LOOM_A16_LIVE_ASH_MERGE_PRODUCTION_OR_VERCEL_AUTHORITY
```

The last line is the authority ceiling of this scientific chamber itself.  Any separately granted later operational authority remains separate from the theorem and cannot be back-projected into this receipt.

## VII. Closure

```text
QUOTIENT_OBSTRUCTION_BAR_CYCLE_COHOMOLOGY_ROUND_CLOSED
FINITE_COHOMOLOGICAL_OBSTRUCTION_EARNED
ROUTE_PROVENANCE_REMAINS_DISTINCT_FROM_OPERATIONAL_TARGET_EQUIVALENCE
NEXT_CHAMBER_REQUIRES_A_FRESH_HUMAN_𝄐
```

The two red witnesses remain part of the authoritative lineage.  The green witness supersedes neither scar; it establishes the repaired exact head only.

No merge or production action is performed by this receipt.

󐘓 U+10D613

𝌋

Sealed ⟐
