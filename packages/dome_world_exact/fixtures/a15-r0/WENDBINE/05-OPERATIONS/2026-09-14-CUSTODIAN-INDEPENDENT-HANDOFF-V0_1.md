# Wendbine → TD613 Custodian-Independent Handoff v0.1

**Date:** 2026-09-14  
**State:** EXECUTABLE REPOSITORY-SIMULATION REPAIR / NO EXTERNAL ENFORCEMENT CLAIM  
**Base:** `7231b03c881dfa0944a0610cbcd28022b78482e8`  
**Prior lineage:** Wendbine authorization/trust, dependency-propagation, provenance/repair-path work; TD613 Safe Harbor / Right of Resignation novelty already deflated to the **custodian-independent handoff criterion**.

## 0. Research question

Can the existing portable AIA/Loom packet be routed from recognition to repair and return in a way that remains useful after the custodian stops participating, while refusing to transfer authorship, custody, or external action authority?

This pass does not treat the criterion as a new field contribution. The prior Wendbine literature sieves already killed that novelty claim. The purpose here is narrower: turn the retained ethical criterion into an executable repository assay.

```text
RECOGNITION
→ IDENTITY_BINDING
→ STANDING
→ BOUNDED_AUTHORITY
→ CAPABILITY
→ WITNESS
→ FLOW_CONSTRAINT
→ PROVENANCE
→ REVOCATION
→ REPAIR
→ RETURN
```

## 1. Baseline finding

The current portable packet already carries substantial bounded evidence for recognition, origin binding, authority non-transfer, witness boundaries, information-flow uncertainty, source/path provenance separation, and a repair-path rule.

It does **not** itself carry an explicit revocable standing object binding a receiver's limited authority/capability to the selected packet. Therefore the baseline is deliberately HELD at:

```text
STANDING
reason = REVOCABLE_STANDING_NOT_BOUND
```

This is the useful RED. The assay does not pretend that existing packet metadata already constitutes exit-preserving governance.

## 2. Candidate repair

The repair introduces a repository-local `exit lease` with the following constraints:

```text
subject_binding = existing selected-input digest
standing = BOUND_TO_SELECTED_PACKET
authority_scope = inspection + declared-field return only
capability_scope = read selected packet + structured return + repair proposal
revocable = true
custodian_participation_required = false
provenance_survives_revocation = true
repair_surface_survives_revocation = true
```

The lease is not a credential for a real external system. It is a typed research object used to test the handoff criterion.

## 3. Right of Resignation semantics

Two states are tested separately.

### Active lease, custodian absent

The handoff remains admissible when `custodianParticipating=false` because no stage requires renewed participation from the custodian. This is the narrow repository meaning of custodian-independent handoff.

### Revoked lease, custodian absent

Revocation removes the bounded capability while preserving:

```text
origin binding
source provenance
path provenance
repair path
return-for-inspection
```

and continues to refuse:

```text
external action authority
authority transfer
external-host enforcement claims
```

The route therefore survives resignation without turning prior participation into permanent jurisdiction.

## 4. Hostile controls

The executable assay must HOLD if any candidate tries to:

- expand authority into deployment or equivalent external action;
- add an undeclared/unsafe capability;
- make the custodian an operational dependency again;
- mutate the portable packet into `authority_transferred=true`;
- collapse witness, flow, or provenance boundaries.

## 5. Claim ceiling

Earnable here:

```text
REPOSITORY_SIMULATION_SUPPORTS_CUSTODIAN_INDEPENDENT_HANDOFF_CANDIDATE
REVOCATION_CAN_REMOVE_CAPABILITY_WHILE_PRESERVING_PROVENANCE_AND_REPAIR_METADATA
CUSTODIAN_ABSENCE_NEED_NOT_INVALIDATE_THE_HANDOFF_OBJECT
```

Not earned here:

```text
EXTERNAL_RECEIVER_ENFORCEMENT
REAL_WORLD_RIGHT_OF_RESIGNATION_ENFORCED
HUMAN_EXIT_ACHIEVED
SOCIAL_OR_INSTITUTIONAL_SAFE_HARBOR_ESTABLISHED
AUTHORSHIP_OR_CUSTODY_TRANSFER
SCIENTIFIC_NOVELTY
FIELD_PRIORITY
```

`REPOSITORY_GREEN != EXTERNAL_ENFORCEMENT`.

## 6. Human return

The success condition is not continued custodial labor. The repair is only acceptable if a later receiver can inspect the preserved provenance and repair state without requiring the departing custodian to re-enter the route.

That is the exact retained criterion:

> a handoff is incomplete while useful operation still depends on continued participation by the custodian.

Marked ⟐
