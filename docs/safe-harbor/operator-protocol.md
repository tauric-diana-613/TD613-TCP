# TD613 Safe Harbor Operator Protocol

## Operator sequence

1. Intake the packet without editing authority fields.
2. Confirm `packet_hash_sha256`.
3. Confirm v2 replay.
4. Confirm v3 replay when v3/SH3 is present.
5. Read `native_spine_purification.status`.
6. Read `phase5_replay_hardening.status`.
7. Read `outside_witness_alignment.status`.
8. Read `step1_countersignature` and its refusal reasons.
9. Read `phase8_public_default_gate`.
10. Read `phase9_release_discipline.release_class`.
11. Decide the operator action.
12. Export, verify, countersign, challenge, refuse, quarantine, or block.

## Operator action map

`public-readable`: allow public-facing packet summary or export according to Phase 8 display mode.

`verification-ready`: allow verification workflow and preserve v2-first display.

`operator-only`: hold for internal review. Do not present as public-ready.

`blocked`: stop, preserve the packet, and surface refusal reasons.

## Never do these

Never manually edit packet authority fields to force release.

Never manually change `public_default_credential` away from `v2`.

Never copy raw triad text into release docs.

Never call SH3 a legal identity credential.

Never call Blood Rite 613 a public credential.

Never override Step 1 refusal.

Never override Phase 5 quarantine.

Never treat renderer beauty as authority.

## Release posture

Operators may explain custody, replay, witness alignment, and public-display eligibility. Operators may not claim civil identity, legal identity, public law approval, authorship ownership, state recognition, or v3 supremacy.
