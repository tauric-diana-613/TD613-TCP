𝌋‌⟐

# A15-R0 · Loom-Informed Route-Pair Preregistration · Burden v0.1

Status: **FROZEN BURDEN / RESEARCH-ONLY / TEMPORAL SELECTION FIREWALL**

## Positive burden

One admissible preregistration must prove:

```text
exact operational measurements at freeze = 0
Loom context status = BOUND_CONTEXT
route tuple = frozen
preregistration empirical credit = 0
```

A later complete episode may adjudicate only if all exact operational measurements are strictly later than the freeze and the entire route tuple remains byte-equivalent in meaning:

```text
episode_id
departure_id
custody_id
comparison_frame_id
control_route_id
protected_route_id
control_return_id
protected_return_id
```

The later parent acquisition result may be HELD, FAILED, or CANDIDATE according to the #992 measurement law. The preregistration itself contributes zero credit and may never upgrade that result.

## Hostile burden

The chamber must reject:

1. post-measurement preregistration;
2. context recorded after the route-pair freeze;
3. control/protected route swap after freeze;
4. comparison-frame drift after freeze;
5. measurement timestamp before or equal to freeze;
6. missing operational measurement timestamp;
7. malformed freeze timestamp.

## Non-equivalences

```text
CONTEXT_INFORMED_SELECTION != EMPIRICAL_EVIDENCE
PREREGISTRATION != MEASUREMENT
FROZEN_ROUTE_PAIR != MATCHED_RETURN_WITNESS
TEMPORAL_ORDER_PROOF != THRESHOLD_PASS
ROUTE_PAIR_SELECTION != GOLDEN_EGG_EARNED
POSTHOC_RESELECTION != ADMISSIBLE MATCHING
```

No empirical episode is created by this burden. It tests only whether future data could enter a predeclared comparison frame without post-hoc route selection.

Frozen ⟐
