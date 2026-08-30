# A15-R0 · Finite Blocker Duality / Minimal-Obstruction Reconstruction · Preregistration v0.1

Status: **PREREGISTERED BEFORE IMPLEMENTATION / CANDIDATE THEOREM / NO MERGE AUTHORITY**

Exact earned scientific parent: **#888 / `633cd75baaaebcc5f357bd503024aefbbcf11057` / TD613 Consolidated Validation run 2395 / 33296570047 SUCCESS**.

#889 is witness-routing only and carries zero theorem ancestry. #890/#891 are quarantined RED/uneared and are not scientific parents of this chamber.

## Scientific question

#888 established, for each declared #884 witness class, a finite transport-separation hypergraph

```text
H_tr = (V,{D_g : g != id})
```

and the exact identity

```text
b(H_tr)
=
inclusion-minimal inherited-origin-identifying witness families,
```

where `b(H)` is the blocker: the inclusion-minimal hitting sets of `H`.

This successor asks whether the minimal identifying families are merely an output list, or whether they determine the **minimal transport-obstruction structure** from which exact identification and witness-erasure robustness can be regenerated.

## Preregistered finite constructions

For a finite edge family `H`, let

```text
clutter(H) = inclusion-minimal distinct edges of H.
```

Duplicate transport-labelled edges may exist before forgetting labels. The clutter construction is set-theoretic and forgets duplicate labels and all transport names.

Let

```text
B = b(H_tr).
```

Define the double blocker

```text
BB = b(B).
```

For any selected witness family `W`, define the inherited #888 transport-separation depth

```text
mu_H(W) = min_{E in H_tr} |W intersect E|.
```

and the clutter depth

```text
mu_cl(W) = min_{E in clutter(H_tr)} |W intersect E|.
```

## Candidate theorem A · blocker involution recovers the obstruction clutter

Preregister the finite identity

```text
b(b(H_tr)) = clutter(H_tr)
```

extensionally in every declared witness class.

The equality must be verified by actual witness-ID sets, not merely edge counts or widths.

Interpretive consequence, if earned:

```text
MINIMAL IDENTIFYING FAMILIES -> MINIMAL UNLABELLED TRANSPORT OBSTRUCTIONS
```

because #888 already identifies `b(H_tr)` with the minimal inherited-origin-identifying witness families.

## Candidate theorem B · clutterization preserves transport-separation depth

Preregister, for every selected witness family `W` in every declared finite class,

```text
mu_H(W) = mu_cl(W).
```

Reason under test: every nonminimal edge contains a clutter edge, so no nonminimal transport-separation edge can lower the minimum intersection count below the minimum attained on the clutter core.

If exact, the already-earned #888/#886 identification and erasure-robustness laws factor through the clutter:

```text
W identifies tau*
IFF
mu_cl(W) >= 1
```

and for exact witness deletion depth `e=0..4`,

```text
every exact-e deletion preserves inherited-origin identification
IFF
mu_cl(W) >= e+1.
```

Hence the minimum `(e+1)`-fold multicover widths computed from `H_tr` and from `clutter(H_tr)` must agree.

## Candidate theorem C · minimal-identifier sufficiency is bounded

If A and B hold, the blocker `B` is an exact finite carrier for reconstructing the **unlabelled clutter** and therefore the minimum transport-separation depth functional.

This does **not** preregister transport-label recovery. A permutation of nonidentity transport names attached to the same unlabelled edge family leaves the blocker unchanged.

Mandatory distinction:

```text
BLOCKER_DUAL_RECOVERY != TRANSPORT_LABEL_RECOVERY
```

Likewise, blocker duality does not recover witness semantics, topology names, physical dynamics, causal relations, or a unique richer realization.

## Required exact checks

For each of the four declared witness classes:

1. derive the distinct transport-separation edge family from the earned #888 parent;
2. clutterize it by strict set inclusion;
3. recompute the blocker from that clutter and match the earned #888 blocker extensionally;
4. compute the blocker of the earned blocker and match the clutter extensionally;
5. compare `mu_H(W)` and `mu_cl(W)` over every selected witness family;
6. compare exact depth-1..5 family counts against #888;
7. compare minimum multicover widths against #888;
8. record whether clutterization deletes any duplicate or strict-superedge structure;
9. demonstrate transport-label nonrecoverability by verifying that relabelling the nonidentity transport names leaves blocker/clutter incidence unchanged.

## Required hostile independence

Before importing this child implementation, the hostile test must reconstruct transport-separation edges directly from:

1. the earned #884 witness rows,
2. the earned #882 metric-isometry action,
3. inherited point `1111111110`.

It must then compute minimal transversals and double blocker using an algorithm structurally independent from the child implementation. Only after freezing the hostile edge, blocker, and double-blocker ledgers may it import this successor for comparison.

The hostile test may import #888 after its independent structures are frozen solely to compare already-earned blocker and robustness outputs.

## Falsifiers

The candidate theorem is RED if any declared class has any of:

- `b(b(H_tr)) != clutter(H_tr)` extensionally;
- recomputed first blocker disagreeing with #888's blocker;
- any selected family with `mu_H(W) != mu_cl(W)`;
- any depth-1..5 exact family count differing after clutterization;
- any minimum multicover width differing after clutterization;
- hostile reconstructed transport edges disagreeing with #888;
- hostile double blocker disagreeing with canonical double blocker;
- any claim that transport labels are recovered from the unlabelled blocker alone.

## Discovery lane frozen before execution

The following are not preregistered numeric results and may be discovered:

- clutter edge count by witness class,
- number of strict-superedge or duplicate edges removed by clutterization,
- exact clutter edge contents,
- double-blocker edge contents,
- whether all four #888 transport hypergraphs are already clutters,
- exact count of label permutations preserving the unlabelled blocker representation.

Any such numeric values become claims only after canonical/hostile agreement and exact-head aggregate success.

## Mandatory membranes

```text
BLOCKER_DUAL_RECOVERY != TRANSPORT_LABEL_RECOVERY
MINIMAL_IDENTIFYING_FAMILIES != COMPLETE_WITNESS_SEMANTICS
OBSTRUCTION_CLUTTER != PHYSICAL_NETWORK
HYPERGRAPH_EDGE != CAUSAL_RELATION
CLUTTERIZATION != INFORMATION-THEORETIC COMPRESSION
BLOCKER_CARDINALITY != MINIMUM BIT LENGTH
MULTICOVER_DEPTH != SHANNON INFORMATION
TRANSPORT_EDGE_MULTICOVER != ERROR-CORRECTION CAPACITY
TRANSPORT_SEPARATING RANK != ACTION-GENERATING RANK
TRANSPORT_SEPARATING RANK != BEHAVIORAL SEPARATING RANK
METRIC ISOMETRY ACTION != PHYSICAL DYNAMICS
FREE TRANSITIVE FINITE ACTION != GAUGE THEORY
ORIENTATION FIBRE != HIDDEN STATE SPACE
LATER SYMMETRY BREAKING != PRIOR METRIC IDENTIFIABILITY
WITNESS ROUTING != SCIENTIFIC ANCESTRY
```

No merge, deployment, publication, production, release, Vercel, A16/Proto-Loom, physical gauge theory, physical network, Shannon/channel coding theorem, or universal inverse-problem theorem follows.

Sealed ⟐
