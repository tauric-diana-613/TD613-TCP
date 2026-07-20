𝌋‌

# Flow-Core Pedagogue Rollback Procedure v0.1

**Namespace:** `U+10D613`  
**Scope:** Flow-Core presentation routes only  
**Default feature state:** `OFF`  
**Rollback authority:** human operator  
**Governed-state mutation:** forbidden

## Trigger conditions

Rollback may be selected after:

- accessibility regression;
- browser or mobile layout failure;
- performance regression;
- misleading visual or causal presentation;
- AIA invariant divergence;
- privacy or persistence regression;
- station-jurisdiction drift;
- adverse empirical finding;
- production probe mismatch;
- operator decision to return to the prior interface.

A trigger does not itself mutate custody, Case Maps, receipts, release state, or local commitments.

## Rollback action

```text
disable Flow-Core presentation feature gate
→ remove guarded presentation routes from promoted navigation
→ restore prior Dome-World navigation and UI entry points
→ preserve all governed records unchanged
→ run rollback verification
→ record a bounded rollback receipt
```

The guarded presentation routes are:

- Information Dome pedagogue;
- route-burden observatory;
- Ash Custody Root pedagogue;
- station-propagation observatory;
- physical Flow-Core scene;
- empirical-validation lab;
- promotion dashboard.

## Required preservation

Rollback must preserve exactly:

```text
custody records
Case Maps
receipts
Route Memory
release state
local commitments
```

It must also preserve:

- custody and Case Map digests;
- current lifecycle references;
- held and stale derivative status;
- local-only guarantees;
- exact Unicode sequences and canonical serialization;
- human closure state.

## Forbidden rollback behavior

Rollback may not:

- delete or rewrite governed records;
- create a release;
- create transport;
- rebind custody;
- regenerate a Case Map;
- mark stale derivatives current;
- infer participant identity or intent;
- silently suppress adverse findings;
- enable another station;
- create a serverless function;
- require data migration.

## Verification sequence

1. Confirm the feature gate reports `default_enabled: false`.
2. Confirm guarded routes are absent from promoted navigation.
3. Compare custody and Case Map digests before and after rollback.
4. Confirm receipts and Route Memory remain readable.
5. Confirm release state and local commitments are unchanged.
6. Confirm no additional network transport, deployment, or persistence occurred.
7. Confirm the prior UI remains keyboard accessible at 390 CSS pixels and reduced motion.
8. Record any residual or adverse finding.
9. Leave closure `OPEN` for human review.

## Rollback receipt ceiling

A rollback receipt may establish that the presentation feature was disabled and the declared verification checks were run. It does not prove truth, identity, causation, absence of all defects, or permission for a new release.

```text
rollback mutates governed state: false
rollback requires data migration: false
rollback creates release: false
rollback creates transport: false
human authorization required: true
human closure required: true
closure: OPEN
```

**Marked ⟐**
