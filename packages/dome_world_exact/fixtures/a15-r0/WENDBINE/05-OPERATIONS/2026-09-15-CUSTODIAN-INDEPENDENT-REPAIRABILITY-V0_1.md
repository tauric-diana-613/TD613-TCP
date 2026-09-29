# Custodian-independent artifact-only repairability assay v0.1 — implementation operation

## Scope

This operation implements the preregistered successor chamber to the sealed Aperture translation audit in PR #1140. It does not reopen or strengthen #1140.

The bounded question is whether a machine receiver can use only the supplied portable Loom packet and frozen public/source-bound bridge artifacts to localize the preregistered finite defect family and return a non-executing repair proposal without custodian narration, private Wendbine state, identity binding, external search, or continuing custodian authority.

The operation deliberately reuses the existing Loom receiver substrate:

`inspectPortableLoomReceiverAssurance`

rather than manufacturing a second destination-verification rule.

## Finite family

The implementation admits exactly these six preregistered cases:

- `CLEAN_CONTROL` → `NO_REPAIR_REQUIRED` / `NONE`
- `SOURCE_BINDING_DRIFT` → `PROVENANCE_BINDING_MISMATCH` / `RESTORE_BOUND_PUBLIC_SOURCE_REFERENCE`
- `AUTHORITY_PROMOTION` → `DISPLAY_AUTHORITY_PROMOTION` / `RESTORE_DISPLAY_ONLY_NON_AUTHORITY`
- `RELATION_CLASS_INFLATION` → `UNEARNED_EXACT_PROMOTION` / `RESTORE_PREREGISTERED_RELATION_CLASS`
- `REPAIR_RECOVERY_COLLAPSE` → `REPAIR_RECOVERY_RETURN_COLLAPSE` / `RESTORE_REPAIR_RECOVERY_RETURN_SEPARATION`
- `DESTINATION_ENFORCEMENT_PROMOTION` → `PORTABLE_RECEIVER_ASSURANCE_REJECTED` / `RESTORE_DESTINATION_ENFORCEMENT_UNVERIFIED`

Each hostile case is seeded by mutating the relevant artifact surface. The evaluator then diagnoses the mutated artifact state; it does not accept a caller-supplied diagnosis or execute the proposed repair.

## Artifact-only membrane

Allowed surfaces remain:

`PORTABLE_LOOM_PACKET + FROZEN_BRIDGE_MAP + APERTURE_AUDIT_RECEIPT + WENDBINE_PUBLIC_SOURCE_BINDINGS + STICKER_DISPLAY_TAXONOMY`

The implementation rejects the declared forbidden inputs before diagnosis:

`CUSTODIAN_NARRATION`

`PRIVATE_WENDBINE_STATE`

`PERSON_IDENTITY_BINDING`

`OPERATOR_IDENTITY_BINDING`

`UNBOUNDED_EXTERNAL_SEARCH`

`CONTINUING_CUSTODIAN_AUTHORITY`

The output always records:

`repair_executed = false`

`authority_transferred = false`

`custodian_narration_used = false`

`private_state_used = false`

`external_host_enforced = false`

## Provenance and receiver checks

Source-binding drift is localized by comparing every bridge source reference against the supplied frozen public registries. Sticker authority promotion is localized on the display taxonomy rather than inferred from a person identity. Exact-relation inflation remains invalid without an operator-identity witness. Safe Return/Recovery retains its `NON_EQUIVALENT / HELD_REPAIR_PATH_IS_NOT_RECOVERY` state. Right of Resignation remains `OPEN / HELD_NOT_EXPOSED_IN_PORTABLE_PACKET`.

Destination-enforcement promotion is not adjudicated from the repairability engine itself. The seeded packet is passed through `inspectPortableLoomReceiverAssurance`; a changed portability assurance is held by the existing independent receiver recomputation path.

## Scientific posture before validation

This commit is an implementation attempt, not a GREEN declaration. The receipt remains `IMPLEMENTED_AWAITING_EXACT_HEAD_VALIDATION` until the exact implementation head passes the consolidated contract.

Maximum possible result after validation:

`BOUNDED_ARTIFACT_ONLY_REPAIRABILITY_SUPPORTED`

Even a GREEN means only that this frozen six-case artifact family is correctly localized under the declared input membrane. It does not establish independent human replication, measured reduction in human narration burden, Right of Resignation, custodian-independent Return, external host enforcement, empirical exteriority, or universal repairability.

`REPAIR_PROPOSAL != REPAIR_EXECUTION`

`REPAIR_PATH != RECOVERY != RETURN`

No merge, deployment, Vercel mutation, Dome-World tomography authority, private-corpus intake, or Return claim follows from this operation.

Marked ⟐
