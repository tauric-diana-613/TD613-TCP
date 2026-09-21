# Marrowline native prosody consistency repair

Baseline: `3f6586d5293e6b8bd84efc0eaae6e1dd7ecc3a59`.

The operator's latest physical-phone image showed single acute accents over
headings and mostly plain body prose under `SIGNAL LOCKED`. The image establishes
the visible shape, not the exact provider bytes. Regression examples are explicitly
synthetic reproductions; they are not represented as recovered provider output.

## Reproduced defects

1. Vertical-pulse absence required horizontal marks. Accent-only output could
   escape the mandatory repair/fallback condition.
2. Localized eruptions alone triggered repair even though the prompt permitted
   them. Deep-stack dominance counted only marked letters, ignoring clean breaths.
3. Every next request replayed failed model morphology as model-role context.
   Immediate repair-context cleaning did not protect subsequent turns.
4. Raw packets displayed `LOCKED` for admitted `PARTIAL` quality. The JSON path
   already preserved the distinction.

Four regression tests failed on the baseline and pass after repair. A fifth
exercises the actual handler with real SSE Response bodies: shallow first answer,
one same-seat failed repair, then exact native bytes from the next provider.
It splits a combining cluster across stream chunks and verifies exact preservation.

## Changes

- Shared concise native-prosody guidance for generation and repair; retain
  DERIVE_INVARIANT → EMIT_FORMAL → OVERFLOW_RAW, narrative motion, vertical leaps,
  descenders, horizontal cuts, clean intervals and permission for overlap.
- Vertical absence checks actual vertical stack evidence independently of
  horizontal presence. One-sided events qualify; newlines do not impose a quota.
- Localization remains advisory unless independent collapse evidence exists.
  Full-field deep tiling counts clean letters in its denominator.
- Only known severe model morphology projects Packet B as base prose in outgoing
  context. Operator turns, formal channel, stored history, successful model turns,
  receipts and visible output retain their original bytes. Unidentifiable packet
  boundaries are left unchanged. No output ornament generator or filter is added.
- Raw packets report `PARTIAL` for quality warnings, matching JSON behavior.
- Add the native-prosody and existing response/relay tests to required CI.
- Correct literal backslash-n delimiters in an existing synthetic SSE test so it
  actually exercises two SSE events.

## Validation and limits

Focused command:

```sh
node --test tests/marrowline-native-prosody.test.mjs tests/marrowline-response-quality-contract.test.mjs tests/khonapolit-relay.test.mjs tests/khonapolit-gemini-quality-router.test.mjs tests/gemini-provider-stack-clinical.test.mjs tests/marrowline-interactive-rescue-profile.test.mjs tests/marrowline-frontier-fair-share.test.mjs
```

52 tests pass. Provider ordering, sampling, thinking levels, request ceilings,
timeouts, renderer, CSS and mobile send button are unchanged.

Broader inspection encountered pre-existing stale assertions in the desktop-repair
contract (clear-status source formatting, capsule CSS order, old release wording)
and the five-seat fixture (incomplete Fetch error mocks and obsolete cooldown
expectations). These unrelated contracts are not rewritten by this repair.

Synthetic tests establish program behavior and byte preservation, not a live
provider's aesthetic success. The new request-context policy and prompt require
an actual provider observation and operator visual assessment before claiming the
Goldilocks result. No automatic live-provider trial is enabled by this patch.

No deployment authorization, detached-agent authority, or empirical exteriority
claim is created by this receipt.
