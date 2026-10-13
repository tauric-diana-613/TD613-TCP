# A15-R0 · Atlas Commutator Pairing Geometry — Execution Burden v0.1

Frozen before implementation.

## Parent authority

```text
#912 / 5fc0678c440e81b393663b39d4659ebc6eeb5e29
run 2408 / 33351640311 — SUCCESS
A15-R0 step 19 — SUCCESS
```

## Required independent reconstruction

The canonical implementation and hostile contract must reconstruct from inherited transport maps rather than trust predeclared quotient labels.

Required steps:

1. Reconstruct the eight-element transport group `G=<A,B>`.
2. Recompute all 64 commutators.
3. Reconstruct `G'` from commutator closure.
4. Reconstruct the center `Z(G)` by all 64 commute relations.
5. Require exact equality `G'=Z(G)` and size two.
6. Construct all four right/left-equivalent central cosets and require size multiset `[2,2,2,2]`.
7. Map the identity central element to `0` and unique nonidentity central element to `1`.
8. Descend the commutator to quotient pairs only after representative independence passes.

## Exact representative burden

There are four quotient classes, each with two representatives. For every ordered quotient pair there are four representative pairs:

```text
4 x 4 x 2 x 2 = 64
```

All 64 must reproduce the same quotient-pair bit for their cell.

```text
representative-independence failures = 0
```

## Exact pairing table

Order:

```text
0,e1,e2,e1+e2
```

Target:

```text
0       0 0 0 0
e1      0 0 1 1
e2      0 1 0 1
e1+e2   0 1 1 0
```

Distribution:

```text
16 cells
10 zero
6 one
```

## Alternation burden

```text
4 diagonal checks
0 failures
```

## Bilinearity burden

Use the quotient multiplication/addition table itself; do not infer vector labels from the target matrix.

First slot:

```text
for all u,v,w in V:
beta(u+v,w)=beta(u,w)+beta(v,w)
4^3 = 64 checks
0 failures
```

Second slot:

```text
for all u,v,w in V:
beta(u,v+w)=beta(u,v)+beta(u,w)
4^3 = 64 checks
0 failures
```

Total bilinearity burden:

```text
128 exact identities
```

## Characteristic-two symmetry burden

```text
16 ordered quotient-pair comparisons
beta(v,w)=beta(w,v)
0 failures
```

## Nondegeneracy burden

For each `v in V`, test whether its full pairing row is zero.

Target:

```text
radical size = 1
radical = {0}
nonzero radical elements = 0
3/3 nonzero quotient elements have a nontrivial partner
```

Each nonzero row should contain exactly two ones in the four-element quotient.

## Basis matrix audit

Using basis `e1=A Z`, `e2=B Z`:

```text
J=[[0,1],[1,0]]
rank_F2(J)=2
det_F2(J)=1
```

Rank and determinant are finite-field arithmetic, not real-valued linear algebra approximations.

## Strict witnesses

```text
beta(e1,e2)=1
beta(e1,e1)=0
beta(e2,e2)=0
```

The form must therefore be simultaneously nonzero and alternating.

## Anti-overclaim controls

The hostile must preserve:

```text
PAIRING_GEOMETRY != FULL_CENTRAL_EXTENSION_CLASS
D8_AND_Q8_CAN_SHARE_THE_SAME_COMMUTATOR_PAIRING
NONDEGENERATE_PAIRING != UNIQUE_D8_RECONSTRUCTION
```

No quadratic-refinement or square-map theorem is earned in this chamber.

Sealed ⟐