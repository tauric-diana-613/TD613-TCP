# Aperture × Pedagogue Explicit Reconciliation Event Gauntlet v0.1

Status: **PREREGISTERED / SYNTHETIC / A15-R0 / COUNTERFACTUAL-RECONCILIATION-ONLY / NON-RUNTIME / NON-PRODUCTION**  
Preregistration boundary: **frozen before executable implementation.**

## 0. Research question

The preceding bounded fixture established that multiple replayable counterfactual suffixes may diverge from one exactly shared custodied prefix while preserving that common past and refusing branch-count voting.

This gauntlet asks the next narrower question:

> **Can an explicit reconciliation be represented as a new authored event that references a complete counterfactual branch set, records a prospective disposition, and still preserves the shared prefix, every branch receipt, and the fact that branch selection is not historical realization?**

The fixture is entirely synthetic. `reconciliation` means a newly authored record *about* an already materialized counterfactual branch set. It does not mean causal identification, factual adjudication, consensus, merge, deletion of alternatives, or discovery of what historically occurred.

## 1. Frozen three-layer grammar

The experiment distinguishes three objects:

```text
H = retained shared historical/custody prefix
B_i = COUNTERFACTUAL_ONLY branch receipt derived from H
R = newly authored reconciliation event referencing {B_i}
```

Required anti-collapse law:

```text
H != B_i != R
```

A reconciliation event may reference branch receipts. It may not splice any counterfactual suffix into `H`.

A prospective branch preference may be recorded in `R`. It may not convert that branch into historical fact.

## 2. Frozen reconciliation event schema

A valid reconciliation event must expose:

```text
schema
reconciliation_id
event_status = AUTHORED_RECONCILIATION_EVENT
source_status = SIMULATED
reconciliation_scope = COUNTERFACTUAL_BRANCH_SET
authorship_order = AFTER_REFERENCED_BRANCH_RECEIPTS
shared_prefix_snapshot
shared_prefix_event_ids
declared_branch_universe_ids
branch_receipts
disposition
selected_branch_id
selection_basis
selected_branch_historical = false
historical_realization_claim = false
historical_custody_mutated = false
counterfactual_branch_statuses_preserved = true
branch_merge_performed = false
branch_deletion_performed = false
majority_vote_used = false
combined_confidence_scalar = null
historical_promotion_authorized = false
prospective_execution_authority = false
automatic_execution = false
promotion_authority = false
human_closure_required = true
```

The reconciliation event itself is not inserted into historical custody in this fixture. It is a separate synthetic authored record whose referents remain independently replayable counterfactual receipts.

## 3. Frozen branch universe

Use the already preregistered A/B/C/D branch family from the shared-prefix branching gauntlet:

```text
A -> DECISION_ACTIONABLE_PLUS / CUSTODY_MULTI_ROOT_SYNTHETIC_AGREEMENT
B -> DECISION_ACTIONABLE_MINUS / CUSTODY_MULTI_ROOT_SYNTHETIC_AGREEMENT
C -> DECISION_ABSTAIN_ORIENTATION_UNRESOLVED / CUSTODY_PROVENANCE_CONFLICT_HOLD
D -> DECISION_EVIDENCE_INELIGIBLE_BOUND_FALSIFIED / CUSTODY_MULTI_ROOT_SYNTHETIC_AGREEMENT
```

All four must retain:

```text
branch_status = COUNTERFACTUAL_ONLY
historical_custody_mutated = false
promotion_authority = false
automatic_execution = false
```

The declared branch universe for the primary assay is exactly `[A,B,C,D]` by branch identity. Reconciliation may not erase the non-selected branches from its referenced record.

## 4. Frozen dispositions

Only two dispositions are admitted in v0.1.

### R1 — explicit prospective selection

```text
disposition = SELECT_ONE_FOR_PROSPECTIVE_CONTINUATION
selected_branch_id = A
selection_basis = EXPLICIT_AUTHORED_GESTURE
```

Required interpretation:

```text
prospective_selection_recorded = true
selected_branch_historical = false
historical_realization_claim = false
prospective_execution_authority = false
```

The event records a synthetic preference for future continuation. It does not assert that Branch A happened.

### R2 — unresolved hold

```text
disposition = HOLD_BRANCH_SET_UNRESOLVED
selected_branch_id = null
selection_basis = null
```

Required interpretation:

```text
prospective_selection_recorded = false
historical_realization_claim = false
```

The branch set remains explicitly unresolved.

## 5. Complete-reference law

For the declared branch universe:

```text
reconciliation.declared_branch_universe_ids == all supplied branch ids
reconciliation.branch_receipts contains exactly one snapshot per supplied branch id
no duplicate branch id
no omitted branch id
no added branch id
```

Each branch receipt snapshot must preserve at least:

```text
branch_id
branch_status
source_status
shared_prefix_event_ids
suffix_event_ids
current_state_signature
historical_custody_mutated
promotion_authority
automatic_execution
```

A reconciliation event may choose one branch prospectively without deleting the others from the event's reference surface.

## 6. Shared-prefix preservation law

Before authoring reconciliation, the supplied branch set must still satisfy the preceding branch-comparison grammar:

```text
shared_prefix_identical = true
```

The reconciliation event must carry an exact snapshot of the same shared prefix and event-id sequence.

It must never mutate any supplied branch object or any shared-prefix object.

## 7. No inferred selection

The implementation may not infer a selected branch from:

```text
branch count
copy count
head-state frequency
custody agreement frequency
majority vote
lexical branch order
first branch
last branch
```

For `SELECT_ONE_FOR_PROSPECTIVE_CONTINUATION`, `selected_branch_id` must be explicitly supplied and must name exactly one member of the declared universe.

For `HOLD_BRANCH_SET_UNRESOLVED`, `selected_branch_id` must be null.

## 8. Duplicate-majority hostile control

Use the prior duplicate family:

```text
A1 = A-like counterfactual copy
A2 = A-like counterfactual copy
B1 = B-like counterfactual branch
```

Attempt to author a selection without an explicit `selected_branch_id`.

Required result:

```text
REJECT
```

The two A-like copies do not elect A.

A hold event over `[A1,A2,B1]` remains valid only if all three receipts remain referenced and:

```text
majority_vote_used = false
selected_branch_id = null
```

## 9. Historical-realization laundering controls

### H1 — selected branch promoted to historical fact

Mutate a valid reconciliation receipt so that:

```text
selected_branch_historical = true
```

or:

```text
historical_realization_claim = true
```

Required result:

```text
REJECT
```

### H2 — branch status rewritten

Mutate any referenced branch receipt from:

```text
COUNTERFACTUAL_ONLY
```

to a historical/realized status.

Required result:

```text
REJECT
```

A reconciliation event cannot launder a counterfactual suffix into custody by relabeling it.

## 10. Retroactive-edit hostile controls

### H3 — shared-prefix rewrite

Mutate the reconciliation event's shared-prefix snapshot or one referenced branch's shared-prefix identity.

Required result:

```text
REJECT
```

### H4 — branch deletion

Delete a non-selected branch receipt or its id from an otherwise valid selected reconciliation event.

Required result:

```text
REJECT
```

Selection is not deletion.

### H5 — backdated reconciliation

Mutate:

```text
authorship_order != AFTER_REFERENCED_BRANCH_RECEIPTS
```

Required result:

```text
REJECT
```

The reconciliation event cannot pretend to pre-exist the branch receipts it cites.

### H6 — majority-vote laundering

Mutate:

```text
majority_vote_used = true
```

Required result:

```text
REJECT
```

## 11. Validation contract

A validation function must compare a reconciliation receipt against the original supplied branch universe and reject any mismatch in:

```text
shared prefix
branch universe ids
branch receipt snapshots
counterfactual status
historical-realization flags
authorship order
disposition/selection consistency
majority-vote flag
merge/deletion flags
authority ceiling
```

Validation is replay/receipt integrity for this synthetic object. It is not historical verification.

## 12. Frozen bounded success criterion

The gauntlet passes only if:

```text
A/B/C/D remain valid COUNTERFACTUAL_ONLY receipts over one identical prefix
R1 references all A/B/C/D receipts
R1 records explicit prospective selection of A
R1 does not mark A historical
R1 does not mutate the shared prefix
R1 does not delete B/C/D
R1 does not merge branches
R1 does not create execution or promotion authority
R2 references all A/B/C/D receipts with no selection
duplicate-majority selection without explicit branch id is rejected
duplicate-majority hold preserves all three receipts
historical-realization laundering is rejected
branch-status laundering is rejected
shared-prefix rewrite is rejected
branch deletion is rejected
backdating is rejected
majority-vote laundering is rejected
combined confidence scalar remains null
automatic execution remains false
human closure remains required
```

A passing fixture may support only this bounded refinement candidate:

> **In this finite synthetic fixture, reconciliation can be represented as a later authored event over a complete counterfactual branch set, including an explicit prospective branch preference, while preserving shared history and every branch receipt and without converting the selected counterfactual into historical realization.**

## 13. Core anti-equivalences

```text
reconciliation != realization
prospective selection != historical fact
selection != deletion
selection != merge
reference != mutation
branch receipt != custody event
branch majority != evidence majority
branch count != independent support
later authored event != retroactive cause
counterfactual continuation != historical reconstruction
```

## 14. Claim ceiling

No passing result grants authority for:

```text
historical adjudication
causal identification
structural causal model theorem
potential-outcomes theorem
branching-time logic theorem
possible-worlds theorem
consensus theorem
voting theorem
merge theorem
event-sourcing theorem
database durability theorem
cryptographic append-only guarantee
tamper-proof storage
Bayesian model selection
Bayesian filtering theorem
prediction
active learning
reinforcement learning
optimal experimental design
autonomous reconciliation
autonomous escalation
autonomous execution
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

Installed Aperture remains unchanged. Pedagogue law promotion remains false. Historical custody remains unchanged. Human closure remains required.

## 15. Frozen next learning action

Only after this reconciliation assay is witnessed may the frontier consider:

```text
TEST_POST_RECONCILIATION_PROSPECTIVE_CONTINUATION_WITH_DUAL_LINEAGE_WHERE_NEW_EVENTS_DESCEND_FROM_THE_RECONCILIATION_RECORD_AND_THE_SELECTED_COUNTERFACTUAL_RECEIPT_WITHOUT_COLLAPSING_UNSELECTED_BRANCHES_OR_REWRITING_SHARED_HISTORY
```

That future continuation question remains held and must not be implemented in this preregistration commit.
