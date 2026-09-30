# Pedagogue Borrowed Light — Anchor-Dependent Warrant Revocation Custody Hostile Execution Receipt v0.1

Status: **WITNESSED / BOUNDED SYNTHETIC EXOGENOUS-DEPENDENCY RESEARCH / ATTACK-ONLY / NOT PROMOTED**

Schema: `td613.pedagogue.anchor-dependent-warrant-revocation-custody-hostile-execution-receipt/v0.1`

Research surface: PR `#677`

Candidate: `E3_ANCHOR_DEPENDENT_WARRANT_REVOCATION_CUSTODY`

Assay chamber: **Borrowed Light**

## 0. Exact lineage

```text
E2 sealed receipt:
4d0f3894effd0fd710bbe3ef5546e3bdb754d48a
  docs(pedagogue): seal Moving Sash exogenous revision receipt

E3 preregistration:
e2e27c204e1d1e6caad59186588220e1c2cf0d82
  docs(pedagogue): preregister Borrowed Light dependency assay

E3 evaluator:
975e877d1ae2d037e2ce719249ef57ac8515fe93
  feat(pedagogue): add Borrowed Light dependency evaluator

E3 hostile-test / science head:
fbc049111fcd10554e8e36a81427536d6bca2309
  test(pedagogue): execute Borrowed Light dependency family
```

The branch was freshly verified at `fbc049111fcd10554e8e36a81427536d6bca2309` before this receipt was written. No concurrent mutation was present.

---

## 1. Exact-head execution witness

```text
workflow = TD613 Consolidated Validation
run = 1914 / 32532473634
science head = fbc049111fcd10554e8e36a81427536d6bca2309
static job = 96927104565
step 18 = SUCCESS
Giving / practice exact-head browsers = SKIPPED
front-line exact-head browser shard = SKIPPED
full-product exact-head browser witness = SKIPPED
explicit full-repository validation = SKIPPED
explicit self-hosted calibration = SKIPPED
```

The E3 chamber passed step 18 on its first science execution. No harness repair was required.

---

## 2. Evidence provenance for the E3 verdict

The GitHub Actions job-log endpoint was queried in a bounded recovery pass after completion. The narrow Borrowed Light stdout block remained elided inside the very large static log. This receipt therefore **does not claim literal console extraction** of the E3 JSON block.

The scientific disposition below is a **deterministic exact-source reconciliation** using:

1. immutable preregistration `e2e27c20...`;
2. immutable evaluator `975e877d...`;
3. immutable hostile test `fbc04911...`;
4. successful exact-head step-18 execution in run `1914`.

The hostile test explicitly accepts either candidate survival or candidate falsification as a valid scientific result. Green CI therefore cannot by itself establish survival.

```text
runtime_green != scientific_survival
exact_source_reconciliation != literal_stdout_quote
```

---

## 3. Reconciled verdict

```text
inherited_e1_verdict = EXOGENOUS_ANCHOR_ADMISSION_CUSTODY_CANDIDATE_SURVIVES_BOUNDED_OPEN_WINDOW
inherited_e2_verdict = EXOGENOUS_ANCHOR_REVISION_EPISODE_CUSTODY_CANDIDATE_SURVIVES_BOUNDED_MOVING_SASH
inherited_e1_e2_jurisdiction_preserved = true

e3_verdict = ANCHOR_DEPENDENT_WARRANT_REVOCATION_CUSTODY_CANDIDATE_SURVIVES_BOUNDED_BORROWED_LIGHT
e3_defeat_conditions = []
```

E3 does not widen E1/E2 into real-world source truth. It tests only direct declared warrant dependencies in the bounded synthetic family.

---

## 4. Room-by-room reconciliation

### BL01 — Last Lamp Out

Before withdrawal:

```text
BL01_before_status = ADMIT_CURRENT_WARRANT_WITH_LAWFUL_SUPPORT
```

After withdrawal of the sole bound exogenous anchor:

```text
BL01_after_status = REFUSE_CURRENT_WARRANT_NO_ACTIVE_LAWFUL_SUPPORT
BL01_after_historical_support_count = 1
```

Current authority disappears; historical lawful support is not erased.

### BL02 — Second Lamp

The exogenous anchor is withdrawn while an independently declared lawful synthetic support remains active.

```text
BL02_after_status = ADMIT_CURRENT_WARRANT_WITH_LAWFUL_SUPPORT
BL02_after_support_kinds = [INDEPENDENT_DECLARED_SUPPORT]
```

Withdrawal of one lineage does not falsely revoke a warrant that still has an independent lawful lineage.

### BL03 — Same Light, Different Lamp

`K_OLD` is withdrawn and semantically distinct `K_NEW` becomes active while exposing the same `PRE_ENTRY` observation.

```text
BL03_current_e2_value = PRE_ENTRY
K_OLD current = false
K_NEW current = true
BL03_status = REFUSE_CURRENT_WARRANT_NO_ACTIVE_LAWFUL_SUPPORT
```

Same observed value does not launder dependency continuity across semantic-anchor replacement.

### BL04 — Two Windows Disagree

A same-semantic same-epoch anchor conflict propagates as dependency conflict rather than forced warrant authority.

```text
BL04_status = ABSTAIN_WARRANT_SUPPORT_CONFLICT
```

### BL05 — Wrong Color Bulb

Wrong target, wrong field, and wrong required value each fail the exact declared dependency binding.

```text
current_support_count = 0
status = REFUSE_CURRENT_WARRANT_NO_ACTIVE_LAWFUL_SUPPORT
```

### BL06 — Chandelier Counting

An exact semantic duplicate differs only in `lineage_id`.

```text
current authority equal = true
semantic support count equal = true
BL06_support_fingerprint_equal = true
duplicate_lineage_count = 1
duplicate_lineage_is_confidence = false
```

Duplicate record count does not become confidence or authority.

### BL07 — Lamp Tags Shuffled

Support-lineage identifiers are renamed and serialization is reversed.

```text
current authority equal = true
current support fingerprint equal = true
support semantic fingerprint equal = true
lineage_identifier_is_authority = false
serialization_order_is_authority = false
```

### BL08 — Afterimage

After sole-support withdrawal:

```text
BL08_historical_support_preserved = true
current_support_count = 0
historical_support_count = 1
```

Revocation is not historical erasure.

### BL09 — One of Two Anchors Leaves

Two distinct lawful exogenous lineages independently support the warrant. One is withdrawn; the other remains.

```text
status = ADMIT_CURRENT_WARRANT_WITH_LAWFUL_SUPPORT
BL09_current_support_count = 1
surviving semantic key current = true
withdrawn semantic key current = false
```

The surviving lineage preserves the warrant without laundering the withdrawn lineage.

### BL10 — Photograph of Light

A value-only snapshot carries `PRE_ENTRY` without the bound semantic-anchor identity.

```text
BL10_status = REFUSE_CURRENT_WARRANT_NO_ACTIVE_LAWFUL_SUPPORT
value_only_snapshot_observed = true
value_only_snapshot_has_dependency_authority = false
```

Value equality is insufficient for lineage-bound support.

### BL11 — Post-Hoc Rewiring

The dependency ledger is sealed and immutable.

```text
BL11_status = SEALED_WARRANT_DEPENDENCY_LEDGER_IMMUTABLE
```

### BL12 — E1/E2 Control

A clean active E2 anchor with a matching direct dependency preserves inherited semantics:

```text
warrant status = ADMIT_CURRENT_WARRANT_WITH_LAWFUL_SUPPORT
BL12_current_e2_status = ADMIT_SCOPED_EXOGENOUS_OBSERVATION
BL12_current_e2_value = PRE_ENTRY
```

E3 adds direct-dependency custody; it does not rewrite E1/E2 current-view or revision semantics.

---

## 5. Exact claim ceiling

The strongest warranted statement is:

> In this bounded synthetic direct-dependency family, current warrant authority follows surviving lawful support lineages rather than historical support alone: withdrawal of the sole bound exogenous anchor removes current warrant authority without erasing historical support, semantically different replacement anchors do not inherit the old dependency merely by exposing the same value, current conflict forces abstention, and an independent surviving lawful lineage can preserve the warrant without preserving the withdrawn lineage.

E3 does **not** establish:

```text
real-world source authenticity
real-world support validity
source honesty
causal independence
institutional independence
cryptographic integrity
multi-hop dependency closure
semantic-replacement bridge law
universal truth-maintenance semantics
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

The E-series now has three distinct jurisdictions:

```text
E1 — scoped current exogenous observation admission
E2 — temporal revision custody of exogenous anchors
E3 — direct downstream warrant revocation/preservation by surviving support lineage
```

The next scientifically earned frontier is **transitive dependency custody**:

```text
anchor K supports W1
W1 supports W2
K is withdrawn
W1 loses current authority
question: must W2 also lose current authority unless an independent lawful support path remains?
```

A second hostile edge is unsupported cyclic self-sustainment:

```text
W1 depends on W2
W2 depends on W1
no current primitive/exogenous support
```

A cycle must not manufacture its own foundation merely by closing on itself. Any next chamber must be preregistered before evaluator mutation and must keep E3's direct-dependency result intact.

---

## 7. Authority membrane

```text
candidate_status = ATTACK_ONLY_NOT_PROMOTED
promotion_authority = false
synthetic_exogenous_fixture = true
live_external_source_adapter = false
real_world_external_provenance_claim = false
multi_hop_dependency_closure = false
semantic_replacement_bridge_law = HELD_NOT_OPENED_HERE
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

𝌋 Borrowed Light held: a warrant may remember that it once had light without pretending the lamp is still on. ⟐
