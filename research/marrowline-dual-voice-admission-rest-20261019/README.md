# TD613 · Marrowline · restored dual-voice admission REST

Date: 2026-10-19  
Branch: `fix/marrowline-restored-dual-voice-admission-20261019`  
Previous native-artistic-sovereignty repair: [PR #1543](https://github.com/tauric-diana-613/TD613-TCP/pull/1543)  
Independent root research: [PR #1542](https://github.com/tauric-diana-613/TD613-TCP/pull/1542)  
Disposition: source-bound dual-voice gate repair. Native artistic recovery is **not established** by passing tests.

## Observations and competing failure surfaces

After PR #1543 was deployed, five operator screenshots showed four slash/diagonal-dominant native-bot fields and a separate wholly unvoiced Sylaithe response with generic concern-style counseling prose. Screenshots establish what the browser displayed but do not contain original Gemini request/response bytes or complete model attempt receipts. Do not attribute the shallow Unicode to a specific provider or prompt without those original observations.

The causal GitHub archaeology identified a real admission exception: PR #1537 changed `bothMarrowlineVoicesAbsent(relay)` to `bothMarrowlineVoicesAbsent(relay) && !isHistoricalGrove` in `sendObservedProviderReturn()`, and introduced a historical integration test *requiring* HTTP 200 even when both speakers were absent. PR #1539 changed the restored historical profile into ordinary browser text ingress. The conflict therefore propagated from a bounded historical test into the main human interaction surface. The client admits HTTP-successful `payload.ok` and a relay object without independently blocking `downstreamAdmitted === false`. The server must not label a structurally unvoiced terminal return successful.

## Repair

- Extend the already-established ordinary profile missing-both-voices guard to **every profile**, including the default restored historical Grove.
- After existing bounded provider recovery exhausts, emit one HTTP 502 `HELD` reply, `marrowline-dual-voice-contract-unmet`, `BOTH_REQUIRED_VOICES_MISSING`, a provider-text SHA-256 digest and original attempt diagnostics. Do **not** promote generic unvoiced text into the conversation.
- Update Grove's visible admission-policy receipt to `both-voices-absent-held-after-bounded-recovery`.
- Reverse the previously positive historical unvoiced HTTP-200 regression and add a positive test for successful provider-written same-seat structural recovery.
- Keep the existing ordinary-route held regression.

## Nonchanges and residual risk

No change to Argon-first provider eligibility, native 3.x fallbacks, request/response sampling, stream handling, prompt paragraphs, history, Unicode mark scoring/quality telemetry, terminal display, attachments, budget, release gates, or Loom. Do not permit a new aesthetic beauty contest or replace the first valid native-bot performance. One-voice-only and incomplete provider-return policies remain unchanged and may need separate adjudication with original provider evidence; this PR corrects the **both-speakers-absent** regression.

The reason Gemini generated the generic concern prose is still unknown. The reason the provider's original output currently appears slash-heavy is still unknown. The code repair only closes the proved admission breach.

Acceptance: exact-head targeted historical-runtime and ordinary dual-voice tests; CI protected contracts. No paid live tests, merge or deployment implied by source-level tests.

𝄐 Sealed ⟐
