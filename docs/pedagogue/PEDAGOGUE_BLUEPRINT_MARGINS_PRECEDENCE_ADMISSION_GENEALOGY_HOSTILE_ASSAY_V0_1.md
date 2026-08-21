# Pedagogue Blueprint Margins — Precedence Admission Genealogy Hostile Assay v0.1

Status: **PREREGISTERED / PRE-EXECUTION / BOUNDED SYNTHETIC HOSTILE RESEARCH / OPERATOR-ADMITTED**

Schema: `td613.pedagogue.precedence-admission-genealogy-hostile-assay/v0.1`

Research surface: PR `#677`

## 0. Inherited result under attack

Moving Floorplan established only this bounded result:

```text
C5_WEAVE_REVISION_LEDGER
WEAVE_REVISION_LEDGER_CANDIDATE_SURVIVES_BOUNDED_MOVING_FLOORPLAN
```

C5 can preserve accepted and rejected precedence-relation epochs, distinguish semantic relation recurrence from revision history, and refuse latest-state compaction as historical custody.

That does **not** establish that a semantic precedence relation contains enough custody to say why each admitted edge entered the relation.

The silent widening attacked here is:

```text
admitted semantic precedence relation
→ sufficient provenance for each admitted precedence edge
```

or:

```text
same admitted relation = same admission provenance
```

The target is not whether a precedence edge is causally true. The target is narrower: whether the bounded relation-custody object preserves the declaration/witness genealogy by which an edge was admitted, including alternative lawful supports, revoked supports, rejected candidate supports, and changes in support genealogy that leave relation semantics unchanged.

## 1. Candidate C6 · Precedence Admission Genealogy

Preregistered candidate:

```text
C6_PRECEDENCE_ADMISSION_GENEALOGY
Display name: Precedence Admission Genealogy
status = ATTACK_ONLY_NOT_PROMOTED
presumption_of_survival = false
```

Candidate rule:

> A precedence edge may enter an admitted relation only through at least one predeclared, admissible, witnessed bounded admission record. Preserve every semantically distinct lawful support lineage for the edge, preserve rejected candidate supports separately, and preserve support-set changes even when the resulting semantic relation is unchanged. Witness identifiers and serialization order may label custody records but may not choose edge authority. Revoking one lawful support must not remove an edge while another lawful support remains; revoking all lawful supports must remove the edge at the next accepted relation epoch. Sealed admission records are immutable.

This candidate is a bounded custody genealogy for declared edge-admission records only. It is not a causal proof rule, testimony-veracity system, distributed consensus protocol, provenance algebra, or general temporal database.

## 2. Frozen representation

The hostile family fixes:

```text
event set
semantic event identities
baseline evidence
warrant derivation rules
requested warrant
contradiction families
edge candidate set
```

Only edge-admission support records and their admitted/revoked/rejected posture vary across the bounded genealogy episodes.

Each admission record contains:

```text
admission_id
edge = [before_event, after_event]
semantic_support_kind
predeclared
admissible
witnessed
witness_payload
active
```

### 2.1 Witness rule

A support record is lawful only when:

```text
predeclared = true
admissible = true
witnessed = true
witness_payload matches the declared semantic edge relation
active = true
```

A boolean `witnessed=true` without a matching bounded witness payload is not sufficient.

Thus:

```text
declared witnessed != witnessed relation
```

### 2.2 Edge admission rule

For a semantic edge `u -> v`:

```text
edge admitted
iff at least one active lawful support lineage exists
```

All lawful support lineages must remain visible. Rejected candidate supports remain separately visible and may not count toward admission.

### 2.3 Relation construction

The admitted precedence relation is the set of edges with at least one active lawful support lineage.

That relation is then evaluated through the inherited Warrant Weave / Weave Revision custody machinery.

If the admitted edge set is cyclic or otherwise rejected by C4, the relation update remains rejected and the admission-support receipts remain visible. No witness is allowed to win by lexical order.

## 3. Strong falsifier · Same Line, Different Pencil

Frozen edge:

```text
PINK -> BLUE
```

Construct two current relation states:

### State A

One lawful active support:

```text
ADMIT_A
semantic_support_kind = DECLARATION_ALPHA
edge = PINK -> BLUE
witness valid
```

### State B

One different lawful active support:

```text
ADMIT_B
semantic_support_kind = DECLARATION_BETA
edge = PINK -> BLUE
witness valid
```

Both produce the same semantic precedence relation:

```text
[PINK -> BLUE]
```

and therefore the same C4 relation fingerprint and current Warrant Weave posture.

But their admission provenance differs.

Required result:

```text
semantic_relation_equal = true
current_weave_posture_equal = true
admission_genealogy_equal = false
```

### C5 defeat condition

C5 is falsified **only as a precedence-admission-provenance-sufficient form** if the two states become custody-equivalent because C5 preserves the semantic relation/revision epoch but not the distinct lawful support genealogy for the edge.

This does not revoke C5's relation-revision jurisdiction.

## 4. Hostile rooms

### BM01 · Same Line, Different Pencil

Central strong falsifier above.

Required distinction:

```text
same admitted semantic relation != same admission provenance
```

### BM02 · Two Pencils · multiple lawful supports for one edge

Two semantically distinct lawful active admission records support the same edge.

Required:

```text
edge admitted = true
lawful support lineage count = 2
both lawful lineages preserved
```

No first/lexical support may erase the other.

### BM03 · One Pencil Lifted · one of multiple supports revoked

Begin with two lawful supports for one edge. Revoke one while the other remains active.

Required:

```text
edge remains admitted = true
support genealogy changed = true
active lawful support count: 2 -> 1
```

Earned target:

```text
edge persistence != support-genealogy persistence
```

### BM04 · All Pencils Lifted · all lawful supports revoked

Revoke the final lawful support.

Required:

```text
edge no longer admitted = true
no ghost edge survives
```

The prior relation episode remains historical custody; current relation loses the unsupported edge.

### BM05 · Wax Seal Costume · false witness badge

A candidate support carries:

```text
predeclared = true
admissible = true
witnessed = true
```

but its witness payload does not match the claimed semantic edge.

Required:

```text
REFUSE_UNWITNESSED_EDGE_ADMISSION
```

The support remains in rejected-candidate custody and does not admit the edge.

### BM06 · Marginalia Shuffle · identifier / serialization invariance

Rename `admission_id` values and reorder support records while preserving semantic support kinds, edges, witness payloads, and active states.

Required:

```text
semantic relation invariant = true
lawful semantic admission-lineage set invariant = true
requested-warrant posture invariant = true
```

Thus:

```text
admission identifier != edge authority
serialization order != edge authority
```

### BM07 · Bad Pencil Sorts First · valid + invalid support to same edge

Provide one invalid support whose identifier sorts first and one valid lawful support whose identifier sorts later.

Required:

```text
edge admitted through valid support = true
invalid support preserved as rejected = true
valid support preserved as lawful = true
lexical order chooses neither authority nor provenance = true
```

### BM08 · Crossed Arrows · opposing edges with lawful supports

Provide lawful supports for:

```text
PINK -> BLUE
BLUE -> PINK
```

The admission genealogy must preserve both lawful support families, while inherited Warrant Weave rejects the resulting cyclic relation:

```text
REJECT_CYCLIC_OR_INCONSISTENT_PRECEDENCE
```

Required:

```text
relation accepted = false
lawful support receipts preserved = true
no support family silently discarded = true
```

### BM09 · Post-Hoc Eraser · sealed admission record mutation

After sealing a lawful admission record, attempt to rewrite its edge or witness payload in place.

Required refusal:

```text
SEALED_EDGE_ADMISSION_RECORD_IMMUTABLE
```

A change requires a new custody record/episode.

### BM10 · Marginless Blueprint · relation-only compaction

Compare:

```text
full object = semantic relation + admission genealogy
compacted object = semantic relation only
```

Required:

```text
semantic relation equal = true
current Warrant Weave posture equal = true
admission provenance equivalent = false
compacted relation-only object has no authority to assert admission genealogy
```

### BM11 · Same Semantic Pencil, New Label · support-record ID change only

Reissue an otherwise semantically identical support record under a new identifier.

Required:

```text
semantic admission lineage changed = false
record custody event may differ = true
```

Raw record identity must not manufacture a new semantic support lineage.

### BM12 · Witness Scope Expired · active-scope withdrawal

A previously lawful support becomes inactive by an explicitly declared bounded scope transition.

If another lawful active support remains, edge persists; if none remains, edge disappears.

Required distinction:

```text
historically lawful support != currently active support
```

No permanence is inferred from prior admission.

## 5. C6 strong survival requirement

C6 survives this bounded family only if it simultaneously:

1. admits an edge only through at least one active lawful witnessed support;
2. preserves all semantically distinct lawful support lineages for one edge;
3. preserves rejected candidate supports separately;
4. keeps an edge admitted when one of several lawful supports is revoked but another remains;
5. removes the edge when all lawful active supports are gone;
6. rejects boolean witness laundering when payload semantics do not match;
7. remains invariant to admission-ID renaming and support-record ordering;
8. prevents an invalid lexical-first support from suppressing a valid later support;
9. preserves all lawful supports even when their admitted edges form a relation later rejected as cyclic;
10. refuses mutation of sealed admission records;
11. distinguishes semantic support-lineage identity from raw record identity;
12. gives relation-only compaction no authority over unpreserved admission provenance;
13. uses no scalar confidence, trust, certainty, robustness, credibility, or authority score.

Any failure falsifies C6 in this bounded form.

## 6. Preregistered verdict strings

Inherited C5 provenance overclaim:

```text
WEAVE_REVISION_LEDGER_C5_FALSIFIED_AS_PRECEDENCE_ADMISSION_PROVENANCE_SUFFICIENT_FORM
```

C6 bounded survival:

```text
PRECEDENCE_ADMISSION_GENEALOGY_CANDIDATE_SURVIVES_BOUNDED_BLUEPRINT_MARGINS
```

C6 bounded falsification:

```text
PRECEDENCE_ADMISSION_GENEALOGY_CANDIDATE_FALSIFIED_IN_BOUNDED_BLUEPRINT_MARGINS
```

## 7. Claim ceiling

Even if C6 survives, this assay does not establish:

```text
truth of any precedence edge
causal order
witness credibility
human testimony reliability
real-world concurrency semantics
Lamport clocks
vector clocks
distributed consensus
distributed log correctness
serializability theorem
temporal database completeness
event-sourcing completeness
truth-maintenance completeness
provenance algebra
proof theory
category / lattice / sheaf structure
physical time law
connection / curvature / holonomy
quantum identity
autonomous scientific authority
```

`Witness` here means only a bounded machine-checkable synthetic relation receipt whose payload matches the declared synthetic edge semantics.

## 8. Holds

```text
C6 promotion = false
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

CI green is infrastructure evidence, not theory survival. The hostile test must permit either preregistered C6 scientific verdict as a valid run outcome and fail only on broken assay machinery, changed frozen assumptions, or constitutional regression.

𝌋 Moving Floorplan kept every blueprint. Blueprint Margins asks who put the arrow there—and whether a clean photocopy is allowed to forget the pencil, the eraser, and the second hand writing the same line. ⟐
