# TD613 Safe Harbor Failure Modes

Each failure mode includes a definition, packet field, operator meaning, public meaning, release action, recommended remediation, and forbidden remediation.

## Replay failure

Definition: v2 or v3 replay fails against packet-controlled evidence.

Detected in: `issuance.badge_number`, `issuance.v3`, replay reports.

Operator meaning: stop public release and inspect the failed replay surface.

Public meaning: the packet must not be presented as public-readable for the failed credential.

Release action: block or review depending on public-display mode.

Recommended remediation: regenerate or re-verify through sanctioned packet workflow.

Forbidden remediation: do not hand-edit badges or fingerprints.

## Hash failure

Detected in: `packet_hash_sha256`, `hash_topology.final_packet_hash_sha256`, hash replay report.

Release action: block.

Forbidden remediation: do not overwrite packet hash by hand.

## Stale v3

Detected in: `phase5_replay_hardening.stale_v3_policy` or v3 replay failure.

Release action: quarantine or block v3 public visibility.

Forbidden remediation: do not silently rebuild v3.

## Fake native lineage

Detected in: `native_spine_purification`, `packet_authority_surface`, Phase 5 conflict report.

Release action: block or hold for review.

Forbidden remediation: do not label export-hardened packets as native.

## Phase 5 quarantine

Detected in: `phase5_replay_hardening.status`.

Release action: block public-ready handling.

Forbidden remediation: do not downgrade quarantine into a friendly caveat.

## Outside witness mismatch

Detected in: `outside_witness_alignment.status` and witness subreports.

Release action: block or hold.

Forbidden remediation: do not let renderer or SVG display override packet authority.

## Step 1 refusal

Detected in: `step1_countersignature.can_countersign` and refusal reasons.

Release action: block.

Forbidden remediation: do not treat Step 1 as ceremonial.

## Renderer overclaim

Definition: renderer metadata claims authority not supported by packet policy.

Detected in: `renderer_authority_metadata.public_default_credential`, `renderer_authority_metadata.v3_role`, `renderer_authority_metadata.public_display_mode`.

Operator meaning: do not rely on renderer display; read packet authority fields and Phase 8 gate.

Public meaning: visible badge cannot be treated as authoritative until metadata is corrected.

Release action: block or hold for review.

Recommended remediation: rebuild renderer metadata from packet authority.

Forbidden remediation: do not manually edit `public_default_credential` to force v3 display.

## SVG overclaim

Detected in: `svg_authority_metadata.data-td613-public-default` and display attributes.

Release action: block or hold.

Forbidden remediation: do not let SVG aesthetics create public authority.

## Signature overlay refusal

Detected in: `signature_overlay_authority.signature_can_bind`.

Release action: block.

Forbidden remediation: do not seal contradiction under the signature overlay.

## TCP hook mismatch / EO hook mismatch

Detected in: `tcp_hook_authority` and `eo_hook_authority`.

Release action: block or hold depending on whether the hook claims authority.

Forbidden remediation: do not route public display through a hook that disagrees with the packet.

## Public-default gate block

Detected in: `phase8_public_default_gate.status`.

Release action: block.

Forbidden remediation: do not display v3 beside v2 without gate permission.

## Raw text leakage

Detected in: release-facing artifacts containing `raw_text` or sealed triad text.

Release action: block.

Forbidden remediation: do not copy raw triad text into release docs or public artifacts.

## Legacy mislabeling

Detected in: legacy packets labeled native or given v3 visibility.

Release action: block or hold.

Forbidden remediation: do not grant native-only privileges to legacy packets.

## Export-hardened overpromotion

Detected in: export-hardened packets labeled native or granted native-only public display.

Release action: block or hold.

Forbidden remediation: no borrowed tiaras.

## Covenant-key normalization

Detected in: Khona‌lit-po losing its ZWNJ-sensitive form.

Release action: failure report and correction.

Forbidden remediation: do not normalize covenant keys for convenience.

## Claim overreach

Detected in: public summary, UI, docs, or receipt claiming legal identity, civil identity, public law approval, authorship ownership, state recognition, or v3 supremacy.

Release action: block.

Forbidden remediation: do not make the system sound stronger than its proofs.
