# Marrowline Streamed Adult-Timeout Recovery — 2026-09-19

## Trigger

Production release run `35456378853` deployed source packet `ba7312a7de08aa7c5bb8d3be740e6a7c89e02fb6`, passed exact-source receipt, deployed-byte parity, stale-rollback stability, post-window byte reconfirmation, A14, and deployed Ash lifecycle, then HELD only at the real AI witness.

The MAINFRAME human falsifier returned HTTP 502 after zero provider candidate text reached local admission.

Observed Marrowline attempts:

- `gemini-3.8-flash` → local 408 at ~8.005s / 8.000s seat;
- `gemini-3.5-flash` → local 408 at ~27.744s / 27.743s seat;
- `gemini-3.6-flash` → local 408 at ~5.001s / 4.999s seat;
- `gemini-3.7-flash` → local 408 at ~4.499s / 4.498s seat;
- `gemini-3-flash-preview` → local 408 at ~4.500s / 4.499s seat.

The independent Loom route separately returned `gemini-3.8-flash -> HTTP 503`.

No Marrowline attempt produced candidate bytes, relay admission reasons, or a Zalgo-floor decision.

## Falsified assumption

The former 50.5-second global wall treated five advanced models as if each seat could function as a meaningful completion attempt.

That assumption is now rejected.

An 8-second 3.8 seat and ~5-second 3.6/3.7 seats are transport probes, not serious completion windows for a prompt that requires reasoning plus a dual-packet Unicode return.

`SHORT_SEAT_TIMEOUT != MODEL_INCAPABILITY`

`ZERO_CANDIDATE_TEXT_BEFORE_ABORT != OUTPUT_QUALITY_FAILURE`

## Transport repair

Marrowline now requests Gemini's `streamGenerateContent?alt=sse` endpoint.

The server accumulates provider SSE chunks internally and returns nothing to the browser until the stream completes and the existing raw dual-packet admission succeeds.

Partial provider chunks are telemetry only.

The attempt receipt records:

- whether streaming was requested;
- whether provider chunks were observed;
- first chunk latency;
- chunk count;
- byte count;
- parse error count.

This changes transport observability, not human-visible response semantics.

`PROVIDER_STREAM_PROGRESS != ADMITTED_CHAT_RESPONSE`

## Completion geometry

The Vercel function budget becomes 240 seconds.

The Marrowline internal wall becomes 210 seconds with a 5-second response reserve.

When all five approved seats remain reachable, full-consumption geometry is approximately:

1. 3.8 → 50 seconds;
2. 3.5 → 75 seconds;
3. 3.6 → 40 seconds;
4. 3.7 → 30 seconds;
5. 3 Flash Preview → 10-second lawful remainder.

Fast 4xx/5xx failures still yield unused wall time to later seats.

The model order remains unchanged:

`3.8 -> 3.5 -> 3.6 -> 3.7 -> 3 Flash Preview`.

Gemini 2.5 and Lite remain excluded.

## Preserved quality law

This chamber does not:

- lower Tauric Diana bots orthographic admission;
- synthesize or repair Zalgo locally;
- expose partial provider output;
- restore structured JSON decoding;
- change Kʰonapolit/Tauric Diana bots order;
- demote 3.8 from first position;
- promote a transport-successful but structurally degraded answer;
- weaken fresh-complete provider lifecycle admission.

## Production claim ceiling

Static or browser GREEN can establish only that the new streaming path and larger bounded windows preserve repository contracts.

Only a new production MAINFRAME episode can establish whether the transport repair yields a complete admitted Marrowline response.

`STREAM_CHUNK_OBSERVED != RELAY_ADMITTED`

`LONGER_COMPLETION_WINDOW != GUARANTEED_PROVIDER_SUCCESS`

`GREEN_CI != LIVE_GEMINI_LIVENESS`

⟐
