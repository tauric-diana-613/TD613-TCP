# Ash Keep v1.0 Production Demonstration Receipt

## Status

```text
IMPLEMENTED_PRODUCTION_DEMONSTRATED
PRODUCTION_DEMONSTRATED
```

Ash Keep v1.0 has earned production-demonstrated status through a post-merge observation of the deployed public artifact, a separately preserved evidence bundle, a terminal commit-status receipt, and explicit operator closure.

Operator closure: `PRODUCTION_DEMONSTRATED`

## Observed deployment

- Deployed base URL: `https://td613.com`
- Deployed Ash Keep route: `https://td613.com/dome-world/ash-keep.html`
- Runtime commit SHA: `e04dbfa489a8ef69eb8c34dcd57e67fd7dda59d4`
- Upstream deployment workflow run ID: `29361125011`
- Deployed observer workflow run ID: `29361143077`
- Deployed observer workflow run attempt: `1`
- Deployed observer workflow run URL: `https://github.com/tauric-diana-613/TD613-TCP/actions/runs/29361143077`
- Browser: `chromium-headless`
- Source status: `DEPLOYED_OBSERVATION`
- Probe outcome: `PASS`

## Machine-readable closure index

```text
runtime commit SHA = e04dbfa489a8ef69eb8c34dcd57e67fd7dda59d4
upstream deployment workflow-run ID = 29361125011
deployed observer workflow-run ID = 29361143077
evidence artifact ID = 8322199692
evidence artifact SHA-256 = sha256:7860cd7304eef1fae94f6007962f6d2c0f9dc21ac41c607631e3d3bed5310bc7
desktop screenshot SHA-256 = sha256:a173528f7e7e1f6f49ba5c2028b6ab8d65d3cacd63e4aa781aa4ccbdca0af958
mobile portrait screenshot SHA-256 = sha256:e827b4e5f56ff90d789722e58c3a3493af28c7d4c3af625160615fecce048501
mobile landscape screenshot SHA-256 = sha256:f174195b184d48d032d374826f709242fae40a2ba3087c7fa9fd7d917232e996
promotion_authorized = false
```

## Commit-status evidence

- Observer status context: `Ash Keep Deployed Observation`
- Terminal observer status: `success`
- Terminal observer status ID: `50468299004`
- Terminal status description: `Ash Keep deployed observation passed; posture preserved`
- Terminal status created at: `2026-07-14T19:16:36Z`
- Terminal status target URL: `https://github.com/tauric-diana-613/TD613-TCP/actions/runs/29361143077`
- Terminal status-publication receipt SHA-256: `sha256:92eb304628d992d5c273d64f59484fadf7c2bdecf9288d4fccf24bc57392d8ed`
- Terminal status-publication receipt file SHA-256: `sha256:60e5ab21d43137290206e6086d4405a1bb35408251516cbaca171585eafeaa99`

The commit status is a navigational and outcome receipt. It remains separate from the production receipt, the evidence artifact, and operator closure.

## Evidence artifact

- Evidence artifact ID: `8322199692`
- Evidence artifact name: `ash-keep-deployed-observation-evidence`
- Evidence artifact SHA-256: `sha256:7860cd7304eef1fae94f6007962f6d2c0f9dc21ac41c607631e3d3bed5310bc7`
- Artifact created at: `2026-07-14T19:16:38Z`
- Artifact expiry recorded by GitHub: `2026-08-13T19:16:37Z`
- Evidence manifest file SHA-256: `sha256:81cb9b81e4b184cf8a06955592ebe88e7140989180934e3b5a5952cd94929245`

## Instrument and fixture evidence

- Canonical probe SHA-256: `sha256:f5ae02320c6982ab01b2ac8e87854f088100a5339e39fac7021a9f46dac48b02`
- Ephemeral runtime probe SHA-256: `sha256:df4373d50a09f51b3f2ab67d174ad0e04d103019bc9d45106b7dc11ab515346d`
- Selected excerpt SHA-256: `sha256:963843f1c90029a97db1b768fce1327b50fe0fb20c3927207279d81f26a3e223`
- Fixture manifest file SHA-256: `sha256:c7235551f1a3bc520d372ccd34c210d8813e2b4495765d97d6ab5f02fdd6ad2c`
- Fixture class: `SYNTHETIC_OPERATOR_SELECTED_EXCERPT`
- Canonical source mutated: `false`
- Runtime copy ephemeral: `true`
- Promotion authorized by fixture runner: `false`

Instrument source, operator-selected test material, and observation remained separate objects.

## Observer and posture evidence

- Deployment observer-context SHA-256: `sha256:5b8d7c6b7ed43160e857931eeda5f1a9dc35cc5d8ae72058d23252b9f42b1ead`
- Deployment observer-context file SHA-256: `sha256:8bf8ae0cca448b439851f25b7894209bdc3da97f3b2509be1b830420036ab65f`
- Release-posture verification SHA-256: `sha256:f3844db8606886c7c68ad814b7e17c649602191001eafbf366d83d415f7668ea`
- Release-posture verification file SHA-256: `sha256:165fa024fc460a7de408db6427bccf822e7d10172ce50af3d100420f1f350737`
- Observed predecessor posture: `IMPLEMENTATION_IN_PROGRESS / PREVIEW_PENDING`
- Predecessor posture preserved: `true`
- Transport observed: `false`
- Automatic Cinder observed: `false`
- Promotion authorized by observer: `false`
- Promotion authorized by status publisher: `false`
- Promotion authorized by posture verifier: `false`

The observer did not promote Ash Keep. This separate evidence-only commit performs operator closure after reviewing the preserved evidence.

## Production observation evidence

- Production observation JSON SHA-256: `sha256:7c0b5a26c2846710a6fe04927dd0246ff3d1c10b7090f7a13cbc9d6376078cea`
- Desktop screenshot SHA-256: `sha256:a173528f7e7e1f6f49ba5c2028b6ab8d65d3cacd63e4aa781aa4ccbdca0af958`
- Mobile portrait screenshot SHA-256: `sha256:e827b4e5f56ff90d789722e58c3a3493af28c7d4c3af625160615fecce048501`
- Mobile landscape screenshot SHA-256: `sha256:f174195b184d48d032d374826f709242fae40a2ba3087c7fa9fd7d917232e996`
- Capsule SHA-256: `sha256:27061cca1b905f81aff7f366078163e1c25ad63fe697f1ed45c640c39ca1bfc2`
- Tampered capsule SHA-256: `sha256:b78852d814d6f5aea1b6be84f3fbce1c89a1199a74a1d058e070f81f32f758a5`

## Observed results

| Gate | Deployed result |
| --- | --- |
| Clean arrival | PASS · zero IndexedDB records, zero localStorage keys, zero non-read requests |
| Case continuity | PASS · Case Map digest preserved across reload |
| Rooms | PASS · four Rooms and three cross-Room relationships observed |
| Route Memory | PASS · one `WHAT_ACTUALLY_LEFT` successor entry |
| Rebuild Test | `CALIBRATED_FOR_NAMED_FIXTURE` · four trials · one benign control · one held-out observation |
| Rebuild replay | `REPLAY_VERIFIED` |
| Real surveillance probability | `null` |
| Automatic hold | `false` |
| Exact release binding | PASS |
| Stale version | rejected |
| Changed route | rejected |
| Transmission performed | `false` |
| Provider call | `false` |
| Provider POST requests added | `0` |
| Save Point | PASS |
| Capsule authenticated import | PASS |
| Wrong passphrase | held without import |
| Tampered capsule | held before import |
| Scale fixture | PASS · 250 nodes, 400 relationships, verified in 10.3 ms |
| Desktop | zero horizontal overflow; zero unreachable clipped controls |
| Mobile portrait | zero horizontal overflow; zero unreachable clipped controls; intentional swipe lanes recorded separately |
| Mobile landscape | zero horizontal overflow; zero unreachable clipped controls |
| Rotation return | zero horizontal overflow; zero unreachable clipped controls |
| Reduced motion | honored |
| Non-read network requests | `0` |
| Recipient-transport requests | `0` |
| Console errors | `0` |

## Release synchronization

The promotion changes only the Ash release posture and this durable evidence receipt. The following generated and test surfaces must remain synchronized:

- `app/aperture/release.json`
- `app/aperture/release.js`
- `tests/fixtures/aperture-release.json`

The promoted release posture is:

```text
status = IMPLEMENTED_PRODUCTION_DEMONSTRATED
productionStatus = PRODUCTION_DEMONSTRATED
transport = false
automaticCinder = false
```

## Boundaries

This production demonstration establishes that the declared deployed workflow behaved as observed under the preserved browser, fixture, route, and evidence conditions. It does not establish:

- identity;
- authorship;
- ownership;
- permission;
- confidentiality at an external provider;
- resistance to every possible Reader;
- real surveillance probability;
- trusted time;
- final-recipient delivery;
- deletion from any external system;
- universal privacy or anonymity.

Production demonstration grants no recipient transport, prediction authority, automatic hold, automatic Ash action, automatic Cinder, or Open Field promotion authority.

## Final ruling

```text
CLOSURE_HARNESS_IMPLEMENTED_PRODUCTION_DEMONSTRATED
POST_DEPLOYMENT_OBSERVER_IMPLEMENTED_PRODUCTION_DEMONSTRATED
OBSERVER_STATUS_RECEIPTS_IMPLEMENTED_PRODUCTION_DEMONSTRATED
RELEASE_POSTURE_VERIFIER_IMPLEMENTED_PRODUCTION_DEMONSTRATED
ASH_KEEP_V1_IMPLEMENTED_PRODUCTION_DEMONSTRATED
TRANSPORT_DEFERRED
AUTOMATIC_CINDER_FALSE
```

𝌋‌ U+10D613

Marked ⟐
