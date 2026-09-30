# A15-R0 · Atlas Quadratic-Refinement Orbit Geometry · Execution Burden v0.1

Parent: exact earned #916 head `83a3eff9ceb7f29a3f4d850c36f226dacffc80d0`.

This burden is frozen before implementation.

## 1. Complete Boolean-function census

Enumerate all 16 functions `V -> F2` as four-bit vectors.

For each candidate, evaluate all 16 ordered polarization cells:

```text
q(u+v) xor q(u) xor q(v) == beta(u,v)
```

Exact burden:

```text
16 candidates x 16 ordered pairs = 256 checks
exactly 4 admitted refinements
exact admitted vectors:
0001
0010
0100
0111
```

## 2. Linear-dual reconstruction

Independently enumerate all 16 Boolean functions and test linearity on all 16 ordered addition cells.

Require exactly four linear functionals:

```text
0000
0011
0101
0110
```

For every ordered pair of admitted refinements `(q_i,q_j)`, compute `q_i xor q_j` and require exactly one member of the reconstructed linear-dual family:

```text
4 x 4 = 16 ordered translation checks
0 uniqueness failures
```

This establishes the finite affine-torsor law by exhaustive translation, not by naming coefficients in advance.

## 3. Pairing-automorphism reconstruction

Enumerate all 16 binary `2x2` matrices.

Require:

```text
6 invertible matrices
6 pairing preservers
```

Audit all 16 pairing cells for every invertible matrix:

```text
6 x 16 = 96 beta-preservation cell checks
0 failures
```

## 4. Complete action on refinement family

For all four admitted refinements and all six pairing automorphisms, compute pullback action using an independently found matrix inverse:

```text
4 x 6 = 24 action checks
```

Every image must remain inside the admitted family.

Frozen source-to-target count matrix:

```text
[[2,2,2,0],
 [2,2,2,0],
 [2,2,2,0],
 [0,0,0,6]]
```

Required orbit sizes:

```text
[3,1]
```

Required stabilizer sizes in admitted-vector order:

```text
[2,2,2,6]
```

Orbit-stabilizer identities:

```text
6/2 = 3 for each Arf-0 form
6/6 = 1 for the Arf-1 form
```

## 5. Arf orbit audit

Enumerate all ordered symplectic bases `(u,v)` with `beta(u,v)=1`.

Require exactly 6.

For each of four refinements and all six bases, compute the two-dimensional Arf bit `q(u) q(v)`:

```text
4 x 6 = 24 Arf checks
0 basis-dependence failures
```

Frozen classification:

```text
q00,q01,q10 -> Arf 0
q11         -> Arf 1
```

The Arf partition must coincide exactly with the action-orbit partition.

## 6. D/Q inherited witness placement

From exact earned #916 require:

```text
D q = [0,0,0,1] = q00
Q q = [0,1,1,1] = q11
same parent polar form
zero parent cross q-isometries
```

Then require:

```text
D and Q lie in different pairing-automorphism orbits
```

## Claim ceiling

A GREEN run may earn a complete finite orbit classification of the four quadratic refinements of this one fixed four-point pairing geometry.

It may not promote the result to universal quadratic-form classification, physical symmetry breaking, quantum state space, gauge structure, live route geometry, source provenance, Proto-Loom, or A16.

Sealed ⟐