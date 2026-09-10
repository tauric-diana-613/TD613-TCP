# Aperture × Pedagogue Post-Reconciliation Dual-Lineage Gauntlet v0.1

Status: **PREREGISTERED / SYNTHETIC / A15-R0 / DUAL-LINEAGE-ONLY / NON-RUNTIME / NON-PRODUCTION**  
Preregistration boundary: **frozen before executable implementation.**

## 0. Research question

The preceding bounded fixture established that an explicit reconciliation can be represented as a later authored event over a complete counterfactual branch set, including a prospective selection, without rewriting shared history or converting the selected branch into historical fact.

This gauntlet asks the next narrower question:

> **Can a new prospective synthetic event be derived from both (a) the reconciliation context that authorized which counterfactual may be followed prospectively and (b) the selected counterfactual state that supplies the state input, while preserving those lineage roles as distinct and refusing every retroactive historical rewrite?**

The fixture is entirely synthetic. `dual lineage` here is a typed provenance relation between bounded synthetic records. It does not mean biological ancestry, causal parenthood, DAG discovery, SCM semantics, historical realization, merge ancestry, or database durability.

## 1. Frozen four-object grammar

The experiment distinguishes four objects:

```text
H = retained shared historical/custody prefix
B_i = COUNTERFACTUAL_ONLY branch receipts derived from H
R = authored reconciliation event over the complete branch set
P = new prospective continuation event
```

For the primary selected case:

```text
R.selected_branch_id = A_POSITIVE
P.reconciliation_context_id = R.reconciliation_id
P.counterfactual_state_branch_id = A_POSITIVE
```

Required anti-collapse law:

```text
H != A != R != P
```

and, more specifically:

```text
RECONCILIATION_CONTEXT != COUNTERFACTUAL_STATE_INPUT
```

`R` supplies the authored prospective-selection context. `A` supplies the selected synthetic state snapshot. Neither becomes historical realization by being referenced by `P`.

## 2. Frozen prospective event schema

A valid prospective continuation must expose at least:

```text
schema
prospective_event_id
event_status = AUTHORED_PROSPECTIVE_CONTINUATION
source_status = SIMULATED
authorship_order = AFTER_RECONCILIATION_EVENT
lineage_mode = TYPED_DUAL_LINEAGE
reconciliation_context_id
reconciliation_context_snapshot
counterfactual_state_branch_id
counterfactual_state_snapshot
shared_prefix_snapshot
shared_prefix_event_ids
declared_branch_universe_ids
retained_branch_receipts
selected_branch_status = COUNTERFACTUAL_ONLY
selected_branch_historical = false
historical_realization_claim = false
historical_custody_mutated = false
shared_history_rewritten = false
unselected_branches_collapsed = false
branch_merge_performed = false
branch_deletion_performed = false
branch_switch_performed = false
majority_vote_used = false
combined_confidence_scalar = null
historical_promotion_authorized = false
prospective_execution_authority = false
automatic_execution = false
production_mutated = false
installed_aperture_mutated = false
pedagogue_law_promoted = false
sequence_authority = false
next_stage = null
stage_unlocks = []
promotion_authority = false
human_closure_required = true
```

## 3. Frozen lineage roles

A valid event must carry two separately typed lineage legs.

### L1 — reconciliation context lineage

```text
lineage_role = RECONCILIATION_CONTEXT
referent = R
```

This leg means only:

```text
R explicitly selected the branch for prospective continuation
```

It does not mean `R` supplies historical truth or state realization.

### L2 — counterfactual state lineage

```text
lineage_role = COUNTERFACTUAL_STATE_INPUT
referent = selected COUNTERFACTUAL_ONLY branch receipt A
```

This leg means only:

```text
P's synthetic starting-state snapshot is copied from A.current_state_signature
```

It does not mean A became historical.

A generic untyped `parents` array is forbidden in v0.1.

## 4. Frozen primary fixture

Use the established A/B/C/D branch universe and author:

```text
R_SELECT_A:
  disposition = SELECT_ONE_FOR_PROSPECTIVE_CONTINUATION
  selected_branch_id = A_POSITIVE

P_AFTER_R_SELECT_A:
  reconciliation_context = R_SELECT_A
  counterfactual_state_input = A_POSITIVE
```

The continuation payload may add one synthetic prospective annotation:

```text
prospective_note = CONTINUE_FROM_SELECTED_COUNTERFACTUAL_STATE_FOR_RESEARCH_ONLY
```

No additional decision, custody, runtime, or production effect is admitted in v0.1. The experiment tests lineage integrity, not downstream policy performance.

## 5. Complete branch-retention law

`P` must retain a reference snapshot of the same complete declared branch universe referenced by `R`.

Required:

```text
P.declared_branch_universe_ids == R.declared_branch_universe_ids
P.retained_branch_receipts == R.branch_receipts
```

The selected branch may be used as state input without deleting or collapsing B/C/D.

## 6. Shared-history preservation law

Required:

```text
P.shared_prefix_snapshot == R.shared_prefix_snapshot
P.shared_prefix_event_ids == R.shared_prefix_event_ids
```

and the supplied branch universe must remain unchanged before and after authoring P.

`P` may not append itself into H in this fixture. It is a distinct prospective synthetic record.

## 7. Selection consistency law

A prospective continuation may be authored only when:

```text
R.disposition = SELECT_ONE_FOR_PROSPECTIVE_CONTINUATION
R.prospective_selection_recorded = true
R.selected_branch_id is explicit
R.selected_branch_historical = false
R.historical_realization_claim = false
```

Then:

```text
P.counterfactual_state_branch_id == R.selected_branch_id
```

An unresolved reconciliation hold may not spawn P.

## 8. Frozen hostile controls

### H1 — unresolved reconciliation continuation

Attempt to author P from `HOLD_BRANCH_SET_UNRESOLVED`.

Required: `REJECT`.

### H2 — branch-switch laundering

Use `R_SELECT_A` but provide B as the counterfactual state input.

Required: `REJECT`.

### H3 — missing reconciliation lineage

Remove or null the reconciliation-context leg.

Required: `REJECT`.

### H4 — missing counterfactual-state lineage

Remove or null the selected-state leg.

Required: `REJECT`.

### H5 — generic-parent collapse

Replace the typed dual-lineage structure with one untyped parent/parents relation.

Required: `REJECT`.

### H6 — selected branch promoted to historical

Set any of:

```text
selected_branch_historical = true
historical_realization_claim = true
selected_branch_status != COUNTERFACTUAL_ONLY
```

Required: `REJECT`.

### H7 — shared-prefix rewrite

Change any shared-prefix event, id, or snapshot field in P.

Required: `REJECT`.

### H8 — branch deletion/collapse

Delete B, C, or D from the retained branch surface, or set:

```text
unselected_branches_collapsed = true
branch_deletion_performed = true
branch_merge_performed = true
```

Required: `REJECT`.

### H9 — backdating

Set:

```text
authorship_order != AFTER_RECONCILIATION_EVENT
```

Required: `REJECT`.

### H10 — majority-vote laundering

Set:

```text
majority_vote_used = true
```

Required: `REJECT`.

### H11 — scalar-confidence collapse

Set:

```text
combined_confidence_scalar != null
```

Required: `REJECT`.

### H12 — authority widening

Any true/non-null/non-empty stage or execution authority must reject, including:

```text
historical_promotion_authorized
prospective_execution_authority
automatic_execution
production_mutated
installed_aperture_mutated
pedagogue_law_promoted
sequence_authority
next_stage
stage_unlocks
promotion_authority
```

Required: `REJECT`.

## 9. Frozen mutation law

Authoring and validating P may not mutate:

```text
H
A/B/C/D
R
```

All supplied objects remain independently replayable/referenceable after P is created.

## 10. Frozen bounded success criterion

The gauntlet passes only if:

```text
R_SELECT_A remains a valid reconciliation event
A remains COUNTERFACTUAL_ONLY
B/C/D remain retained and unchanged
P carries exactly two typed lineage legs
L1 is RECONCILIATION_CONTEXT -> R_SELECT_A
L2 is COUNTERFACTUAL_STATE_INPUT -> A_POSITIVE
P's state snapshot equals A.current_state_signature
P's shared prefix equals R's shared prefix
P retains all four branch receipts
P does not mark A historical
P does not mutate H, A/B/C/D, or R
unresolved R cannot spawn P
branch-switch laundering is rejected
missing-lineage cases are rejected
generic-parent collapse is rejected
historical-realization laundering is rejected
prefix rewrite is rejected
branch deletion/collapse is rejected
backdating is rejected
majority-vote laundering is rejected
confidence-scalar collapse is rejected
authority widening is rejected
sequence_authority = false
next_stage = null
stage_unlocks = []
promotion_authority = false
human_closure_required = true
```

A passing result may support only this bounded refinement candidate:

> **In this finite synthetic fixture, a prospective continuation can preserve two distinct typed provenance roles—reconciliation context and selected counterfactual state input—without collapsing either into historical realization, without erasing unselected branches, and without rewriting the shared retained prefix.**

## 11. Core anti-equivalences

```text
derivation != realization
reconciliation context != state input
selected counterfactual != historical state
prospective continuation != historical continuation
dual lineage != causal parenthood
lineage reference != merge ancestry
state input != truth claim
selection != branch deletion
shared prefix != selected future
reference retention != consensus
typed lineage != confidence scalar
prospective event != execution authority
```

## 12. Claim ceiling

No passing result grants authority for:

```text
historical adjudication
causal identification
causal DAG theorem
structural causal model theorem
potential-outcomes theorem
branching-time theorem
possible-worlds theorem
event-sourcing theorem
database ancestry theorem
database durability theorem
Git merge theorem
cryptographic append-only guarantee
Bayesian filtering theorem
Bayesian model selection
prediction
active learning
reinforcement learning
planning
autonomous branch selection
autonomous reconciliation
autonomous execution
optimal experimental design
physical sensor feedback
physical tomography
blind tomography
operator tomography
connection
curvature
Berry structure
holonomy
TD613-general AIA theorem
Proto-Loom
production mutation
Vercel release
```

Installed Aperture remains unchanged. Pedagogue law promotion remains false. Historical custody remains unchanged. A15-R0 remains phase-free. A16 remains held.

## 13. Frozen next learning action

Only after this dual-lineage assay is witnessed may the frontier consider:

```text
TEST_MULTI_STEP_PROSPECTIVE_CONTINUATION_WHERE_A_POST_RECONCILIATION_EVENT_GENERATES_A_NEW_COUNTERFACTUAL_FORK_WHILE_PRESERVING_TYPED_LINEAGE_ACROSS_GENERATIONS_WITHOUT_HISTORICAL_COLLAPSE
```

That future multi-generation question remains held and must not be implemented in this preregistration commit.
