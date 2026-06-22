# TD613 Hush Provider Contract Inventory

Phase 0 inventory for the provider-contract and provider-log event chain.

This document defines the seam that Phase 1 must govern. It does not implement provider dispatch, provider logs, or audits.

## Why this inventory exists

Hush Customizer Packet v1 governs corpus formation.

The next ungoverned hallway is provider dispatch: the moment Hush converts a mask/corpus/routing state into a request intended for a model or provider.

That hallway needs an outgoing contract packet before it needs provider logs.

## Current status

As of Phase 0:

- No canonical `td613.hush.outgoing-contract/v1` implementation is present.
- No canonical `td613.hush.provider-log/v1` implementation is present.
- No unified contract-log comparator is present.
- Customizer packets exist and should be referenced, not embedded with raw samples.

## Phase 1 target packet

Canonical schema to implement next:

```text
td613.hush.outgoing-contract/v1
```

Canonical identifier family:

```text
TD613-HUSH-CONTRACT-YYYYMMDD-XXXXXXXX
```

Claim:

```text
A Hush Outgoing Contract Packet records intended model/provider behavior before dispatch. It does not prove provider compliance.
```

## Candidate outgoing contract seams

Candidate surfaces requiring deeper Phase 1 review:

- Hush prompt assembly surfaces
- Hush provider or API adapter surfaces
- Hush fallback surfaces
- Hush Customizer-to-generation bridge surfaces
- Hush Mask Studio generation surfaces
- Hush recovered output / review candidate bridge surfaces
- Hush Aperture intake bridge surfaces

Repo-visible candidates include:

- `app/hush.html`
- `app/hush.js`
- `app/hush-phase31-1-original.js`
- `app/hush-pr123-strict-undefined-fallback.js`
- `app/hush-patch38.js`
- `app/hush-pr110-recovered-output-rehydrator.js`
- `app/hush-pr111-review-candidate-bridge.js`
- `app/hush-pr98-aperture-intake.js`

These are inventory candidates, not final classifications.

## Outgoing contract required fields

Phase 1 contract packet should require:

```text
schema_version
packet_version
packet_class
contract_packet_id
created_at
request_context
provider_target
mask_context
instruction_contract
stylometry_constraints or explicit absent warning
adversarial_constraints or explicit absent warning
eo_rfd_route_state
private_text_policy
refusal_policy
claim_limits
release_discipline
hash_topology
packet_hash_sha256
```

## Provider target boundary

Provider target should be explicit before provider-ready dispatch:

```text
provider_class
provider_name
model_name
endpoint_class
network_dispatch_expected
```

Draft/local contracts may carry abstract provider target data. Provider-ready contracts need specificity.

## Mask context boundary

Mask context should include:

```text
mask_source
mask_id
mask_packet_id when available
customizer_packet_id when derived from Customizer
customizer_packet_hash_sha256 when available
discourse_mode
retrieval_trigger
raw_mask_material_exported
```

Do not use SHI as mask identity.

## Private text boundary

Provider-ready contracts must block:

- raw Customizer samples
- raw mask corpus
- unlabeled private text
- raw prompt bodies marked redacted
- third-party voice material without authorization boundary

Operator-private contract state may exist, but it must be explicit and non-provider-ready unless operator confirmation is recorded.

## Authorship boundary

The outgoing contract records authored intent.

Provider output is a later event.

Provider compliance is never proven by the outgoing contract alone.

The chain must remain:

```text
outgoing contract -> provider log -> contract/log comparison -> stylometry/adversarial audit -> release decision
```

## Stylometry boundary

The outgoing contract may carry stylometry constraints, target profile references, allowed distance bands, catchphrase/overfit controls, and adversarial-audit requirements.

It should not silently run or rewrite through stylometry.

Stylometry becomes empirical audit evidence after provider output exists.

## EO-RFD boundary

The outgoing contract may carry EO-RFD route state as interface-only:

```text
firmware_status: interface-only
route_conscience_hook
provider_contract_hook
stylometry_drift_hook
refusal_reason_hook
```

Do not claim firmware-attached unless a verified adapter exists.

Do not treat EO-RFD as government authority.

## Provider log phase boundary

Provider logs are Phase 2, not Phase 1.

Phase 1 may define fields that Phase 2 will compare against, but it should not implement:

- provider response packetization
- provider response drift scoring
- contract compliance classification
- token/latency receipts
- provider refusal audit

## Phase 1 stop conditions

Stop Phase 1 if the implementation:

- uses SHI as `contract_packet_id`
- treats prompt text as the whole contract
- omits refusal policy
- omits private text policy
- omits claim limits
- permits raw Customizer samples in provider-ready class
- claims provider compliance before a provider log exists
- claims EO-RFD firmware execution without an adapter
- lets hash format substitute for hash replay
- allows hash-only contracts

## Suggested Phase 1 implementation files

```text
app/engine/hush-outgoing-contract-packet.js
app/engine/hush-outgoing-contract-validator.js
docs/hush/outgoing-contract-packet.md
tests/hush-outgoing-contract-packet.test.mjs
tests/hush-outgoing-contract-validator.test.mjs
```

## Suggested Phase 1 test command

```bash
npm run test:hush:outgoing-contract
```

## Phase 0 conclusion

The provider-contract seam is currently unpacketized. Phase 1 should create a sealed, redacted, hash-replayable outgoing contract packet before Hush adds provider logs, provider audits, Mask Studio packets, or UI dispatch buttons.

Filed with ⟐SAC[X6ZNK5NO51]
