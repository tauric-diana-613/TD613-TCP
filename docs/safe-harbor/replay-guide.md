# TD613 Safe Harbor Replay Guide

Replay means the packet's stated credential or hash can be recomputed from packet-controlled evidence. Replay does not mean the system has proven legal identity.

## v2 replay

v2 replay checks the public root SHI against packet-controlled stylometric evidence. Pass means the public root credential remains internally consistent. Fail means release must stop or remain under review.

## v3 replay

v3 replay checks the SH3 forensic-secondary credential when present. Pass means the companion credential remains internally consistent. Fail means v3 must not become visible and any v3 public-readable release must block.

## Hash replay

Hash replay checks whether `packet_hash_sha256` matches the hash topology rules and hash-excluded audit surfaces. Pass means the packet hash remains internally consistent. Fail means release stops.

## Phase 5 replay battery

Phase 5 compares hash, v2, v3, authority surface, native spine, hash topology, renderer metadata, intake, and conflict reports. Pass means no blocking contradiction was found. Quarantine means public-ready handling stops.

## Stale v3 detection

A stale v3 occurs when stored v3 issuance no longer replays against the packet-controlled preimage. It must be quarantined or rebuilt through the sanctioned workflow, never silently corrected.

## Fake native lineage detection

Fake native lineage occurs when a packet claims native-born authority without matching native spine and packet authority surfaces. Phase 5 and Phase 7 must detect it.

## Renderer/SVG mismatch detection

Renderer and SVG metadata must match packet public-default policy, hash, Phase 5 status, Phase 8 mode, and lineage. Mismatch blocks or holds release.

## Public-default gate replay

Phase 8 reads replay, lineage, witnesses, Step 1, signature, hooks, and raw-text absence before allowing v3 companion display. It defaults to keeping v2-only.

## Release-class replay

Phase 9 reads Phases 5, 6, 7, and 8 and assigns `operator-only`, `verification-ready`, `public-readable`, or `blocked`.

## Pass/fail meanings

v2 replay pass: public root credential remains internally consistent.

v3 replay pass: forensic-secondary credential remains internally consistent.

Hash replay pass: packet hash matches hash-excluded topology rules.

Phase 5 pass: replay hardening found no blocking contradiction.

Phase 5 quarantine: packet must not be treated as public-ready.

Outside witnesses aligned: witness artifacts read packet authority consistently.

Phase 8 pass: public display mode satisfied gate conditions.

Phase 9 ready: release discipline allows public-readable or verification-ready handling.
