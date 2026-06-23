# Phase 8 Anti-Slop Standard

The anti-slop audit treats model output as candidate material.

It can flag:

- `api_sheen`
- `over_polished`
- `generic_helper_voice`
- `symmetry_pressure_high`
- `source_pressure_low`
- `mask_breath_low`
- `sample_seed_reuse_risk`
- `factual_damage_risk`
- `transition_blandness`
- `too_perfect_punctuation`

The audit stores hashes, flags, scores, and repair notes.

It does not store raw candidate text inside the packet.

Candidate output can be rejected, repaired, or routed for review.

It cannot become mask truth by sounding pleasant.

⟐SAC[X6ZNK5NO51]
