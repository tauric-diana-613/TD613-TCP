𝌋⟐

# A15-R0 · Atlas Central-Commutator Depth Collapse · Preregistration v0.1

Status: **PREREGISTERED / PREIMPLEMENTATION / THEOREM UNEARNED**.

Exact earned parent:

```text
#910 / 6343ced7cf274b5f3981cfcb68e3a255447ffcd6
TD613 Consolidated Validation run 2407 / 33349610077 — SUCCESS
A15-R0 step 19 — SUCCESS
```

## Research question

The earned #910 image is nonabelian:

```text
G = <A,B>
|G| = 8
G ~= D8
|G'| = 2
G/G' ~= C2 x C2
```

This chamber asks how deep that noncommutativity survives under iterated commutators.

Define the lower central series

```text
gamma_1(G)=G
gamma_2(G)=[G,G]
gamma_3(G)=[gamma_2(G),G]
```

and the derived series

```text
G^(0)=G
G^(1)=[G,G]
G^(2)=[G^(1),G^(1)].
```

## Frozen candidate

The target is

```text
|gamma_1(G)| = 8
|gamma_2(G)| = 2
|gamma_3(G)| = 1
```

with

```text
Z(G) = G' = gamma_2(G)
```

and therefore the declared finite history image is **nilpotent of exact class 2** and **solvable of derived length 2**.

The candidate is exact-class rather than merely an upper bound because `G'` must remain nontrivial while `gamma_3(G)` is trivial.

## Frozen first-commutator census

All 64 ordered pairs `(g,h) in G x G` will be audited.

Required distribution:

```text
distinct commutator values = 2
identity commutators = 40
nonidentity commutators = 24
```

The unique nonidentity commutator must equal the already-earned Moss Lantern formal loop holonomy transformation `(x,y)->(x,y xor 1)`.

## Center and centrality

All 64 group-element commuting relations are audited to determine the center from scratch.

Required:

```text
|Z(G)| = 2
Z(G) = G'
```

Every element of `G'` must commute with every element of `G`:

```text
2 x 8 = 16 centrality checks
0 failures.
```

## Iterated commutator burden

Lower-central step:

```text
[g2,g] for g2 in gamma_2(G), g in G
16 ordered checks
all identity
|gamma_3(G)| = 1.
```

Derived step:

```text
[d1,d2] for d1,d2 in G'
4 ordered checks
all identity
|G^(2)| = 1.
```

Full triple-commutator hostile:

```text
[[g,h],k] for all g,h,k in G : 512 checks
[g,[h,k]] for all g,h,k in G : 512 checks
```

Every triple commutator must equal identity.

## Free-history pullback witnesses

The exact based history domain remains the free group `F(a,b)` from #910.

With commutator convention `[u,v]=u v u^-1 v^-1`, preregister:

```text
[a,b]      = abAB
[[a,b],a]  = abABabaBAA
[[a,b],b]  = abAbaBAB
```

All three words must remain nonempty after free reduction.

Required representation behavior:

```text
rho([a,b]) != id
rho([[a,b],a]) = id
rho([[a,b],b]) = id.
```

The group-theoretic consequence is bounded and exact:

```text
rho(gamma_2(F(a,b))) is nontrivial
rho(gamma_3(F(a,b))) = {id}
```

because homomorphisms map lower-central terms into lower-central terms and `gamma_3(G)={id}`.

This does **not** claim `ker(rho)=gamma_3(F(a,b))`; #910 already has additional kernel relations such as `a^2`.

## Candidate bounded 𝄐

If exact-head constitutional GREEN:

```text
THE_EARNED_NONABELIAN_TWO_LOOP_HISTORY_IMAGE_HAS_EXACT_COMMUTATOR_DEPTH_TWO: ITS_FIRST_COMMUTATOR_SUBGROUP_IS_THE_TWO_ELEMENT_CENTER_CONTAINING_THE_NONTRIVIAL_MOSS_LANTERN_LOOP_HOLONOMY, WHILE_EVERY_THIRD_LEVEL_COMMUTATOR_COLLAPSES_TO_IDENTITY IN_THE_FIXED_SYNTHETIC_FIXTURE.
```

and

```text
THE_FREE_TWO_LOOP_HISTORY_REPRESENTATION_KILLS_ALL_THIRD_LOWER_CENTRAL_HISTORY_WHILE_RETAINING_A_NONTRIVIAL_FIRST_COMMUTATOR, SO_NONABELIAN_HISTORY_SURVIVES_EXACTLY_ONE_COMMUTATOR_LAYER_IN_THE_DECLARED_HOLONOMY_IMAGE.
```

## Mandatory membranes

```text
NILPOTENCY_CLASS_2 != PHYSICAL_DYNAMICAL_COMPLEXITY
LOWER_CENTRAL_SERIES != TEMPORAL_STAGE_SEQUENCE
COMMUTATOR_DEPTH != CAUSAL_DEPTH
CENTER_OF_FORMAL_TRANSPORT_GROUP != PHYSICAL_SYMMETRY_CENTER
TRIPLE_COMMUTATOR_COLLAPSE != EXACT_HISTORY_ERASURE
GAMMA3_SUBSET_KERNEL != KERNEL_EQUALITY
SOLVABLE_GROUP != SOLVABLE_REAL_WORLD_SYSTEM
FREE_GROUP_HISTORY != LIVE_ROUTE_HISTORY
FORMAL_DISCRETE_HOLONOMY != GEOMETRIC_OR_PHYSICAL_HOLONOMY
ATLAS_REGISTRATION != LIVE_RUNTIME_STATE
A15_R0_RESEARCH_EXTENSION != PROTO_LOOM_OR_A16_PROMOTION
WITNESS_ROUTING != SCIENTIFIC_ANCESTRY
```

No merge, deployment, publication, production, Vercel, live Ash/Loom, physical topology/symmetry, gauge/Berry structure, source provenance, Proto-Loom, or A16 authority.

Sealed ⟐