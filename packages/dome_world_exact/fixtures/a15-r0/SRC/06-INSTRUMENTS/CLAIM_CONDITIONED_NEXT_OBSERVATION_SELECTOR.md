# Claim-Conditioned Next-Observation Selector — TD613 Calibration

Status: **TD613-AUTHORED / SOURCE-DERIVED FIXTURE / ACTIVE-DESIGN CALIBRATION / NOT SR DOCTRINE / NO EXECUTION AUTHORITY**

Bound epoch:

```text
atelier_snapshot_id = src-20260824-p2-001
seal_id = src-seal:eaf744ce16b1c8b519ad0f1b0325b44192679ea4a5110b0ad0ca49fbcd816a1a
```

## 1. Purpose

The preceding source witness establishes that SR-RIF assigns different **decisive next tests** to different unresolved claims/mechanisms, while the captured corpus does not currently witness a minimum/optimal/information-gain selector.

This file therefore opens an independent TD613 research object:

```text
Given a frozen claim Gamma and a declared current observation operator H,
which admissible candidate observation should be selected next, if any,
to make Gamma identifiable without demanding unnecessary full-state reconstruction?
```

This is a TD613-authored question-design assay. It may use source-derived fixtures without transferring the selector into SR theory.

## 2. Source-derived fixture

The ESB PISA case supplies three marginal exposure prevalences and explicitly refuses to infer overlap, interaction, or combined effect from those marginals alone.

Use the eight-cell joint exposure state:

```text
x = [p000,p001,p010,p011,p100,p101,p110,p111]^T
```

with binary exposure coordinates `(D,B,F)`.

The frozen target claim is:

```text
Gamma_union(x) = P(D union B union F)
```

The current source-derived observation family contains:

```text
normalization
P(D)
P(B)
P(F)
```

so:

```text
rank(H0) = 4
nullity(H0) = 4
Gamma_union is not identifiable from H0
```

## 3. Claim-identifiability criterion

Let `c` be the row vector representing the scalar claim `Gamma_c(x)=c x`.

The bounded linear criterion is:

```text
Gamma_c is identifiable from H
iff
c belongs to rowspace(H)
```

Equivalently:

```text
rank(H) = rank([H;c])
```

This criterion asks whether every state compatible with the current observations agrees on the declared claim. It does **not** require the full latent state to be point identified.

## 4. Predeclared one-action candidate family

The fixture tests:

```text
DIRECT_UNION
DIRECT_NONE
PAIR_DB
PAIR_DF
PAIR_BF
TRIPLE_DBF
EXACTLY_ONE
AT_LEAST_TWO
```

Every one-action candidate raises the full observation rank from 4 to 5.

Yet only:

```text
DIRECT_UNION
DIRECT_NONE
```

make the frozen union claim identifiable in one action.

Therefore:

```text
rank_gain = 1 for every candidate
```

while:

```text
claim_gain differs by candidate
```

Bounded result:

```text
RANK_GAIN_NOT_EQUIVALENT_TO_CLAIM_GAIN_WITNESSED_IN_FIXTURE
```

## 5. Grammar-dependent minimum action count

If direct union/complement observations are admitted, the claim can resolve in one action.

If the admissible grammar is restricted to primitive interaction cells:

```text
PAIR_DB
PAIR_DF
PAIR_BF
TRIPLE_DBF
```

all four additional observations are required to identify the union through inclusion-exclusion.

If broader aggregate observations are admitted while direct union/complement are excluded, some two-action sets suffice, including:

```text
TRIPLE_DBF + EXACTLY_ONE
TRIPLE_DBF + AT_LEAST_TWO
EXACTLY_ONE + AT_LEAST_TWO
```

Therefore:

```text
minimum observation count is action-grammar conditioned
```

not a property of the claim alone.

## 6. Claim-sufficient stop

After one direct union or direct none observation:

```text
rank = 5
full-state nullity = 3
Gamma_union = identifiable
```

The claim can therefore lawfully stop while the full joint exposure architecture remains nonpoint.

Bounded result:

```text
CLAIM_SUFFICIENT_STOP_BEFORE_FULL_STATE_IDENTIFICATION_WITNESSED_IN_FIXTURE
```

This reproduces the independent TD613 law:

```text
claim-sufficient stopping != full-state identification
```

without converting that law into an SR source claim.

## 7. Optimality abstention

Two one-action candidates resolve the claim:

```text
DIRECT_UNION
DIRECT_NONE
```

The current fixture does not declare:

```text
measurement cost
noise variance
covariance with existing observations
missingness risk
ethical burden
sampling feasibility
```

Therefore the selector may identify the **resolver set** but may not crown one member as optimal.

Disposition:

```text
CLAIM_RESOLVER_SET = {DIRECT_UNION, DIRECT_NONE}
OPTIMALITY = ABSTAIN_UNTIL_COST_AND_UNCERTAINTY_GEOMETRY_DECLARED
```

This is intentionally aligned with Aperture v3.2's typed-deficit discipline:

```text
missing uncertainty != neutral uncertainty
available candidate != needed question
proposal != execution
```

## 8. Proposed selector grammar

```text
1. Freeze claim Gamma.
2. Declare current observation operator H and uncertainty posture.
3. If Gamma is already identifiable, ASK_NOTHING.
4. Enumerate only predeclared admissible candidate observations.
5. For each candidate h, test whether Gamma becomes identifiable under [H;h].
6. Preserve candidates that contract claim-relevant ambiguity even when full-state rank remains deficient.
7. If multiple candidates resolve Gamma, compare them only under declared cost/noise/feasibility geometry.
8. If those comparison coordinates are undeclared, ABSTAIN on optimality.
9. A selected candidate remains a proposal; no observation is executed automatically.
```

## 9. Anti-equivalences

```text
rank gain != claim gain
claim resolution != full-state identification
one-action resolver != optimal action
minimum action count != invariant across action grammars
available candidate != needed question after claim resolution
claim selector != observation execution
TD613 fixture != SR doctrine
source-derived semantics != source-authored operator geometry
```

## 10. Claim ceiling

Permitted:

```text
CLAIM_CONDITIONED_NEXT_OBSERVATION_SELECTOR_FIXTURE_IMPLEMENTED
RANK_GAIN_NOT_EQUIVALENT_TO_CLAIM_GAIN_WITNESSED_IN_FIXTURE
CLAIM_SUFFICIENT_STOP_BEFORE_FULL_STATE_IDENTIFICATION_WITNESSED_IN_FIXTURE
OPTIMALITY_ABSTENTION_WHEN_COST_NOISE_GEOMETRY_UNDECLARED
```

Forbidden:

```text
SR_ACTIVE_LEARNING_CONFIRMED
SR_OPTIMAL_EXPERIMENT_DESIGN_CONFIRMED
DIRECT_UNION_MEASUREMENT_PROVEN_FEASIBLE
DIRECT_NONE_MEASUREMENT_PROVEN_FEASIBLE
TD613_VALIDATED_BY_SR
SR_VALIDATED_BY_TD613
AUTOMATIC_EXPERIMENT_EXECUTION
```

U+10D613

𝌋

Sealed ⟐
