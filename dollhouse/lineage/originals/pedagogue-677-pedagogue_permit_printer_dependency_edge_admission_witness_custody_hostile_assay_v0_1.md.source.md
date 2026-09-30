# Pedagogue Hostile Assay · Permit Printer

## E6 · Dependency Edge Admission Witness Custody

**Research surface:** Draft PR #677  
**Candidate:** `E6_DEPENDENCY_EDGE_ADMISSION_WITNESS_CUSTODY`  
**Status:** `ATTACK_ONLY_NOT_PROMOTED`  
**Parent:** sealed E5 Unlicensed Electrician receipt `aad36619a0e8720644754c5772fff0a5c092f8f6`

## 0. Why this chamber exists

Unlicensed Electrician established a bounded admission membrane for dependency edges: a declared edge may contribute transitive warrant authority only when at least one active, unrevoked, materially matching admission record survives E5.

E5 nevertheless trusts the supplied admission ledger as its own authority surface. It can distinguish a permit bound to the wrong wiring, a revoked permit, and a duplicate-conflicted permit ID. It cannot distinguish a permit that was independently observed entering the ledger from a permit freshly printed by the same claimant who needs the edge admitted.

Therefore:

```text
permit record present
!= permit issuance witnessed

materially correct permit
!= independent admission provenance

witness token written on permit
!= witness record

ledger presence
!= self-authenticating authority
```

## 1. Strong falsifier · the permit printer

Construct W1 with direct lawful E3 support and W2 with no direct lawful support. The candidate W1→W2 edge cites an active, unrevoked, materially matching E5 admission record.

The admission record additionally claims:

```text
issuance_event_fingerprint = ISSUANCE:FAKE
witness_record_ids = [FAKE_WITNESS]
```

No independent witness-ledger record with `witness_id = FAKE_WITNESS` exists.

Required inherited E5 observation:

```text
E5 admission record is materially valid
E5 edge status = ADMIT_LEDGER_BOUND_DEPENDENCY_EDGE
E5 W2 = ADMIT_CURRENT_WARRANT_WITH_TRANSITIVE_LAWFUL_SUPPORT
```

Required E6 behavior:

```text
admission record status = REFUSE_SELF_ATTESTED_DEPENDENCY_EDGE_ADMISSION
edge cannot enter inherited E5 graph
W2 = REFUSE_CURRENT_WARRANT_NO_ACTIVE_LAWFUL_SUPPORT
```

If E5 does not admit the fabricated/self-attested permit, the inherited insufficiency is not established. If E6 admits it without an independent matching witness record, E6 fails.

## 2. Material issuance binding

An E6 candidate admission record extends the E5 record with:

```text
issuance_event_fingerprint
witness_record_ids[]
```

`issuance_event_fingerprint` is a binding target, not authority. A claimant may invent one. Authority arises only through a separately supplied witness record that materially agrees with both the issuance event and the edge admission it purportedly observed.

A witness record contains:

```text
witness_id
witness_kind = DEPENDENCY_EDGE_ADMISSION_OBSERVED
issuance_event_fingerprint
material_edge_fingerprint
revoked
```

The witness must be:

- uniquely identified within the bounded witness ledger;
- of the required witness kind;
- bound to the admission record's issuance event;
- bound to the same material dependency edge;
- unrevoked.

Neither `witness_id` nor `admission_id` is semantic authority.

## 3. Candidate statuses

```text
ADMIT_WITNESSED_DEPENDENCY_EDGE_ADMISSION
REFUSE_SELF_ATTESTED_DEPENDENCY_EDGE_ADMISSION
REFUSE_MISSING_DEPENDENCY_EDGE_ADMISSION_WITNESS
REFUSE_MISBOUND_DEPENDENCY_EDGE_ADMISSION_WITNESS
REFUSE_REVOKED_DEPENDENCY_EDGE_ADMISSION_WITNESS
REFUSE_DUPLICATE_DEPENDENCY_EDGE_ADMISSION_WITNESS_ID
REFUSE_E5_INVALID_DEPENDENCY_EDGE_ADMISSION
```

Only E6-witnessed admission records may be supplied to inherited E5 for edge admission.

## 4. Hostile rooms

### PP01 · Printer in the Back Room
A materially valid E5 permit claims a fabricated witness ID absent from the independent witness ledger. E5 must admit it; E6 must refuse it as self-attested and keep W2 unsupported.

### PP02 · Clerk at the Counter
A materially valid permit has one independently supplied, matching, unrevoked issuance-witness record. E6 admits the permit and preserves E5's edge and Relay Lantern propagation result.

### PP03 · Missing Carbon Copy
A permit cites both a valid matching witness and an additional required witness ID that is absent. Partial witness custody must not be silently collapsed into complete custody.

### PP04 · Witness Saw Another Permit
The cited witness exists but binds a different issuance event or material edge. E6 refuses the misbound witness.

### PP05 · Witness Recanted
A materially matching witness record marked revoked cannot authorize the admission record.

### PP06 · Two People Wearing the Same Badge
One witness ID is assigned to materially incompatible witness records. No lexical or serialization winner may be selected.

### PP07 · Badge Numbers Changed
Rename `witness_id`, `admission_id`, and `edge_id` while preserving all material bindings. Authority must remain unchanged.

### PP08 · Folder Reversed
Reverse warrants, edges, admission records, witness records, and cited witness-ID order. Admission and current-authority states must remain invariant.

### PP09 · Real Permit Beside a Home Printer
A valid witnessed admission record and a fabricated self-attested alternative both target the same material edge. The fabricated alternative must not erase the valid lineage; the edge remains usable through the witnessed permit only.

### PP10 · Yesterday's Witness on Today's Permit
Preserve `admission_id` and material edge while changing `issuance_event_fingerprint`; reuse the old witness. E5 must still accept the permit because it ignores issuance provenance. E6 must refuse the stale/misbound witness.

### PP11 · Crowd at the Counter
Multiple semantically equivalent valid witness records may preserve custody redundancy but must not amplify confidence, authority, or consequence.

### PP12 · "Witnessed: True" Rubber Stamp
A permit carries a self-declared boolean or prose claim that it was witnessed but has no independent witness-ledger record. The claim has no admission authority.

### PP13 · Locked Witness Book
A sealed issuance-witness record cannot be mutated after the assay to rescue or destroy a permit.

### PP14 · Unlicensed Electrician Control
For a properly witnessed admission record, E6 must preserve E5's material edge-admission result and E4's downstream propagation semantics exactly. E6 may narrow which permit records count; it may not rewrite inherited semantics.

## 5. Defeat conditions

```text
SELF_ATTESTED_PERMIT_RETAINS_AUTHORITY
E5_ADMISSION_LEDGER_PROVENANCE_INSUFFICIENCY_NOT_ESTABLISHED
PARTIAL_WITNESS_SET_SILENTLY_ACCEPTED
MISBOUND_ADMISSION_WITNESS_AUTHORIZES_PERMIT
REVOKED_ADMISSION_WITNESS_RETAINS_AUTHORITY
DUPLICATE_WITNESS_ID_LEXICALLY_ARBITRATED
IDENTIFIER_RENAME_CHANGES_ADMISSION_AUTHORITY
SERIALIZATION_ORDER_SELECTS_ADMISSION_WITNESS_AUTHORITY
FABRICATED_ALTERNATIVE_ERASES_VALID_WITNESSED_PERMIT
STALE_ISSUANCE_WITNESS_INHERITS_REPLACEMENT_PERMIT
WITNESS_MULTIPLICITY_AMPLIFIES_AUTHORITY
SELF_DECLARED_WITNESSED_FLAG_SUBSTITUTES_FOR_WITNESS_LEDGER
SEALED_ADMISSION_WITNESS_RECORD_MUTATED
E6_CHANGES_E5_OR_E4_SEMANTICS_FOR_WITNESSED_PERMIT
```

## 6. Possible verdicts

If PP01 first demonstrates that E5 accepts the self-attested admission record:

```text
E5_ADMISSION_LEDGER_PROVENANCE_INSUFFICIENCY_ESTABLISHED
```

If E6 then defeats every preregistered attack:

```text
DEPENDENCY_EDGE_ADMISSION_WITNESS_CUSTODY_CANDIDATE_SURVIVES_BOUNDED_PERMIT_PRINTER
```

Otherwise:

```text
E5_ADMISSION_LEDGER_PROVENANCE_INSUFFICIENCY_NOT_ESTABLISHED_IN_THIS_RUN
```

and/or:

```text
DEPENDENCY_EDGE_ADMISSION_WITNESS_CUSTODY_CANDIDATE_FALSIFIED_IN_BOUNDED_PERMIT_PRINTER
```

## 7. Exact claim ceiling

Even a witnessed permit remains bounded by the witness ledger supplied to E6.

```text
matching witness-ledger record
!= non-anticipating acquisition
!= predeclared witness protocol
!= independent institutional authority
!= real-world authorization
```

E6 does not promote the witness ledger into a self-authenticating source.

If E6 survives, the next earned attack is **witness acquisition provenance / pre-admission protocol custody**: whether the witness existed under a declared protocol before the permit needed defending, rather than being manufactured after the question was known.

## 8. Held boundaries

```text
synthetic_exogenous_fixture = true
live_external_source_adapter = false
real_world_external_provenance_claim = false
real_world_authorization_claim = false
witness_acquisition_provenance = HELD_FOR_NEXT_ATTACK
pre_admission_witness_protocol = HELD_FOR_NEXT_ATTACK
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

𝌋 A permit can be materially perfect and still come warm from the printer. ⟐
