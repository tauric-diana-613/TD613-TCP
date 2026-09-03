𝌋‌⟐

# A15-R0 · Minimal Target-Separating Acquisition Cover v0.1

Status: **FORMAL EXPERIMENT-SELECTION CANDIDATE / RESEARCH-ONLY / GOLDEN EGG UNEARNED**

## Exact scientific parent

`74462660f3a3287d4d91e739c7cba664554d0a47` — Target-Relevant Equivalence Refinement 𝄐.

The parent established that identifying progress is strict refinement of the declared target-equivalence partition. This chamber asks the next operational question: once several admissible acquisitions can refine that partition, which complete acquisition plan is optimal under a declared resource objective?

## Finite target-pair universe

The frozen evidence regime leaves three unresolved target pairs:

`(A,B)`, `(A,C)`, `(B,C)`.

A complete identification plan must resolve all three.

The preregistered candidate acquisitions are:

- `Z_A_SPLITTER`, cost `1`, resolves `(A,B)` and `(A,C)`.
- `Z_B_SPLITTER`, cost `1`, resolves `(A,B)` and `(B,C)`.
- `Z_C_SPLITTER`, cost `1`, resolves `(A,C)` and `(B,C)`.
- `Z_ONE_SHOT_FULL`, cost `3`, resolves all three pairs.
- `Z_NOVEL_NO_TARGET_VALUE`, cost `0.25`, resolves no surviving target pair.

This is a finite set-cover application. It is not claimed as a new set-cover theorem.

## Two different optimization objectives

Under `MIN_CARDINALITY`, the unique one-step complete plan is:

`[Z_ONE_SHOT_FULL]`

with cardinality `1` and cost `3`.

Under `MIN_COST`, the cheapest complete plan uses two partial splitters, with cardinality `2` and total cost `2`.

Thus:

`MINIMUM_CARDINALITY != MINIMUM_RESOURCE_COST`.

The phrase “best experiment plan” is therefore incomplete until the optimization objective is declared.

## Relation to external experiment-design literature

This chamber applies standard finite combinatorial optimization to Western's target-equivalence operator. It does not claim the general idea of minimum intervention design as new. Existing causal experiment-design work explicitly minimizes intervention count, while more recent active-learning work optimizes other quantities such as evidence strength or experimental cost. These sources provide context, not same-episode Western evidence.

## Earned claim candidate

On exact-head green:

`FOR_A_FINITE_DECLARED_TARGET_HYPOTHESIS_SET_A_COMPLETE_ACQUISITION_PLAN_MUST_COVER_EVERY_TARGET_PAIR_LEFT_UNRESOLVED_BY_THE_FROZEN_EVIDENCE_REGIME; UNDER_DECLARED_NONNEGATIVE_COSTS_THE_MINIMUM_COST_COMPLETE_PLAN_NEED_NOT_BE_THE_MINIMUM_CARDINALITY_PLAN_SO_EXPERIMENTAL_OPTIMALITY_IS_OBJECTIVE_RELATIVE`.

## Claim ceiling

`TARGET_PAIR_COVER != NEW_SET_COVER_THEOREM`

`FORMAL_COST != EMPIRICAL_BUDGET`

`MINIMUM_COST_PLAN != ADAPTIVE_POLICY`

`DETERMINISTIC_COST_FIXTURE != STOCHASTIC_RESOURCE_MODEL`

`TARGET_SEPARATING_COVER != EMPIRICAL_EXTERIORITY`

`TARGET_SEPARATING_COVER != GOLDEN_EGG_MEASUREMENT`

Exact Golden Egg surfaces remain `[]`; empirical Golden Egg credit remains `0`.

No sequence authority, numbered-stage authority, merge, production, deployment, publication, Vercel, live Loom mutation, or public promotion is granted.

## Child-legible form

**THE FEWEST TESTS AND THE CHEAPEST COMPLETE ANSWER CAN BE DIFFERENT PLANS.**

## Expected rest

**WESTERN HORIZON: EXPERIMENTAL OPTIMALITY IS TARGET- AND OBJECTIVE-RELATIVE.**

𝄐

Sealed ⟐
