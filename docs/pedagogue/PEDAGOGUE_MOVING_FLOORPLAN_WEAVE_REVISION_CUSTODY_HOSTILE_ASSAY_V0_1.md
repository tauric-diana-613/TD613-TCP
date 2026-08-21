# Pedagogue Moving Floorplan — Weave Revision Custody Hostile Assay v0.1

Status: **PREREGISTERED / PRE-EXECUTION / BOUNDED SYNTHETIC HOSTILE RESEARCH / OPERATOR-ADMITTED**

Schema: `td613.pedagogue.weave-revision-custody-hostile-assay/v0.1`

Research surface: PR `#677`

## 0. Inherited result under attack

Two Staircases established only this bounded result:

```text
C4_WARRANT_WEAVE
WARRANT_WEAVE_CANDIDATE_SURVIVES_BOUNDED_TWO_STAIRCASES
```

C4 preserves one declared partial precedence relation, enumerates every bounded serialization admitted by that relation, and identifies a proposition only when the admitted serializations agree.

That does **not** establish that recomputing C4 from the latest precedence relation preserves the custody history of earlier precedence states.

The silent widening attacked here is:

```text
latest declared precedence relation
→ whole history of what precedence had been admitted before
```

or, equivalently:

```text
current weave state = precedence-history custody
```

The target is not causal discovery, distributed time, or a theory of real-world concurrency. The target is narrower: whether a bounded custody instrument can preserve the difference between an ambiguity that was always present, an ambiguity that was later resolved, and a resolution that was later withdrawn.

## 1. Candidate C5 · Weave Revision Ledger

Preregistered candidate:

```text
C5_WEAVE_REVISION_LEDGER
Display name: Weave Revision Ledger
status = ATTACK_ONLY_NOT_PROMOTED
presumption_of_survival = false
```

Candidate rule:

> Seal each admitted precedence relation as its own immutable custody epoch. Evaluate each accepted epoch through the frozen C4 Warrant Weave machinery. Preserve the epoch-local identifiability posture and a semantic relation fingerprint. A later precedence amendment may change the current posture but may not retroactively rewrite an earlier epoch. If a later epoch returns to a semantically equivalent precedence relation, the current relation may match an earlier relation while the revision history remains distinct. Rejected relation updates remain visible as rejected custody events and do not overwrite the last accepted current weave.

This candidate is a finite synthetic revision ledger only. It is not a universal event store, temporal database, distributed log, causal clock, proof system, or provenance algebra.

## 2. Frozen representation

One assay instance contains:

```text
fixed baseline evidence
fixed derivation rules
fixed contradiction families
fixed requested warrant
fixed event set E
ordered custody epochs K0 ... Kn
```

Each custody epoch contains:

```text
epoch_id
precedence_edges
```

The event set and event semantics are frozen across the revision timeline. Only the declared precedence relation changes between epochs.

Every epoch is evaluated independently through C4 using the same frozen event/evidence/rule specimen.

### 2.1 Semantic relation fingerprint

A precedence relation is fingerprinted by the complete bounded set of admitted **semantic serializations** rather than by raw edge text.

For each event, `semantic_label` is the bounded semantic identity used only inside this assay. Event IDs may label records but may not determine relation equivalence.

Two relation encodings count as semantically equivalent inside this assay when they admit the same set of semantic serializations over the same frozen semantic event set.

Therefore:

```text
raw edge list != semantic precedence relation
redundant transitive edge != new relation
identifier spelling != relation authority
```

No theorem about general partial-order minimization is claimed.

## 3. Strong falsifier · The Moving Floorplan

Reuse the Two Staircases support-handoff specimen:

```text
A + B -> W
C + D -> W

PINK = withdraw A
BLUE = add C and D
```

Frozen revision timeline:

### K0 · OPEN LANDING

```text
precedence = []
```

Expected C4 posture:

```text
final presence = IDENTIFIED_PRESENT
transient support = ABSTAIN_TRANSIENT_HISTORY_NOT_IDENTIFIED_BY_PARTIAL_ORDER
```

### K1 · PINK STAIR LOCKED FIRST

```text
PINK -> BLUE
```

Expected C4 posture:

```text
final presence = IDENTIFIED_PRESENT
transient support = IDENTIFIED_SUPPORT_INTERRUPTION
```

### K2 · LOCK REMOVED

```text
precedence = []
```

Expected current C4 posture returns to:

```text
final presence = IDENTIFIED_PRESENT
transient support = ABSTAIN_TRANSIENT_HISTORY_NOT_IDENTIFIED_BY_PARTIAL_ORDER
```

K2's semantic precedence relation is equivalent to K0's, but the custody history is not equivalent to a specimen that was ambiguous continuously.

Required C5 result:

```text
current_relation_matches_prior_relation = true
posture_trace = [
  ABSTAIN_TRANSIENT_HISTORY_NOT_IDENTIFIED_BY_PARTIAL_ORDER,
  IDENTIFIED_SUPPORT_INTERRUPTION,
  ABSTAIN_TRANSIENT_HISTORY_NOT_IDENTIFIED_BY_PARTIAL_ORDER
]
precedence_revision_history_preserved = true
historical_posture_compacted_into_current = false
```

### C4 defeat condition

C4 is falsified **only as a precedence-revision-custody-sufficient form** if a latest-state-only evaluation cannot distinguish:

```text
Timeline A:
K0 = []

Timeline B:
K0 = []
K1 = [PINK -> BLUE]
K2 = []
```

when both end on the same current C4 relation/posture but Timeline B contains a sealed interval in which the transient history was identified differently.

This does not revoke C4's one-relation jurisdiction.

## 4. Hostile rooms

### MF01 · Moving Floorplan · resolve then reopen

Central strong falsifier K0 -> K1 -> K2 above.

Required distinction:

```text
same current relation != same precedence-revision history
```

### MF02 · Opposite Lock · one resolution replaced by another

Timeline:

```text
K0 = []
K1 = [BLUE -> PINK]
K2 = [PINK -> BLUE]
```

Required posture trace:

```text
AMBIGUOUS
IDENTIFIED_CONTINUOUS_SUPPORT
IDENTIFIED_SUPPORT_INTERRUPTION
```

The K2 posture may supersede K1 as current, but K1 remains a sealed historical episode.

### MF03 · Brass Blueprint · epoch-ID renaming invariance

Rename epoch IDs only. Preserve relation sequence and event semantics.

Required:

```text
semantic posture trace invariant = true
semantic relation-fingerprint trace invariant = true
```

Epoch identifier is custody metadata, not precedence authority.

### MF04 · Extra Pencil Line · redundant transitive edge

Use a three-event specimen with semantic events A, B, C.

Compare:

```text
R1 = A -> B, B -> C
R2 = A -> B, B -> C, A -> C
```

Both must produce the same semantic relation fingerprint and the same C4 semantic posture.

Required distinction:

```text
raw edge-list difference != semantic relation difference
```

### MF05 · Same Folder Number · duplicate epoch identifier with changed relation

Attempt to reuse one `epoch_id` for a semantically different precedence relation inside the same revision timeline.

Required refusal:

```text
REJECT_EPOCH_IDENTIFIER_REUSE_WITH_DIFFERENT_RELATION
```

No later occurrence may overwrite the earlier sealed epoch.

### MF06 · Broken Banister · invalid/cyclic relation update

After one accepted relation epoch, submit a cyclic precedence update.

Required:

```text
rejected epoch preserved = true
current accepted relation remains prior accepted relation
invalid update does not erase or replace prior current weave
```

C4's own cycle refusal must remain intact.

### MF07 · Closed Archive Box · latest-state compaction

Compare the full K0 -> K1 -> K2 revision ledger to a compacted object containing only K2.

Required:

```text
current semantic relation equal = true
current C4 posture equal = true
precedence-revision history equivalent = false
compacted object has no authority to assert prior posture trace
```

### MF08 · No New Floorplan · semantically unchanged re-admission

Re-admit a semantically equivalent relation under a new epoch ID without changing the admitted semantic serializations.

Required:

```text
new custody epoch may exist = true
semantic relation changed = false
posture changed = false
```

The ledger may remember a new declaration event without pretending the relation itself changed.

### MF09 · Post-Hoc Red Pencil · mutation of a sealed prior epoch

After sealing K0, attempt to rewrite K0's precedence relation in place.

Required refusal:

```text
SEALED_PRECEDENCE_EPOCH_IMMUTABLE
```

The lawful operation is a new epoch, not retroactive mutation.

### MF10 · Current Is Not Always · same current relation, different histories

Construct two timelines with identical final accepted precedence relation and identical final C4 posture but different prior accepted relation/posture traces.

Required:

```text
current_relation_equivalent = true
current_posture_equivalent = true
revision_history_equivalent = false
```

This is the second independent test that current state cannot inherit historical custody by compression.

## 5. C5 strong survival requirement

C5 survives this bounded family only if it simultaneously:

1. preserves every accepted precedence epoch immutably;
2. preserves rejected relation updates without promoting them to current state;
3. records the C4 posture separately for each accepted epoch;
4. distinguishes semantic relation equivalence from raw edge-list equality;
5. remains invariant to epoch-ID renaming;
6. refuses duplicate epoch-ID reuse with changed relation semantics;
7. recognizes a return to an earlier semantic relation without erasing intervening epochs;
8. refuses latest-state compaction as a substitute for revision-history custody;
9. keeps C4 cycle refusal intact;
10. uses no scalar confidence, trust, certainty, robustness, or universal score.

Any failure falsifies C5 in this bounded form.

## 6. Preregistered verdict strings

Inherited C4 revision overclaim:

```text
WARRANT_WEAVE_C4_FALSIFIED_AS_PRECEDENCE_REVISION_CUSTODY_SUFFICIENT_FORM
```

C5 bounded survival:

```text
WEAVE_REVISION_LEDGER_CANDIDATE_SURVIVES_BOUNDED_MOVING_FLOORPLAN
```

C5 bounded falsification:

```text
WEAVE_REVISION_LEDGER_CANDIDATE_FALSIFIED_IN_BOUNDED_MOVING_FLOORPLAN
```

## 7. Claim ceiling

Even if C5 survives, this assay does not establish:

```text
causal order
real-world concurrency semantics
Lamport clocks
vector clocks
distributed log correctness
consensus
serializability theorem
temporal database completeness
event-sourcing completeness
truth-maintenance completeness
provenance algebra
partial-order reduction theorem
category / lattice / sheaf structure
physical time law
connection / curvature / holonomy
quantum identity
autonomous scientific authority
```

The terms `epoch`, `revision`, `precedence`, and `ledger` refer only to bounded synthetic custody records in this assay.

## 8. Holds

```text
C5 promotion = false
H2 = HELD_NOT_TESTED_HERE
H3 = HELD_NOT_TESTED_HERE
M×D = HELD
M×P = HELD
D×P = HELD
M×D×P = HELD
APERTURE_V32_REPLAY_STABILITY = HELD_NOT_YET_WITNESSED
```

## 9. Authority membrane

```text
research_target_admitted_by_operator = true
major_research_decisions_self_authorized_in_pr677_lane = true
product_mutation = false
shared_pedagogue_engine_mutation = false
workflow_mutation = false
browser_execution = false
merge_authority_for_this_assay = false
deployment_authority = false
release_authority = false
vercel_release_requires_issue_405_and_new_explicit_operator_gesture = true
promotion_authority = false
```

CI green is infrastructure evidence, not theory survival. The hostile test must permit either preregistered C5 scientific verdict as a valid run outcome and fail only on broken assay machinery, changed frozen assumptions, or constitutional regression.

𝌋 Two Staircases refused to invent a staircase. Moving Floorplan asks a nastier question: when the architect redraws the stairs tomorrow, who is allowed to pretend yesterday's floorplan always looked that way? ⟐
