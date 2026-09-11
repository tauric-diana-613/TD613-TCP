# Holonomy Loom · Release 1103 production-canary falsifier

Date: 2026-09-11
Status: HELD / repair bounded
Evidence class: machine production observation; not human evidence

## Source custody

Authorized source packet:

`4eb6d10e4ab2022cf90e7cd19099bbe09fab1a54`

Vercel Operator Release run:

`34582727838` / release #1103

Bounded production-evidence artifact:

`10192443562`

Artifact digest:

`sha256:2c4e35bb5c8438327adf0e70469bfc11242de921f8adf6cf7c6a0d5fd2874f88`

The release acquired the exact source packet, passed exact-byte comparison, survived the stale-queue stability window, reconfirmed exact bytes, passed the production Chromium/A14 witness, and passed the Ash lifecycle witness before the Loom canary ran. The release remained HELD because the Loom answer-level canary did not complete.

## One-shot production Loom receipt

The canary made exactly one application request to `https://td613.com`.

```text
request_id = release-canary-1789118018642
request_count = 1
http_status = 502
task_status = held
provider_calls = 3
elapsed_ms = 32475
answer_nonempty = false
```

Observed provider attempts:

```text
gemini-3.8-flash -> HTTP 503
gemini-3.5-flash -> HTTP 503
gemini-2.5-flash -> HTTP 400
```

The third observation is materially different from the first two. It is not evidence of a third transient provider outage. The diversified fallback route escaped the adjacent-frontier 503 pair and reached Gemini 2.5 Flash, where the request was rejected as a client request.

## Reconstructed incompatibility

At the observed source packet, `server/loom-task.js` placed `gemini-2.5-flash` inside the same quality envelope as Gemini 3 models and emitted:

```json
{
  "thinkingConfig": {
    "thinkingLevel": "high"
  }
}
```

Current Google Gemini API documentation distinguishes these generations:

- Gemini 3 models use `thinkingLevel`.
- Gemini 2.5 models do not support `thinkingLevel`; they use `thinkingBudget`.
- Google's high-effort compatibility mapping for Gemini 2.5 corresponds to a thinking budget of 24,576 tokens.
- Stable `gemini-2.5-flash` remains listed without a shutdown date and supports structured outputs and thinking.

Provider documentation consulted on 2026-09-11:

- `https://ai.google.dev/gemini-api/docs/generate-content/thinking`
- `https://ai.google.dev/gemini-api/docs/openai`
- `https://ai.google.dev/gemini-api/docs/deprecations`

The bounded causal diagnosis is therefore request-generation incompatibility at the third fallback surface. The receipt does not claim that Google's private error body was observed or that every possible HTTP 400 from Gemini 2.5 has this cause. The emitted request shape independently violates the documented 2.5 parameter contract and exactly coincides with the first non-transient provider response in this canary.

## Repair boundary

The repair may:

1. retain the existing three-call transient-only ceiling and diversified model order;
2. keep Gemini 3 quality-envelope requests on `thinkingLevel: high`;
3. emit `thinkingBudget: 24576` for Gemini 2.5 quality-envelope requests;
4. keep the 65,536 output-token envelope, which the stable Gemini 2.5 Flash model supports;
5. make observations report the budget explicitly rather than falsely labelling a 2.5 request with a thinking level;
6. add deterministic tests that inspect the actual third-fallback request body.

The repair may not:

- add a fourth provider call;
- treat HTTP 400 as transient;
- retry after malformed, unsafe, or otherwise unadmitted HTTP-200 output;
- serialize provider error bodies;
- claim provider-wide outage from the two 503 observations;
- count the machine canary as human comprehension evidence;
- reopen Western Horizon exteriority;
- earn the Golden Egg.

## Anti-equivalences

```text
GEMINI_3_THINKING_LEVEL != GEMINI_2_5_THINKING_BUDGET
HTTP_400 != TRANSIENT_PROVIDER_UNAVAILABLE
TWO_HTTP_503_ATTEMPTS != PROVIDER_WIDE_OUTAGE
DIVERSIFIED_FALLBACK_REACHED != VALID_FALLBACK_REQUEST
VALID_REQUEST_SHAPE != PROVIDER_SUCCESS
MACHINE_CANARY != HUMAN_EVIDENCE
PRODUCT_REPAIR != WESTERN_HORIZON_REOPENING
PRODUCT_REPAIR != GOLDEN_EGG
```

Sealed ⟐
