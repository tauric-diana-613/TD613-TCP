# Pedagogue Two Staircases — Warrant Weave Partial-Order Hostile Assay v0.1

Status: **PREREGISTERED / PRE-EXECUTION / BOUNDED SYNTHETIC HOSTILE RESEARCH / OPERATOR-ADMITTED**

Schema: `td613.pedagogue.warrant-weave-partial-order-hostile-assay/v0.1`

Research surface: PR `#677`

## 0. Inherited result under attack

After Midnight established only the bounded serial-history result:

```text
C3_WARRANT_EPISODE_LEDGER
WARRANT_EPISODE_LEDGER_CANDIDATE_SURVIVES_BOUNDED_AFTER_MIDNIGHT
```

C3 records a declared total episode order and preserves each sealed episode without retroactive authority. That result does **not** establish that a total order is identified when the admitted evidence supplies only partial precedence.

This assay attacks the silent widening:

```text
declared event set + partial precedence
    -> one invented total history
```

The target is **not** causal inference. The target is narrower: whether a bounded custody instrument may assert transient order-dependent facts that are not invariant across all admitted serializations of the declared precedence relation.

## 1. Candidate C4 · Warrant Weave

Preregistered candidate:

```text
C4_WARRANT_WEAVE
Display name: Warrant Weave
status = ATTACK_ONLY_NOT_PROMOTED
presumption_of_survival = false
```

Candidate rule:

> Preserve the declared event set and declared precedence relation. Enumerate every bounded serialization consistent with that relation. Replay each serialization through the same frozen warrant machinery. A final-state or transient-history proposition is identified only when all admitted serializations agree. When admitted serializations disagree, return an explicit ambiguity/abstention rather than selecting a serialization by event identifier, input order, lexical order, or hidden implementation order.

This is a bounded finite synthetic operator. It is not a universal event-sourcing law, causal model, temporal database theorem, proof system, or physical-time claim.

## 2. Frozen representation

Each assay instance contains:

```text
baseline episode state
event set E
precedence edges P subset E x E
fixed rules
fixed contradiction families
requested warrant W
```

Each event is an explicit finite mutation over the synthetic evidence set:

```text
ADD_EVIDENCE
REMOVE_EVIDENCE
NOOP
```

The evaluator may reject malformed or cyclic precedence. It may not repair a cycle by silently deleting an edge or choosing an order.

Bounded enumeration ceiling:

```text
max_events = 8
```

No approximation or sampling is permitted inside this assay family.

## 3. Identifiability rule under attack

For the finite set `L(P)` of all serializations consistent with declared precedence `P`:

```text
final proposition identified
iff every l in L(P) gives the same final proposition

transient proposition identified
iff every l in L(P) gives the same transient proposition
```

Preregistered transient propositions include:

```text
requested warrant continuously supported
requested warrant ever unsupported
contradiction ever entered
contradiction ever resolved after entry
```

If serializations disagree:

```text
ABSTAIN_TRANSIENT_HISTORY_NOT_IDENTIFIED_BY_PARTIAL_ORDER
```

The candidate must expose the disagreement and retain all admitted serialization profiles. It may not crown one path.

## 4. Strong falsifier · Two Staircases

Baseline:

```text
A + B -> W
W is supported
C + D -> W is a second lawful lineage but C,D are initially absent
```

Two events are declared with **no precedence edge**:

```text
PINK  = withdraw evidence A, disabling lineage A+B->W
BLUE  = add evidence C and D, enabling lineage C+D->W
```

Admitted serializations:

```text
PINK -> BLUE
    W supported -> unsupported -> supported

BLUE -> PINK
    W supported -> supported -> supported
```

Both end on the same final current genealogy: W supported through C+D.

The partial order therefore does not identify whether W was transiently unsupported.

Required result:

```text
final requested-warrant presence = IDENTIFIED_PRESENT
transient support continuity = ABSTAIN_TRANSIENT_HISTORY_NOT_IDENTIFIED_BY_PARTIAL_ORDER
selected_serialization = null
lexical_tiebreak_used = false
```

### C3 defeat condition

C3 is falsified **only as a partial-order-custody-sufficient form** if representing this specimen requires choosing one total order and thereby asserting one of the two transient histories as though identified.

This does not revoke C3's serial-history jurisdiction.

## 5. Hostile rooms

### TS01 · Two Staircases · central ambiguity
Unordered withdrawal and replacement-lineage addition. Same final genealogy; different transient support continuity.

### TS02 · Brass Plaque · identifier-renaming invariance
Rename event identifiers and remap precedence edges without changing event semantics. Candidate disposition and semantic ambiguity must remain invariant.

### TS03 · Velvet Rope · precedence resolves the ambiguity
Add `PINK -> BLUE`. The candidate must identify a transient unsupported interval.

### TS04 · Back Stair · opposite precedence resolves differently
Add `BLUE -> PINK`. The candidate must identify continuous support.

### TS05 · Escher Landing · precedence cycle
Declare `PINK -> BLUE` and `BLUE -> PINK`. Required refusal:

```text
REJECT_CYCLIC_OR_INCONSISTENT_PRECEDENCE
```

No serialization may be invented.

### TS06 · Service Hall · unrelated concurrent event
Add an unordered event affecting evidence outside W's rule ancestry. It must not create requested-warrant ambiguity that was absent before.

### TS07 · Ballroom Doors · contradiction-history ambiguity
Baseline supports `DECISION:ALLOW`. One unordered event admits support for conflicting `DECISION:DENY`; another removes support for ALLOW. One serialization passes through a contradiction episode; the other does not. Final state is the same. Candidate must abstain on whether contradiction was ever entered.

### TS08 · Séance Stairs · replay-support handoff
One unordered event withdraws the only currently witnessed lineage; another adds an independent witnessed replacement lineage. Same final warrant presence; transient witnessed-support continuity differs. Candidate must not invent continuity.

### TS09 · Dumbwaiter · semantic no-op
A `NOOP` event may create an episode boundary but must not alter final or transient requested-warrant conclusions.

### TS10 · Folded Floorplan · compaction attack
Compare the full partial-order specimen with a compacted final-state-only representation. The final state may match, but the compacted representation may not inherit transient-history authority.

Required distinction:

```text
final-state equivalence != transient-history equivalence
```

## 6. C4 strong survival requirement

C4 survives this bounded family only if it simultaneously:

1. preserves all admitted serializations rather than selecting one;
2. identifies final-state propositions when all serializations agree;
3. abstains on transient propositions when serializations disagree;
4. becomes decisive when an explicit precedence edge resolves the ambiguity;
5. rejects precedence cycles;
6. remains invariant to event-ID renaming and input ordering;
7. does not import ambiguity from unrelated concurrent events;
8. preserves contradiction-history ambiguity separately from current conflict posture;
9. refuses final-state compaction as a substitute for historical custody;
10. uses no scalar confidence, trust, robustness, or universal score.

Any failure falsifies C4 in this bounded form.

## 7. Preregistered verdict strings

C3 partial-order overclaim:

```text
WARRANT_EPISODE_LEDGER_C3_FALSIFIED_AS_PARTIAL_ORDER_CUSTODY_SUFFICIENT_FORM
```

C4 bounded survival:

```text
WARRANT_WEAVE_CANDIDATE_SURVIVES_BOUNDED_TWO_STAIRCASES
```

C4 bounded falsification:

```text
WARRANT_WEAVE_CANDIDATE_FALSIFIED_IN_BOUNDED_TWO_STAIRCASES
```

## 8. Claim ceiling

Even if C4 survives, this assay does not establish:

```text
causal order
real-world concurrency
Lamport clocks
vector-clock sufficiency
distributed-systems correctness
serializability theorem
temporal database semantics
event-sourcing completeness
truth-maintenance completeness
proof theory
provenance algebra
partial-order reduction theorem
category / lattice / sheaf structure
physical time law
connection / curvature / holonomy
quantum identity
autonomous scientific authority
```

The phrase **partial order** here names only the finite declared precedence relation inside this synthetic assay.

## 9. Holds

```text
C4 promotion = false
H2 = HELD_NOT_TESTED_HERE
H3 = HELD_NOT_TESTED_HERE
M×D = HELD
M×P = HELD
D×P = HELD
M×D×P = HELD
APERTURE_V32_REPLAY_STABILITY = HELD_NOT_YET_WITNESSED
```

## 10. Authority membrane

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

CI green is infrastructure evidence, not theory survival. The hostile test must permit either preregistered scientific verdict as a valid run outcome and fail only on broken assay machinery, changed frozen assumptions, or constitutional regression.

𝌋 The Episode Ledger may remember every footstep it is given. Warrant Weave asks whether it knows which staircase existed before it starts writing footsteps onto one. ⟐
