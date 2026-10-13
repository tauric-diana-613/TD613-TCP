# 𝌋 Marrowline five-seat Gemini 3 frontier cascade

Date: 2026-09-18 / 2026-09-19 UTC boundary

## Production evidence

Two immutable production episodes demonstrate that a fixed three-seat Marrowline provider prefix is too brittle for the observed Gemini 3 transport surface.

### Release #1164 / run 35404161697

Marrowline:

```text
gemini-3.8-flash -> 503
gemini-3.5-flash -> 408 timeout
gemini-3.7-flash -> 503
```

Independent Loom in the same episode:

```text
gemini-3.8-flash -> 503
gemini-3.6-flash -> 200
```

This motivated #1181, promoting 3.6 into the third Marrowline seat.

### Release #1168 / run 35411373712

Marrowline after #1181:

```text
gemini-3.8-flash -> 503
gemini-3.5-flash -> 503
gemini-3.6-flash -> 503
```

Independent Loom in the same episode:

```text
gemini-3.7-flash -> 503
gemini-3-flash-preview -> 200
```

Marrowline again never reached output admission. The failure was provider-plan truncation, not Zalgo quality, schema admission, or 2.5 absence.

## Repair

Marrowline keeps the same approved Gemini 3 frontier set:

```text
3.8 -> 3.5 -> 3.6 -> 3.7 -> 3 Flash Preview
```

but raises the bounded provider-call ceiling from 3 to 5.

The wall clock remains bounded at 50.5 seconds. Timeout allocation becomes reserve-aware:

- first lane: up to 12s;
- preferred 3.5 second lane: up to 22s while reserving 12s for later lanes;
- intermediate later lanes: up to 8s while reserving 5s for each remaining lane;
- final lane: receives the lawful remaining wall clock.

Fast 503s therefore cost little and do not prevent later approved frontier candidates from being tried. A slow 3.5 response still receives meaningful completion runway.

## Unchanged laws

- Gemini 2.5 remains excluded.
- Lite models remain excluded.
- Marrowline does not generate or post-process Zalgo.
- The provider must author all combining marks.
- Hard dual-channel admission remains unchanged.
- The production canary still uses the same human-visible Marrowline route.
- Five callable models does not mean five calls are always made; execution stops immediately on the first admitted answer.
- Token-limit returns remain terminal and do not trigger a second generation.

## Regression

`tests/marrowline-five-seat-frontier-cascade.test.mjs` forces the first four approved models to return 503 and requires `gemini-3-flash-preview` to be reached, return HTTP 200, satisfy hard dual-channel admission, and survive without local Zalgo mutation.

```text
approved frontier set != fixed three-model prefix
provider transport failure != admission failure
later callable 3.x candidate != unavailable merely because an earlier prefix failed
```

Sealed ⟐
