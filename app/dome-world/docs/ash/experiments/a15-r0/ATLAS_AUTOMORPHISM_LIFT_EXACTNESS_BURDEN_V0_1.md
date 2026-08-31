# A15-R0 · Atlas Automorphism-Lift Exactness Burden

Frozen before implementation.

Parent: `#918 / fb4f10524d4f93c35fc4d1a48c6b86c6f5aa1487`.

## Raw exhaustive automorphism census

For each of the two eight-element declared controls:

```text
8! = 40,320 permutation candidates
64 multiplication cells per candidate
2,580,480 multiplication checks
```

Combined:

```text
80,640 permutation candidates
5,160,960 multiplication checks
```

The implementation and hostile must not prune the candidate set by known automorphism presentations. All 64 cells are counted for every permutation whether or not an early mismatch is already known.

## D-side required outputs

```text
transport group size                         8
automorphism candidates                 40,320
multiplication checks                2,580,480
accepted automorphisms                       8
conjugation maps generated                    8
unique inner automorphisms                    4
central quotient classes                      4
induced quotient-action maps                  2
quotient-action kernel                        4
O(q_D) size                                   2
image equals O(q_D)                        true
kernel equals Inn(D8)                      true
lift fibers                                  [4,4]
pairing automorphisms                         6
pairing automorphisms outside O(q_D)          4
lifts of those four                           0
```

## Q8-control required outputs

```text
symbolic group size                           8
closure products                             64
closure escapes                               0
automorphism candidates                  40,320
multiplication checks                 2,580,480
accepted automorphisms                       24
conjugation maps generated                    8
unique inner automorphisms                    4
central quotient classes                      4
induced quotient-action maps                  6
quotient-action kernel                        4
O(q_Q) size                                   6
image equals O(q_Q)                        true
kernel equals Inn(Q8)                       true
lift fibers                          [4,4,4,4,4,4]
```

## Downstairs matrix audit

Reconstruct all 16 binary 2x2 matrices. Exactly 6 must be invertible; all six preserve the inherited polar form beta.

For each control derive q from group squares, not from the parent vector labels. Filter the six matrices by q-preservation.

Required:

```text
|GL(2,2)| = 6
|Sp(beta)| = 6
|O(q_D)| = 2
|O(q_Q)| = 6
```

Every induced quotient action from a group automorphism must be one of those matrices.

## Fiber exactness

For each matrix in the image of `Aut(G)->GL(V)`, count all group automorphisms inducing it.

Required:

```text
D: 2 image matrices, each with exactly 4 lifts
Q: 6 image matrices, each with exactly 4 lifts
```

The kernel is the lift fiber above the identity matrix. It must equal the independently reconstructed inner automorphism set as a set of permutations, not merely by cardinality.

## Mandatory negative control

On D8, enumerate the four matrices in `Sp(beta)\O(q_D)`. Search the complete D automorphism census for lifts inducing each such matrix.

Required:

```text
4 forbidden pairing automorphisms
0 lifts for each
0 forbidden lifts total
```

This is the declared finite obstruction test:

```text
preserve beta but not q_D -> no D8 automorphism lift.
```

## Claim ceiling

GREEN supports exactness only for these two declared finite controls. It does not establish a universal theorem for arbitrary central extensions, extraspecial groups, physical symmetries, gauge structures, or live transport systems.

Sealed ⟐