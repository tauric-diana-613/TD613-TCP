# Pedagogue Hostile Assay · Unlicensed Electrician

## E5 · Dependency Edge Admission Provenance Custody

**Research surface:** Draft PR #677  
**Candidate:** `E5_DEPENDENCY_EDGE_ADMISSION_PROVENANCE_CUSTODY`  
**Status:** `ATTACK_ONLY_NOT_PROMOTED`  
**Parent:** sealed E4 Relay Lantern receipt `72e13c85381ca5505eb5958e08c1afa012324152`

## 0. Why this chamber exists

Relay Lantern established a bounded transitive rule: current authority may travel through a declared dependency graph only from a current lawful foundation; unsupported cycles do not bootstrap themselves; current and historical reachability remain distinct.

But E4's edge classifier is intentionally shallow. Once both warrant endpoints are known and the edge carries a boolean active state, the edge enters the graph. E4 does not establish who authorized that dependency or whether a prior authorization still binds after the material meaning of the dependency changes.

Therefore the next question is not larger graph theory. It is admission provenance.

```text
declared dependency edge
!= admitted dependency authority

edge syntax
!= edge warrant

edge identifier continuity
!= semantic authorization continuity

same endpoints
!= same dependency meaning
```

## 1. Strong falsifier A · the unlicensed wire

Construct W1 with current lawful direct E3 support and W2 with no direct lawful support.

Supply a syntactically valid E4 edge:

```text
W1 → W2
```

but provide no corresponding independent edge-admission ledger record.

Required inherited observation:

```text
E4 admits the declared edge
E4 propagates current authority to W2
```

Required E5 behavior:

```text
edge → REFUSE_UNADMITTED_DEPENDENCY_EDGE
W2 → no current transitive authority
```

If E5 permits the edge merely because its endpoints are known, E5 fails.

## 2. Strong falsifier B · stale permit after semantic replacement

Start with a materially admitted dependency:

```text
edge_id = EDGE_ALPHA
from = W1
to = W2
dependency_kind = WARRANT_SUPPORT_DEPENDENCY
scope_fingerprint = SCOPE:ALPHA
```

The independent admission ledger binds its authorization to the **material edge fingerprint**, not to `edge_id`.

Now preserve the identifier and endpoints while changing material dependency meaning:

```text
edge_id = EDGE_ALPHA
from = W1
to = W2
dependency_kind = CORRELATION_ONLY
scope_fingerprint = SCOPE:BETA
```

The old admission record remains unchanged.

Required inherited E4 observation: because E4 does not inspect these additional semantic fields, the replacement remains syntactically admissible and can still propagate authority.

Required E5 behavior:

```text
REFUSE_STALE_DEPENDENCY_EDGE_ADMISSION_BINDING
```

Identifier continuity and endpoint resemblance cannot transfer authorization across semantic replacement.

## 3. Material edge identity

E5 computes an identifier-independent material fingerprint from exactly:

```text
from_warrant_key
to_warrant_key
dependency_kind
scope_fingerprint
```

The following are explicitly excluded from semantic authority:

```text
edge_id
serialized input position
admission_id lexical order
duplicate record count
```

`active` remains an edge state, not its semantic identity.

## 4. Independent edge-admission ledger

A candidate edge may cite one or more `admission_record_ids`. The cited records must exist in a separately supplied ledger.

A bounded admission record contains:

```text
admission_id
admission_kind = DEPENDENCY_EDGE_ADMISSION
material_edge_fingerprint
active
revoked
```

At least one uniquely identified, active, unrevoked, materially bound record is required for edge admission.

This ledger is a bounded synthetic authority surface for the assay. E5 does **not** claim that presence in this ledger proves real-world authorization, authorship, institutional validity, or independent witness truth. The provenance of admission-ledger entries themselves remains a later attack surface.

## 5. Hostile rooms

### UE01 · Extension Cord Through the Window
Only an unadmitted syntactically valid W1→W2 edge is supplied. E4 must expose its declared-edge insufficiency by admitting it; E5 must refuse it and keep W2 unsupported.

### UE02 · Permit on File
The same material edge has a matching active ledger record. E5 admits it and reproduces the bounded E4 transitive result.

### UE03 · Old Permit, New Wiring
Same edge ID and endpoints, changed dependency kind/scope, stale old ledger binding. E4 still accepts; E5 refuses the stale binding.

### UE04 · Number on the Permit
Rename `edge_id` and `admission_id` while preserving material binding. Authority must remain unchanged.

### UE05 · Papers Reversed on the Desk
Reverse warrants, edges, admission records, and cited admission-record order. Authority and edge-admission statuses must remain invariant.

### UE06 · Photocopies of the Permit
Duplicate semantically equivalent admission records must not amplify confidence or consequence.

### UE07 · Permit Revoked
A materially matching but revoked admission record cannot authorize the edge.

### UE08 · Permit for the Neighbor's House
An admission record whose material fingerprint binds another edge must not authorize this edge.

### UE09 · Licensed and Unlicensed Copies
Two visible same-material edges cite different records: one valid, one absent/fabricated. The valid lineage remains usable; the fabricated copy is refused and cannot erase the valid path.

### UE10 · Endpoint Photograph
A snapshot claiming that W2 was previously transitive-lawful cannot replace an edge-admission record.

### UE11 · Duplicate Admission ID
If one admission ID is assigned to materially incompatible records, no lexical or serialization winner may be chosen. The cited admission is conflicted and unusable.

### UE12 · Locked Permit Cabinet
A sealed admission-ledger record cannot be mutated after the assay to rescue or destroy an edge.

### UE13 · Relay Lantern Control
For a properly admitted material edge, E5 must preserve E4's bounded reachability semantics exactly. Admission custody may narrow which edges enter the graph; it may not rewrite Relay Lantern's propagation law.

## 6. Defeat conditions

```text
UNADMITTED_EDGE_RETAINS_AUTHORITY
E4_DECLARED_EDGE_INSUFFICIENCY_NOT_ESTABLISHED
STALE_SEMANTIC_REPLACEMENT_INHERITS_OLD_ADMISSION
EDGE_OR_ADMISSION_IDENTIFIER_SELECTS_AUTHORITY
SERIALIZATION_ORDER_SELECTS_EDGE_AUTHORITY
DUPLICATE_ADMISSION_AMPLIFIES_AUTHORITY
REVOKED_ADMISSION_RETAINS_AUTHORITY
MISBOUND_ADMISSION_AUTHORIZES_EDGE
FABRICATED_COPY_ERASES_VALID_ADMISSION
ENDPOINT_SNAPSHOT_SUBSTITUTES_FOR_EDGE_ADMISSION
DUPLICATE_ADMISSION_ID_LEXICALLY_ARBITRATED
SEALED_EDGE_ADMISSION_LEDGER_MUTATED
E5_CHANGES_E4_PROPAGATION_SEMANTICS_FOR_ADMITTED_EDGE
```

## 7. Possible verdicts

If E4 admits the strong-falsifier unlicensed edge and E5 defeats every attack:

```text
E4_DECLARED_DEPENDENCY_EDGE_ADMISSION_INSUFFICIENCY_ESTABLISHED
DEPENDENCY_EDGE_ADMISSION_PROVENANCE_CUSTODY_CANDIDATE_SURVIVES_BOUNDED_UNLICENSED_ELECTRICIAN
```

Otherwise:

```text
E4_DECLARED_DEPENDENCY_EDGE_ADMISSION_INSUFFICIENCY_NOT_ESTABLISHED_IN_THIS_RUN
```

and/or:

```text
DEPENDENCY_EDGE_ADMISSION_PROVENANCE_CUSTODY_CANDIDATE_FALSIFIED_IN_BOUNDED_UNLICENSED_ELECTRICIAN
```

## 8. Claim ceiling and next frontier

Even survival does not prove the truth or legitimacy of the admission ledger itself.

```text
ledger-bound edge admission
!= admission-ledger provenance
!= institutional authorization
!= witness truth
```

If E5 survives, the next scientifically earned attack is the **admission ledger's own provenance / bootstrap authority**, not larger graph composition.

## 9. Held boundaries

```text
synthetic_exogenous_fixture = true
live_external_source_adapter = false
real_world_external_provenance_claim = false
real_world_authorization_claim = false
admission_ledger_provenance = HELD_FOR_NEXT_ATTACK
universal_graph_semantics = false
scalar_aggregation_used = false
H2 = HELD_NOT_TESTED_HERE
H3 = HELD_NOT_TESTED_HERE
intersections = HELD_NOT_OPENED_HERE
APERTURE_V32_REPLAY_STABILITY = HELD_NOT_YET_WITNESSED
promotion_authority = false
product_mutation = false
shared_pedagogue_engine_mutation = false
workflow_mutation = false
browser_execution = false
merge_performed = false
deployment_performed = false
release_authority = false
vercel_release_requires_issue_405_and_new_explicit_operator_gesture = true
```

𝌋 Relay Lantern proved current could move through wiring. Unlicensed Electrician asks whether the wiring ever had a permit. ⟐
