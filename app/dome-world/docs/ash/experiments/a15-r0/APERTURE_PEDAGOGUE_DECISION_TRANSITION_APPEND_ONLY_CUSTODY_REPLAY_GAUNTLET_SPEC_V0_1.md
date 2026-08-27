# Aperture × Pedagogue Decision Transition / Append-Only Custody Replay Gauntlet v0.1

Status: **PREREGISTERED / SYNTHETIC / A15-R0 / NON-RUNTIME / NON-PRODUCTION**  
Preregistration boundary: **frozen before executable implementation.**

## 0. Research question

The preceding bounded fixture represented decision posture and custody/provenance posture as independently typed axes:

```text
E_t = <D_t, C_t>
```

The next question is temporal:

> **Can the current decision state change when new observations arrive while the custody/replay history remains append-only, preserving earlier postures, conflicts, routes, and the evidence conditions under which they were legitimate?**

The word **monotonic** applies only to retention of the authored event ledger:

```text
history_{t+1} contains history_t as an unchanged prefix
```

It does **not** mean that certainty, agreement, actionability, evidentiary quality, or the current epistemic state must increase monotonically.

A current state may legitimately move:

```text
ABSTAIN -> ACTIONABLE -> ABSTAIN
```

if later valid observations change the declared decision interval.

## 1. Frozen replay grammar

The authored event-sourced state is:

```text
H_t = [e_0, e_1, ..., e_t]
E_t = reduce(H_t)
E_t = <D_t, C_t>
```

Every event must carry:

```text
event_id
sequence
previous_event_id
kind
payload
source_status = SIMULATED
authority_class = A2_DERIVATIONAL
```

Allowed event kinds:

```text
INITIAL_JOINT_STATE
DECISION_OBSERVATION
CUSTODY_RECEIPT_SET
```

The reducer may update only the axis named by the event kind:

```text
DECISION_OBSERVATION -> D changes; C remains unchanged
CUSTODY_RECEIPT_SET  -> C changes; D remains unchanged
```

`INITIAL_JOINT_STATE` initializes both axes.

## 2. Append-only replay law

For every valid append:

```text
new_history.length = prior_history.length + 1
new_history[0:prior_history.length] deep-equals prior_history
new_event.sequence = prior_history.length
new_event.previous_event_id = prior_history[-1].event_id
```

The implementation must reject:

```text
duplicate event_id
out-of-order sequence
wrong previous_event_id
unknown event kind
malformed payload
attempted in-place replacement of prior event
```

This is a bounded event-chain topology test, not a cryptographic append-only log theorem.

## 3. Current-state versus replay-state law

The current snapshot is a reduction over the retained history, not a replacement for it.

Required anti-equivalences:

```text
current state != complete replay history
state transition != prior-state falsification
new decision observation != custody rewrite
new custody receipt != decision rewrite
resolved decision != erased prior abstention
current agreement != erased prior conflict
current conflict != erased prior agreement
append-only history != monotonically increasing certainty
append-only history != blockchain
append-only history != tamper-proof storage
replay consistency != external-world truth
```

## 4. Frozen authored transition scenarios

### T1 — decision resolves while custody conflict persists

Initial:

```text
D0 = DECISION_ABSTAIN_ORIENTATION_UNRESOLVED
C0 = CUSTODY_PROVENANCE_CONFLICT_HOLD
```

Append a valid decision observation:

```text
y_hat = +0.001
bound = 0.0002
actual_eta = 0
```

Expected current state:

```text
D1 = DECISION_ACTIONABLE_PLUS
C1 = CUSTODY_PROVENANCE_CONFLICT_HOLD
```

Required replay property:

```text
history still contains D0/C0 initialization unchanged
```

### T2 — decision resolves negative while agreed custody persists

Initial:

```text
D0 = DECISION_ABSTAIN_ORIENTATION_UNRESOLVED
C0 = CUSTODY_MULTI_ROOT_SYNTHETIC_AGREEMENT
```

Append:

```text
y_hat = -0.001
bound = 0.0002
actual_eta = 0
```

Expected:

```text
D1 = DECISION_ACTIONABLE_MINUS
C1 = CUSTODY_MULTI_ROOT_SYNTHETIC_AGREEMENT
```

### T3 — duplicate same-root custody evidence may not rewrite decision or amplify independence

Initial:

```text
D0 = DECISION_ACTIONABLE_PLUS
C0 = CUSTODY_PROVENANCE_CONFLICT_HOLD
```

Append a new custody receipt set containing additional copies from an already represented root but preserving an independent conflicting root.

Expected:

```text
D1 = DECISION_ACTIONABLE_PLUS
C1 = CUSTODY_PROVENANCE_CONFLICT_HOLD
```

Raw record count may increase. Independent support count / root conflict semantics may not be majority-voted away.

### T4 — custody can gain a new independent synthetic root without rewriting decision

Initial:

```text
D0 = DECISION_ACTIONABLE_MINUS
C0 = CUSTODY_SINGLE_ROOT_SUPPORTED_NOT_CORROBORATED
```

Append a custody receipt set with a second declared independent synthetic root agreeing on the same route.

Expected:

```text
D1 = DECISION_ACTIONABLE_MINUS
C1 = CUSTODY_MULTI_ROOT_SYNTHETIC_AGREEMENT
```

The earlier single-root posture remains visible in replay history.

### T5 — decision can reopen uncertainty after prior actionability

Initial:

```text
D0 = DECISION_ABSTAIN_ORIENTATION_UNRESOLVED
C0 = CUSTODY_MULTI_ROOT_SYNTHETIC_AGREEMENT
```

Append decision observation A:

```text
y_hat = +0.001
bound = 0.0002
actual_eta = 0
```

Then append decision observation B:

```text
y_hat = 0
bound = 0.0002
actual_eta = 0
```

Expected transition:

```text
D0 = ABSTAIN
D1 = ACTIONABLE_PLUS
D2 = ABSTAIN
```

Custody remains agreement throughout.

This scenario is mandatory. A reducer that treats epistemic resolution as monotonically increasing fails the gauntlet.

### T6 — custody conflict can appear after prior agreement while earlier agreement remains replayable

Initial:

```text
D0 = DECISION_ACTIONABLE_PLUS
C0 = CUSTODY_MULTI_ROOT_SYNTHETIC_AGREEMENT
```

Append a custody receipt set in which declared independent synthetic roots now conflict.

Expected current state:

```text
D1 = DECISION_ACTIONABLE_PLUS
C1 = CUSTODY_PROVENANCE_CONFLICT_HOLD
```

The earlier agreement event remains present in history. Current conflict does not retroactively falsify or delete the earlier fixture observation.

## 5. Replay reconstruction criterion

For every valid scenario:

```text
reduce(full_history) == stored_current_state
```

and for every prefix:

```text
reduce(history[0:k]) == stored_state_after_event_k_minus_1
```

The witness must retain a replay trace containing, for each event:

```text
event_id
sequence
kind
decision_status_after
custody_status_after
selected_action_after
resolved_route_after
```

This is an epistemic replay receipt, not a proof of an external event.

## 6. Hostile controls

The executable witness must reject or expose:

1. deletion of an earlier event followed by replay;
2. replacement of an earlier event payload;
3. duplicate event id;
4. sequence gap;
5. wrong `previous_event_id`;
6. out-of-order append;
7. custody event that mutates decision state;
8. decision event that mutates custody state;
9. a reducer that forbids `ACTIONABLE -> ABSTAIN`;
10. majority-vote laundering of copied same-root custody receipts;
11. current-state serialization that omits the replay ledger while claiming complete custody;
12. automatic execution or escalation from any transition.

The deletion/replacement controls need establish only that the mutated sequence no longer satisfies the declared replay contract. No cryptographic tamper-proof claim follows.

## 7. Frozen bounded success criterion

The gauntlet passes only if:

```text
all six authored scenarios reach the preregistered current states
all replay prefixes reconstruct their corresponding stored state
all valid appends preserve the exact prior history as a prefix
T5 demonstrates ABSTAIN -> ACTIONABLE_PLUS -> ABSTAIN
T6 demonstrates AGREEMENT -> CONFLICT while preserving earlier agreement in replay
T3 preserves provenance conflict despite extra same-root copies
T4 permits current custody posture to improve from one declared root to two agreeing synthetic roots without deleting prior posture
all cross-axis non-interference assertions hold
all hostile chain-topology controls reject
combined_confidence_scalar remains null
automatic_execution remains false
automatic_escalation remains false
human_closure_required remains true
```

A passing fixture may support only this bounded refinement candidate:

> **In this finite synthetic event-sourced fixture, current decision and custody postures may change non-monotonically while their authored replay history remains append-only; preserving earlier states and evidence conditions does not require freezing the current epistemic state.**

## 8. Claim ceiling

No passing result grants authority for:

```text
event-sourcing theorem
database durability theorem
cryptographic append-only-log theorem
blockchain claim
tamper-proof storage claim
Bayesian filtering theorem
Kalman filtering theorem
Markov-state theorem
POMDP theorem
sufficient-statistic theorem
consensus theorem
real-world provenance-independence claim
causal intervention theorem
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

## 9. Frozen next learning action

Only after this replay gauntlet is witnessed may the frontier consider:

```text
TEST_COUNTERFACTUAL_REPLAY_BRANCHING_FROM_THE_SAME_CUSTODIED_PREFIX_WITH_ALTERNATIVE_NEW_OBSERVATIONS_WHILE_PRESERVING_SHARED_HISTORY_AND_FORBIDDING_RETROACTIVE_EDITING
```

That future question remains held and must not be implemented in this preregistration commit.
