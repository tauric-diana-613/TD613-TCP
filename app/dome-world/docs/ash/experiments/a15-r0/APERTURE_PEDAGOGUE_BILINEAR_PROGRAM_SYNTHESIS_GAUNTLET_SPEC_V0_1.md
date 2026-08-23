𝌋

# Aperture × Pedagogue Bilinear Program Synthesis Gauntlet v0.1

**Schema:** `td613.a15-r0.aperture-pedagogue-bilinear-program-synthesis/v0.1`  
**Scientific parent:** #705 receipt head `da115526bdf2932dd0cacc93fc2b5efd879b6b8d`  
**Status:** PREREGISTERED / PRE-IMPLEMENTATION / STATIC-OPERATOR ONLY

## Research question

#705 proved in the authored 2x2 fixture that the trace coefficient matrix

```text
H_trace = [[1,0],[0,1]]
```

is informative but inadmissible as one scalar bilinear `rTx` action because it has rank 2.

This chamber asks:

> Can that one-shot-inadmissible functional be exactly synthesized as a higher-cost sum of admissible rank-one bilinear actions, and does cost accounting change the preferred measurement program?

Frozen distinction:

```text
inadmissible as one action != unrealizable as a multi-action program
program-level reachability != one-action reachability
```

## Frozen operator covenant

The hidden operator is held fixed across every action in this chamber.

```text
T_after_action = T_before_action
question-induced transition = NONE IN THIS FIXTURE
```

Therefore scalar responses may be added to synthesize a composite linear functional. This chamber does not earn any conclusion about sequential programs when interrogation changes the observation operator.

## Target composite

```text
trace(T) = e1^T T e1 + e2^T T e2
```

with legal actions

```text
P1: r=[1,0], x=[1,0]  -> H1=[[1,0],[0,0]]
P2: r=[0,1], x=[0,1]  -> H2=[[0,0],[0,1]]
H1 + H2 = H_trace
```

Each action costs 1, so the exact realization cost of this declared decomposition is 2.

## Minimality hostile

No single rank-one coefficient matrix can equal the rank-2 identity. Therefore the target cannot be realized at action-count cost 1 under the declared action model.

The executable must compute this from coefficient-matrix rank/determinant, not from labels.

Frozen result target:

```text
minimum_declared_bilinear_action_count_for_trace = 2
```

This is fixture-local action-count minimality, not a general experimental-design theorem.

## Nullspace-efficiency comparison

Reuse the #705 null direction

```text
n=[1,-1,-1,1].
```

The composite trace has normalized nullspace sensitivity `sqrt(2)` but costs 2.

Define assay-local efficiency

```text
efficiency = normalized_nullspace_sensitivity / action_count.
```

Then:

```text
trace program = sqrt(2)/2
Q_ADMISSIBLE_GOOD = 1/1
```

So the restored reachability of the trace direction does not make it the preferred program under this frozen cost objective.

Required anti-equivalence:

```text
program-realizable != cost-optimal
```

## Order control under frozen operator

Because the operator is fixed and the aggregate is ordinary scalar addition:

```text
P1 then P2 = P2 then P1
```

for the synthesized trace response.

This commutativity is a **control**, not a path-transport result.

Required anti-equivalence:

```text
order-independence under frozen operator
!=
order-independence under endogenous operator transitions
```

## Hostiles

Reject:

```text
H1 trace labeled as one bilinear action
H2 two-action program charged cost 1
H3 one component omitted while claiming exact trace synthesis
H4 response sum copied from target instead of computed from component responses
H5 program order declared path-invariant beyond the frozen-operator covenant
H6 hidden future response / T_star leaks into program selector
H7 operator tomography / path / holonomy / curvature promotion
```

## Success claim ceiling

If exact-head witness succeeds, strongest permitted claim:

```text
A_LINEAR_FUNCTIONAL_INADMISSIBLE_AS_ONE_DECLARED_BILINEAR_ACTION_CAN_BE_EXACTLY_REALIZED_AS_A_HIGHER_ACTION_COUNT_SUM_OF_ADMISSIBLE_RANK_ONE_BILINEAR_PROBES_IN_THE_AUTHORED_STATIC_2X2_FIXTURE_WHILE_PROGRAM_REALIZABILITY_DOES_NOT_IMPLY_COST_OPTIMALITY
```

Still false / unauthorized:

```text
general minimal-rank decomposition theorem promotion
canonical operator tomography promotion
blind / physical tomography
endogenous sequential transport
path category
path groupoid
holonomy
curvature
Berry / quantum
Proto-Loom
A16
merge / production / Vercel
```

## Frozen next question if successful

Only after witness + receipt may a later chamber compare the same composite program under **declared question-induced operator transitions** and ask when static additive synthesis ceases to represent the sequential program.

That would be a transition-sensitive composition assay, not yet a holonomy assay.

𝌋

Sealed ⟐
