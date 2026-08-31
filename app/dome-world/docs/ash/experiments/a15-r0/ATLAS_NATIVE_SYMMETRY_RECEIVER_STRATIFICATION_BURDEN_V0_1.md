# A15-R0 · Atlas Native-Symmetry Receiver Stratification Burden

Frozen before implementation.

Parent: `#920 / 568dbf7ff91c47361a7de9502e17a2d90063093e`.

## Refinement reconstruction

Reconstruct all 16 Boolean functions `q:V->F2` on the four-point quotient and test all 16 ordered `(u,v)` polarization cells for each candidate:

```text
16 candidates
256 polarization checks
4 admitted refinements
```

Required admitted vectors, in canonical order:

```text
0001, 0010, 0100, 0111
```

Recompute Arf bits across all six ordered symplectic bases:

```text
24 Arf checks
bits [0,0,0,1]
```

## Native symmetry reconstruction

Enumerate all 16 binary 2x2 matrices. Exactly 6 are invertible and preserve the shared beta.

Filter by the square refinements inherited from the earned parent:

```text
D native outer group O(q_D): 2 matrices
Q native outer group O(q_Q): 6 matrices
```

The parent exact-sequence certificate must independently attest that these sizes equal the corresponding quotient-action images and that the automorphism lift fibers are `[4,4]` and `[4,4,4,4,4,4]`.

## Refinement-action burden

Act by pullback on all four admitted refinements:

```text
D: 4 refinements * 2 native matrices = 8 action checks
Q: 4 refinements * 6 native matrices = 24 action checks
Total = 32
```

Required D action-count matrix:

```text
[[2,0,0,0],
 [0,1,1,0],
 [0,1,1,0],
 [0,0,0,2]]
```

Required Q action-count matrix:

```text
[[2,2,2,0],
 [2,2,2,0],
 [2,2,2,0],
 [0,0,0,6]]
```

Required native orbit profiles:

```text
D: [2,1,1]
Q: [3,1]
```

Required stabilizer vectors in refinement order `[q00,q01,q10,q11]`:

```text
D: [2,1,1,2]
Q: [2,2,2,6]
```

## Faithfulness burden

Compute the permutation of the complete four-refinement family induced by each distinct native outer matrix.

All native outer matrices must induce distinct refinement-family permutations:

```text
D: 2 distinct outer matrices -> 2 distinct family permutations
Q: 6 distinct outer matrices -> 6 distinct family permutations
```

Pairwise signature checks:

```text
D: C(2,2)=1
Q: C(6,2)=15
Total=16
0 collisions
```

The distinguished native refinement receiver must be constant under its own native group:

```text
D: q_D fixed by 2/2
Q: q_Q fixed by 6/6
```

Using the earned four-lift fibers from #920, required automorphism receiver class counts are therefore:

```text
D: 8 -> 2 -> 1
Q: 24 -> 6 -> 1
```

## Arf/orbit comparison

Required:

```text
D: Arf partition != native orbit partition
D: Arf-zero class contains exactly 2 native orbits
Q: Arf partition == native orbit partition
Q: Arf-zero class contains exactly 1 native orbit
```

The ambient six-element pairing action retains orbit profile `[3,1]`; the D-native two-element liftable subgroup strictly refines its Arf-zero orbit.

## Claim ceiling

GREEN supports symmetry-relative invariant completeness and the declared receiver stratification only for this finite four-refinement geometry and the two earned/control extension images. It does not establish a universal theorem for arbitrary quadratic spaces, outer automorphism groups, physical symmetries, or causal systems.

Sealed ⟐