# A15-R0 · Finite Task-Topology Rigidity / Birkhoff Dual Execution Burden v0.1

Status: PREREGISTERED BEFORE THEOREM IMPLEMENTATION.

Exact scientific parent:

```text
#872 / d76ab8a3166916ebed1d189eee01343233ee3cfd
```

The successor is finite and exhaustive. No sampling claim is permitted.

## Parent replay burden

The implementation must consume the earned #872 canonical certificate and independently reconstruct the closure/topology object from its exact 32-subset table rather than hard-code the 12 expected states as the result.

Required inherited finite inputs:

```text
5 task points
32 task subsets
12 earned closed states
4 earned task dependency cover edges
```

## Topology burden

```text
32 closure rows checked against the parent certificate
12 closed states deduplicated
12 open complements constructed
12 x 12 closed-set pair lattice checks = 144
5 principal closures
5 minimal-open neighborhoods
5 intrinsic local point fingerprints
12 clopen membership checks
10 unordered point-separation checks for T0/T1 classification
```

## Lattice/Birkhoff burden

```text
12 x 12 strict-order comparisons for cover extraction = 144 relation cells
18 expected lattice Hasse covers
12 lower-cover counts
12 upper-cover counts
5 expected join-irreducibles
5 expected meet-irreducibles
5 x 5 join-irreducible order comparisons = 25 relation cells
12 Birkhoff image constructions
all downsets of a 5-point poset: 2^5 = 32 candidate subsets examined
12 expected valid downsets
12 expected exact image matches
0 expected collisions
```

## Rigidity burden

All task-point permutations are enumerated exactly:

```text
5! = 120 permutations
25 ordered specialization-relation cells per permutation
3,000 relation-preservation truth comparisons
```

Expected preserving automorphisms:

```text
identity    1
nonidentity 0
```

The hostile must retain every preserving permutation if the expected rigidity fails.

Independent local-fingerprint control:

```text
5 principal-closure cardinalities
5 minimal-open cardinalities
5 paired fingerprints
expected duplicate fingerprint pairs = 0
```

## Specialization/generator synthesis burden

```text
25 specialization-order relation cells
4 specialization Hasse covers
5 maximal/minimal point classifications
all 32 task subsets checked for full closure
expected unique inclusion-minimal full generator = {R,M}
expected specialization maximal-point set = {R,M}
```

## Hostile requirements

The independent hostile must rebuild from the parent closure table before reading the child certificate and must attack at least:

1. A nonidentity task permutation preserving the closure system.
2. A duplicate intrinsic point fingerprint.
3. A failure of the 12-state Birkhoff downset bijection.
4. A join-irreducible or meet-irreducible count mismatch.
5. A specialization-order cover mismatch.
6. A generator/maximal-point mismatch.
7. False T1 classification.
8. False disconnected classification.
9. Any attempt to identify the finite task topology with model-state, physical, causal, ancestry, source-truth, or semantic-name topology.

## Authority membrane

Execution of this finite burden cannot by itself authorize merge, deployment, publication, production, release, Vercel, source-state mutation, Proto-Loom/A16, #788 promotion, physical topology, continuum topology, Shannon/entropy/mutual-information claims, category/functor claims, or universal task-identifiability claims.

Sealed ⟐