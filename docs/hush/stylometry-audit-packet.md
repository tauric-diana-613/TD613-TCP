# TD613 Hush Stylometry Audit Packet v1

The Hush Stylometry Audit Packet records cadence-alignment audit posture after a Contract-Log Pair Packet establishes the relation between authored intent and provider-boundary evidence.

It is not a mask-writing feature.

It is not a personality slider.

It is not identity proof.

It is a governed breath audit.

## Purpose

The packet measures whether provider output preserved, flattened, compressed, drifted from, or endangered the authored cadence envelope prepared by earlier Hush packets.

Phase 4 asks whether authored force survived provider pressure without becoming unsafe mimicry, private cadence exposure, or generic AI polish.

This foundation PR creates the packet and validator only. Runner execution, pair bridge wiring, and adversarial stylometry remain later Phase 4 slices.

## Schema

```text
schema_version: td613.hush.stylometry-audit/v1
packet_version: hush-stylometry-audit/v1-pair-derived
packet_class: cadence-alignment-audit
```

Audit identifiers use:

```text
TD613-HUSH-STYLO-YYYYMMDD-XXXXXXXX
```

They must not use Safe Harbor SHI identifiers.

## Authorship boundary

Authorship is not identity. Authorship is not ownership proof. Authorship is not merely style.

This packet treats stylometry as provenance-sensitive cadence governance, not a sound-alike detector. It evaluates transformation behavior under contract, pair, privacy, and release constraints.

## Linked pair

The audit links a Contract-Log Pair Packet:

```text
TD613-HUSH-PAIR-YYYYMMDD-XXXXXXXX
```

The link carries the pair hash, comparison result status, audit routes, and pair validation status. A blocked or invalid pair cannot become release-safe stylometry evidence.

## Linked contract and provider log

The audit carries linked contract and provider-log identifiers and hashes from the pair packet. These preserve the chain from authored intent to provider receipt to comparison relation.

## Linked Customizer / stylometry profile

The profile link records profile ID, profile hash, profile source, sample release class, and metric set version. The audit packet stores profile references and hashes, not raw sample text.

## Audit input profile

Allowed modes:

- `redacted-summary`
- `feature-vector`
- `local-private-raw`
- `response-hash-only`

`feature-vector` is preferred because it supports measurement without repeated raw-text exposure.

`local-private-raw` must not become public-release by default.

`response-hash-only` produces insufficient or low confidence because cadence cannot be measured from a hash alone.

## Metric profile

The initial metric profile includes:

- lexical texture
- sentence rhythm
- punctuation rhythm
- clause structure
- discourse markers
- transition logic
- compression ratio
- rhetorical pressure
- refusal structure
- register stability
- cadence variance

## Cadence alignment

Cadence alignment includes overall score, alignment band, confidence, metric scores, and interpretation.

Aligned does not mean identity.

Weak does not mean inauthentic person.

Unsafe does not mean bad writing.

Insufficient does not mean human failure.

## Pressure preservation

Pressure preservation records whether specificity, institutional memory, risk awareness, strategic refusal, and non-spectacularized force survived transformation.

This protects authored force from being polished into institutional obedience.

## Flattening detection

Flattening detection records generic polish, institutional neutralization, pressure loss, overbalanced syntax, and risk erasure as release-relevant signals.

Flattening is a safety issue, not merely aesthetic preference.

## Constraint preservation

Constraint preservation checks whether discourse mode, retrieval trigger, forbidden transformations, claim limits, and other contract-bound conditions remained visible in the audit posture.

## Risk profile

The risk profile records unsafe identifiability risk, overfit risk, private cadence exposure risk, public-release posture, and operator review need.

High alignment plus high identifiability can be dangerous.

## Release recommendation

Allowed release classes:

- `release-safe`
- `operator-review`
- `revise-before-release`
- `block-release`
- `insufficient-evidence`

Provider rewrite is allowed only when contract boundaries permit. Mask tuning must not happen automatically from one failed output.

## Claim limits

A Hush Stylometry Audit Packet does not prove identity, authorship ownership, third-party consent, impersonation authorization, legal authorship, civil identity, output quality, or whistleblower truth.

Stylometry is probabilistic.

Human review is required for high-stakes release.

## Hash topology

The validator recomputes:

- `linked_pair_hash_sha256`
- `linked_profile_hash_sha256`
- `audit_input_profile_hash_sha256`
- `metric_profile_hash_sha256`
- `cadence_alignment_hash_sha256`
- `pressure_preservation_hash_sha256`
- `flattening_detection_hash_sha256`
- `constraint_preservation_hash_sha256`
- `risk_profile_hash_sha256`
- `release_recommendation_hash_sha256`
- `policy_hash_sha256`
- top-level `packet_hash_sha256`
- `hash_topology.packet_hash_sha256`

Hash format is never enough. Declared hashes must replay.

## Validation rules

Validation blocks missing schema, missing audit ID, malformed audit ID, SHI-style audit ID, missing linked pair, malformed pair ID, missing pair hash, missing profile hash, missing audit input profile, missing metric profile, missing cadence alignment, missing pressure preservation, missing flattening detection, missing constraint preservation, missing risk profile, missing release recommendation, missing claim limits, malformed hashes, hash-only audit packets, hash replay mismatch, top-level/topology disagreement, raw text embedded in packet, identity/authorship/legal/output-quality/whistleblower-truth proof claims, public release under high identifiability risk, and public release under high overfit risk.

## Test command

```bash
npm run test:hush:stylometry-audit
```

⟐SAC[X6ZNK5NO51]
