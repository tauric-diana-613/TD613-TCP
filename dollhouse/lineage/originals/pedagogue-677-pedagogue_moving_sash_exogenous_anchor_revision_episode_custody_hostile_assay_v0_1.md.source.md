# Pedagogue Moving Sash — Exogenous Anchor Revision Episode Custody Hostile Assay v0.1

Status: **PREREGISTERED / BOUNDED SYNTHETIC EXOGENOUS-REVISION RESEARCH / ATTACK-ONLY / NOT PROMOTED**

Schema: `td613.pedagogue.exogenous-anchor-revision-episode-custody-hostile/v0.1`

Research surface: PR `#677`

Candidate: `E2_EXOGENOUS_ANCHOR_REVISION_EPISODE_CUSTODY`

Display name: **Exogenous Anchor Revision Episode Custody**

Assay chamber: **Moving Sash**

Presumption of survival: **false**

## 0. Inherited E1 jurisdiction

E1 `Open Window` survived:

```text
EXOGENOUS_ANCHOR_ADMISSION_CUSTODY_CANDIDATE_SURVIVES_BOUNDED_OPEN_WINDOW
```

E1 established only current, field-specific, target-specific admission authority for a lawful synthetic exogenous observation. It explicitly did not claim a history of how that external observation became current.

Therefore E2 does **not** falsify E1 merely by asking a temporal question E1 never claimed to answer.

```text
E1 current admission custody != E2 revision episode custody
E1 jurisdiction remains preserved
```

## 1. Research question

When exogenous-anchor state itself changes over time, can the protocol preserve the revision episodes that produced the current observation without allowing identifiers, serialization order, duplicate records, or current-state compaction to rewrite that history?

The hostile proposition is:

> Current exogenous observation authority may be reconstructed from the latest admissible semantic revision state, while the revision ledger separately preserves withdrawals, reintroductions, replacements, continuous renames, same-epoch conflicts, rejected revisions, and episode boundaries. Same current observation does not imply same historical custody.

## 2. Revision record covenant

Each synthetic revision record must carry at least:

```text
revision_id
semantic_anchor_key
epoch
active
revision_kind
raw_anchor_id
target_fingerprint
observations
source_kind
```

Allowed revision kinds:

```text
ADMIT
WITHDRAW
REINTRODUCE
RENAME_CONTINUOUS
REPLACE_SEMANTIC
```

The semantic anchor key, not the raw identifier, defines continuity. A `REPLACE_SEMANTIC` event enters a new semantic anchor key. A continuous rename keeps the same semantic key.

Same-semantic same-epoch records are evaluated as an epoch bundle. Contradictory semantic state inside one epoch bundle must abstain rather than choose by `revision_id` or serialization order.

## 3. Strong falsifier — same view, different history

World A:

```text
e1: ADMIT K / active / PRE_ENTRY
e2: RENAME_CONTINUOUS K / active / PRE_ENTRY
current E1 result = PRE_ENTRY
episode_count(K) = 1
```

World B:

```text
e1: ADMIT K / active / PRE_ENTRY
e2: WITHDRAW K / inactive
e3: REINTRODUCE K / active / PRE_ENTRY
current E1 result = PRE_ENTRY
episode_count(K) = 2
```

Required:

```text
current E1 observation equal = true
revision history equal = false
episode count equal = false
```

If E2 treats the two histories as equivalent because the current field value is equal, E2 is falsified.

## 4. Hostile rooms

### MS01 — Same View, Different History
The strong falsifier above.

### MS02 — Old Pane Replaced
A semantic replacement uses a new semantic anchor key. Authority from the old semantic anchor must not silently transfer to the replacement merely because the raw identifier or observed value is similar.

### MS03 — New Name, Same Pane
A raw anchor identifier changes under `RENAME_CONTINUOUS` while the semantic anchor key remains stable and active. The rename must not create a new support episode.

### MS04 — Closed and Reopened
Withdraw then reintroduce the same semantic anchor. Current authority may return, but the support gap remains and episode count increments.

### MS05 — Two Hands on the Sash
Contradictory same-semantic same-epoch revisions must yield `ABSTAIN_CONFLICTING_SAME_EPOCH_EXOGENOUS_ANCHOR_REVISION` rather than identifier arbitration.

### MS06 — Revision Nameplate Shuffle
Rename revision IDs and reverse serialization. Current semantic authority, episode counts, and history fingerprint must remain invariant.

### MS07 — Duplicate Repair Ticket
Duplicate an identical revision in the same epoch. Duplication must not create confidence, a new episode, or a new semantic history event.

### MS08 — Yesterday Cannot Overrule Today
An older inactive or stale revision serialized after a newer current revision must not override the newer semantic epoch.

### MS09 — Revoked View
A current semantic anchor is withdrawn. Current E1 authority disappears while the prior exogenous observation remains historically reconstructable.

### MS10 — Snapshot Photograph
A compact object containing only the current E1 anchor snapshot may reproduce the current field value but cannot claim equivalence to the revision ledger.

### MS11 — Post-Hoc Carpenter
Attempted mutation of a sealed revision ledger must be refused as `SEALED_EXOGENOUS_ANCHOR_REVISION_LEDGER_IMMUTABLE`.

### MS12 — E1 Still Sees Through the Glass
For a clean current revision history, E2 must reproduce E1's current scoped observation result while adding revision custody rather than changing E1's field/target authority semantics.

## 5. Preregistered defeat conditions

```text
SAME_CURRENT_OBSERVATION_ERASES_REVISION_HISTORY
SEMANTIC_REPLACEMENT_INHERITS_OLD_AUTHORITY_WITHOUT_CONTINUITY
CONTINUOUS_RENAME_CREATES_FALSE_NEW_EPISODE
REINTRODUCTION_ERASES_SUPPORT_GAP
CONFLICTING_SAME_EPOCH_REVISION_FORCED_BY_IDENTIFIER
REVISION_IDENTIFIER_OR_SERIALIZATION_CHANGES_AUTHORITY
DUPLICATE_REVISION_AMPLIFIES_HISTORY_OR_CONFIDENCE
OLDER_REVISION_OVERRIDES_NEWER_SEMANTIC_EPOCH
WITHDRAWN_ANCHOR_RETAINS_CURRENT_E1_AUTHORITY
CURRENT_SNAPSHOT_OVERCLAIMS_REVISION_HISTORY
SEALED_REVISION_LEDGER_MUTATED
E2_CHANGES_E1_CURRENT_SCOPED_ADMISSION_SEMANTICS
```

Candidate survival verdict:

```text
EXOGENOUS_ANCHOR_REVISION_EPISODE_CUSTODY_CANDIDATE_SURVIVES_BOUNDED_MOVING_SASH
```

Candidate falsification verdict:

```text
EXOGENOUS_ANCHOR_REVISION_EPISODE_CUSTODY_CANDIDATE_FALSIFIED_IN_BOUNDED_MOVING_SASH
```

## 6. Claim ceiling if E2 survives

The strongest permitted conclusion would be:

> In this bounded synthetic family, current scoped exogenous observation authority can be reconstructed from the latest non-conflicted semantic revision state while revision episodes remain separately custodied; continuous semantic renames preserve an episode, withdrawal/reintroduction creates a new episode, semantic replacement does not inherit old authority without continuity, same-epoch contradiction forces abstention, and current-state equality does not erase revision-history inequality.

E2 still would **not** establish:

```text
real-world source authenticity
real-world timestamp authenticity
external source honesty
causal independence
institutional independence
cryptographic integrity
network adapter trust
universal temporal provenance algebra
scalar trust or confidence
H2
H3
intersections
Aperture installed replay stability
production authority
```

## 7. Held membranes

```text
candidate_status = ATTACK_ONLY_NOT_PROMOTED
promotion_authority = false
synthetic_exogenous_fixture = true
live_external_source_adapter = false
real_world_external_provenance_claim = false
product_mutation = false
shared_pedagogue_engine_mutation = false
workflow_mutation = false
browser_execution = false
merge_performed = false
deployment_performed = false
release_authority = false
vercel_release_requires_issue_405_and_new_explicit_operator_gesture = true

H2 = HELD_NOT_TESTED_HERE
H3 = HELD_NOT_TESTED_HERE
intersections = HELD_NOT_OPENED_HERE
APERTURE_V32_REPLAY_STABILITY = HELD_NOT_YET_WITNESSED
```

No merge. No deployment. No release. No Vercel.

𝌋 Open Window learned what one pane can show. Moving Sash asks whether the protocol remembers that the pane was ever closed. ⟐
