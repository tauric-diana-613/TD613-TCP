# Pedagogue Moving Sash — Exogenous Anchor Revision Episode Custody Hostile Execution Receipt v0.1

Status: **WITNESSED / BOUNDED SYNTHETIC EXOGENOUS-REVISION RESEARCH / ATTACK-ONLY / NOT PROMOTED**

Schema: `td613.pedagogue.exogenous-anchor-revision-episode-custody-hostile-execution-receipt/v0.1`

Research surface: PR `#677`

Candidate: `E2_EXOGENOUS_ANCHOR_REVISION_EPISODE_CUSTODY`

Assay chamber: **Moving Sash**

## 0. Exact lineage

```text
E1 sealed receipt:
7ca9c5a079b7e90287179935a12242627fc1108d
  docs(pedagogue): seal Open Window exogenous anchor receipt

E2 preregistration:
fae76d3516e83232b8f0b9dea7d2aba8dab5dc40
  docs(pedagogue): preregister Moving Sash exogenous revision assay

E2 evaluator:
3f1002ec6c7a3548dff360d1b5badad8e080dde8
  feat(pedagogue): add Moving Sash revision episode evaluator

E2 hostile-test / original science head:
21b2f531d22f4f65d7d31d59ea047cb4fa0f0ed4
  test(pedagogue): execute Moving Sash exogenous revision family

E2 test-only documentation repair:
ec9699117186257a6d895d309a75be003d29f078
  test(pedagogue): bind Moving Sash doc assertion to frozen wording
```

The preregistration and evaluator were frozen before branch advancement. The branch was then fast-forwarded once to the complete hostile-test head. The repair commit changed only a brittle prose assertion in the test harness; it did not alter the preregistration, fixture, evaluator, hostile rooms, defeat conditions, or candidate semantics.

---

## 1. Execution chronology

### Run 1911 — red, test-only wording mismatch

```text
workflow = TD613 Consolidated Validation
run = 1911 / 32531530714
head = 21b2f531d22f4f65d7d31d59ea047cb4fa0f0ed4
static job = 96924375864
all browser families = SKIPPED
full-repository validation = SKIPPED
self-hosted calibration = SKIPPED
step 18 = FAILED
```

Immutable-source inspection showed the test demanded the literal phrase:

```text
same-semantic same-epoch contradiction
```

while the frozen preregistration actually stated:

```text
Same-semantic same-epoch records are evaluated as an epoch bundle.
```

with the abstention requirement expressed separately. The failure was therefore classified:

```text
TEST_ONLY_DOCUMENTATION_WORDING_MISMATCH
scientific_falsification = false
preregistration_mutated = false
evaluator_mutated = false
fixture_mutated = false
```

The repair bound the test to the frozen wording only.

### Run 1912 — successful exact-head static witness

```text
workflow = TD613 Consolidated Validation
run = 1912 / 32531882301
head = ec9699117186257a6d895d309a75be003d29f078
static job = 96925395196
step 18 = SUCCESS
all browser families = SKIPPED
full-repository validation = SKIPPED
self-hosted calibration = SKIPPED
```

No browser, product, workflow, shared-engine, merge, deployment, or release authority was exercised.

---

## 2. Evidence provenance for the E2 verdict

The GitHub Actions log endpoint returned the completed job but repeatedly elided the narrow E2 stdout inside the very large static log. This receipt therefore **does not claim literal console extraction** for the E2 JSON block.

The scientific disposition below is a **deterministic exact-source reconciliation** using:

1. the immutable preregistration at `fae76d35...`;
2. the immutable evaluator at `3f1002ec...`;
3. the immutable hostile test at `21b2f531...`;
4. the test-only wording repair at `ec969911...`;
5. successful execution of step 18 on exact head `ec969911...`.

The test accepts either candidate survival or candidate falsification as a valid scientific result. CI success therefore cannot by itself imply survival. The verdict is derived by evaluating each preregistered defeat condition against the immutable evaluator logic and the successful test assertions.

```text
runtime_green != scientific_survival
exact_source_reconciliation != literal_stdout_quote
```

---

## 3. Deterministically reconciled E2 verdict

```text
inherited_e1_verdict = EXOGENOUS_ANCHOR_ADMISSION_CUSTODY_CANDIDATE_SURVIVES_BOUNDED_OPEN_WINDOW
inherited_e1_jurisdiction_preserved = true
e1_revision_custody_overclaim_asserted = false

e2_verdict = EXOGENOUS_ANCHOR_REVISION_EPISODE_CUSTODY_CANDIDATE_SURVIVES_BOUNDED_MOVING_SASH
e2_defeat_conditions = []
```

This is not inferred from the green color of CI. It follows from the exact room logic below.

---

## 4. Room-by-room reconciliation

### MS01 — Same View, Different History

Continuous history:

```text
ADMIT active
→ RENAME_CONTINUOUS active
episode_count = 1
```

Interrupted history:

```text
ADMIT active
→ WITHDRAW inactive
→ REINTRODUCE active
episode_count = 2
```

Both reconstruct the same current E1 observation:

```text
status = ADMIT_SCOPED_EXOGENOUS_OBSERVATION
value = PRE_ENTRY
```

But their revision-history fingerprints differ.

Therefore:

```text
MS01_current_e1_observation_equal = true
MS01_history_equal = false
MS01_episode_counts = [1, 2]
```

No `SAME_CURRENT_OBSERVATION_ERASES_REVISION_HISTORY` defeat.

### MS02 — Old Pane Replaced

The old semantic anchor is inactive after semantic replacement and the new semantic anchor is current.

```text
old_current = false
new_current = true
```

No silent transfer of old semantic authority.

### MS03 — New Name, Same Pane

A `RENAME_CONTINUOUS` event keeps the same semantic anchor key active.

```text
episode_count = 1
```

Identifier change does not manufacture a support gap.

### MS04 — Closed and Reopened

```text
active → inactive → active
episode_count = 2
```

Reintroduction restores current authority without retroactively erasing the interruption.

### MS05 — Two Hands on the Sash

Two contradictory states for the same semantic anchor at the same epoch form a conflict bundle.

```text
MS05_status = ABSTAIN_CONFLICTING_SAME_EPOCH_EXOGENOUS_ANCHOR_REVISION
revision_identifier_is_authority = false
serialization_order_is_authority = false
```

The evaluator does not repeat C8's old lexical-arbitration failure.

### MS06 — Revision Nameplate Shuffle

Revision IDs are renamed and serialization is reversed. Semantic bundles are still grouped by semantic key + epoch and history fingerprints exclude revision IDs.

```text
current_authority_equal = true
episode_count_equal = true
MS06_history_fingerprint_equal = true
```

### MS07 — Duplicate Repair Ticket

An exact semantic duplicate differs only in revision ID. The bundle deduplicates semantic history rather than counting the extra record as new authority.

```text
current_equal = true
episode_count_equal = true
history_fingerprint_equal = true
duplicate_revision_is_confidence = false
```

### MS08 — Yesterday Cannot Overrule Today

A newer active epoch remains current even when an older inactive record is serialized later. Semantic epoch, not serialization order, controls current state.

```text
current_e1_status = ADMIT_SCOPED_EXOGENOUS_OBSERVATION
observed_value = PRE_ENTRY
```

### MS09 — Revoked View

Before withdrawal:

```text
ADMIT_SCOPED_EXOGENOUS_OBSERVATION
```

After withdrawal:

```text
MS09_after_status = UNIDENTIFIED_NO_EXOGENOUS_ANCHOR
historical_event_count_after = 2
```

Historical observation custody survives while current authority disappears.

### MS10 — Snapshot Photograph

A compact latest-state object can reproduce the current E1 field value but does not thereby acquire revision-history authority.

```text
current_equal = true
compact_revision_history_authority = false
current_snapshot_has_revision_history_authority = false
```

### MS11 — Post-Hoc Carpenter

The sealed ledger is deep-frozen.

```text
MS11_status = SEALED_EXOGENOUS_ANCHOR_REVISION_LEDGER_IMMUTABLE
```

### MS12 — E1 Still Sees Through the Glass

For a clean current revision history, E2 reconstructs the same field/target current-view semantics as direct E1 evaluation.

```text
MS12_current_semantics_equal = true
```

E2 adds temporal custody; it does not rewrite E1's scoped admission law.

---

## 5. Exact claim ceiling

The strongest warranted statement is:

> In this bounded synthetic family, current scoped exogenous observation authority can be reconstructed from the latest non-conflicted semantic revision state while revision episodes remain separately custodied; continuous semantic renames preserve an episode, withdrawal/reintroduction creates a new episode, semantic replacement does not inherit old authority without continuity, same-epoch contradiction forces abstention, and current-state equality does not erase revision-history inequality.

The result is a synthetic **revision-custody** result. It is not a theorem of real-world external provenance.

E2 does **not** establish:

```text
real-world source authenticity
real-world timestamp authenticity
source honesty
causal independence
institutional independence
cryptographic integrity
network adapter trust
live-source acquisition correctness
universal temporal provenance algebra
scalar trust
scalar confidence
H2
H3
intersection behavior
Aperture installed replay stability
production authority
```

---

## 6. Research consequence

E1 and E2 now occupy distinct but composable jurisdictions:

```text
E1:
scoped exogenous observation may authorize its exact current field/target

E2:
current exogenous observation state does not erase the revision path that produced it
```

The new frontier is therefore downstream dependency rather than merely more anchor bookkeeping:

```text
historically valid exogenous observation
!=
necessarily current derived warrant after anchor withdrawal/replacement
```

A scientifically earned next hostile assay may attack whether a downstream warrant that depended on exogenous support is properly revoked, preserved through an independent alternate lineage, or illegitimately laundered across semantic anchor replacement. Such an assay must be preregistered before evaluator mutation.

---

## 7. Authority membrane

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

No merge. No deployment. No release. No Vercel. No scalar crown.

𝌋 Open Window learned to use the view. Moving Sash learned that the same view can arrive by different histories—and that the history does not disappear just because the glass looks identical now. ⟐
