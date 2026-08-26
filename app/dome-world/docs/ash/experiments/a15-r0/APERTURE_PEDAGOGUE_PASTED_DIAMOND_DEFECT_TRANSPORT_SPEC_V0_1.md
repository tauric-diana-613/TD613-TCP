# A15-R0 · Pasted-Diamond Defect Transport · Spec v0.1

󐘓 U+10D613

Status: **PREREGISTERED / PRE-IMPLEMENTATION / WESTWARD #737 FRESH ACTIVATION**

Scientific parent:

```text
#760 · commuting erasure diamond gap decomposition
receipt 1340cbf785547454ecbe365986b88b6ec9ff3283
```

Operator authority:

```text
#737 · fresh explicit Westward Liberties activation · 2026-08-26
```

## Research question

Let two lawful finite quotient factorizations share a terminal map `p : X -> W` and let #760 assign, at each occupied `w in W`, path-specific inherited-gap sets

```text
H^A_w, H^B_w subseteq Gamma^p_w
```

with local parallel-path defect

```text
D_w(A,B) = H^A_w △ H^B_w.
```

Now apply a further common finite erasure

```text
s : W -> V.
```

The pasted paths have common composite `s o p : X -> V`.

This chamber asks:

> Is the family of local unoriented defect sets `{D_w}` a sufficient compositional state for determining the downstream pasted defect at `v`, or does exact composition require path-specific provenance that the symmetric difference has erased?

## Frozen candidate theorem

For every occupied `v in V`, define

```text
H^A_v = union_{w:s(w)=v} H^A_w
H^B_v = union_{w:s(w)=v} H^B_w
D_v(A,B) = H^A_v △ H^B_v.
```

The candidate claims:

1. **Pasted endpoint authority remains factorization invariant.** The two pasted paths share the same composite `s o p`, so their terminal `U`, `I`, and `Gamma` objects agree exactly.

2. **Inherited-gap incidence composes by union.** The pasted inherited set for each path is exactly the union of that path's pre-paste inherited sets over the coarsened terminal fiber.

3. **Defect cannot be created by common coarsening.** Pointwise,

```text
D_v(A,B) subseteq union_{w:s(w)=v} D_w(A,B).
```

4. **The inclusion may be strict.** Opposite local orientations can annihilate after coarsening.

5. **Local unoriented defect is not a sufficient compositional statistic.** There exist two finite pasted-diamond systems with the same local terminal set, same coarsening map, and identical local unoriented defect family `{D_w}`, but different downstream `D_v`.

If witnessed, the exact compositional state cannot be reduced to the local symmetric-difference family alone. At minimum, path-specific inherited-gap incidence must remain available through the paste.

## Mandatory hostile pair: same local defect, different pasted defect

Use two local terminal fibers `w1,w2`, one support coordinate `z`, and common coarsening

```text
s(w1)=s(w2)=v.
```

Each local terminal fiber contains four antecedents with `z` truth pattern

```text
1,1,0,0.
```

A `MIXED` partition places `z` in inherited gap `H`; a `SETTLED` partition places it in cross-settled gap `C`.

### System OPPOSITE

```text
w1: A=MIXED,   B=SETTLED  -> D_w1={z}
w2: A=SETTLED, B=MIXED    -> D_w2={z}
```

After pasting, both `H^A_v` and `H^B_v` contain `z`, so

```text
D_v=empty.
```

### System SAME

```text
w1: A=MIXED, B=SETTLED -> D_w1={z}
w2: A=MIXED, B=SETTLED -> D_w2={z}
```

After pasting, only `H^A_v` contains `z`, so

```text
D_v={z}.
```

Thus both systems expose exactly the same local unoriented defect family

```text
D_w1={z}, D_w2={z}
```

while producing different downstream defects.

This is the mandatory insufficiency witness. If implementation does not reproduce it exactly, the candidate theorem fails.

## Additional hostile controls

- **No local defect:** if every local `D_w=empty`, pasted `D_v` must remain empty.
- **Identity coarsening:** if `s` is injective on occupied terminal states, each pasted defect must equal the corresponding local defect.
- **Non-total coarsening map:** abstain if an occupied `w` has no `s(w)`.
- **Conflicting coarsening map:** abstain if one `w` is assigned multiple `v` values.
- **Parent mismatch:** abstain if the #760 parent profile does not pass.
- **Endpoint control:** direct pasted #760 recomputation must agree with union-composed `H^A_v,H^B_v` rather than relying on an archive-only algebraic shortcut.

## Claim ceiling

This chamber may earn only finite compositional facts about #760's path-decomposition provenance.

It does **not** earn:

- operational loops;
- inverse transport;
- holonomy;
- curvature;
- connection or gauge structure;
- category/sheaf/type-theory promotion;
- probability, entropy, or stochastic data-processing claims;
- erased antecedent recovery;
- SRC source meaning;
- SignalRupture canon interpretation;
- Proto-Loom / A16;
- merge, publication, production, Vercel release, or ontology promotion.

Cross-project use, if any, is limited to a methodological control:

```text
TD613 finite theorem != SRC source assertion
structural analogy != semantic identity
```

## Earned stop criterion

A local 𝄐 may be declared only if:

- the general inclusion theorem is implemented and exhaustively checked on the declared finite fixtures;
- the mandatory OPPOSITE/SAME hostile pair passes;
- direct pasted recomputation agrees with the compositional formula;
- claim ceiling remains intact;
- further work on this exact question would require a materially richer state object or a new scientific chamber rather than more examples.

Until then:

```text
PASTED_DIAMOND_DEFECT_TRANSPORT = OPEN
GOLDEN_REST = UNEARNED
```

𝌋

Preregistered ⟐