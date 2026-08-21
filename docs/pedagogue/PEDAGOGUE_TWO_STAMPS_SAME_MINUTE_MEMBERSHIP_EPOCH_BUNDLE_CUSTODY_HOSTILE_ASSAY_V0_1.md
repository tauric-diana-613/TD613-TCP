# Pedagogue Two Stamps Same Minute — Membership Epoch Bundle Custody Hostile Assay v0.1

Status: **PREREGISTERED / PRE-EXECUTION / ATTACK-ONLY / HUMAN-GATED**

Schema: `td613.pedagogue.membership-epoch-bundle-custody-hostile-assay/v0.1`

Research surface: PR `#677`

## 0. Inherited result under attack

Cut-and-Paste established in its preregistered bounded family:

```text
ADMISSION_WITNESS_REPLAY_CUSTODY_C7_FALSIFIED_AS_EVENT_MEMBERSHIP_REVISION_SUFFICIENT_FORM
EVENT_MEMBERSHIP_REVISION_CUSTODY_CANDIDATE_SURVIVES_BOUNDED_CUT_AND_PASTE
```

C8 remains valid inside the exact hostile family it survived. This assay attacks one untested implementation boundary discovered only after the Cut-and-Paste witness.

Candidate under attack:

```text
C8_EVENT_MEMBERSHIP_REVISION_CUSTODY
```

Candidate descendant:

```text
C9_MEMBERSHIP_EPOCH_BUNDLE_CUSTODY
Display name: Membership Epoch Bundle Custody
Assay name: Two Stamps Same Minute
status = ATTACK_ONLY_NOT_PROMOTED
presumption_of_survival = false
```

## 1. Preregistered insufficiency

The C8 evaluator groups current membership by semantic event but, when two valid records share the same semantic event key and the same epoch, it chooses one record by lexical `membership_id` ordering.

That behavior can manufacture a unique current membership state from records for which no semantic revision precedence was declared.

```text
same semantic event + same epoch + contradictory dispositions
!=
uniquely resolved current membership

membership identifier ordering != revision authority
```

The attack freezes C8's witness-replay and event-universe semantics and varies only the content and ordering of records inside one semantic-event epoch.

## 2. Candidate C9 rule

For each `semantic_event_key`, all lawful membership records at the maximal observed epoch form one **membership epoch bundle**. The bundle is unordered unless an independently declared precedence relation is explicitly admitted; this assay introduces no such relation.

Current semantic membership may be identified from the bundle only when every lawful record in that maximal-epoch bundle agrees on the material active/inactive disposition.

If the bundle contains both `active=true` and `active=false`, current membership is unresolved and must return:

```text
ABSTAIN_CONFLICTING_SAME_EPOCH_EVENT_MEMBERSHIP
```

No membership identifier, raw input order, revision-kind lexical order, or serialization order may select a winner.

Uniform same-epoch records may cohere on the bounded active/inactive state without being collapsed into one fabricated authoritative record. Every lawful record remains in custody.

Episode accounting must operate at epoch-bundle granularity. Multiple records inside one epoch cannot create a fictitious sequence of within-epoch activation/deactivation transitions merely because they can be serialized.

No scalar authority, confidence, credibility, trust, or reliability score is allowed.

## 3. Frozen scope

```text
C8 witness-replay semantics = FIXED
C8 event-membership history semantics across distinct epochs = FIXED
semantic_event_key = FIXED inside primary hostile rooms
epoch = SAME inside primary hostile rooms
membership_id = VARIABLE
raw input order = VARIABLE
revision_kind = VARIABLE in bounded controls
active disposition = VARIABLE
same-raw/different-semantic C8 conflict = INHERITED POSITIVE CONTROL
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

## 4. Epoch-bundle object

A bounded bundle contains at least:

```text
semantic_event_key
epoch
records[]
active_dispositions[]
material_disposition_status
current_membership_identified
current_active | null
```

Candidate statuses:

```text
UNIFORM_ACTIVE_MEMBERSHIP_EPOCH_BUNDLE
UNIFORM_INACTIVE_MEMBERSHIP_EPOCH_BUNDLE
ABSTAIN_CONFLICTING_SAME_EPOCH_EVENT_MEMBERSHIP
```

`current_active = null` whenever the same-epoch bundle contains conflicting active dispositions.

## 5. Strong falsifier

### TSMM01 · Two Stamps, Alphabet Wins

Begin with one previously admitted semantic event. At epoch 1 add two valid records for the same `semantic_event_key`:

```text
AAA_WITHDRAW: active=false
ZZZ_ADMIT:    active=true
```

Under inherited C8, lexical `membership_id` ordering selects `ZZZ_ADMIT`, making the event current.

Required inherited-overclaim witness:

```text
C8 unique current membership = true
C8 selected disposition depends on membership_id lexical order = true
```

Required C9 disposition:

```text
ABSTAIN_CONFLICTING_SAME_EPOCH_EVENT_MEMBERSHIP
current_active = null
```

If the fixture cannot demonstrate the C8 lexical dependence, the claimed C8 same-epoch sufficiency overreach is not established.

## 6. Hostile family

### TSMM01 · Two Stamps, Alphabet Wins
Same semantic key, same epoch, one inactive and one active record. C8 lexical winner must be exposed; C9 must abstain.

### TSMM02 · Rename the Stamps
Swap only the membership identifiers so the inactive record sorts after the active record. C8's selected state should flip if the suspected insufficiency exists. C9 posture must remain the same ambiguity.

Required distinction:

```text
membership-ID rename != membership-state evidence
```

### TSMM03 · Reverse the Folder
Reverse raw input order while keeping record content fixed. C9 result must be invariant.

### TSMM04 · Two Yes Stamps
Two lawful same-semantic, same-epoch records both say `active=true` but carry distinct membership IDs. C9 may identify current membership as active while preserving both records.

### TSMM05 · Two No Stamps
Two lawful same-semantic, same-epoch records both say `active=false`. C9 may identify current membership as inactive while preserving both records.

### TSMM06 · Episode Hallucination Control
Multiple same-epoch records must not create multiple temporal membership episodes merely because revision kinds or IDs provide a sortable order. Episode accounting occurs once per epoch bundle.

### TSMM07 · Distinct Epoch Control
An active record at epoch 0, withdrawal at epoch 1, and reintroduction at epoch 2 must retain Cut-and-Paste's two-episode result. C9 must not flatten genuine cross-epoch history while refusing within-epoch pseudo-order.

### TSMM08 · Inherited Raw-Binding Conflict
Reuse C8's CPX09 style case: two incompatible active semantic assignments claim one raw event ID in one epoch. The inherited refusal remains:

```text
ABSTAIN_CONFLICTING_EVENT_MEMBERSHIP
```

C9 must not weaken this existing protection.

### TSMM09 · Bad Record Sorts Last
An invalid record with a lexically dominant membership ID must remain rejected rather than becoming the bundle's authority.

### TSMM10 · Duplicate-ID Control
Exact duplicate `membership_id` remains rejected under inherited validation. C9 does not use duplicate-ID rejection to erase semantically distinct lawful records with different IDs.

### TSMM11 · Bundle Compaction
A compacted object containing only the resulting active boolean lacks authority to claim which same-epoch records existed or whether there was conflict.

```text
resolved current boolean != epoch-bundle custody
```

### TSMM12 · Sealed Bundle Mutation
A sealed epoch-bundle receipt must be immutable.

Expected:

```text
SEALED_MEMBERSHIP_EPOCH_BUNDLE_IMMUTABLE
```

## 7. Candidate verdicts

C9 survives only if every preregistered hostile room satisfies the candidate rule and TSMM01/TSMM02 establish that C8 can choose contradictory same-epoch membership by identifier ordering.

Possible verdicts:

```text
MEMBERSHIP_EPOCH_BUNDLE_CUSTODY_CANDIDATE_SURVIVES_BOUNDED_TWO_STAMPS_SAME_MINUTE
MEMBERSHIP_EPOCH_BUNDLE_CUSTODY_CANDIDATE_FALSIFIED_IN_BOUNDED_TWO_STAMPS_SAME_MINUTE
```

If the inherited overclaim is established:

```text
EVENT_MEMBERSHIP_REVISION_CUSTODY_C8_FALSIFIED_AS_SAME_EPOCH_ARBITRATION_SUFFICIENT_FORM
```

Otherwise:

```text
C8_SAME_EPOCH_ARBITRATION_OVERCLAIM_NOT_ESTABLISHED_IN_THIS_RUN
```

CI green is not the theory verdict. Tests must accept candidate survival or falsification as legitimate scientific outcomes and fail only on broken assay machinery or constitutional regression.

## 8. Defeat conditions

C9 is defeated by any of:

```text
CONFLICTING_SAME_EPOCH_DISPOSITIONS_FORCED_TO_UNIQUE_MEMBERSHIP
MEMBERSHIP_ID_SELECTS_SAME_EPOCH_AUTHORITY
INPUT_ORDER_SELECTS_SAME_EPOCH_AUTHORITY
REVISION_KIND_LEXICAL_ORDER_SELECTS_SAME_EPOCH_AUTHORITY
UNIFORM_ACTIVE_BUNDLE_FALSELY_ABSTAINS
UNIFORM_INACTIVE_BUNDLE_FALSELY_ABSTAINS
SAME_EPOCH_SERIALIZATION_MANUFACTURES_EPISODE_SEQUENCE
DISTINCT_EPOCH_HISTORY_FLATTENED
INHERITED_RAW_BINDING_CONFLICT_PROTECTION_LOST
INVALID_RECORD_ACQUIRES_BUNDLE_AUTHORITY
BUNDLE_COMPACTION_OVERCLAIMS_HISTORY
SEALED_MEMBERSHIP_EPOCH_BUNDLE_MUTATED
```

## 9. Claim ceiling

This assay may establish only bounded synthetic custody distinctions. It does not establish:

```text
causal simultaneity
physical simultaneity
distributed clocks
vector clocks
Lamport order
distributed consensus
serializability theorem
event-sourcing completeness
temporal-database completeness
truth-maintenance completeness
provenance algebra
proof theory
category / lattice / sheaf structure
physical time law
connection / curvature / holonomy
quantum identity
autonomous scientific authority
```

`epoch` remains a bounded synthetic fixture coordinate, not a physical-time claim.

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

𝌋 Two stamps hit the same line in the same minute. The alphabet may file them. It may not decide which one happened. ⟐
