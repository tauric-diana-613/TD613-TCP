# A2–A5 PRE-TRACE REPLACEMENT REACQUISITION v0.1 — PREREGISTRATION

𝌋‌⟐

**Status:** FROZEN BEFORE IMPLEMENTATION  
**Exact scientific parent:** PR #1066 earned head `aaaee83298fa91907ebe77d0e6e5702967f9b2a4`  
**Mechanistic ancestor:** PR #1046 · bounded replaceable native route-control reacquisition  
**Merge / production release / Vercel / live-provider authority:** CLOSED

## Trigger

PR #1066 earned a real two-attempt recovery episode by replacing the canonical native route control **after** handle acquisition, focus, and trace binding but **before** native Enter dispatch.

That episode reached the existing caught failure surface:

```text
handle acquired
→ focus succeeds
→ trace binds original control
→ original control is replaced
→ handle.press('Enter') throws detached-element error
→ press error is caught
→ attempt ledger is preserved
→ attempt 2 reacquires replacement
→ native Enter settles route
```

Exact-source post-seal review exposes a distinct earlier timing class inside the same bounded loop:

```text
canonicalButton.waitFor(...)
→ const handle = await canonicalButton.elementHandle()
→ await handle.focus()
→ await handle.evaluate(...trace binding...)
→ caught handle.press('Enter')
```

The current retry catcher begins only around native Enter. `handle.focus()` and trace-binding failures occur before that catcher. Therefore the earned #1066 theorem cannot be silently widened to cover a replacement that happens **after handle acquisition but before focus / trace binding**.

```text
POST_TRACE_STALE_HANDLE_RECOVERY != PRE_TRACE_STALE_HANDLE_RECOVERY
HANDLE_ACQUIRED != CONTROL_CONNECTED_AT_FOCUS
RETRY_LOOP_PRESENT != EVERY_PRE_DISPATCH_FAILURE_IS_RETRYABLE
CAUGHT_PRESS_FAILURE != CAUGHT_PREACTIVATION_FAILURE
```

## Exact question

Can the bounded native route-control observer classify one **disconnected pre-trace stale handle** as a retryable ownership-loss event, reacquire the sole canonical replacement on attempt 2, and still settle only through native Enter — without widening product/runtime authority, swallowing connected semantic failures, adding timeout budget, or enumerating an attempt-count ladder?

## Frozen hostile episode

Only one route is injected:

```text
FORCED_ROUTE = CUSTODIAL
```

Only one replacement is permitted.

The replacement occurs on **attempt 1 only**, after `elementHandle()` returns the original canonical visible control and before `handle.focus()` / semantic trace binding.

Required DOM transfer:

```text
old control
  route = CUSTODIAL
  isConnected before replacement = true
  native onclick present = true

replacement
  cloneNode(true)
  receives the original native onclick
  becomes the sole visible canonical CUSTODIAL owner

old control after transfer
  isConnected = false
  onclick = null
```

No direct/private Live-AIA setter is permitted.

```text
PRETRACE_REPLACEMENT_TRIGGER != DIRECT_ROUTE_MUTATION
SAME_SELECTOR != SAME_DOM_INSTANCE
DISCONNECTED_OLD_OWNER != CANONICAL_REPLACEMENT_OWNER
```

## Allowed observer repair

The inherited #1066 parent remains immutable evidence. A descendant observer repair may modify only the A2–A5 **observer** so that a preactivation failure is retryable **only when the acquired handle can be independently classified as disconnected from the document**.

The repair must remain fail-closed:

- a connected control with the wrong `data-aia-route` remains RED;
- a connected control missing native `onclick` remains RED;
- a focus failure on a still-connected control remains RED;
- an arbitrary exception is not converted into retry merely because it occurred before Enter;
- no product route-control code, Live-AIA code, route semantics, demo registry, workspace owner, or production runtime may be changed to obtain GREEN;
- no timeout may be widened;
- max attempts remains the inherited finite bound;
- the hostile episode itself must close in exactly two recorded attempts.

A lawful retry receipt may distinguish a disconnected preactivation owner with fields such as:

```text
attempt
handle_acquired
preactivation_stage
preactivation_error
traced_control_connected_before_trace
retry_reason = PRETRACE_CONTROL_DISCONNECTED
```

Exact field names may vary only if the static hostile contract preserves the same semantics.

## Required attempt ledger

### Attempt 1

Must demonstrate:

```text
attempt = 1
handle_acquired = true
forced replacement performed = true
old control disconnected = true
replacement connected = true
replacement has native onclick = true
canonical visible count = 1
canonical visible owner is replacement = true
same DOM instance = false
route remains EXPERIENTIAL
native keydown on stale owner = false
native click on stale owner = false
retry reason = disconnected pre-trace owner
```

The attempt must not be reported as a post-trace `press_error` recovery. The scientific coordinate is specifically pre-trace ownership loss.

### Attempt 2

Must demonstrate:

```text
attempt = 2
canonical replacement reacquired = true
control connected = true
native onclick present = true
active before native activation = true
native keydown observed = true
native click observed = true
route after dispatch = CUSTODIAL
canonical route settled = true
```

No attempt 3 may be required by the forced episode.

## Non-injected controls

Every other canonical AIA route must retain its ordinary successful one-attempt behavior under the same engine episode.

```text
NONINJECTED_ROUTE_ATTEMPT_COUNT = 1
NONINJECTED_ROUTE_REPLACEMENT_RETRY = false
NONINJECTED_ROUTE_NATIVE_ENTER_REQUIRED = true
NONINJECTED_ROUTE_DIRECT_BYPASS = false
```

## Immediate falsifiers

Any of the following is RED:

- pre-trace replacement aborts the entire observer instead of producing a bounded retry ledger;
- connected semantic drift is swallowed as retry;
- attempt 1 receives native key/click events and is then re-described as pre-trace;
- replacement fails to become the sole canonical visible native owner;
- attempt 2 settles through a direct/private route setter;
- attempt 2 lacks native Enter keydown/click evidence;
- route settles on attempt 1 despite the stale pre-trace owner;
- attempt 3 is required by the exact one-replacement episode;
- any non-injected route drifts beyond one attempt;
- inherited #1066 observer bytes are rewritten in place rather than preserved as parent history;
- product/runtime source is changed merely to obtain GREEN;
- timeout budget is widened;
- cross-engine scientific receipts disagree;
- exact-head convergence fails.

## Authority sequence

1. Freeze this preregistration before implementation.
2. Open successor PR as **Draft**.
3. Source review must preserve the source-level distinction that motivated the chamber.
4. Implement only the smallest descendant observer/witness/static-contract authority needed to exercise the frozen hostile episode.
5. Draft Static must close GREEN first.
6. The identical head may then become Ready.
7. Chromium + Firefox + WebKit must each produce the direct successor PASS receipt.
8. Full exact-head convergence must close GREEN before any 𝄐 claim.

## Finite stop law

This chamber changes **failure class / catch-boundary coverage**, not attempt count.

A GREEN result does not authorize:

- attempt 3 / attempt 4 hostile ladders;
- enumeration of every nanoscopic replacement instant between JavaScript statements;
- repeated replacement schedules;
- arbitrary DOM churn;
- generalized UI transaction claims.

```text
NEW_CATCH_BOUNDARY != ATTEMPT_COUNT_LADDER
ONE_PRETRACE_REPLACEMENT != ARBITRARY_REPLACEMENT_SCHEDULE
TEMPORAL_CLASSIFICATION != EXHAUSTIVE_INTERLEAVING_ENUMERATION
```

## Claim ceiling

A GREEN result could establish only bounded **single pre-trace replacement reacquisition** for the exact CUSTODIAL hostile episode above, using the canonical A2–A5 observer lineage and three-engine local browser authority.

It would not establish universal replaceable-control immunity, arbitrary browser scheduler interleavings, arbitrary control populations, general transaction retry semantics, production TD613.com behavior, provider behavior, deployment/merge/release authority, external-origin knowledge, empirical exteriority, Western Horizon reopening, or Golden Egg empirical credit.

Western Horizon remains at official empirical-shore research rest. This chamber carries zero exogenous-witness credit.

**NO 𝄐 YET.**

Marked ⟐
