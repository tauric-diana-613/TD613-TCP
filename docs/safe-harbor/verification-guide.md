# TD613 Safe Harbor Verification Guide

## How to verify a TD613 Safe Harbor packet

1. Confirm `packet_hash_sha256`.
2. Confirm `hash_topology.final_packet_hash_sha256`.
3. Confirm `issuance.badge_number`.
4. Confirm v2 replay status.
5. If present, confirm `issuance.badge_number_v3` and v3 replay status.
6. Read `phase5_replay_hardening.status`.
7. Read `native_spine_purification.status`.
8. Read `outside_witness_alignment.status`.
9. Read `phase8_public_default_gate.gate_decision`.
10. Read `phase9_release_discipline.release_class`.
11. Apply claim limits.

## What is the v2 credential?

The v2 SHI is the public root credential. It remains the default public credential even when Phase 8 permits v3 companion visibility.

## What is the v3/SH3 credential?

The v3/SH3 credential is a forensic-secondary or companion credential. It may be visible only when Phase 8 permits display. It does not replace SHI and does not prove civil or legal identity.

## Why does v2 remain the public root?

v2 maintains backward-compatible public recall. Phase 8 display modes may add v3 visibility beside v2, not above v2.

## Lineage terms

`native spine` means the packet was born through the native finalizer path.

`export-hardened` means export normalization strengthened an existing packet for public export without pretending native birth.

`legacy` means v2-valid packet behavior remains available without retroactive native labeling.

## Phase 5 pass/quarantine

Phase 5 pass means replay hardening found no blocking contradiction. Phase 5 quarantine means the packet must not be treated as public-ready.

## Outside witness alignment

Outside witnesses are Step 1, countersignatory intake, renderer, SVG, signature overlay, TCP hook, EO hook, and operator receipt. Alignment means those artifacts read the packet consistently; it does not create authority.

## Phase 8 public-display mode

Phase 8 may return `v2-only`, `v2-primary-v3-visible`, `dual-v2-v3`, or `blocked`. v3-only is not a Phase 8 mode.

## Phase 9 release class

`public-readable` permits public-facing summary according to Phase 8.

`verification-ready` permits verification workflow.

`operator-only` requires internal review.

`blocked` stops release.

## Public glossary

Safe Harbor: a TD613 custody and replay protocol.

SHI: the v2 public root credential.

SH3: the v3 forensic companion credential when present and gate-permitted.

Native spine: native finalizer lineage.

Export-hardened: truthful export normalization lineage.

Legacy packet: v2-valid packet without native relabeling.

Raw-text sealed: public verification uses hashes and statuses, not raw triad text.
