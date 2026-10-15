# Independent Handoff + Recovery Witness-Acquisition Specification v0.1

U+10D613 · WENDBINE · A15-R0 · 2026-09-15

## Parent custody

This chamber descends only from Dome-World open residual tomography v0.1, PR #1143, sealed GREEN head `cf6232fe74c2adf319f009ab78942b3aa396f428`.

Parent state retained without promotion:

- Right of Resignation: `OPEN`
- Safe Return / Recovery: `NON_EQUIVALENT`
- Return-promotion authority: `false`
- empirical-exteriority authority: `false`

The parent named one lawful successor:

`INDEPENDENT_HANDOFF_AND_RECOVERY_WITNESS_ACQUISITION_SPEC_BEFORE_ANY_RETURN_CLAIM`

## Preregistered RED

The successor was preregistered before implementation at head `3bb06da4a0ddbc9ce39f7bf41fb21049feb756a8`.

GitHub Actions run `34932133102` produced the intended RED. A15-R0 failed on the four declared absences:

- `WITNESS_ACQUISITION_SPEC_MISSING`
- `WITNESS_ACQUISITION_VALIDATOR_MISSING`
- `WITNESS_ACQUISITION_RECEIPT_MISSING`
- `WITNESS_ACQUISITION_OPERATION_MISSING`

No scientific result is inferred from that RED beyond confirmation that the preregistered hostile gate was live before implementation.

## Research question

Can the two archive-limited open residuals be converted into a bounded, independently executable witness-acquisition specification that says exactly what must be observed, what must remain independent of custodian narration, and what defeats the claim, without treating specification completeness as witness acquisition, Right of Resignation, Recovery, Return, or empirical exteriority?

## Lane A — Right of Resignation

Required future witness families:

1. `EXPLICIT_POST_PARTICIPATION_EXIT_OR_REVOCATION_OPERATOR`
2. `EXECUTED_POST_PARTICIPATION_WITHDRAWAL_RECEIPT`
3. `INDEPENDENT_CONTINUATION_WITHOUT_CUSTODIAN_AUTHORITY`
4. `POST_EXIT_ROUTE_USEFULNESS_WITNESS`

Declared defeat conditions:

- generic revocation substituted for the stronger resignation claim;
- custodian narration required after exit;
- continuation still requires originating-custodian authority;
- no executed withdrawal receipt exists.

A generic revocation primitive therefore cannot close the open Right-of-Resignation residual.

## Lane B — Safe Return / Recovery

Required future witness families:

1. `EXPLICIT_RECOVERY_TRANSITION_SPECIFICATION`
2. `EXECUTED_RECOVERY_RECEIPT`
3. `VALIDATED_POST_RECOVERY_STATE`
4. `DECLARED_DEFEAT_OR_ROLLBACK_CONDITION`

Declared defeat conditions:

- repair path substituted for recovery;
- no executed recovery receipt exists;
- post-recovery state remains unvalidated;
- no defeat or rollback condition was declared in advance.

Repairability therefore remains non-equivalent to Recovery and Return.

## Witness-source membrane

Permitted source classes in this specification are independent receiver observation, system-generated execution receipt, append-only custody record, and post-state validation. `CUSTODIAN_NARRATION` is explicitly excluded from satisfying an independent witness requirement.

Every future episode begins `NOT_ACQUIRED`. `HELD` and `FAILED` episodes remain retained. `CANDIDATE` requires all declared witness families for the relevant lane and absence of a declared defeat condition. `CANDIDATE` still does not mean Return.

## Maximum earned result

`BOUNDED_INDEPENDENT_HANDOFF_RECOVERY_WITNESS_ACQUISITION_SPEC_SUPPORTED`

This means only that the bounded acquisition specification survived its preregistered hostile validation. It does not mean that any independent execution witness has been acquired or that either parent residual has been resolved.

## Validation lineage

### Preregistered RED

- head: `3bb06da4a0ddbc9ce39f7bf41fb21049feb756a8`
- run: `34932133102`
- meaning: the hostile gate existed before the spec, validator, receipt, and operation record.

### Implementation RED

- head: `e8ef62443a9c6b87196a68e445b772167b33b425`
- run: `34932417352`
- exact defect: the new validator requested parent field `empirical_exteriority_promotion_authority`, while the sealed #1143 receipt actually exposes `empirical_exteriority_authority`.
- interpretation: implementation binding error only; the preregistration was not altered and the parent authority ceiling was not widened.

### Scientific GREEN

- head: `5a866943b245092beb4376aa21b7e52f851f9831`
- run #3387 / `34935100382`
- conclusion: `success`
- A15-R0 research field: `success`

The repair changed only the validator's parent-field binding from the nonexistent promotion-authority name to the exact field exposed by the sealed parent receipt.

### Receipt-binding GREEN

- head: `e04f8be69dac33f8f4b6a77107c93a65d0cf23b1`
- run #3388 / `34935275560`
- conclusion: `success`
- A15-R0 research field: `success`

The receipt-bearing head preserved the scientific result and all claim ceilings under the same consolidated validation.

## Claim ceiling

`ACQUISITION_SPECIFICATION != WITNESS_ACQUISITION`

`SPEC_COMPLETE != EPISODE_OBSERVED`

`GENERIC_REVOCATION != RIGHT_OF_RESIGNATION`

`REPAIR_PATH != RECOVERY != RETURN`

`CANDIDATE != RETURN`

`INDEPENDENT_MACHINE_VALIDATION != INDEPENDENT_HUMAN_EXECUTION`

`GREEN != RIGHT_OF_RESIGNATION`

`GREEN != RECOVERY`

`GREEN != CUSTODIAN_INDEPENDENT_RETURN`

`GREEN != EMPIRICAL_EXTERIORITY`

## Current state before seal validation

Scientific GREEN and receipt-binding GREEN are earned. This commit records that lineage and therefore still requires its own exact-head consolidated GREEN before it may be treated as the sealed chamber head.

Still retained:

- witness acquired: `false`
- Right of Resignation: `OPEN`
- Safe Return / Recovery: `NON_EQUIVALENT`
- human replication promoted: `false`
- Return promoted: `false`
- empirical exteriority promoted: `false`

No merge. No deployment. No Vercel mutation. No mark-ready transition. No production mutation.

## Lawful successor after seal validation

`ACQUIRE_INDEPENDENT_EXECUTION_WITNESSES_UNDER_THIS_SPEC_BEFORE_ANY_RIGHT_OF_RESIGNATION_RECOVERY_OR_RETURN_PROMOTION`

The specification may now govern a later acquisition episode. The present chamber itself has acquired no such witness.

Marked ⟐
