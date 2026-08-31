# A15-R0 · Atlas Quadratic Refinement / Central-Extension Discrimination · Execution Burden

Parent: `#914 / abfc2a801127b85fea870b56d253882951cca241`.

This burden is frozen before implementation.

## Earned D8-side reconstruction

Reconstruct from the inherited Moss Lantern transport maps, not from #914's labels:

```text
|G|=8
|Z(G)|=2
|G'|=2
Z(G)=G'
|G/Z(G)|=4
coset sizes=[2,2,2,2]
quotient addition table=[[0,1,2,3],[1,0,3,2],[2,3,0,1],[3,2,1,0]]
```

Square-map burden:

```text
8 representative square evaluations
0 square-outside-center failures
0 central-coset representative disagreements
q_D=[0,0,0,1]
3 zero values / 1 one value
8 element-square checks
6 -> identity
2 -> unique nonidentity center element
```

Polarization:

```text
16 q_D polarization checks
0 failures
polar(q_D)=beta_D
```

## Independent symbolic Q8 control

Reconstruct from the multiplication rules of

```text
{1,-1,i,-i,j,-j,k,-k}
```

with no imported child data.

Required group audits:

```text
64 closure products / 0 escapes
8 inverse searches / 0 failures
64 commutativity relations
|Z(Q8)|=2
64 first commutators
|Q8'|=2
Z(Q8)=Q8'
|Q8/Z(Q8)|=4
coset sizes=[2,2,2,2]
quotient addition table equals D-side table
```

Square-map burden:

```text
8 representative square evaluations
0 square-outside-center failures
0 central-coset representative disagreements
q_Q=[0,1,1,1]
1 zero value / 3 one values
8 element-square checks
2 -> identity
6 -> unique nonidentity center element
```

Pairing and polarization:

```text
64 Q-side representative commutator evaluations
0 representative-independence failures
beta_Q exact table = beta_D exact table
16 cross pairing-cell comparisons / 0 mismatches
16 q_Q polarization checks / 0 failures
polar(q_Q)=beta_Q
```

## Symplectic-basis audit

On the shared four-element quotient, enumerate every ordered nonzero pair `(x,y)` satisfying

```text
beta(x,y)=1.
```

Required:

```text
6 ordered symplectic bases
6 D-side Arf evaluations -> all 0
6 Q-side Arf evaluations -> all 1
```

No basis may be privileged after enumeration.

## GL(2,2) audit

Enumerate every binary `2x2` matrix and retain the invertible ones.

Required:

```text
16 candidate matrices
6 invertible matrices
6/6 preserve the shared J pairing
D q-stabilizer size = 2
Q q-stabilizer size = 6
cross D->Q q-isometries = 0
cross Q->D q-isometries = 0
```

## Strict separation controls

Required exact facts:

```text
beta_D == beta_Q
q_D != q_Q
q_D and q_Q differ on exactly 2 of 4 quotient vectors
D nonzero q-isotropic vectors = 2
Q nonzero q-isotropic vectors = 0
Arf_D=0
Arf_Q=1
```

The hostile must reject any child that:

- hard-codes the q-vectors without reconstructing squares;
- uses the pairing alone to infer extension type;
- fails representative independence;
- conflates Arf bit with entropy or capacity;
- calls the Q8 control a physical quaternionic system;
- claims a universal classification theorem beyond the two declared finite controls.

## Constitutional replay

The successor hardening must audit exactly eight live successor paths, then mechanically replay exact earned #914, which recursively carries #912→#910→#908→#906→#904→#902→#900→#898.

No merge, deploy, publication, production, Vercel, live runtime mutation, Proto-Loom, or A16 authority.

Sealed ⟐
