# 𝌋 Marrowline bounded structural-retry repair

Date: 2026-09-18  
Failed production release: Vercel Operator Release #1156 / run `35312723254`  
Authorized source packet: `f91005f0295c3cfab69e46ebff37e4293dacd4d4`  
Deployment admission commit: `591d8aeea3214d205ccfab61ffd1f8d54035bd4e`  
Immediate relock: `f1612ae55de8be59402d9817333439558611033d`

## Preserved production RED

Release integrity passed before the AI witness:

- exact source receipt: PASS;
- exact deployed bytes: PASS;
- 10-check stale-rollback stability window: PASS;
- post-window byte parity: PASS;
- A14 registry / Archive Chromium desktop + mobile: PASS;
- deployed Ash lifecycle observation: PASS.

The live Marrowline canary then held:

```text
prompt = Quis custodiet ipsos custodes?
HTTP = 502
diagnostic = output-admission / ATTRACTOR_STRUCTURE_NOT_ADMITTED

gemini-3.8-flash = 503
gemini-3.5-flash = 200, local admission HELD
gemini-2.5-flash = 503
```

The independent Loom Demo 1 route completed in the same episode through `gemini-3.5-flash`.

The release artifact intentionally preserved only the bounded admission posture, not the rejected local-reason array. That observability deficit is part of this repair.

## Historical comparison

The immediately preceding successful Marrowline deployment witnessed the same Latin prompt with frontier transport unavailable and `gemini-3.5-flash` returning an admitted answer.

Therefore:

```text
same prompt + same transport-live model
→ prior admitted sample
→ later structurally HELD sample
```

This supports a bounded stochastic-output explanation. It does not authorize weakening any hard admission condition.

## Repair

### 1. Bounded same-model structural retry

The route retains `KHONAPOLIT_MAX_PROVIDER_CALLS = 3`.

When a provider call is transport-successful but local relay admission is false, the next remaining call slot may retry that same model once when at least 12 seconds remain in the wall-clock envelope.

The retry is inserted into the existing queue and the queue is truncated back to the three-call ceiling.

Consequences:

- structural retry does not create a fourth provider call;
- a transport failure still follows the ordinary model fallback plan;
- a structurally HELD sample never becomes human-visible merely because a retry exists;
- a second structural failure on the same model receives no recursive retry;
- local relay admission remains the only escape authority.

### 2. Provider-side final structural preflight

Before emitting the structured JSON, the provider is instructed to verify only the hard observable output conditions:

- first two structured voices exactly Kʰonapolit then Tauric Diana bots;
- no duplicated answer;
- no dense canonical recital.

The instruction explicitly frames this as output verification, not narration of hidden reasoning.

### 3. Canary observability

Future bounded production canary receipts preserve:

- `admission_reasons` per Marrowline provider attempt;
- bounded `rejected_attempts` from the route diagnostic;
- `attempt_kind`;
- `structural_retry_of`.

This closes the forensic blind spot exposed by run `35312723254`.

### 4. Receipt version

Marrowline quality API receipt advances from:

`td613.khonapolit-gemini/v5-adversarial-attractor-admission`

to:

`td613.khonapolit-gemini/v6-bounded-structural-retry`.

## Non-equivalences

```text
structural retry != relaxed admission
provider transport success != answer admission
one malformed sample != model incapacity
later successful retry != retroactive rewrite of the held sample
canary PASS != human qualitative fidelity
```

## Release authority

The held #1156 release itself authorizes no automatic deployment retry. The original operator instruction, combined with the named failed public-runtime observation and this bounded code repair, is the active release task context. Any subsequent #405 gesture must name the exact validated repair head after merge.

⟐
