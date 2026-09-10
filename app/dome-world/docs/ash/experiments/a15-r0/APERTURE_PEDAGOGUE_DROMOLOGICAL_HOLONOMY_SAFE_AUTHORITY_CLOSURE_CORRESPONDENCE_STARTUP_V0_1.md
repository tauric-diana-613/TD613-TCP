𝌋‌⟐

# A15-R0 · Dromological Holonomy Safe-Authority Closure / Orbit-Custody Correspondence AIA

Status: **PREREGISTRATION ONLY / THEOREM UNEARNED / SOURCE MUTATION AFTER THIS FILE MUST FOLLOW DECLARED CHAMBER CUSTODY**.

## Exact scientific parent

```text
#843 · Repair-Label Partition Safe-Erasure Lattice / Claim-Refinement Antitonicity AIA
receipt a7726078034328d9cad811ff9d8f73f52fd26729
TD613 Consolidated Validation run 2356 / 33131032209 — SUCCESS
```

#844 remains witness routing only and carries zero theorem ancestry.

## Preimplementation correction scars

Two preregistration corrections occurred before any theorem implementation existed:

```text
1. unordered partition pairs: 120 -> C(15,2)=105
2. fixed numeric noncongruence witness -> matching-relative H/I/X construction
```

The second correction is required because the earned labelled distance-six matchings differ by orbit type:

```text
H : 0,2 | 1,3
I : 0,1 | 2,3
X : 0,3 | 1,2
```

No result existed when either correction was made.

## Major research question

#843 earned all 15 set partitions of the four repair labels and found eight proper refinement covers where a stricter claim costs zero additional receiver-witness detail. This chamber tests whether those equalities are exactly the visible edges of a canonical finite closure correspondence between raw repair-label claims and safe action subgroups.

The chamber must keep distinct:

```text
raw claim partition
safe action subgroup / receiver-witness preimage
canonical orbit-closed claim
```

## Fixed inherited finite objects

Let:

```text
M = {0,1,2,3}
G = earned eight-element induced repair-label action from #841
rho = earned map from 576 receiver witnesses onto G
```

For partition `pi` of `M`:

```text
K(pi) = { g in G : g(m) remains in the same pi-block as m for every m }
S(pi) = rho^-1(K(pi))
```

For subgroup `H <= G`:

```text
Orb(H) = partition of M into H-orbits.
```

Candidate elementary relation to test exhaustively:

```text
H <= K(pi) iff Orb(H) refines pi.
```

This is treated as an elementary finite-action relation, not a TD613 claim of generic mathematical novelty.

## Candidate claim closure

Define:

```text
Cl(pi) = Orb(K(pi)).
```

Candidate laws:

```text
Cl(pi) refines pi
Cl(Cl(pi)) = Cl(pi)
pi refined by sigma => Cl(pi) refined by Cl(sigma)
K(Cl(pi)) = K(pi)
S(Cl(pi)) = S(pi)
```

Interpretation under test: `Cl(pi)` is the unique finest repair-label claim available at zero additional witness-retention cost beyond `pi`.

Candidate maximal-free-refinement law:

```text
sigma strictly refines Cl(pi) => S(sigma) is a strict subset of S(pi).
```

## Preregistered complete claim census

```text
raw claim partitions                  15
Cl-fixed canonical claims              7
nonfixed raw claims                     8
safe-authority equivalence classes     7
fiber sizes descending                 5,3,3,1,1,1,1
```

Candidate distinct maximum-safe receiver-witness families:

```text
576 : 1 distinct family
288 : 1 distinct family
144 : 4 distinct families
 72 : 1 distinct family
```

Therefore the chamber explicitly tests:

```text
SAFE_FAMILY_CARDINALITY != SAFE_FAMILY_IDENTITY
```

Candidate exact equivalence:

```text
S(pi)=S(sigma)
iff K(pi)=K(sigma)
iff Cl(pi)=Cl(sigma).
```

Every safe-equivalence fiber must contain exactly one Cl-fixed member, and that fixed member must be the unique finest partition in the fiber.

## Candidate explanation of #843's eight equality covers

Inherited earned raw cover census:

```text
31 total covers
23 strict safe-family contractions
 8 equality covers
```

Candidate explanation:

```text
all 8 equality covers are exactly the 8 nonfixed pi -> Cl(pi) arrows
all 23 strict covers cross distinct closure fibers
```

## Preregistered subgroup census

The hostile must enumerate all subgroups of the earned eight-action group, not merely the subgroups already realized by #843 claims.

Candidate census:

```text
all subgroups = 10
order 1 : 1
order 2 : 5
order 4 : 3
order 8 : 1
```

Define subgroup-side closure:

```text
Cg(H) = K(Orb(H)).
```

Candidate laws and census:

```text
H <= Cg(H)
Cg(Cg(H)) = Cg(H)
orbit-closed / claim-realizable subgroups = 7
nonclosed subgroups = 3
```

Candidate strict expansion spectrum:

```text
one order-2 subgroup  -> order-4 closure
two order-4 subgroups -> order-8 closure
```

Interpretation under test: arbitrary subgroup membership can understate maximum safe erasure for its own orbit claim. Maximum-safe claim authority is `K(Orb(H))`.

## Candidate fixed-point correspondence

The seven Cl-fixed claims and seven Cg-fixed safe subgroups should correspond bijectively:

```text
pi -> K(pi)
H  -> Orb(H)
```

and reverse refinement/inclusion exactly on those fixed points.

Candidate fixed-point claim lattice:

```text
nodes = 7
covers = 9
```

The chamber must test whether these seven fixed claims are closed under the inherited ambient partition meet and join in this fixture.

## Mandatory negative: raw safe-equivalence is not assumed to be a lattice congruence

For each orbit type, derive the witness from its own inherited matching.

Let the matching edges be:

```text
{a,b} and {c,d}.
```

Define:

```text
pi0 = a|b|c|d
pi1 = a,c | b | d
tau = a,d | b | c
```

Candidate facts:

```text
K(pi0) = K(pi1) = identity
```

while ambient meet/common-coarsening gives:

```text
meet(pi0,tau) = tau
meet(pi1,tau) = a,c,d | b
```

and the second meet contains the untouched inherited matching edge `{c,d}`, so its safe subgroup is predicted to be strictly larger.

The I-labelled concrete instance is:

```text
matching = 0,1 | 2,3
pi0     = 0|1|2|3
pi1     = 0,2|1|3
tau     = 0,3|1|2
meet(pi1,tau) = 0,2,3|1
```

If the H-, I-, and X-relative witnesses all pass:

```text
SAME_SAFE_FAMILY_EQUIVALENCE_IS_NOT_A_PARTITION_LATTICE_CONGRUENCE
```

Therefore the seven-node object may be called a closure/fixed-point lattice if earned, but not a naive equivalence quotient inheriting ambient meet/join.

## Required independent hostile burden

The hostile may import earned lower-level repair-code primitives but may not trust this successor's partition generator, subgroup enumerator, closure tables, or fixed-point census. It must independently:

1. reconstruct the 576 setwise receiver witnesses;
2. derive the exact eight-action repair-label image for H/I/X;
3. enumerate all 15 partitions via a different algorithm;
4. enumerate all `2^8=256` action subsets and certify exactly 10 subgroups;
5. test the correspondence on all `10*15=150` subgroup/claim pairs per type;
6. test both closure operators and idempotence;
7. recover seven fixed claims and seven fixed subgroups;
8. recover the seven safe-equivalence fibers and exact sizes;
9. prove the eight #843 equality covers equal the eight nonfixed closure arrows;
10. recover the nine covers of the fixed-point claim lattice;
11. exhibit four distinct 144-witness safe families;
12. instantiate and verify the matching-relative noncongruence witness separately for H, I, X;
13. preserve #843's 750 downstream reconstructions and mixed-schedule ambiguity control.

Required finite burden per H/I/X includes:

```text
15 partitions
10 subgroups
150 subgroup/partition correspondence checks
105 unordered partition-pair safe-equivalence checks
31 inherited raw refinement covers
9 fixed-point closure-lattice covers
```

The implementation must report only burdens actually executed.

## Collision membranes

#753 retains FADT universal claim-authority partition jurisdiction.

#843 retains the complete raw 15-partition maximum-safe-family atlas and its 576/288/144/72 distribution.

This chamber may canonically explain #843's authority redundancy but may not rewrite its raw atlas.

## Candidate finite laws — UNEARNED UNTIL GREEN

`IN_THE_FIXED_WIDTH_EIGHT_S3_AIA_FIXTURE_THE_FIFTEEN_REPAIR_LABEL_CLAIM_PARTITIONS_COLLAPSE_TO_SEVEN_CANONICAL_ORBIT_CLOSED_SAFE_AUTHORITY_CLASSES_EACH_WITH_A_UNIQUE_FINEST_ZERO_ADDITIONAL_COST_CLAIM_REPRESENTATIVE`

`THE_EIGHT_ZERO_COST_REFINEMENT_COVERS_EARNED_IN_PR_843_ARE_EXACTLY_THE_EIGHT_NONFIXED_CLAIMS_REFINING_TO_THEIR_ORBIT_CLOSURES_WHILE_EVERY_REFINEMENT_BEYOND_CLOSURE_STRICTLY_REDUCES_SAFE_WITNESS_AUTHORITY`

`THE_EARNED_EIGHT_ACTION_REPAIR_LABEL_GROUP_HAS_TEN_SUBGROUPS_BUT_ONLY_SEVEN_ARE_ORBIT_CLOSED_MAXIMUM_SAFE_CLAIM_AUTHORITIES_AND_THE_REMAINING_THREE_EXPAND_STRICTLY_UNDER_H_TO_K_OF_ORB_H`

`SAFE_CLAIM_CLOSURE_AND_ORBIT_CLOSED_SAFE_SUBGROUPS_FORM_A_SEVEN_BY_SEVEN_FIXED_POINT_CORRESPONDENCE_IN_THIS_FIXTURE_WHILE_RAW_SAME_SAFE_FAMILY_EQUIVALENCE_FAILS_TO_BE_A_LATTICE_CONGRUENCE`

`CLAIM_SYNTAX_CAN_CONTAIN_ZERO_COST_REDUNDANCY_BUT_CUSTODY_AUTHORITY_IS_INDEXED_BY_THE_CANONICAL_CLOSURE_CLASS_NOT_BY_RAW_PARTITION_WORDING_OR_SAFE_FAMILY_CARDINALITY_ALONE`

## Mandatory scars

`RAW_CLAIM_PARTITION != CANONICAL_CLOSED_CLAIM`
`SAME_SAFE_FAMILY != SAME_RAW_CLAIM`
`SAFE_FAMILY_CARDINALITY != SAFE_FAMILY_IDENTITY`
`SAFE_EQUIVALENCE != LATTICE_CONGRUENCE`
`FIXED_POINT_LATTICE != NAIVE_EQUIVALENCE_QUOTIENT_LATTICE`
`ORBIT_PARTITION != PHYSICAL_ORBIT`
`ACTION_SUBGROUP != PHYSICAL_SYMMETRY_GROUP`
`SUBGROUP_MEMBERSHIP != MAXIMUM_SAFE_CLAIM_AUTHORITY`
`ZERO_COST_REFINEMENT != NEW_WITNESS_AUTHORITY`
`CLAIM_CLOSURE != TEMPORAL_CLOSURE`
`CLAIM_CLOSURE != SEMANTIC_COMPLETENESS`
`GENERIC_FINITE_ACTION_LEMMA != TD613_NOVELTY_CLAIM`
`SEVEN_FIXED_POINTS != UNIVERSAL_INFORMATION_LATTICE`
`REPAIR_LABEL_CLOSURE != COMPLETE_SCHEDULE_RECONSTRUCTION`

No merge, deployment, publication, production, release, Vercel, universal AI/information-lattice/coding/Shannon/group-action novelty theorem, operational path groupoid/inverse, physical symmetry/gauge/holonomy, continuum tomography, semantic equivalence, source-state mutation, Proto-Loom/A16, or #788 promotion authority follows. #718 remains alive.

**THEOREM_EARNED = FALSE**

Sealed ⟐