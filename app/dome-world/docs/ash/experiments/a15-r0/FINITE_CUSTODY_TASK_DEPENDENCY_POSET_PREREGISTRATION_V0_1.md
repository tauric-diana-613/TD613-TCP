# A15-R0 · Finite Custody Task-Dependency Poset / Distributive Closure AIA

Status: **PREREGISTERED / THEOREM UNEARNED / NO IMPLEMENTATION AUTHORITY**.

Exact scientific parent:

```text
#870 / 8a17d896a74d76f284081c29badd0ec5028c5ab1
TD613 Consolidated Validation run 2379 / 33274612085 — SUCCESS
```

#871 is witness-routing only and carries zero theorem ancestry.

## 1. Fixed domain

No new source information, sensor measurement, state mutation, receiver authority, or future task is introduced.

The chamber reuses the fixed S3 AIA fixture and the 762 schedule/bundle contexts already earned through #870.

Declared task family:

```text
B = authority-birth output
R = #858 post-recompression restoration behavior
T = #860 minimum-sidecar transport behavior
A = #862 anticipatory future-horizon behavior
M = #864 two-surface marginal/alias behavior

T_ground = {B,R,T,A,M}
```

The symbols are task-output coordinates only.

```text
TASK_FUNCTIONAL_DEPENDENCY != SCIENTIFIC_ANCESTRY
TASK_FUNCTIONAL_DEPENDENCY != CAUSAL_DERIVATION
TASK_OUTPUT != THEOREM_IDENTITY
```

## 2. Empirical task closure operator

For any subset `S ⊆ T_ground`, define context equivalence

```text
Q ~_S Q' iff every task output named in S agrees on Q and Q'.
```

Define the finite observational task closure

```text
cl(S) = { X in T_ground : X is constant on every ~_S equivalence class }.
```

Thus `X ∈ cl(S)` means that, over the exact 762-context fixture only, equality on every task in `S` functionally determines equality on task `X`.

No database-wide, causal, semantic, or universal dependency theorem follows.

## 3. Complete 32-subset target table

Task letters are ordered `B,R,T,A,M`.

| S | cl(S) | partition classes |
|---|---|---:|
| ∅ | ∅ | 1 |
| B | B | 4 |
| R | BRTA | 32 |
| T | TA | 27 |
| A | A | 17 |
| M | AM | 21 |
| BR | BRTA | 32 |
| BT | BTA | 28 |
| BA | BA | 19 |
| BM | BAM | 23 |
| RT | BRTA | 32 |
| RA | BRTA | 32 |
| RM | BRTAM | 36 |
| TA | TA | 27 |
| TM | TAM | 31 |
| AM | AM | 21 |
| BRT | BRTA | 32 |
| BRA | BRTA | 32 |
| BRM | BRTAM | 36 |
| BTA | BTA | 28 |
| BTM | BTAM | 32 |
| BAM | BAM | 23 |
| RTA | BRTA | 32 |
| RTM | BRTAM | 36 |
| RAM | BRTAM | 36 |
| TAM | TAM | 31 |
| BRTA | BRTA | 32 |
| BRTM | BRTAM | 36 |
| BRAM | BRTAM | 36 |
| BTAM | BTAM | 32 |
| RTAM | BRTAM | 36 |
| BRTAM | BRTAM | 36 |

All 32 rows are preregistered before theorem implementation.

## 4. Preregistered dependency-poset target

The complete singleton functional-dependency closure must be represented by the four-edge transitive reduction

```text
R -> B
R -> T
T -> A
M -> A
```

with `R -> A` only as a transitive consequence.

Equivalent singleton closures:

```text
cl(B) = {B}
cl(R) = {B,R,T,A}
cl(T) = {T,A}
cl(A) = {A}
cl(M) = {A,M}
```

The implementation must verify that rule reachability reproduces all 32 empirical closures exactly.

Deletion necessity targets:

```text
remove R->B : 8 subset closures become wrong
remove R->T : 8 subset closures become wrong
remove T->A : 6 subset closures become wrong
remove M->A : 2 subset closures become wrong
```

Each mismatch count must be reconstructed from the full 32-subset table, not hard-coded as authority.

## 5. Twelve closed task states

Exactly twelve distinct closed sets are preregistered:

```text
∅
B
A
BA
TA
AM
BTA
BAM
TAM
BRTA
BTAM
BRTAM
```

Their induced partition-class counts are respectively:

```text
1, 4, 17, 19, 27, 21, 28, 23, 31, 32, 32, 36
```

Numbers of raw task subsets mapping to those closures are respectively:

```text
1, 1, 1, 1, 2, 2, 2, 2, 2, 8, 2, 8
```

## 6. Distributive closed-set lattice target

On the twelve empirical closed sets, preregister:

```text
meet(C,D) = C ∩ D
join(C,D) = C ∪ D
```

The union is expected already closed because the empirical closure is additive.

Exact finite burden:

```text
12 closed states
144 ordered closed-set pairs
144 / 144 unique meet+join closures
1,728 ordered closed-set triples
0 first-distributivity failures
0 second-distributivity failures
```

The hostile must check both distributive laws on all 1,728 ordered triples.

## 7. Finite Kuratowski / Alexandrov-style corollary target

Across all 32 subsets preregister:

```text
cl(∅)=∅
extensivity on 32 / 32 subsets
idempotence on 32 / 32 subsets
monotonicity on all 243 ordered inclusion pairs S⊆T
cl(S∪T)=cl(S)∪cl(T) on all 1,024 ordered subset pairs
```

If all pass, the closure is a finite Kuratowski closure on the five-task ground set; because the ground set is finite, the induced finite topology may be described as Alexandrov-style / poset-representable.

Strict ceiling:

```text
FINITE_TASK_TOPOLOGY != MODEL_STATE_TOPOLOGY
FINITE_TASK_TOPOLOGY != PHYSICAL_SPACE
FINITE_TASK_TOPOLOGY != INFORMATION_GEOMETRY
ALEXANDROV_STYLE_TASK_CLOSURE != UNIVERSAL_TOPOLOGICAL_MODEL
```

## 8. Unique inclusion-minimal full generator target

The full #870 declared behavior has 36 classes.

Preregistered generator census:

```text
R alone  = 32 classes
M alone  = 21 classes
R + M    = 36 classes = full Φ
```

Across all 32 task subsets, the expected unique inclusion-minimal subset whose closure is the full five-task family is:

```text
{R,M}
```

This means only that the two named task outputs jointly generate the already-declared five-task behavioral partition in this fixed fixture.

```text
UNIQUE_TASK_GENERATOR != UNIQUE_ENCODING
UNIQUE_TASK_GENERATOR != MINIMUM_BIT_LENGTH
UNIQUE_TASK_GENERATOR != UNIVERSAL_MINIMAL_EXPERIMENT
TASK_GENERATOR != SOURCE_INFORMATION_GENERATOR
```

## 9. Withheld-aperture necessity target

`R` alone leaves exactly four behavior classes unresolved by `M`:

```text
4 R-equivalence classes split by M
32 / 762 contexts inside those four classes
all 32 are q3-born
```

Named control:

```text
P-H-I / {X3}
R behavior shared with H-P-I / {X3}
M = (5,5,5,25x5,5x5)

H-P-I / {X3}
M = (5,5,5,9x5,9x5)
```

Thus scalar restoration behavior can agree while the two-surface marginal fibre geometry differs.

This is the preregistered finite necessity witness for retaining `M` beside `R` in the unique minimal full generator.

## 10. Mandatory hostile obligations

The independent hostile must reconstruct, before consulting the canonical successor certificate:

1. the 125-state cube, six schedules, 750 antecedents, and global fibre atlas;
2. all 127 nonempty claim bundles per schedule and all 762 contexts;
3. inherited birth and all four predecessor task-output functions;
4. every one of the 32 task-subset partitions;
5. every empirical functional closure;
6. the twelve closed states;
7. all four basis rules and each deletion mismatch census;
8. all 1,024 ordered union-law checks;
9. all 144 closed-set meet/join checks;
10. both distributive laws on all 1,728 ordered triples;
11. the unique minimal full generator census;
12. the four-class / 32-context `R`-to-`M` withheld-aperture split.

## 11. Mandatory scars

```text
TASK_FUNCTIONAL_DEPENDENCY != SCIENTIFIC_ANCESTRY
TASK_FUNCTIONAL_DEPENDENCY != CAUSAL_DERIVATION
TASK_DEPENDENCY_ORDER != TEMPORAL_ORDER
BEHAVIORAL_OUTPUT_REDUNDANCY != THEOREM_REDUNDANCY
FINITE_TASK_CLOSURE != FUTURE_TASK_CLOSURE
DISTRIBUTIVE_TASK_LATTICE != UNIVERSAL_INFORMATION_LATTICE
FINITE_TASK_TOPOLOGY != MODEL_STATE_TOPOLOGY
FINITE_TASK_TOPOLOGY != PHYSICAL_SPACE
UNIQUE_MINIMAL_TASK_GENERATOR != UNIQUE_ENCODING
UNIQUE_MINIMAL_TASK_GENERATOR != MINIMUM_BIT_LENGTH
UNIQUE_MINIMAL_TASK_GENERATOR != UNIVERSAL_MINIMAL_EXPERIMENT
R_PLUS_M_FULL_TASK_GENERATION != SEMANTIC_COMPLETENESS
TASK_CLOSURE != SOURCE_TRUTH
TASK_CLOSURE != RECEIVER_AUTHORITY
WITNESS_ROUTING != SCIENTIFIC_ANCESTRY
```

No merge, deployment, publication, production, release, Vercel, source-state mutation, Proto-Loom/A16, #788 promotion, Shannon/entropy/mutual-information theorem, category/functor theorem, physical holonomy, operational path groupoid, universal database-dependency theorem, or natural-language semantic reconstruction theorem follows.

**PREREGISTERED. THEOREM UNEARNED. IMPLEMENTATION MUST NOT CHANGE THESE TARGETS RETROACTIVELY.**

Sealed ⟐