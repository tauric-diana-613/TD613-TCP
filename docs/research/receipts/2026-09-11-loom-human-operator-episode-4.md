# Holonomy Loom — Human Operator Episode 4

Date: 2026-09-11
Evidence class: human-operated production observation
Human evidence: yes
General human-comprehension claim: not established
Child-study authority: none

## Deployed lineage observed

The episode occurred after the Episode 3 production release whose authorized product source packet was:

`ace755ec300281ab08a9874f88c668efa42db8ee`

The repository had already returned to the release-lock descendant:

`45b4b9ddea7e73a99efbad392b0ba272c635a70f`

## Exact bounded observation

The operator freshly loaded Demo 1 and issued one Run request, stopping after that single submission to conserve provider calls.

- request id: `4522313a-7a70-42df-a36e-6a5533b56996`
- started: `2026-09-11T08:24:46Z`
- elapsed: 25.4 seconds
- `gemini-3.8-flash` -> HTTP 503
- `gemini-3.7-flash` -> HTTP 503
- admitted AI answer: none

This one episode demonstrates only that the production request traversed two recorded provider attempts and both returned HTTP 503 before an answer was admitted. It does not establish a provider-wide outage, a lifecycle state, quota exhaustion, or a unique external cause.

## Human-facing result

Episode 3's causal presentation repair held under a fresh provider failure. The room displayed:

`Packet binding passed · provider failed later.`

The operator could distinguish the earlier successful rule/binding boundary from the later provider interruption. The continuation route opened and the prepared governed task remained portable.

Therefore the prior visual-causality defect is no longer reproduced by this episode.

The answer-level product payoff remains unobserved in this human episode because no useful supplier comparison returned.

## Engineering falsifier exposed

The serving Loom route admitted a deeper eligible provider plan but the request implementation sliced that plan to two provider calls. Under the quality-first order those two attempts were the adjacent frontier models `gemini-3.8-flash` and `gemini-3.7-flash`.

The shared model policy also retains transient model cooldowns in process-local memory. Such memory may help a warm process but cannot be treated as durable cross-invocation evidence in a serverless environment. A new invocation must therefore remain resilient even when it begins without prior-process cooldown state.

Episode 4 motivates a stateless request-local repair:

1. retain a strict finite provider-call ceiling;
2. retry only transient provider HTTP conditions;
3. use bounded backoff between attempts;
4. diversify fallback generations among models already admitted by the fresh provider plan rather than spending the whole request on adjacent frontier siblings;
5. stop immediately on a successful HTTP response that then fails deterministic output admission, preserving the prohibition on model-shopping for permissive output;
6. require one real deployed Demo 1 canary before a full-product release may seal.

## Claim ceiling

A successful future canary can establish that one post-deployment production request returned an admitted answer on the observed route. It cannot guarantee future provider availability, prove durable quality across users or tasks, establish human comprehension, authorize a child study, reopen Western Horizon exteriority, or earn the Golden Egg.

A failed future canary must remain a failed production observation and must hold the release rather than being described as a successful answer-level demonstration.

Sealed ⟐
