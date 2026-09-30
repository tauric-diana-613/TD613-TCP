# Pedagogue Notary Ribbon — Revision Precedence Bridge Custody Hostile Assay v0.1

Status: **PREREGISTERED / PRE-EXECUTION / ATTACK-ONLY / HUMAN-GATED**

Schema: `td613.pedagogue.revision-precedence-bridge-custody-hostile-assay/v0.1`

Research surface: PR `#677`

## 0. Inherited result under attack

Two Stamps Same Minute established:

```text
EVENT_MEMBERSHIP_REVISION_CUSTODY_C8_FALSIFIED_AS_SAME_EPOCH_ARBITRATION_SUFFICIENT_FORM
MEMBERSHIP_EPOCH_BUNDLE_CUSTODY_CANDIDATE_SURVIVES_BOUNDED_TWO_STAMPS_SAME_MINUTE
```

C9 correctly refuses contradictory same-semantic, same-epoch dispositions when no revision precedence is independently available.

This assay attacks only C9's sufficiency for a narrower case in which a separately declared revision-precedence bridge is supplied.

Candidate under attack:

```text
C9_MEMBERSHIP_EPOCH_BUNDLE_CUSTODY
```

Candidate descendant:

```text
C10_REVISION_PRECEDENCE_BRIDGE_CUSTODY
Display name: Revision Precedence Bridge Custody
Assay name: Notary Ribbon
status = ATTACK_ONLY_NOT_PROMOTED
presumption_of_survival = false
```

## 1. Preregistered insufficiency

C9 has only two lawful postures for a maximal same-epoch bundle:

```text
uniform material disposition → identify bounded current state
contradictory material disposition → abstain
```

That refusal is correct when no precedence object exists. It may be insufficient when an independently declared, replayable, acyclic bridge establishes that one contradictory revision precedes another.

The assay asks whether a bridge can resolve the otherwise-unordered bundle **without** laundering authority through labels, record names, input order, or unverifiable witness claims.

Core distinctions:

```text
declared revision precedence != witnessed revision precedence
precedence label != precedence provenance
bridge record != bridge authority
membership_id != revision identity
visible bridge payload equality != bridge custody equality
```

## 2. Material revision fingerprint

A bridge may not point to `membership_id` as its authority-bearing endpoint.

Each lawful revision receives a deterministic **material revision fingerprint** derived only from:

```text
semantic_event_key
epoch
raw_event_id
active
revision_kind
continuity_from_semantic_event_key
```

`membership_id` is explicitly excluded from the fingerprint.

Renaming a record therefore cannot redirect a bridge.

The fingerprint is a bounded synthetic identity surrogate for this assay. It is not a real-world identity, authorship, authenticity, or cryptographic trust claim.

## 3. Bridge provenance object

A candidate bridge contains at least:

```text
bridge_id
semantic_event_key
epoch
from_revision_fingerprint
to_revision_fingerprint
relation = PRECEDES
witness_payload
witness_chain[]
witness_terminal_digest
replayable
admissible
revoked
```

The visible precedence payload is:

```text
semantic_event_key
epoch
from_revision_fingerprint
to_revision_fingerprint
relation
```

Witness replay recomputes a deterministic digest from the visible payload plus the ordered witness chain. The supplied terminal digest must match that replay.

A bridge is admitted only if:

```text
relation = PRECEDES
replayable = true
admissible = true
revoked = false
replayed digest = supplied terminal digest
both endpoint fingerprints exist in the same maximal membership epoch bundle
```

A boolean `replayable=true` label without a matching replay witness is insufficient.

## 4. Candidate C10 rule

For a contradictory maximal same-epoch membership bundle:

1. preserve all lawful membership records;
2. construct material revision fingerprints independent of membership IDs;
3. validate bridge provenance independently;
4. build a directed precedence relation only from admitted bridges;
5. reject cyclic or mutually contradictory admitted precedence;
6. if the admitted relation identifies exactly one maximal revision in the bundle, the bounded current active/inactive state may follow that maximal revision;
7. otherwise abstain.

Candidate statuses:

```text
RESOLVED_BY_WITNESSED_REVISION_PRECEDENCE
ABSTAIN_NO_ADMITTED_REVISION_PRECEDENCE
ABSTAIN_REVISION_PRECEDENCE_NOT_IDENTIFYING
ABSTAIN_CONFLICTING_OR_CYCLIC_REVISION_PRECEDENCE
```

No lexical ordering of `bridge_id`, `membership_id`, revision kind, witness ID, or serialization may select authority.

## 5. Strong falsifier

### NR01 · Ribbon Versus Carbon Copy

Use the same contradictory BLUE bundle from Two Stamps Same Minute:

```text
WITHDRAW revision: active=false
ADMIT revision: active=true
same semantic event
same epoch
```

C9 must retain its inherited posture:

```text
ABSTAIN_CONFLICTING_SAME_EPOCH_EVENT_MEMBERSHIP
```

Construct two bridge declarations with the same visible precedence payload:

```text
WITHDRAW → ADMIT
```

Bridge A has a predeclared witness chain whose replayed digest equals its terminal digest.

Bridge B copies the same visible precedence payload but carries either an empty/fabricated chain or a mismatched terminal digest.

Required C10 behavior:

```text
Bridge A = admitted
Bridge B = refused
current_active = true
status = RESOLVED_BY_WITNESSED_REVISION_PRECEDENCE
```

If C10 admits the carbon copy, the candidate is defeated.

If C10 cannot resolve the same bundle with the independently replayed bridge, C9's bridge-aware insufficiency is not established in this run.

## 6. Hostile family

### NR01 · Ribbon Versus Carbon Copy
Positive witnessed bridge and payload-identical unwitnessed copy. Only witnessed bridge may count.

### NR02 · Rename Both Stamps
Rename both membership IDs while preserving material revision fields and the valid bridge. Material fingerprints, bridge admission, and resolved current state must remain invariant.

### NR03 · Reverse the Folder
Reverse membership-record and bridge input order. Result must remain invariant.

### NR04 · Reverse the Ribbon
Supply a separately witnessed valid bridge in the opposite direction:

```text
ADMIT → WITHDRAW
```

The bounded current state may legitimately resolve to inactive. The changed result must be attributable to changed witnessed precedence, not names.

### NR05 · Two Ribbons Fighting
Supply two admitted bridges forming:

```text
WITHDRAW → ADMIT
ADMIT → WITHDRAW
```

Required:

```text
ABSTAIN_CONFLICTING_OR_CYCLIC_REVISION_PRECEDENCE
```

No bridge ID tiebreak.

### NR06 · Decorative Ribbon
Supply a syntactically valid bridge with `replayable=true` but mismatched replay digest.

Required refusal:

```text
REFUSE_UNWITNESSED_REVISION_PRECEDENCE_BRIDGE
```

### NR07 · Revoked Ribbon
A bridge whose provenance is otherwise valid but `revoked=true` must not contribute precedence.

### NR08 · Wrong Drawer
A valid bridge whose endpoint fingerprint is not present in the target maximal epoch bundle must be refused.

### NR09 · Uniform Bundle Control
A uniform active same-epoch bundle does not require precedence to identify the bounded active state. C10 must not turn ordinary agreement into artificial dependency on a ribbon.

### NR10 · Inherited Raw-Binding Conflict
C8/C9 protection for incompatible semantic assignments to one raw event ID remains inherited. A bridge may not override that separate conflict class.

### NR11 · Bridge Compaction
A compact object containing only `from`, `to`, and `PRECEDES` cannot claim witness provenance equivalence with the full admitted bridge.

```text
precedence edge equality != bridge-provenance equality
```

### NR12 · Sealed Bridge Mutation
A sealed admitted bridge receipt is immutable.

Expected:

```text
SEALED_REVISION_PRECEDENCE_BRIDGE_IMMUTABLE
```

## 7. Candidate verdicts

Possible inherited verdicts:

```text
MEMBERSHIP_EPOCH_BUNDLE_C9_FALSIFIED_AS_BRIDGE_AWARE_SUFFICIENT_FORM
C9_BRIDGE_AWARE_INSUFFICIENCY_NOT_ESTABLISHED_IN_THIS_RUN
```

Possible C10 verdicts:

```text
REVISION_PRECEDENCE_BRIDGE_CUSTODY_CANDIDATE_SURVIVES_BOUNDED_NOTARY_RIBBON
REVISION_PRECEDENCE_BRIDGE_CUSTODY_CANDIDATE_FALSIFIED_IN_BOUNDED_NOTARY_RIBBON
```

CI green is not the scientific verdict. Candidate survival and candidate falsification are both legitimate scientific outcomes. Tests fail only on broken assay machinery or constitutional regression.

## 8. Defeat conditions

C10 is defeated by any of:

```text
UNWITNESSED_BRIDGE_ADMITTED
REPLAY_DIGEST_MISMATCH_ADMITTED
MEMBERSHIP_ID_REDIRECTS_BRIDGE
INPUT_ORDER_SELECTS_BRIDGE_AUTHORITY
BRIDGE_ID_SELECTS_CONFLICTING_AUTHORITY
CYCLIC_PRECEDENCE_FORCED_TO_UNIQUE_RESULT
REVOKED_BRIDGE_RETAINS_AUTHORITY
OUT_OF_BUNDLE_BRIDGE_ENDPOINT_ADMITTED
UNIFORM_BUNDLE_FALSELY_REQUIRES_PRECEDENCE
INHERITED_RAW_BINDING_CONFLICT_PROTECTION_LOST
BRIDGE_COMPACTION_OVERCLAIMS_PROVENANCE
SEALED_REVISION_PRECEDENCE_BRIDGE_MUTATED
```

## 9. Frozen scope

```text
C9 no-precedence bundle semantics = FIXED
C8/C9 event-membership validation = FIXED
same semantic event + same epoch primary bundle = FIXED
bridge endpoint identity = MATERIAL_REVISION_FINGERPRINT
membership_id authority = FORBIDDEN
bridge_id authority = FORBIDDEN
input-order authority = FORBIDDEN
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

## 10. Claim ceiling

This assay does not establish:

```text
physical time order
causal order outside the synthetic fixture
Lamport clocks
vector clocks
distributed consensus
distributed-log correctness
serializability theorem
event-sourcing completeness
temporal-database completeness
cryptographic identity
authorship or authenticity
provenance algebra
proof theory
category / lattice / sheaf structure
connection / curvature / holonomy
quantum identity
autonomous scientific authority
```

A replay digest here is only a deterministic synthetic integrity witness for this assay.

## 11. Authority membrane

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

𝌋 The ribbon may connect two stamps. It does not become a notary merely because somebody wrote PRECEDES on it. ⟐
