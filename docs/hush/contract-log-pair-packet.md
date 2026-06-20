# TD613 Hush Contract-Log Pair Packet v1

The Hush Contract-Log Pair Packet compares an outgoing authored contract against a provider-boundary log.

It is not an outgoing contract.

It is not a provider log.

It is not a stylometry verdict.

It is not an adversarial verdict.

It is a sealed, hash-replayable relational evidence object: the first trial after authored intent meets provider weather.

## Purpose

Contract-Log Pair Packets compare authored contract surfaces against provider-boundary evidence. They determine whether the provider event materially honored, altered, ignored, refused, leaked, flattened, rerouted, or exceeded the sealed Hush outgoing contract surfaces.

They do not prove identity, authorship ownership, output quality, stylometric authenticity, or provider intent.

Stylometry claims require Phase 4 audit.

Adversarial counterfeit claims require later adversarial audit.

## Schema

```text
schema_version: td613.hush.contract-log-pair/v1
packet_version: hush-contract-log-pair/v1-provider-boundary-comparison
packet_class: contract-provider-event-comparison
```

Pair identifiers use:

```text
TD613-HUSH-PAIR-YYYYMMDD-XXXXXXXX
```

They must not use Safe Harbor SHI identifiers, Customizer packet identifiers, mask identifiers, provider request IDs, or provider response IDs.

## Authorship boundary

The pair packet compares the authored before-object against the provider event-object. It does not create authorship and does not authenticate identity. Fluent provider output remains evidence, not proof of obedience.

## Linked contract

A pair links one Hush Outgoing Contract Packet:

```text
TD613-HUSH-CONTRACT-YYYYMMDD-XXXXXXXX
```

The link carries the contract hash, schema version, release class, and validation status.

## Linked provider log

A pair links one Hush Provider Log Packet:

```text
TD613-HUSH-PROVIDER-YYYYMMDD-XXXXXXXX
```

The link carries the provider log hash, schema version, release class, and validation status.

## Contract snapshot

The contract snapshot contains comparable contract surfaces only: provider target, mask context, instruction summary fields, private-text policy, refusal policy, claim limits, release discipline, stylometry constraints, adversarial constraints, and EO-RFD route state.

No raw prompt text, raw Customizer sample text, or raw mask corpus belongs in the snapshot.

## Provider log snapshot

The provider log snapshot contains comparable provider-boundary surfaces: provider target observed, dispatch observation, request payload observation, response/refusal observation, redaction profile, safety profile, stylometry/adversarial seeds, EO-RFD route observation, release discipline, and claim limits.

No raw response text, raw request text, provider-internal speculation, or private corpus belongs in the snapshot.

## Provider target comparison

Compares expected provider class, model, and endpoint against observed provider class, model, and endpoint. Drift routes review. Drift is not automatically proof of violation.

## Dispatch comparison

Compares contract dispatch permission against observed dispatch. Unauthorized dispatch is breach-level.

## Payload comparison

Checks whether claim limits, refusal policy, discourse mode, and retrieval trigger reached the provider-facing payload.

## Privacy comparison

Compares contract privacy policy against request/response/redaction observations. Raw prompt, raw corpus, and private echo breaches are serious release blockers.

## Refusal comparison

Routes provider refusal evidence for review. It does not infer provider motive and does not overread hidden policy logic.

## Safety comparison

Records provider safety/filter/warning events as observable facts. It does not perform a provider policy seance.

## Release comparison

Compares contract release class and provider-log release class as an aggregate gate for audit routing.

## Stylometry routing

Phase 3 may route to stylometry audit. It does not decide voice authenticity, mask aliveness, or output quality.

## Adversarial routing

Phase 3 may route to adversarial audit. It does not decide counterfeit, overfit, style laundering, or third-party mimicry verdicts.

## EO-RFD route comparison

EO-RFD route comparison remains route-conscience comparison only. It is not firmware proof, legal authority, executive-order authority, or public-law authority.

## Comparison result

Allowed aggregate statuses:

- `aligned`
- `review-required`
- `drift-detected`
- `breach-detected`
- `blocked`
- `not-comparable`

The result may route later audits. It may not claim voice authenticity, output quality proof, provider intent proof, legal identity, civil identity, or authorship ownership.

## Claim limits

A Hush Contract-Log Pair Packet does not prove identity, authorship ownership, third-party consent, impersonation authorization, output quality, stylometric authenticity, provider intent, raw corpus export clearance, or final audit completion.

## Release discipline

Release classes:

- `pair-local`
- `pair-review`
- `audit-route-ready`
- `breach-review`
- `blocked`

## Hash topology

The validator recomputes:

- `linked_contract_hash_sha256`
- `linked_provider_log_hash_sha256`
- `contract_snapshot_hash_sha256`
- `provider_log_snapshot_hash_sha256`
- `comparison_surfaces_hash_sha256`
- `comparison_result_hash_sha256`
- `policy_hash_sha256`
- top-level `packet_hash_sha256`
- `hash_topology.packet_hash_sha256`

Hash format is never enough. Declared hashes must replay against pair packet contents.

Both packet hash locations must replay to the same expected packet hash.

## Validation rules

Validation blocks missing schema or pair ID, malformed pair ID, SHI-style pair ID, missing links, malformed linked IDs, missing hashes, missing snapshots, missing comparison result, missing claim limits, missing release discipline, malformed hashes, hash-only pairs, hash replay mismatch, top-level/topology disagreement, raw prompt/response/sample/mask material in snapshots, final proof claims, and EO-RFD firmware proof overclaims.

## Test command

```bash
npm run test:hush:contract-log-pair
```

⟐SAC[X6ZNK5NO51]
