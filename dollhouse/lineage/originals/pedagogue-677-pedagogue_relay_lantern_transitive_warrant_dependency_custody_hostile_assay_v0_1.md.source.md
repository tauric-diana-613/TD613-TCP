# Pedagogue Relay Lantern — Transitive Warrant Dependency Custody Hostile Assay v0.1

Status: **PREREGISTERED / BOUNDED SYNTHETIC TRANSITIVE-DEPENDENCY RESEARCH / ATTACK-ONLY / NOT PROMOTED**

Schema: `td613.pedagogue.transitive-warrant-dependency-custody-hostile/v0.1`

Research surface: PR `#677`

Candidate: `E4_TRANSITIVE_WARRANT_DEPENDENCY_CUSTODY`

Assay chamber: **Relay Lantern**

Presumption of survival: **false**

## 0. Inherited jurisdiction

E1 `Open Window` witnessed scoped current exogenous observation admission.
E2 `Moving Sash` witnessed exogenous-anchor revision episode custody.
E3 `Borrowed Light` witnessed direct declared warrant dependency revocation/preservation.

E4 opens only the transitive question:

```text
E3 direct dependency custody != E4 transitive dependency custody
```

No new claim about real-world source truth is opened here.

## 1. Candidate law under attack

A warrant may inherit current authority through a declared warrant-to-warrant dependency only when a currently lawful foundation reaches it through the declared dependency graph.

```text
current lawful foundation → declared dependency path → current derived warrant
```

A closed warrant cycle with no current lawful foundation must not bootstrap itself into authority.

```text
W1 → W2 → W1 + no lawful foundation != authority
```

If any lawful foundational or already-grounded path reaches the cycle, authority may propagate through the declared edges. A downstream warrant with its own independent lawful direct support must survive even if an upstream path fails.

Conflict may propagate as abstention only when no admitted support path exists. IDs, serialization order, duplicate edges, and endpoint-value snapshots are not authority.

## 2. Strong falsifiers

### Chain revocation

```text
K supports W1
W1 supports W2
K withdrawn
```

Required:

```text
W1 current = refused
W2 current = refused
historical path preserved
```

### Unsupported cycle

```text
W1 depends on W2
W2 depends on W1
no current primitive/exogenous support
```

Required:

```text
W1 current = refused
W2 current = refused
cycle_does_not_self_sustain = true
```

## 3. Dependency-edge covenant

Each warrant edge carries:

```text
edge_id
from_warrant_key
to_warrant_key
active
```

The semantic edge is `(from_warrant_key, to_warrant_key, active)`; `edge_id` is not authority. Exact duplicates do not amplify support or confidence.

The evaluator begins from E3 direct-support states, then computes bounded reachability from current admitted foundations. It separately propagates unresolved conflict only to nodes that lack an admitted path.

## 4. Hostile rooms

### RL01 — Relay Goes Dark
Anchor K directly supports W1; W1 supports W2. Withdraw K. Both W1 and W2 lose current authority.

### RL02 — Circular Lanterns
W1 and W2 depend only on each other with no direct lawful foundation. Neither may self-sustain.

### RL03 — Grounded Ring
W1 and W2 form a cycle, but W1 also has current independent lawful direct support. Both may become current through the grounded cycle.

### RL04 — Downstream Spare Battery
W1 loses its sole foundation, but W2 has its own independent lawful direct support. W2 remains current.

### RL05 — Conflict Relay
W1 has unresolved direct support conflict and no admitted path; W2 depends only on W1. Both must abstain rather than become admitted or silently refused as ordinary absence.

### RL06 — Wrong Wire
An edge from unrelated W9 to W2 cannot support W2 merely because W9 is admitted.

### RL07 — Twin Wires
Duplicate the same semantic edge under another `edge_id`. Authority and semantic edge count remain unchanged; no confidence is created.

### RL08 — Tags and Order Shuffle
Rename edge IDs and reverse serialization. Current warrant states and semantic graph fingerprint remain invariant.

### RL09 — Historical Relay
After upstream foundation withdrawal, historical evidence that W2 was once reachable through W1 remains reconstructable while current authority is gone.

### RL10 — Endpoint Photograph
A snapshot saying `W2 = admitted` without the dependency path or current foundation has no transitive-authority custody.

### RL11 — Post-Hoc Electrician
Mutation of a sealed dependency graph must refuse as `SEALED_TRANSITIVE_WARRANT_DEPENDENCY_GRAPH_IMMUTABLE`.

### RL12 — E3 Direct Control
A warrant with direct E3 support and no warrant-to-warrant edges must preserve E3's direct status exactly.

## 5. Preregistered defeat conditions

```text
ANCHOR_WITHDRAWAL_FAILS_TRANSITIVE_REVOCATION
UNANCHORED_CYCLE_SELF_SUSTAINS
ANCHORED_CYCLE_FAILS_TO_PROPAGATE
INDEPENDENT_DOWNSTREAM_SUPPORT_FALSELY_REVOKED
CONFLICT_NOT_PROPAGATED_AS_ABSTENTION
WRONG_DEPENDENCY_EDGE_CREATES_AUTHORITY
DUPLICATE_EDGE_AMPLIFIES_SUPPORT_OR_CONFIDENCE
EDGE_IDENTIFIER_OR_SERIALIZATION_CHANGES_AUTHORITY
HISTORICAL_TRANSITIVE_PATH_ERASED
ENDPOINT_SNAPSHOT_OVERCLAIMS_TRANSITIVE_PATH
SEALED_TRANSITIVE_DEPENDENCY_GRAPH_MUTATED
E4_CHANGES_E3_DIRECT_SEMANTICS
```

Survival verdict:

```text
TRANSITIVE_WARRANT_DEPENDENCY_CUSTODY_CANDIDATE_SURVIVES_BOUNDED_RELAY_LANTERN
```

Falsification verdict:

```text
TRANSITIVE_WARRANT_DEPENDENCY_CUSTODY_CANDIDATE_FALSIFIED_IN_BOUNDED_RELAY_LANTERN
```

## 6. Claim ceiling if E4 survives

> In this bounded synthetic dependency family, current warrant authority may propagate through declared warrant-to-warrant edges only from a currently lawful foundation; withdrawal of the sole foundation revokes dependent downstream authority, unsupported cycles do not bootstrap themselves, grounded cycles may transmit admitted authority, conflicts propagate as abstention only where no admitted path exists, and independent direct support can preserve a downstream warrant despite upstream failure.

E4 would not establish universal graph semantics, real-world truth maintenance, optimal dependency design, semantic-replacement bridge law, scalar trust/confidence, H2, H3, intersections, Aperture installed replay stability, or production authority.

## 7. Authority membrane

```text
candidate_status = ATTACK_ONLY_NOT_PROMOTED
promotion_authority = false
synthetic_exogenous_fixture = true
live_external_source_adapter = false
real_world_external_provenance_claim = false
universal_graph_semantics = false
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

No merge. No deployment. No release. No Vercel.

𝌋 Relay Lantern asks whether authority can travel without learning the old spiritualist trick of powering itself from a closed circle. ⟐
