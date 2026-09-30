# Pedagogue Cut-and-Paste — Event Membership Revision Custody Hostile Assay v0.1

Status: **PREREGISTERED / PRE-EXECUTION / ATTACK-ONLY / HUMAN-GATED**

Schema: `td613.pedagogue.event-membership-revision-custody-hostile-assay/v0.1`

Research surface: PR `#677`

## 0. Inherited result under attack

Carbon Paper established, in one bounded synthetic event universe:

```text
PRECEDENCE_ADMISSION_GENEALOGY_C6_FALSIFIED_AS_WITNESS_PROVENANCE_SUFFICIENT_FORM
ADMISSION_WITNESS_REPLAY_CUSTODY_CANDIDATE_SURVIVES_BOUNDED_CARBON_PAPER
```

C7 remains valid inside its fixed-event-set jurisdiction. This assay does not reopen its witness-replay result. It attacks one explicit hold in Carbon Paper: the semantic event set was frozen.

Candidate under attack:

```text
C7_ADMISSION_WITNESS_REPLAY_CUSTODY
```

Candidate descendant:

```text
C8_EVENT_MEMBERSHIP_REVISION_CUSTODY
Display name: Event Membership Revision Custody
Assay name: Cut-and-Paste
status = ATTACK_ONLY_NOT_PROMOTED
presumption_of_survival = false
```

## 1. Preregistered insufficiency

A witness replay can remain internally valid as a derivation while the semantic event universe to which its edge refers has changed.

The attack therefore freezes witness-replay derivation semantics and changes only event membership history.

```text
replayable witness in prior event universe
!=
currently admissible witness after event-membership revision
```

The evaluator must not erase historical witness custody merely because an event leaves the current universe. It must also not let a withdrawn, replaced, split, merged, or gap-reintroduced event inherit uninterrupted current authority by identifier resemblance.

## 2. Candidate C8 rule

For a bounded event universe with explicit membership epochs, current edge/witness authority requires every semantic event referenced by the edge to be currently admitted through a lawful event-membership lineage. Event-membership custody must preserve historical episodes, withdrawals, replacements, rejected revisions, and semantically continuous identifier renames separately. A replay-valid old-universe witness remains historical evidence when an endpoint leaves the current event set, but it cannot by itself authorize a current edge. Reintroduction after a membership gap creates a new current membership episode rather than retroactively making support continuous.

Identifiers and serialization order may label event custody but must not create semantic event continuity.

No scalar authority or confidence aggregation is allowed.

## 3. Frozen scope

```text
base witness-replay derivation grammar = FIXED
C7 replay-witness validation semantics = FIXED
support kind = FIXED unless room explicitly tests semantic replacement
precedence relation construction = INHERITED
semantic event-membership state = VARIABLE
semantic event-membership history = VARIABLE
raw event identifiers = VARIABLE in rename/reuse controls
sampling = FORBIDDEN
scalar aggregation = FORBIDDEN
product mutation = FORBIDDEN
shared Pedagogue engine mutation = FORBIDDEN
workflow mutation = FORBIDDEN
browser execution = FORBIDDEN
merge = FORBIDDEN
deployment = FORBIDDEN
release = FORBIDDEN
```

H2, H3, M×D, M×P, D×P, M×D×P, and installed Aperture v3.2 replay stability remain held.

## 4. Membership object

Each event-membership record is bounded synthetic custody with at least:

```text
membership_id
raw_event_id
semantic_event_key
active
revision_kind
continuity_from_semantic_event_key | null
```

Candidate revision kinds are bounded fixture labels such as:

```text
ADMIT
WITHDRAW
REINTRODUCE
RENAME_CONTINUOUS
REPLACE_SEMANTIC
SPLIT_FROM
MERGE_FROM
```

A raw identifier is not semantic continuity authority.

A current semantic event is admitted only when its latest lawful membership episode is active. Historical episodes remain in custody after withdrawal.

## 5. Strong falsifier

### CPX01 · Missing Sheet

Start with the Carbon Paper `PINK -> BLUE` replay-provenanced witness lawful in event universe U0.

Then withdraw semantic event `BLUE` from current universe U1 without changing the witness provenance object.

Required inherited C7 control:

```text
witness replay still internally valid = true
```

Required C8 disposition:

```text
REFUSE_CURRENT_EDGE_EVENT_MEMBERSHIP_INCOMPLETE
historical witness custody preserved = true
current edge admitted = false
```

If C8 admits the current edge merely because C7's replay remains valid, C8 is falsified.

If the fixture cannot establish that C7 alone would continue accepting the unchanged replay witness while current event membership has been withdrawn, the claimed C7 sufficiency overreach is not established.

## 6. Hostile family

### CPX01 · Missing Sheet
Withdraw one endpoint after a replay-valid witness exists. Current edge must fall; historical witness custody must remain.

### CPX02 · Same Label, New Paper
Reuse raw event ID `BLUE` for a semantically different event. Raw ID continuity must not transfer the old witness.

Required distinction:

```text
event ID continuity != semantic event continuity
```

### CPX03 · New Label, Same Paper
Rename only the raw event identifier while preserving the same semantic event and explicit continuity receipt.

Required result:

```text
semantic membership continuity preserved
old witness remains current if every semantic endpoint remains admitted
```

### CPX04 · Gone and Back
Withdraw semantic `BLUE`, then later reintroduce the same semantic event.

Required result:

```text
current semantic event admitted = true
membership episode continuity = interrupted
reintroduction != uninterrupted support
```

### CPX05 · Same Current Set, Different Past
Compare one history with continuous PINK/BLUE membership against another with BLUE withdrawn and later reintroduced. Current semantic event sets are equal; membership histories are not.

Required distinction:

```text
same current event set != same event-membership history
```

### CPX06 · Split Sheet
Replace one semantic event with two declared split descendants. The old witness must not automatically authorize either descendant without an explicit admitted bridge.

### CPX07 · Pasted Sheets
Merge two semantic events into one descendant. Old endpoint warrants must not silently collapse into the merged event without explicit admitted bridge custody.

### CPX08 · Bad Revision Sorts First
An invalid/rejected membership revision sorts lexically before a lawful current membership. Serialization order must not select event authority.

### CPX09 · Conflicting Current Membership
Two incompatible active semantic assignments claim one raw event ID. Current semantic membership must refuse ambiguity rather than choose by ID/order.

Expected posture:

```text
ABSTAIN_CONFLICTING_EVENT_MEMBERSHIP
```

### CPX10 · Current-Set Compaction
A current-only compacted event set equals the current set of a full membership ledger but lacks authority to claim the erased revision history.

```text
current event set custody != event-membership revision custody
```

### CPX11 · Post-Hoc Scissors
A sealed event-membership ledger must be immutable.

Expected:

```text
SEALED_EVENT_MEMBERSHIP_LEDGER_IMMUTABLE
```

### CPX12 · Old-Universe Replay
Preserve a replay-valid witness from U0 after endpoint withdrawal in U1. It must remain reconstructable as historical witness custody while carrying no current edge authority.

Required distinction:

```text
historical replay validity != current event-membership admissibility
```

## 7. Candidate verdicts

C8 survives only if every preregistered hostile room satisfies the candidate rule and CPX01 establishes the inherited C7 sufficiency overreach.

Possible candidate verdicts:

```text
EVENT_MEMBERSHIP_REVISION_CUSTODY_CANDIDATE_SURVIVES_BOUNDED_CUT_AND_PASTE
EVENT_MEMBERSHIP_REVISION_CUSTODY_CANDIDATE_FALSIFIED_IN_BOUNDED_CUT_AND_PASTE
```

If CPX01 establishes that C7's unchanged replay witness remains internally valid while the current event universe makes the edge inadmissible, the bounded inherited overclaim becomes:

```text
ADMISSION_WITNESS_REPLAY_CUSTODY_C7_FALSIFIED_AS_EVENT_MEMBERSHIP_REVISION_SUFFICIENT_FORM
```

Otherwise:

```text
C7_EVENT_MEMBERSHIP_REVISION_OVERCLAIM_NOT_ESTABLISHED_IN_THIS_RUN
```

CI green is not the theory verdict. Tests must accept survival or falsification as legitimate scientific outcomes and fail only on broken assay machinery or constitutional regression.

## 8. Defeat conditions

C8 is defeated by any of:

```text
INACTIVE_EVENT_RETAINS_CURRENT_EDGE_AUTHORITY
RAW_EVENT_ID_REUSE_LAUNDERS_SEMANTIC_CONTINUITY
SEMANTIC_RENAME_BREAKS_DECLARED_CONTINUITY
REINTRODUCTION_ERASES_MEMBERSHIP_GAP
CURRENT_SET_EQUALITY_ERASES_REVISION_HISTORY
SPLIT_DESCENDANT_INHERITS_WITNESS_WITHOUT_BRIDGE
MERGED_DESCENDANT_INHERITS_WITNESS_WITHOUT_BRIDGE
EVENT_AUTHORITY_SELECTED_BY_IDENTIFIER_OR_SERIALIZATION
CONFLICTING_EVENT_MEMBERSHIP_FORCED_TO_UNIQUE_SEMANTICS
CURRENT_SET_COMPACTION_OVERCLAIMS_HISTORY
SEALED_EVENT_MEMBERSHIP_LEDGER_MUTATED
HISTORICAL_WITNESS_ERASED_ON_EVENT_WITHDRAWAL
```

## 9. Claim ceiling

This assay may establish only bounded synthetic custody distinctions. It does not establish:

```text
real-world event identity
causal order
event-sourcing completeness
temporal-database completeness
truth-maintenance completeness
distributed-log correctness
consensus
serializability theorem
provenance algebra
proof theory
category / lattice / sheaf structure
physical time law
connection / curvature / holonomy
quantum identity
autonomous scientific authority
```

## 10. Authority membrane

```text
research_target_admitted_by_operator = true
major_research_decisions_self_authorized_in_pr677_lane = true
product_mutation = false
shared_pedagogue_engine_mutation = false
workflow_mutation = false
browser_execution = false
merge_performed = false
deployment_performed = false
deployment_authority = false
release_authority = false
vercel_release_requires_issue_405_and_new_explicit_operator_gesture = true
promotion_authority = false
```

𝌋 Carbon Paper proved that a copied witness is not a witnessed hand. Cut-and-Paste asks a different question: even if the hand was witnessed, is the event it points to still on the page? ⟐
