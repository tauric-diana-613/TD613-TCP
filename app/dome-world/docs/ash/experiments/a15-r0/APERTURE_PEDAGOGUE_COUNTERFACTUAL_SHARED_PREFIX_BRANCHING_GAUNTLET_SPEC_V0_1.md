# Aperture × Pedagogue Counterfactual Shared-Prefix Branching Gauntlet v0.1

Status: **PREREGISTERED / SYNTHETIC / A15-R0 / COUNTERFACTUAL-ONLY / NON-RUNTIME / NON-PRODUCTION**  
Preregistration boundary: **frozen before executable implementation.**

## 0. Research question

The preceding bounded fixture established an authored replay grammar in which current decision and custody postures may change non-monotonically while retained replay history remains append-only.

This gauntlet asks the next narrower question:

> **Can multiple legitimate counterfactual futures be replayed from one exactly shared custodied prefix without allowing any branch to rewrite the shared past, silently become historical custody, or resolve branch disagreement by copy count?**

The fixture is entirely synthetic. `counterfactual` means an authored alternative suffix evaluated against the same retained prefix. It does not mean causal identification, structural-causal-model intervention, branching-world ontology, prediction, or external future claim.

## 1. Frozen branch grammar

Let the retained prefix be:

```text
H0 = [e0, e1, ..., ek]
E0 = reduce(H0)
```

A counterfactual branch is:

```text
B_i = <branch_id, prefix_reference, suffix_i, status>
status = COUNTERFACTUAL_ONLY
H_i = H0 || suffix_i
E_i = reduce(H_i)
```

The branch object must retain:

```text
branch_id
branch_status = COUNTERFACTUAL_ONLY
shared_prefix_length
shared_prefix_snapshot
shared_prefix_event_ids
suffix_events
current_state
replay_trace
promotion_authority = false
historical_custody_mutated = false
automatic_execution = false
human_closure_required = true
```

The shared prefix is copied/referenced for replay comparison but remains the common retained evidence object. No suffix event becomes part of historical custody merely because its replay succeeds.

## 2. Frozen shared-prefix identity law

For every branch derived from the same fork:

```text
branch.shared_prefix_snapshot deep-equals H0
branch.history[0:H0.length] deep-equals H0
branch.shared_prefix_event_ids == H0.map(event_id)
branch first suffix sequence == H0.length
branch first suffix previous_event_id == H0[-1].event_id
```

Across branches A and B:

```text
A.shared_prefix_snapshot deep-equals B.shared_prefix_snapshot
```

Divergence may begin only at the first suffix event.

## 3. Frozen shared prefix

The authored prefix begins with:

```text
D0 = DECISION_ABSTAIN_ORIENTATION_UNRESOLVED
C0 = CUSTODY_MULTI_ROOT_SYNTHETIC_AGREEMENT
```

The prefix itself must be replay-consistent before any branch is constructed.

This prefix remains unchanged in every valid branch.

## 4. Frozen counterfactual branches

### Branch A — positive decision observation

Append to the shared prefix:

```text
kind = DECISION_OBSERVATION
y_hat = +0.001
bound = 0.0002
actual_eta = 0
```

Expected branch head:

```text
D_A = DECISION_ACTIONABLE_PLUS
C_A = CUSTODY_MULTI_ROOT_SYNTHETIC_AGREEMENT
selected_action = Q_PLUS_REPAIR
```

### Branch B — negative decision observation

Append to the same shared prefix:

```text
kind = DECISION_OBSERVATION
y_hat = -0.001
bound = 0.0002
actual_eta = 0
```

Expected branch head:

```text
D_B = DECISION_ACTIONABLE_MINUS
C_B = CUSTODY_MULTI_ROOT_SYNTHETIC_AGREEMENT
selected_action = Q_MINUS_REPAIR
```

### Branch C — custody-conflict suffix

Append to the same shared prefix:

```text
kind = CUSTODY_RECEIPT_SET
custody classification = PROVENANCE_CONFLICT_HOLD
```

Expected branch head:

```text
D_C = DECISION_ABSTAIN_ORIENTATION_UNRESOLVED
C_C = CUSTODY_PROVENANCE_CONFLICT_HOLD
selected_action = null
```

### Branch D — decision evidence becomes ineligible

Append to the same shared prefix:

```text
kind = DECISION_OBSERVATION
y_hat = -0.0001
bound = 0.00005
actual_eta = -0.0009
```

Expected branch head:

```text
D_D = DECISION_EVIDENCE_INELIGIBLE_BOUND_FALSIFIED
C_D = CUSTODY_MULTI_ROOT_SYNTHETIC_AGREEMENT
selected_action = null
```

All four are legitimate authored replay outcomes from the same prefix. Their coexistence does not select a winner.

## 5. Frozen branch comparison grammar

A branch comparison may return only descriptive relation fields:

```text
shared_prefix_identical
shared_prefix_length
branch_ids
head_states
head_states_equal
decision_heads_equal
custody_heads_equal
divergence_event_index
relation_status
winner = null
merge_authorized = false
historical_promotion_authorized = false
majority_vote_used = false
```

Required relation statuses:

```text
DIVERGENT_COUNTERFACTUAL_HEADS
EQUIVALENT_COUNTERFACTUAL_HEADS
INVALID_SHARED_PREFIX
```

The comparison must not rank, choose, average, merge, or promote branches.

## 6. Duplicate-branch anti-majority control

Construct:

```text
A1 = exact counterfactual copy of Branch A under a distinct branch_id
A2 = exact counterfactual copy of Branch A under another distinct branch_id
B1 = Branch B
```

Required result:

```text
raw branch count: A-like 2, B-like 1
winner = null
majority_vote_used = false
relation_status = DIVERGENT_COUNTERFACTUAL_HEADS
```

Duplicating one suffix does not create independent evidence and does not resolve the branch set.

## 7. Shared-prefix mutation hostile controls

### H1 — branch-local retroactive payload edit

Copy Branch A and mutate an event payload inside the shared prefix while leaving the other branches unchanged.

Required:

```text
shared_prefix_identical = false
relation_status = INVALID_SHARED_PREFIX
```

If the edited event's stored `state_after` is unchanged, ordinary replay should also reject payload/state mismatch.

### H2 — branch-local historical deletion

Delete a shared-prefix event in only one branch.

Required:

```text
shared-prefix identity fails
replay or sequence/predecessor validation rejects
```

### H3 — retroactive harmonization attempt

Modify the shared prefix in one branch in an attempt to make divergent branch heads appear equivalent.

Required:

```text
INVALID_SHARED_PREFIX
winner = null
merge_authorized = false
```

Agreement purchased by rewriting the common past is inadmissible in this fixture.

## 8. Merge hold

No branch merge rule is authored in v0.1.

If two branch heads differ:

```text
merge_authorized = false
merge_status = EXPLICIT_RECONCILIATION_RULE_REQUIRED
```

If two branch heads happen to match:

```text
merge_authorized = false
merge_status = EQUIVALENT_HEADS_DO_NOT_CONSTITUTE_AUTHORIZED_MERGE
```

Head equality does not establish equivalent provenance, causation, authority, or historical realization.

## 9. Counterfactual / historical authority boundary

Every suffix event and branch receipt must carry:

```text
source_status = SIMULATED
branch_status = COUNTERFACTUAL_ONLY
historical_custody_mutated = false
promotion_authority = false
automatic_execution = false
human_closure_required = true
```

A replayable alternative is not a historical event.

The implementation must expose:

```text
counterfactual_branch != historical_custody
shared past != shared future
branch comparison != reconciliation
branch count != independent support
head equality != provenance equality
head divergence != historical contradiction
counterfactual replay != causal inference
```

## 10. Frozen bounded success criterion

The gauntlet passes only if:

```text
shared prefix replays consistently before branching
A/B/C/D preserve the exact shared prefix
A -> ACTIONABLE_PLUS / AGREEMENT
B -> ACTIONABLE_MINUS / AGREEMENT
C -> ABSTAIN / PROVENANCE_CONFLICT_HOLD
D -> DECISION_EVIDENCE_INELIGIBLE_BOUND_FALSIFIED / AGREEMENT
all four branch histories replay to their stored branch heads
A/B comparison returns DIVERGENT_COUNTERFACTUAL_HEADS with no winner or merge
A1/A2/B1 duplicate-majority control remains unresolved with no winner
branch-local prefix mutation returns INVALID_SHARED_PREFIX and/or replay rejection
branch-local prefix deletion rejects
retroactive harmonization is rejected
historical_custody_mutated remains false for every counterfactual branch
promotion_authority remains false
combined confidence scalar is absent/null
automatic execution remains false
human closure remains required
```

A passing fixture may support only this bounded refinement candidate:

> **In this finite synthetic fixture, multiple replayable counterfactual suffixes can diverge from one exactly shared retained evidence prefix while preserving the common past, branch identity, and non-promotion boundary; alternative futures need not retroactively rewrite or resolve their shared custody history.**

## 11. Claim ceiling

No passing result grants authority for:

```text
causal counterfactual theorem
structural causal model theorem
potential-outcomes theorem
branching-time logic theorem
possible-worlds semantics theorem
multiverse claim
Git/version-control theorem
event-sourcing theorem
database branching theorem
database durability theorem
cryptographic append-only-log theorem
blockchain claim
tamper-proof storage claim
Bayesian model selection
Bayesian filtering theorem
Markov-state theorem
POMDP theorem
consensus theorem
real-world provenance-independence claim
prediction
active learning
reinforcement learning
optimal experimental design
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

Installed Aperture remains unchanged. Pedagogue law promotion remains false. Human closure remains required.

## 12. Frozen next learning action

Only after this branching assay is witnessed may the frontier consider:

```text
TEST_EXPLICIT_RECONCILIATION_AS_A_NEW_AUTHORED_EVENT_THAT_REFERENCES_MULTIPLE_COUNTERFACTUAL_BRANCH_RECEIPTS_WITHOUT_REWRITING_THE_SHARED_PREFIX_OR_PRETENDING_BRANCH_SELECTION_WAS_HISTORICAL_FACT
```

That future reconciliation question remains held and must not be implemented in this preregistration commit.
