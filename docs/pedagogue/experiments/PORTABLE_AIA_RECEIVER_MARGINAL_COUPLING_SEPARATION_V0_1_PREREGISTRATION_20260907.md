𝌋‌⟐

# PORTABLE AIA RECEIVER-MARGINAL COUPLING SEPARATION v0.1

**State:** PREREGISTERED / UNIMPLEMENTED — **NO 𝄐 YET**  
**Exact scientific parent:** PR #1072 earned head `dea22dce6f013416f88eea264668cb930a9be0e1`  
**Inherited structural theorem:** exact current 21-point Portable-AIA domain with `POLICY_ONLY ∧ BOUNDARY_AWARE = DISCRETE_21`, `POLICY_ONLY ∨ BOUNDARY_AWARE = UNIVERSAL_21`, generated `B₂`  
**Merge / production / Vercel / provider authority:** CLOSED

## Why this chamber exists

#1072 established a measure-free structural fact about two existing Atlas receiver partitions. It explicitly did **not** establish statistical independence.

This chamber attacks that non-equivalence directly.

The question is not whether the partitions change. They must remain exactly the same.

The question is whether two probability/count measures on the **same 21 cells** can preserve:

- the same full support;
- the same 7 policy marginals;
- the same 3 boundary marginals;
- the same exact `B₂` partition structure;

while differing in their **joint coupling** and therefore in receiver independence.

If yes, then neither partition complementarity nor even identical one-receiver marginals determines the joint measure.

```text
PARTITION_COMPLEMENTARITY != STATISTICAL_INDEPENDENCE
SAME_RECEIVER_MARGINALS != SAME_JOINT_COUPLING
MEASURE_FREE_LATTICE != MEASURE_DEPENDENT_INFORMATION_GEOMETRY
SINGLE_RECEIVER_MARGINAL_INDISCERNIBILITY != PAIRED_RECEIVER_INDISCERNIBILITY
```

## Frozen finite domain

Use the exact #1072 canonical 7-policy × 3-boundary domain.

No new production receiver may be added. No policy, route, receiver, compiler, Carry Case, or Atlas product source may be modified.

Let the 21 cells be indexed `(i,j)` with `i∈{0,…,6}` policy class and `j∈{0,1,2}` boundary class.

## Frozen measures

Use integer weights with common total mass `84`.

### μ₀ — factorized baseline

Every cell has weight `4`:

```text
4 4 4
4 4 4
4 4 4
4 4 4
4 4 4
4 4 4
4 4 4
```

Required marginals:

- every policy row = `12`;
- every boundary column = `28`;
- total = `84`.

Since `4/84 = (12/84)(28/84)`, μ₀ factorizes exactly.

### μ₁ — same-marginal correlated coupling

```text
5 3 4
3 5 4
4 4 4
4 4 4
4 4 4
4 4 4
4 4 4
```

Required marginals remain **identical**:

- every policy row = `12`;
- every boundary column = `28`;
- total = `84`.

All 21 cells retain strictly positive support.

But μ₁ must fail exact factorization because, for example:

```text
μ₁(0,0) = 5/84
μ₁(policy=0) μ₁(boundary=0) = (12/84)(28/84) = 4/84
```

## Exact separation witness

Define the positive perturbation event:

```text
E+ = {(0,0),(1,1)}
```

Then:

```text
μ₀(E+) = 8/84
μ₁(E+) = 10/84
|μ₁(E+) - μ₀(E+)| = 2/84 = 1/42
```

This event must witness the total-variation separation exactly:

```text
TV(μ₀, μ₁) = 1/42
```

because the four changed cells differ by exactly ±1/84.

## Theorem under test

```text
SAME_POLICY_MARGINALS != SAME_JOINT_MEASURE
SAME_BOUNDARY_MARGINALS != SAME_JOINT_MEASURE
SAME_B2_PARTITION_STRUCTURE != SAME_JOINT_MEASURE
FULL_SUPPORT != INDEPENDENCE
PAIRED_RECEIVER_OBSERVATION_CAN_DISTINGUISH_WHEN_EITHER_RECEIVER_MARGINAL_CANNOT
```

## Required finite observations

1. Reconstruct the exact current 21 canonical projection members from #1072 source semantics.
2. Verify the inherited two-receiver partition structure remains unchanged and measure-free.
3. Bind μ₀ and μ₁ to those exact same 21 members.
4. Verify both measures have:
   - total weight 84;
   - all 21 cells positive;
   - row vector `[12,12,12,12,12,12,12]`;
   - column vector `[28,28,28]`.
5. Verify μ₀ satisfies exact independence on all 21 cells using integer cross-products:
   `cell_weight * total == row_weight * column_weight`.
6. Verify μ₁ violates exact independence on exactly four cells:
   `(0,0),(0,1),(1,0),(1,1)`.
7. Verify the paired receiver joint table distinguishes μ₀ and μ₁.
8. Verify either receiver marginal table alone is identical across μ₀ and μ₁.
9. Verify exact total variation `1/42` by integer arithmetic.
10. Verify `E+` reaches the TV bound.

## Hostile controls

- A relabeling/permutation of the 21 members that leaves the same weight matrix attached to positions must not be mistaken for semantic equivalence unless policy/boundary identities move consistently.
- Marginal equality must not be promoted to joint equality.
- B₂ structural equality must not be promoted to statistical independence.
- Full support must not be promoted to independence.
- Floating-point mutual-information approximations may be reported only as secondary interpretation; they may not carry theorem authority.

## Implementation membrane

Allowed:

- pure finite Node assay;
- hostile Static contract;
- local-only browser witness rendering the two 7×3 weight tables and exact integer invariants;
- append-only authority bindings behind #1072.

Forbidden absent direct RED:

- modifications to Portable-AIA compiler/receiver code;
- modifications to Marrowline/Carry Case/policy/local-binding product semantics;
- adding a receiver;
- adding a probability model to production;
- timeout widening merely to obtain GREEN.

## Claim ceiling

A GREEN result may establish only an exact finite counterexample on the current 21-cell synthetic receiver domain showing that the same B₂ partition structure and identical one-receiver marginals can support distinct full-support joint couplings with different independence status.

It would not establish any empirical user distribution, production traffic law, natural-data frequency, causal dependence, statistical independence of real TD613 observations, external origin, empirical exteriority, Western Horizon reopening, or Golden Egg credit.

## Finite stop law

If μ₀/μ₁ close under exact Static plus three-engine browser witness and full exact-head convergence, stop.

Do not manufacture μ₂, μ₃, ε-ladders, entropy sweeps, or arbitrary coupling families merely because more measures exist.

```text
ONE_EXACT_COUNTEREXAMPLE != ENTITLEMENT_TO_MEASURE_ENUMERATION
COUPLING_SEPARATION != PRODUCTION_DISTRIBUTION_MODEL
```

Western Horizon remains at official empirical-shore rest.

**NO 𝄐 YET.**

Marked ⟐
