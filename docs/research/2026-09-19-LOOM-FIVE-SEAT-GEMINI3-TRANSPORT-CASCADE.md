# 𝌋 Loom five-seat Gemini 3 transport cascade

Date: 2026-09-19

## Production wound

Vercel Operator Release #1172 / run `35417709574` successfully deployed source packet
`f6d8615b05df81a3ebaed82a6bbcce3eee1a060e`.

The release passed:

- exact-source authorization;
- bounded Vercel adoption;
- immediate relock;
- exact-source receipt;
- deployed byte parity;
- stale-rollback stability;
- post-window byte reconfirmation;
- A14 desktop/mobile;
- Ash lifecycle.

The same live production canary also proved the Marrowline raw-packet repair:

```text
Marrowline
gemini-3.8-flash -> 503
gemini-3.5-flash -> 200
relay_admitted = true
relay_quality = PASS
provider_plan.callable_models =
  3.8, 3.7, 3.6, 3.5, 3 Flash Preview
```

The release HELD only because the independent Loom route retained a three-call transport ceiling:

```text
Loom
gemini-3.7-flash -> 503
gemini-3.5-flash -> 503
gemini-3.6-flash -> 503
STOP
```

The key-specific provider observation exposed a wider approved Gemini-3 frontier. The release therefore failed on local prefix truncation, not on Marrowline admission or Vercel source integrity.

## Repair

Loom's transport failover ceiling moves from three to five calls.

The existing ordering law is preserved:

1. first currently callable quality-first model;
2. stable diversified fallbacks;
3. remaining already-callable frontier candidates.

The 50-second global deadline is unchanged. Existing request-local timeout allocation and transient backoff remain unchanged. Execution still stops immediately on the first provider HTTP success. Deterministic output-admission failures remain terminal and do not trigger another model.

The production canary now preserves up to five Loom provider attempts and timings rather than truncating them to three.

## Explicit non-changes

- no Marrowline mutation;
- no Zalgo mutation or filter;
- no provider prompt change;
- no Loom output-schema change;
- no model eligibility widening;
- no Gemini 2.x restoration;
- no browser/UI mutation;
- no Vercel authority widening.

## Regression

`tests/loom-task.test.mjs` now includes a production-shaped route:

```text
callable = [3.7, 3.6, 3.5, 3 Flash Preview]
selected = [3.7, 3.5, 3.6, 3 Flash Preview]

3.7 -> 503
3.5 -> 503
3.6 -> 503
3 Flash Preview -> 200
```

The test requires an admitted Loom completion on the fourth attempt.

```text
three-call transport prefix != complete callable frontier
provider transport failure != output-admission failure
Marrowline PASS != Loom transport PASS
```

Sealed ⟐
