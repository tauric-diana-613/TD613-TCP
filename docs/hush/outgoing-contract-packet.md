# TD613 Hush Outgoing Contract Packet v1

The Hush outgoing contract packet records authored model/provider intent before dispatch.

It is not a provider log.

It is not a response audit.

It is not a Hush Customizer corpus packet.

It is a bounded, hash-replayable request envelope that preserves the difference between authored intent, provider execution, provider refusal, and post-generation interpretation.

## Purpose

The contract answers what Hush intended to ask a model/provider to do before the request left the local system. It records provider target, mask context, Customizer packet reference, instruction contract, stylometry constraints, adversarial constraints, EO-RFD interface state, private-text policy, refusal policy, claim limits, release discipline, and hash topology.

Outgoing contracts record intended model/provider behavior. They do not prove provider compliance.

## Schema

```text
schema_version: td613.hush.outgoing-contract/v1
packet_version: hush-outgoing-contract/v1-safe-harbor-derived
packet_class: model-behavior-request-envelope
```

Contract identifiers use:

```text
TD613-HUSH-CONTRACT-YYYYMMDD-XXXXXXXX
```

They must not use Safe Harbor SHI identifiers.

## Authorship boundary

The authorial object is the bounded request structure, not the generated provider output. A provider may obey, drift, refuse, flatten, overfit, or leak. Phase 1 seals the before-object so later phases can compare what happened against what was requested.

## Provider boundary

Provider target records provider class, provider name, model name, endpoint class, and whether network dispatch is expected. Provider-ready contracts require concrete provider and endpoint classes. Draft or local contracts may remain abstract.

## Private text policy

Provider-ready contracts must not carry raw Customizer sample text, raw mask material, or unlabeled private text. Raw prompt export or private payload conditions move the contract to operator review or blocked status.

## Stylometry constraints

Stylometry constraints are measurement boundaries. They can guide the provider request and later response audit. They are not identity proof, authorship ownership proof, consent proof, or legal recognition.

## Adversarial constraints

Adversarial constraints record whether later response audit should check overfit, style laundering, third-party mimicry, catchphrase infection, and raw corpus reconstruction. Phase 1 records the audit requirement; it does not adjudicate the response.

## EO-RFD interface note

EO-RFD route state is interface-only unless a verified firmware adapter is attached. A contract must not claim live EO-RFD firmware execution, legal authority, executive-order authority, or public law authority without verified adapter proof.

## Release classes

`draft-contract`: incomplete; no dispatch.

`local-contract`: valid local packet; not provider-ready.

`provider-ready`: valid provider target, mask context, refusal policy, private-text policy, hashes, and claim limits.

`operator-review`: private text or ambiguous mask/provider conditions require review.

`blocked`: SHI misuse, missing refusal policy, raw corpus leak, invalid hashes, authority overclaim, fake EO-RFD firmware, or replay failure.

## Hash topology

The validator recomputes:

- `request_context_hash_sha256`
- `provider_target_hash_sha256`
- `mask_context_hash_sha256`
- `instruction_contract_hash_sha256`
- `policy_hash_sha256`
- `packet_hash_sha256`

Hash format is never enough. Declared hashes must replay against packet contents.

## Restore/replay validation

Validation blocks malformed hashes, hash-only contracts, SHI-style contract ids, SHI-style mask ids, missing provider-ready surfaces, missing refusal policy, missing private text policy, raw Customizer samples in provider-ready contracts, authority overclaims, EO-RFD firmware claims without adapter proof, and tampered packet bodies.

## Dispatch envelope

The provider dispatch envelope is not the same as the contract packet. The contract is the sealed intent object. The dispatch envelope is the provider-facing payload summary.

Dispatch envelopes preserve claim limits, refusal policy, discourse mode, retrieval trigger, and contract hash. They do not include raw samples, raw mask material, or raw prompt text.

## Claim limits

A Hush outgoing contract does not prove identity, authorship ownership, third-party consent, authorization to impersonate, public/legal/civil recognition, raw corpus export clearance, or provider compliance.

## Test command

```bash
npm run test:hush:outgoing-contract
```

⟐SAC[X6ZNK5NO51]
