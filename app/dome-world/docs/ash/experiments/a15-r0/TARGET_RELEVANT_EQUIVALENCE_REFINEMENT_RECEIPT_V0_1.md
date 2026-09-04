𝌋‌⟐

# A15-R0 · Target-Relevant Equivalence Refinement v0.1

Status: **FORMAL IDENTIFIABILITY-REFINEMENT CANDIDATE / RESEARCH-ONLY / GOLDEN EGG UNEARNED**

## Exact scientific parent

`ae1c795fbbd194b5eaba9ecbb699e9287ca8c706` — Active Reopening Non-Exclusivity 𝄐.

The parent established that a frozen observational record can remain non-identifying while an admissible intervention generates a new distribution that breaks the relevant causal equivalence. This chamber generalizes the adjudication rule beneath both passive and active reopening.

## Core question

**When does a newly acquired evidentiary object actually count as identifying progress for the declared target?**

Not merely when it is new.

Not merely when it is external.

Not merely when it is experimental.

The acquisition must reduce the ambiguity that survives for the declared target `THETA`.

## Target partition

Let the current frozen evidence regime induce an equivalence relation on the target hypotheses: two hypotheses are equivalent when every admitted channel in the frozen regime has the same conditional law under both hypotheses.

The corresponding partition is written:

`Π_(E,THETA)`.

In the executable fixture, the frozen regime leaves:

`[[THETA_A, THETA_B, THETA_C], [THETA_D]]`.

The first block contains three unresolved target pairs:

`(A,B), (A,C), (B,C)`.

Thus the base unresolved-pair count is `3`.

## Four hostile acquisitions

### 1. Novel but useless

The candidate is a genuinely new object and is marked non-reducible to frozen `A`, yet all target hypotheses receive the same candidate likelihood profile.

Result:

`3 -> 3` unresolved pairs.

No identifying credit.

`NEW_EVIDENCE != IDENTIFYING_EVIDENCE`.

### 2. Information only about an already separated hypothesis

The candidate sharply distinguishes `THETA_D` from the other three, but `THETA_D` was already separated by the frozen regime. The unresolved block `[A,B,C]` remains intact.

Result:

`3 -> 3` unresolved pairs.

No target-relevant identifying credit.

`GLOBAL_NOVELTY != TARGET_SYMMETRY_BREAKING`.

### 3. Partial splitter

The candidate separates `THETA_A` from `[THETA_B, THETA_C]` while `THETA_D` remains separately identified.

Partition becomes:

`[[THETA_A], [THETA_B, THETA_C], [THETA_D]]`.

Result:

`3 -> 1` unresolved pairs.

Two previously unresolved target pairs are resolved.

This earns **partial identifying progress** without full identification.

### 4. Full splitter

The candidate gives all four target hypotheses distinct conditional laws when joined to the frozen regime.

Result:

`3 -> 0` unresolved pairs.

This earns complete identification in the bounded fixture.

## Criterion

A candidate acquisition `Z` earns identifying progress for declared target `THETA` only when the augmented target partition is a strict refinement of the frozen target partition:

`Π_(E∪Z,THETA) ≺ Π_(E,THETA)`.

Operationally in this finite fixture:

`unresolved_pairs(E∪Z, THETA) < unresolved_pairs(E, THETA)`.

Complete identification is the special case in which every target-equivalence block is a singleton.

Partial refinement is scientifically creditable and must not be inflated into complete identification.

## Relation to statistical experiment theory

This chamber is target-specific and deliberately weaker than a universal informativeness ordering such as Blackwell dominance. Statistical-experiment theory compares experiments by how informative they are across decision problems; Western here asks a narrower forensic question: did the new acquisition break the particular equivalence responsible for the declared target ambiguity?

Current causal-discovery work provides a useful external analogy. Mazaheri, Zhang & Uhler (UAI 2026) explicitly characterize equivalence classes that remain when intervention scope is insufficient, reinforcing the point that intervention status alone does not guarantee complete identification.

These references are contextual support, not same-episode Western measurements and not new Golden Egg evidence.

## Earned claim candidate

On exact-head green:

`AN_ACQUISITION_EARNS_IDENTIFYING_PROGRESS_FOR_DECLARED_TARGET_THETA_ONLY_IF_IT_STRICTLY_REFINES_THE_THETA_EQUIVALENCE_PARTITION_LEFT_BY_THE_FROZEN_EVIDENCE_REGIME; NOVELTY_EXTERNALITY_OR_EXPERIMENTAL_STATUS_ALONE_DO_NOT_CONFER_IDENTIFYING_CREDIT`.

## Claim ceiling

`TARGET_RELEVANT_REFINEMENT != FULL_IDENTIFICATION`

`NEW_EVIDENCE != IDENTIFYING_EVIDENCE`

`EXTERNAL_EVIDENCE != IDENTIFYING_EVIDENCE`

`INTERVENTIONAL_EVIDENCE != IDENTIFYING_EVIDENCE`

`IDENTIFIABILITY_IS_TARGET_RELATIVE`

`EVIDENCE_CLASS_BOUNDARY_IS_TARGET_RELATIVE`

`TARGET_REFINEMENT != EMPIRICAL_EXTERIORITY`

`TARGET_REFINEMENT != GOLDEN_EGG_MEASUREMENT`

Exact Golden Egg surfaces remain `[]`; empirical Golden Egg credit remains `0`.

No sequence authority, numbered-stage authority, merge, production, deployment, publication, Vercel, live Loom mutation, or public promotion is granted.

## Child-legible form

**A NEW CLUE COUNTS ONLY IF IT SPLITS THE SUSPECTS STILL TIED.**

## Expected rest

**WESTERN HORIZON: IDENTIFYING PROGRESS IS STRICT TARGET-RELEVANT EQUIVALENCE REFINEMENT.**

𝄐

Sealed ⟐
