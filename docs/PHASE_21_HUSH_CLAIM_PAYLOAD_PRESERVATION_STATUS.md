# Phase 21 Status — Hush Claim Payload Preservation

Phase 21 adds claim-payload preservation to Hush so transformed outputs retain the evidentiary content of a message while still changing syntax and mask posture.

The phase targets the live-output failure where Hush preserved some literals but clipped the surrounding payload: operational IDs, timestamps, actors, organizations, instructions, version context, and causal reasons.

## What changed

Phase 21 expands protected literal extraction and adds payload-aware review modules:

- `app/engine/hush-payload-map.js`
- `app/engine/hush-payload-binding.js`
- `app/engine/hush-payload-integrity.js`
- `app/engine/hush-payload-repair.js`

It also updates:

- `app/engine/hush-meaning-plan.js`
- `app/engine/hush-syntax-recomposer.js`
- `app/engine/hush-candidate-cleanroom.js`
- `app/engine/hush-release-policy.js`
- `app/engine/hush-swap.js`

## Payload preservation

Hush now tracks and tests payload features such as:

- operational identifiers like `INV-440`, `PO-123`, `HR-22`, `FILE-77`, `TICKET-884`
- timestamps like `2:18`
- date/evidence bindings like `DOC-77 + 04/21`
- bracketed covenant markers like `SAC[X6ZNK5NO51]`
- actors such as `Maya` and `Jordan`
- organizations and departments such as `vendor` and `finance`
- instruction targets such as `do not resend the spreadsheet`
- version context such as `which version finance kept`
- causal reasons such as `because that date is the whole point`

## Release posture

Payload loss is now part of Hush release discipline.

Hard-block examples include:

- `claim-payload-loss`
- `payload-repair-failed`
- `truncated-identifier`
- `truncated-timestamp`
- `dangling-negation`
- `dangling-preposition`

Review warnings include:

- `claim-payload-review`
- `payload-distance-high`
- `reason-compressed-review`
- `version-context-compressed-review`
- `instruction-softened-review`

## Regression coverage

Phase 21 adds live-quality regression coverage based on the browser samples that exposed the payload-loss issue. The tests assert that IDs, timestamps, names, departments, version context, instructions, and causal reasons survive the transformation path.

## Boundary

Phase 21 improves local draft integrity. It does not claim anonymity, untraceability, platform-proof behavior, publication safety, identity outcomes, or external recognition outcomes.

Hush remains a local review instrument with human review required before use.

Sealed ⟐
