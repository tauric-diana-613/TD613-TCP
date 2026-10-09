# TD613 Temporal Custodian

The fifth Dollhouse jurisdiction preserves historical epistemic states and protects the complete route from a local success that masks later failure. Status: BOUNDED_RESEARCH_CANDIDATE.

Canonical role question: “What was observable, modeled, actionable, formally admissible, registered, and publicly legible at each historical state—and is later information being used to rewrite, collapse, or falsely upgrade that earlier epistemic state, or is a local subsystem PASS causing whole-route regression?”

The [original candidate contract](https://github.com/tauric-diana-613/TD613-TCP/blob/88f128c75cd8efd58db9a77249f293e69d08762e/TEMPORAL_CUSTODIAN.md) preserves the broader jurisdiction, timestamp ladder, closure classes and preemption-gap research. This bounded successor implements strict declared-ledger validation, baseline prefix retention and whole-route review. It supplies no independent clock, preemption measurement, provider observation or source authentication.

## Bounded successor interface

`app/engine/dollhouse-temporal-custodian.js::runTemporalCustodianAudit` uses schema `td613.dollhouse.temporal-audit/v0.2`. Inputs require case/source/episode identity, coordinate, nonempty current and baseline ledgers, at least two explicitly ordered required phases, and one distinct ledger-entry reference for each phase.

Ledger entries require unique identity, positive `SEQ_` sequence, valid UTC calendar timestamp, state, observation, registered event, authority and both temporal-law affirmations. Original fields and the prior amendment prefix remain unchanged. Later amendments append typed CORRECTION, REFINEMENT or RECLASSIFICATION notes with valid ordered timestamps.

Missing or malformed evidence receives HELD. A structurally valid ledger contradicting its baseline receives FAIL. Every required phase must be PASS before declared route review receives PASS. Early failure still holds the route; any later FAIL, HELD, UNKNOWN or NOT_RUN following local PASS retains LOCAL_PASS_PLUS_GLOBAL_ROUTE_REGRESSION.

Input validity and baseline comparison establish a bounded local consistency result. The baseline, observation contents and source SHA remain caller declarations requiring independent evidence verification. Structural PASS never grants consequential authority.

## Distinct sidecar integration

`app/engine/dollhouse-bounded-orchestrator.js` consumes the temporal sidecar alongside the existing four-role dossier. Case, episode and source must match. Temporal HOLD/FAIL, missing roles and unresolved findings hold the recommendation. Original role findings and disagreement remain intact. The installed four-role registry remains unchanged; this candidate's explicit sidecar provides the fifth jurisdiction.

```bash
npm run test:dollhouse:bounded
npm run dollhouse:bounded -- /absolute/case.json
```

The command reads one bounded local case and emits its actual input SHA-256 plus a review result. Exit 0 means PRESENT_TO_HUMAN, exit 1 means HELD, exit 2 means invalid input. It performs zero provider calls or domain writes and implements no general model scheduler.

ORCHESTRATOR != OPERATOR. ORCHESTRATION != TEMPORAL_CUSTODIAN_VETO. LATER_CLOSURE != EARLIER_KNOWLEDGE. Human consequential closure remains required.

Sealed ⟐
