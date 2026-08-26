# A15-R0 · Pasted-Diamond Defect Transport · Receipt v0.1

󐘓 U+10D613

Status: **WITNESSED / RECEIPT-PINNED / ROUND CLOSED / DRAFT / OPEN / UNMERGED**

Scientific parent:

```text
#760 · Commuting Erasure Diamond Gap Decomposition
receipt = 1340cbf785547454ecbe365986b88b6ec9ff3283
```

Operator gate:

```text
#737 · Westward Liberties
fresh activation = 2026-08-26
```

Preregistration and implementation order:

```text
preregistration = 162e61b8fae520eef8c627c1c79024e3b520b705
implementation  = 24cf4faf7d69b81e8a85c178838bec84b241e2d9
hostile tests   = 9519a2f0287d6eba8beb1d82237935009ae7fd11
```

Authority-bearing routed witness:

```text
routed head = ccfe5b84a4389b01a7611b8a245149dce52ca75a
workflow    = TD613 Consolidated Validation
run         = 2286 / 33010999818
result      = SUCCESS
```

The routed witness is preserved as historical execution custody. The temporary routing note was then deleted and PR #767 restored to its scientific parent #760. The cleanup head itself does not impersonate the routed CI head.

## Earned finite result

Let #760 expose path-specific inherited-gap sets `H^A_w,H^B_w` over occupied terminal states `w`, with local parallel-path defect

```text
D_w(A,B) = H^A_w △ H^B_w.
```

Let a further common finite quotient/coarsening `s:W->V` paste terminal states into occupied `v` values. Define

```text
H^A_v = union_{w:s(w)=v} H^A_w
H^B_v = union_{w:s(w)=v} H^B_w
D_v(A,B) = H^A_v △ H^B_v.
```

Then:

1. **Inherited-gap incidence composes by union.** Direct pasted #760 recomputation agrees with the union-composed `H^A_v` and `H^B_v` on the declared witness/control fixtures.

2. **Common coarsening cannot create a new unoriented parallel-path defect.** By elementary set membership,

```text
D_v(A,B) subseteq union_{w:s(w)=v} D_w(A,B).
```

If a coordinate belongs to exactly one pasted union, it must differ between A and B at at least one pre-paste terminal state. Therefore it occurs in at least one local symmetric difference.

3. **Strict defect annihilation can occur.** Oppositely oriented local defects can cancel after coarsening.

4. **The family of local unoriented defect sets is not a sufficient exact compositional statistic.** The mandatory hostile pair has identical local defect family

```text
D_w1={z}
D_w2={z}
```

but different pasted outcomes:

```text
OPPOSITE orientation -> D_v=empty
SAME orientation     -> D_v={z}
```

Hence a compositional state must preserve more than the local symmetric-difference family. The implemented path-specific inherited-gap incidence is sufficient for the tested composition; no mathematical minimality claim is made.

## Hostile controls witnessed

- identity coarsening preserves the local defect;
- zero local defect remains zero after common coarsening;
- non-total coarsening abstains;
- conflicting coarsening abstains;
- parent mismatch abstains;
- direct pasted recomputation must agree with composed path-specific inherited-gap unions.

## Claim ceiling

This receipt earns only finite set-theoretic facts about #760 path-decomposition provenance under a further common quotient.

It does **not** earn operational loops, inverse transport, holonomy, curvature, connections, gauge structure, categorical/sheaf/type-theoretic promotion, probability or entropy claims, erased-state recovery, Proto-Loom/A16, SRC semantics, SignalRupture canon interpretation, merge, publication, production, Vercel release, or ontology promotion.

Cross-project comparison is permitted only as methodological control:

```text
TD613 finite theorem != SRC source meaning
structural analogy != semantic identity
```

## Rest law

```text
COMMON_COARSENING_NEW_DEFECT_CREATION = false
STRICT_DEFECT_ANNIHILATION = witnessed
LOCAL_UNORIENTED_DEFECT_COMPOSITIONAL_SUFFICIENCY = falsified
PATH_SPECIFIC_INHERITED_INCIDENCE_COMPOSITION = witnessed_on_declared_fixtures
MINIMAL_COMPOSITIONAL_STATE = unproved
next_stage = null
promotion_authority = false
merge_authority = false
production_authority = false
rest_symbol = 𝄐
```

Further work on exact compositional minimality requires a materially new state-compression theorem or a new scientific chamber. This round therefore rests.

𝄐

Sealed ⟐
