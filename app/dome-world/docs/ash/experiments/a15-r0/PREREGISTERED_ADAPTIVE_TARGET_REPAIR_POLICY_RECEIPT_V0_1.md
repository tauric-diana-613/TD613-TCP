𝌋‌⟐

# A15-R0 · Preregistered Adaptive Target-Repair Policy v0.1

Status: **ADAPTIVE-CONTROL ARCHITECTURE CANDIDATE / SYNTHETIC OUTCOME FIXTURE / EMPIRICAL REPAIR UNEARNED**

## Exact scientific parent

`99a3dc13638ddb74b5b65336fb3d306b50f59dff` — Minimal Target-Separating Acquisition Cover 𝄐.

The parent established that a complete static plan must cover every target pair left unresolved by the frozen evidence regime and that minimum-cardinality and minimum-cost plans can differ.

This chamber addresses Potato's remaining seam: once the outcome of an acquisition can change which ambiguity remains, a static cover is no longer enough. The system needs a preregistered policy mapping interim evidence states to the next acquisition.

## Preregistered policy

Declared target: `THETA`.

Base unresolved target pairs:

- `(THETA_A, THETA_B)`
- `(THETA_A, THETA_C)`
- `(THETA_B, THETA_C)`

The policy is frozen before outcomes under digest:

`daf12e7188e768680db65caba450c7de98b008a1666c058d6ebdae4b01a8fa24`.

The first acquisition is always:

`Z_BRANCH`, cost `1`.

Its preregistered outcome model is:

- `A_SEPARATED`, probability `0.5`: resolves `AB` and `AC`, leaving `BC`; next acquisition must be `Z_BC`.
- `C_SEPARATED`, probability `0.5`: resolves `AC` and `BC`, leaving `AB`; next acquisition must be `Z_AB`.

Each specialized second acquisition costs `1` and deterministically resolves the remaining pair in this synthetic fixture.

The stop rule is preregistered:

`STOP_WHEN_UNRESOLVED_TARGET_PAIR_COUNT_IS_ZERO`.

The optimization objective is preregistered:

`MIN_EXPECTED_TOTAL_COST`.

## Predicted ledger and realized ledger are distinct

Before any outcome is observed, the policy may predict:

- expected unresolved pairs after `Z_BRANCH`: `1`;
- expected pairs resolved after `Z_BRANCH`: `2`;
- expected total adaptive policy cost: `2`.

But the predicted ledger is forbidden from containing a realized branch.

After observation, the realized ledger records only what actually happened.

If `A_SEPARATED` occurs, the realized next acquisition must be `Z_BC`.

If `C_SEPARATED` occurs, the realized next acquisition must be `Z_AB`.

The realized branch receives identifying credit only from the observed outcome path.

`EXPECTED_TARGET_REFINEMENT != REALIZED_TARGET_REFINEMENT`.

`PREDICTED_COVERAGE != REALIZED_COVERAGE`.

## Adaptation without post-hoc reselection

Adaptive design is not permission to improvise after seeing the result.

The policy's branch map, stop rule, objective, and costs are frozen before acquisition. A trace that observes `A_SEPARATED` and then chooses `Z_AB` is inadmissible even if some after-the-fact argument claims that choice was clever.

`PREREGISTERED_ADAPTATION != POSTHOC_RESELECTION`.

`POLICY_BRANCHING != UNBOUNDED_RESELECTION`.

The chamber also forbids acquisitions after the stopping criterion is met.

This is consistent with established adaptive-design guidance requiring decision rules and boundaries to be specified in advance and actual adaptation decisions to be auditable against those rules. See the Adaptive Designs CONSORT Extension (ACE) statement, BMJ 2020: https://www.bmj.com/content/369/bmj.m115 .

Current cost-aware experimental-design work likewise treats sequential acquisition under measurement costs as an explicit optimization problem rather than an informal afterthought. See Mareis & Drton, CLeaR 2026, `Cost-Aware Optimized Front-Door Experimental Design`: https://proceedings.mlr.press/v323/mareis26a.html .

These are contextual methodological witnesses, not same-episode Western measurements.

## Bounded cost result

A nonadaptive guaranteed plan that refuses to use the first outcome to choose the second acquisition must carry all three probes:

`Z_BRANCH + Z_AB + Z_BC`, total cost `3`.

The preregistered adaptive policy executes:

`Z_BRANCH + one outcome-matched specialized probe`, total cost `2` on either allowed branch.

Thus, in this finite fixture:

`ADAPTIVE_EXPECTED_COST = 2 < NONADAPTIVE_GUARANTEED_COST = 3`.

This is a bounded synthetic control result, not an empirical budget measurement.

## Earned claim candidate

On exact-head green:

`A_TARGET_REPAIR_POLICY_MAY_ADAPT_TO_INTERIM_OUTCOMES_WITHOUT_POSTHOC_RESELECTION_WHEN_THE_BRANCHING_RULES_STOPPING_RULE_OBJECTIVE_AND_COSTS_ARE_FROZEN_BEFORE_ACQUISITION_AND_REALIZED_IDENTIFYING_CREDIT_IS_ADJUDICATED_ONLY_FROM_OBSERVED_BRANCH_OUTCOMES`.

## Claim ceiling

This chamber does not yet earn Potato's full empirical-repair condition.

`STATIC_COMPLETE_COVER != ADAPTIVE_EMPIRICAL_REPAIR`.

`SYNTHETIC_OUTCOME_POLICY_ASSAY != EMPIRICAL_SUPPLEMENTAL_PROBE_REPAIR`.

`STOCHASTIC_PROBE_FAILURE_MODEL = UNEARNED`.

`VARIABLE_REALIZED_COST_MODEL = UNEARNED`.

No empirical target outcome is acquired here.

No empirical exteriority information gain is measured.

No artifact-origin proof is earned.

Exact Golden Egg surfaces remain `[]`; empirical Golden Egg credit remains `0`.

No sequence authority, numbered-stage authority, merge, production, deployment, publication, Vercel, live Loom mutation, or public promotion is granted.

## Child-legible form

**THE PLAN MAY TURN AFTER THE RESULT, BUT THE TURN HAD TO EXIST BEFORE THE RESULT ARRIVED.**

## Expected rest

**WESTERN HORIZON: ADAPTATION MAY FOLLOW OUTCOMES ONLY THROUGH A POLICY FROZEN BEFORE THE OUTCOMES.**

𝄐

Sealed ⟐
