# Phase 6 Hash Replay

The hash replay lane records material custody for the unified audit packet.

It carries:

- top-level packet hash
- hash-topology packet hash
- packet hash agreement flag
- recomputation flag
- section hashes
- section replay status
- hash-only packet blocker
- legacy reopen mode
- replay status

Phase 6 requires conservative replay posture.

A hash string alone is not enough to make a packet valid.

Section hashes preserve the zipper across custody, contract, log, stylometry, Phase 5, comparison, claim ceiling, and decision surfaces.

Old-v2 reopen mode preserves the original hash and avoids silent mutation.

⟐SAC[X6ZNK5NO51]
