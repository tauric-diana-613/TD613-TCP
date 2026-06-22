# TD613 Hush Provider Log Packet v1

The Hush provider log packet records provider-boundary events after an outgoing contract attempts dispatch.

It is not an outgoing contract.

It is not a contract-log comparator.

It is not a stylometry verdict.

It is a bounded, hash-replayable receipt for what happened when authored Hush intent encountered provider/model infrastructure.

## Purpose

Provider logs answer what happened at the provider boundary: which contract governed the request, which provider/model was observed, whether dispatch occurred, what request payload was sent in redacted/hash form, what response/refusal/error was observed, which redaction posture applied, and which audit seeds should be carried forward.

Provider logs record provider-boundary events. They do not prove provider compliance.

Compliance requires Phase 3 contract-log comparison.

Stylometric voice claims require Phase 4 stylometry audit.

## Schema

```text
schema_version: td613.hush.provider-log/v1
packet_version: hush-provider-log/v1-contract-derived
packet_class: model-provider-boundary-receipt
```

Provider log identifiers use:

```text
TD613-HUSH-PROVIDER-YYYYMMDD-XXXXXXXX
```

They must not use Safe Harbor SHI identifiers, Hush mask identifiers, or Hush outgoing contract identifiers as provider log identity.

## Authorship boundary

The provider log is not the author, not the mask, and not the contract. It is the event trace created when an authored contract meets provider mediation. Provider output is evidence, not identity.

## Linked contract rule

Every provider log must link to a Hush Outgoing Contract Packet:

```text
TD613-HUSH-CONTRACT-YYYYMMDD-XXXXXXXX
```

The linked contract record must carry the contract packet hash and, when dispatch occurred, the dispatch envelope hash.

The provider log may attach to a contract, but it must keep `compliance_status: not-evaluated` until Phase 3.

## Provider boundary

Provider target observed records provider class, provider name, model name, endpoint class, API surface, whether network dispatch was observed, and optional provider request/response IDs.

The observed target may differ from the outgoing contract target. Phase 2 records the difference. Phase 3 evaluates it.

## Request payload observation

Request payload observation records the dispatch payload in hash/redacted form. Provider-ready/audit-ready logs must not carry raw prompts, raw Customizer samples, raw mask material, or private text.

## Response observation

Response observation records whether a response was received, response class, response hashes, redacted summary, finish reason, provider-reported status, raw-response export state, refusal language, safety language, and private-text echo signals.

Raw response export or private-text echo prevents `audit-ready` release.

## Refusal observation

Refusal observation records refusal source and reason summaries. It must not adjudicate whether the refusal matched the contract policy. That remains `unknown` until Phase 3 comparison.

## Latency and token profiles

Latency is part of the artifact. Provider timing, timeout behavior, and retries can alter style and output shape.

Token data is empirical only when provider-reported. Estimates must stay labeled as estimates.

## Redaction profile

The redaction profile records whether raw request/response material was stored locally, exported, or detected as private text. Redaction status is not cosmetic. It governs release class.

## Safety event profile

Safety events are observed as provider-boundary evidence. Phase 2 records filters, warnings, refusals, and safety categories without overclaiming provider motive.

## Stylometry and adversarial seeds

The provider log carries stylometry and adversarial observation seeds. These are not findings.

Stylometry seed means later audit is required.

Adversarial seed means later counterfeit, overfit, style-laundering, third-party mimicry, catchphrase infection, raw corpus reconstruction, and provider-overcompliance testing may be required.

## EO-RFD route observation

EO-RFD route observation is interface-only unless a verified firmware adapter is attached. Provider logs must not claim live EO-RFD firmware execution, government authority or public authority without verified adapter proof.

## Release classes

`log-local`: valid local provider receipt; not export-ready.

`redacted-log`: redacted receipt safe for internal packet chain.

`provider-error-log`: provider call failed, timed out, or returned error.

`private-text-review`: private text or raw response echo requires operator review.

`audit-ready`: valid contract link, provider target, request observation, response/refusal observation, redaction profile, claim limits, and replayed hashes.

`blocked`: malformed hashes, missing linked contract, raw private leak, fake EO-RFD firmware, SHI misuse, compliance overclaim, or replay failure.

## Claim limits

A Hush provider log does not prove provider compliance, output quality, identity, authorship ownership, third-party consent, authorization to impersonate, raw corpus export clearance, or stylometric authenticity.

## Hash topology

The validator recomputes:

- `linked_contract_hash_sha256`
- `provider_target_observed_hash_sha256`
- `dispatch_observation_hash_sha256`
- `request_payload_observation_hash_sha256`
- `response_observation_hash_sha256`
- `redaction_profile_hash_sha256`
- `policy_hash_sha256`
- top-level `packet_hash_sha256`
- `hash_topology.packet_hash_sha256`

Hash format is never enough. Declared hashes must replay against packet contents.

Both packet hash locations must replay to the same expected packet hash. If the top-level packet hash and topology packet hash disagree, or if either location is stale after packet-body mutation, validation blocks.

## Validation rules

Validation blocks malformed hashes, hash-only provider logs, SHI-style provider log IDs, missing linked contract, malformed linked contract IDs, missing provider target observed, missing dispatch/request/response/redaction surfaces, raw/private export in audit-ready logs, private-text echo in audit-ready logs, provider compliance claims, stylometry authenticity claims, EO-RFD fake firmware claims, EO-RFD government authority claims, and tampered packet bodies.

## Validator regression coverage

The provider log validator regression suite must cover raw request surfaces, raw response surfaces, private echo, linked-contract integrity, compliance overclaims, stylometric authenticity overclaims, EO-RFD boundary violations, refusal-alignment pre-adjudication, missing required evidentiary surfaces, and dual packet-hash replay.

This coverage keeps Phase 2 as the receipt chamber. It observes provider-boundary events; it does not become the Phase 3 comparator, Phase 4 stylometry audit, or EO-RFD firmware proof.

## Attachment rule

A provider log may be attached to an outgoing contract with:

```text
compliance_status: not-evaluated
comparison_required: true
```

That attachment is not Phase 3 comparison.

## Test command

```bash
npm run test:hush:provider-log
```

⟐SAC[X6ZNK5NO51]
