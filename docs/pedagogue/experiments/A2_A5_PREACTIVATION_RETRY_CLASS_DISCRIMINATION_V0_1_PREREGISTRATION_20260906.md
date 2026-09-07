# A2–A5 Pre-Activation Retry-Class Discrimination v0.1 — Preregistration

Status: **FROZEN BEFORE IMPLEMENTATION — NO 𝄐 YET**  
Exact scientific parent: PR #1067 earned head `228c11886abcba18027efb71592639c2ecdd1fdf`  
Mechanistic parent: #1067 pre-trace disconnected-owner retry  
Merge / production release / Vercel / live-provider authority: **CLOSED**

## Scientific question

PR #1067 established the positive preactivation recovery class for one exact hostile event:

```text
ElementHandle acquired for CUSTODIAL
→ original owner becomes disconnected before focus/trace
→ classifier observes same route identity + disconnected owner
→ PRETRACE_CONTROL_DISCONNECTED
→ attempt 2 reacquires sole replacement owner
→ native Enter settles CUSTODIAL
```

The descendant classifier contains two adjacent negative branches that have so far been protected statically but not directly exercised as browser hostile episodes:

```text
if route identity changed while acquired owner is still connected
→ hard failure

if acquired owner is still connected and same-route but loses native onclick authority
→ hard failure
```

This chamber asks whether the retry predicate is **specific** to disconnected ownership loss rather than a generic preactivation-exception swallowing surface.

```text
DISCONNECTED_STALE_OWNER != CONNECTED_INVALID_OWNER
RETRYABLE_OWNERSHIP_LOSS != CONNECTED_SEMANTIC_DRIFT
RETRYABLE_OWNERSHIP_LOSS != CONNECTED_NATIVE_AUTHORITY_LOSS
PREACTIVATION_RETRY != ARBITRARY_EXCEPTION_SWALLOWING
```

## Exact finite classifier family

The family contains one already-earned positive anchor and exactly two new connected negative classes.

### P0 — earned parent anchor · disconnected same-route owner

Parent #1067 receipt remains the authority anchor:

```text
route = CUSTODIAL
connected = false
semantic identity = CUSTODIAL
retry_reason = PRETRACE_CONTROL_DISCONNECTED
attempt_count = 2
native attempt 2 settles CUSTODIAL
```

This successor may re-observe #1067 only through the inherited A15 chain. It does not re-implement or broaden P0.

### N1 — connected semantic drift

After the first CUSTODIAL `ElementHandle` is acquired and before focus/trace:

1. preserve the acquired node as connected;
2. change only that stale acquired node's `data-aia-route` identity away from `CUSTODIAL` to the fixed supported control identity `AUDIT`;
3. install one separate visible replacement carrying canonical `CUSTODIAL` identity and the inherited native `onclick` owner;
4. keep the stale acquired node connected but non-canonical / non-visible so it cannot become a second visible CUSTODIAL owner;
5. run the same #1067 preactivation classifier against the acquired handle.

Expected result:

```text
connected = true
acquired route = AUDIT
expected route = CUSTODIAL
→ exact hard failure:
A15 A2-A6 acquired route control changed semantic identity before focus.
```

No retry ledger entry, attempt 2, native dispatch, route settlement, direct route mutation, or widened authority may follow from N1.

### N2 — connected native-owner loss

After the first CUSTODIAL `ElementHandle` is acquired and before focus/trace:

1. preserve the acquired node as connected and semantically `CUSTODIAL`;
2. transfer its native `onclick` owner to one separate visible canonical `CUSTODIAL` replacement;
3. null the stale acquired node's `onclick`;
4. keep the stale acquired node connected but non-visible so the replacement is the sole visible canonical native owner;
5. run the same #1067 preactivation classifier against the acquired handle.

Expected result:

```text
connected = true
acquired route = CUSTODIAL
direct_onclick = false
→ exact hard failure:
A15 A2-A6 connected route control lost native action authority before focus.
```

No retry ledger entry, attempt 2, native dispatch, route settlement, direct route mutation, or widened authority may follow from N2.

## Required witness architecture

The two negative episodes must be isolated from each other and from the parent positive episode.

A lawful implementation may generate temporary descendant observer adapters from the exact #1067 source markers and execute each negative episode independently. The outer successor witness must treat **only the exact preregistered hard-failure message for that case** as PASS for the negative control.

Any other exception is RED.

The negative-control driver must preserve cleanup and close the browser episode. Expected hard failure must not be converted into a product PASS; it is evidence that the classifier rejected the connected invalid owner as designed.

```text
EXPECTED_CLASSIFIER_REJECTION != PRODUCT_FAILURE
EXPECTED_NEGATIVE_CONTROL != RETRY_SUCCESS
CAUGHT_BY_OUTER_ASSAY != SWALLOWED_BY_INNER_CLASSIFIER
```

## Parent custody requirements

The following parent surfaces remain immutable inputs:

- `scripts/ash-a2-a5-browser-probe.mjs` exact #1067 inherited observer bytes;
- #1067 positive receipt semantics;
- max route activation attempts = 4;
- native Enter ownership requirement;
- direct/private route setter prohibition;
- 4-second per-attempt settlement ceiling;
- existing A15 browser authority chain.

No in-place rewrite of the inherited observer is permitted merely to make the negative controls pass.

## Required observations per negative case

For N1 and N2, the local successor receipt must establish:

- hostile episode actually performed;
- acquired stale handle remained connected;
- replacement became the sole visible canonical `CUSTODIAL` native owner;
- stale acquired handle remained a distinct DOM instance;
- N1 acquired route actually became `AUDIT` while connected;
- N2 acquired route remained `CUSTODIAL` while connected and `direct_onclick=false`;
- exact preregistered classifier error observed;
- no `PRETRACE_CONTROL_DISCONNECTED` retry classification observed;
- no second attempt observed;
- no native keydown/click from the invalid stale owner;
- forced route did not settle because of the rejected stale owner;
- direct route API bypass remained false;
- inherited observer bytes remained unchanged;
- product/runtime source remained unchanged;
- max-attempt bound remained unchanged;
- timeout budget remained unchanged;
- release authority remained false;
- provider call remained false;
- production mutation remained false;
- exogenous witness credit remained false;
- Golden Egg credit remained 0.

The normal #1067 positive parent witness must still execute earlier in the same authoritative A15 chain and remain GREEN.

## Three-engine authority

Before any 𝄐 claim:

1. hostile Static contract;
2. Draft Static admission;
3. identical SHA promoted to Ready;
4. Chromium direct negative-control witness;
5. Firefox direct negative-control witness;
6. WebKit direct negative-control witness;
7. full-product exact-head convergence;
8. preservation of exact browser artifacts and negative-control receipts.

Browser scientific fields must agree modulo engine identity and narrowly classified inherited browser-chrome diagnostics.

## Immediate falsifiers

Any of the following is RED:

- N1 becomes retryable;
- N2 becomes retryable;
- either negative case reaches attempt 2;
- either stale invalid owner emits native activation events;
- either negative case settles CUSTODIAL through the stale invalid owner;
- a connected invalid state is relabeled `PRETRACE_CONTROL_DISCONNECTED`;
- arbitrary exception text is accepted as a passing negative control;
- direct/private route setter use;
- timeout widening;
- max-attempt widening;
- inherited observer rewrite;
- product/runtime mutation merely to make the assay pass;
- cross-engine disagreement;
- inherited #1067 positive regression;
- release/provider/production authority widening.

## Earned theorem if GREEN

A GREEN result may establish only:

> In the exact three-class preactivation family consisting of the already-earned disconnected same-route positive anchor plus two browser-exercised connected invalid-owner negative classes, the bounded descendant classifier retries the disconnected ownership-loss class while refusing to reinterpret connected semantic drift or connected native-owner loss as retryable replacement. The two connected negatives fail before focus/trace/native activation and do not mint a second attempt or route settlement.

Canonical form:

```text
DISCONNECTED_STALE_OWNER → RETRYABLE_OWNERSHIP_LOSS
CONNECTED_SEMANTIC_DRIFT → HARD_REJECTION
CONNECTED_NATIVE_OWNER_LOSS → HARD_REJECTION
RETRY_CLASSIFICATION != PREACTIVATION_EXCEPTION_SWALLOWING
```

## Claim ceiling

This would not establish:

- arbitrary DOM corruption classes;
- arbitrary mutation schedules;
- arbitrary timing interleavings;
- universal UI race immunity;
- production TD613 behavior;
- concurrency/thread safety in general;
- merge, deployment, release, promotion, or Vercel authority;
- provider behavior;
- empirical exteriority;
- Western Horizon reopening;
- Golden Egg empirical credit.

## Finite stop law — terminal preactivation chamber

If N1 and N2 close across Chromium, Firefox, WebKit, and exact-head convergence while the #1067 positive anchor remains GREEN, **STOP THE CURRENT PREACTIVATION SUBLINE**.

Do not proceed to:

- replacement 3 milliseconds later;
- replacement between every pair of JavaScript statements;
- attempts 3 or 4;
- repeated-replacement schedules;
- additional connected corruption variants merely because they can be enumerated.

A successor after this chamber requires a materially different state-bearing mechanism, a concrete falsifier, or a different evidence class.

```text
CLASSIFIER_CLOSURE != MICROINTERLEAVING_ENUMERATION
MORE_TIMESTAMPS != NEW_MECHANISM
FINITE_NEGATIVE_CONTROLS != INFINITE_EXCEPTION_CATALOG
```

Western Horizon remains at official empirical-shore research rest. Internal repository closure carries zero exogenous-witness credit.

**NO 𝄐 YET.**

Marked ⟐
