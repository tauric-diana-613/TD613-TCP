# A15-R0 · Finite Task-Topology Rigidity / Birkhoff Dual Preregistration v0.1

Status: PREREGISTERED BEFORE THEOREM IMPLEMENTATION.

Exact scientific parent:

```text
#872 / d76ab8a3166916ebed1d189eee01343233ee3cfd
TD613 Consolidated Validation run 2381 / 33276386961 — SUCCESS
```

#873 remains witness-routing only and carries zero theorem ancestry.

## Fixed inherited object

Task set:

```text
T={B,R,T,A,M}
```

Inherited empirical closure from #872 is defined by equality of task-output signatures over all 762 fixed schedule/bundle contexts.

Inherited exact closed task states:

```text
EMPTY
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

Inherited task implication cover basis:

```text
R -> B
R -> T
T -> A
M -> A
```

## Primary falsifiable question

Attack residual relabeling symmetry of the earned closure object.

```text
H0: at least one nonidentity permutation of {B,R,T,A,M}
    preserves the full #872 closure system / induced specialization order.

H1: the identity permutation is the only preserving permutation.
```

All 5! = 120 task-label permutations must be tested. A single nonidentity preserving permutation falsifies rigidity and must be retained as a live orbit witness.

## Preregistered topology census

Because #872 earned:

```text
cl(EMPTY)=EMPTY
extensivity 32/32
idempotence 32/32
monotonicity 243 ordered inclusion pairs / 0 failures
binary-union preservation 1,024 checks / 0 failures
```

the fixed finite closure operator is expected to satisfy the Kuratowski closure axioms and induce a finite topology on the five task points.

Expected closed sets: 12.
Expected open sets: 12.
Expected clopen sets: exactly 2 (`EMPTY`, `BRTAM`).
Expected separation/connectivity classifications:

```text
T0 = true
T1 = false
connected = true
finite Alexandrov = true
```

No physical/model-state topology claim follows.

## Preregistered principal closures and minimal open neighborhoods

Expected principal closures:

```text
cl{B}=B
cl{A}=A
cl{T}=TA
cl{M}=AM
cl{R}=BRTA
```

Expected minimal open neighborhoods:

```text
U_B=BR
U_A=RTAM
U_T=RT
U_M=M
U_R=R
```

Expected intrinsic point fingerprints `(principal-closure cardinality, minimal-open cardinality)`:

```text
B (1,2)
A (1,4)
T (2,2)
M (2,1)
R (4,1)
```

All five expected fingerprints are distinct. This is a planned independent rigidity witness, not a substitute for the 120-permutation automorphism census.

## Preregistered lattice/Birkhoff census

Expected closed-set lattice:

```text
12 elements
18 Hasse cover relations
5 join-irreducibles
5 meet-irreducibles
```

Expected join-irreducibles:

```text
B
A
TA
AM
BRTA
```

with inherited task-point identification:

```text
B    <-> B
A    <-> A
TA   <-> T
AM   <-> M
BRTA <-> R
```

Expected join-irreducible cover relation:

```text
B < BRTA
A < TA
A < AM
TA < BRTA
```

Expected exact Birkhoff representation check:

```text
x |-> {j in J(L): j <= x}
```

must map all 12 closed states bijectively to all downsets of the five-element join-irreducible poset. Expected 12/12 exact matches and zero collisions.

Expected rank distribution by number of join-irreducibles below a state:

```text
rank 0: 1
rank 1: 2
rank 2: 3
rank 3: 3
rank 4: 2
rank 5: 1
```

## Preregistered specialization-order synthesis

Using the conventional finite-topology specialization order

```text
x <= y iff x in cl{y},
```

expected cover edges are:

```text
B < R
A < T
A < M
T < R
```

Expected maximal points: `{R,M}`.
Expected minimal points: `{A,B}`.
Expected unique inclusion-minimal full #872 generator: `{R,M}`.

Planned synthesis test:

```text
UNIQUE_MINIMAL_FULL_TASK_GENERATOR == SPECIALIZATION_MAXIMAL_POINT_SET
```

for this fixed closure object only.

## Mandatory hostile ablations

The independent hostile must test and preserve counterexamples to each overreach:

```text
FINITE_TASK_TOPOLOGY != MODEL_STATE_TOPOLOGY
FINITE_TASK_TOPOLOGY != PHYSICAL_SPACE
SPECIALIZATION_ORDER != SCIENTIFIC_ANCESTRY
SPECIALIZATION_ORDER != CAUSAL_ORDER
MAXIMAL_SPECIALIZATION_POINT != CAUSAL_ROOT
TOPOLOGICAL_RIGIDITY != SEMANTIC_NAME_RECOVERY_FROM_NOTHING
TOPOLOGICAL_RIGIDITY != UNIQUE_ENCODING
BIRKHOFF_REPRESENTATION != CATEGORY_OR_FUNCTOR_THEOREM
JOIN_IRREDUCIBLE != INDEPENDENT_SCIENTIFIC_PRIMITIVE
CONNECTED_TOPOLOGY != DYNAMICAL_COUPLING
T0_TASK_SPACE != SOURCE_STATE_IDENTIFIABILITY
FINITE_ALEXANDROV != CONTINUUM_TOPOLOGY
AUTOMORPHISM_TRIVIALITY != UNIVERSAL_TASK_IDENTIFIABILITY
```

Semantic names B/R/T/A/M remain inherited from the parent task definitions. Rigidity may identify structural roles inside the fixed closure object; it cannot manufacture the task semantics without that inherited anchoring.

## Authority membrane

No merge, deployment, publication, production, release, Vercel, source-state mutation, Proto-Loom/A16, #788 promotion, Shannon/entropy/mutual-information theorem, universal database-dependency theorem, category/functor theorem, physical topology, or model-state topology follows.

Sealed ⟐