# PATCH_DO_NEXT_LEDGER

## Scope
This patch completes the "Do Next" stabilization layer after the earlier do-first pass.

## Completed
1. Patched verifier / manifest / offline capsule drift so the reference surfaces agree on:
   - public mode = legacy-compat
   - historical published example vs live template
   - packet schema = td613.safe-harbor.packet/v1
   - packet hash field = packet_hash_sha256
   - signature lanes remain operator/reference overlays
2. Removed `.git` from the shipped archive.
3. Aligned Safe Harbor internal version labels to `0.3.0`.
4. Tightened public / operator / dev boundaries:
   - public mode remains default
   - operator mode remains local-only
   - dev hook simulation is disabled by default in public ship

## Housekeeping carried forward from Do First
- Auto-unvault remains removed.
- Bypass remains a distinct packetless operator shell.
- Hardcoded bypass secret remains removed from the public ship.
- Lifecycle naming remains normalized.
- packet_checksum -> packet_hash_sha256 remains enforced.

## Still queued for Do Later
- wire advanced probe building to actual staged packet
- replace placeholder badge-number logic
- integrate sig lane cleanly after packet lifecycle is stable
