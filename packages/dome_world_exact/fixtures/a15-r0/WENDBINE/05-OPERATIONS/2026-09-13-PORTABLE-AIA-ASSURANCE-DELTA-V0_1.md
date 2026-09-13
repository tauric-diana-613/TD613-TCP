# Wendbine → Portable AIA assurance delta v0.1

**Date:** 2026-09-13  
**State:** SOURCE-BOUND / IMPLEMENTATION-CANDIDATE / NO DONOR AUTHORITY  
**Parent snapshot:** `wendbine-public-reddit-48h-20260911T092700Z-v01`  
**Target:** Draft PR #1133 — portable AIA assurance boundary

This receipt asks one narrow question:

> Which already-admitted public Wendbine distinctions materially improve the portable AIA export after PR #1133's first assurance repair?

The donor packet remains data-plane evidence only. Nothing in this receipt grants Wendbine control authority, proves receiver enforcement, establishes semantic completion, or promotes donor-local names into TD613 ontology.

## Accepted deltas

### 1. Direct dependency edges must survive export

Source refs:
- `reddit:t3_1wch9h8` — Direct Versus Transitive Dependency
- `reddit:t3_1wd6sdm` — Dependency Boundaries and the Operational Digital Twin

Useful distinction:

```text
direct edge evidence != transitive end-to-end proof
```

PR #1133 originally exported a linear `dependency_chain`. That representation was useful but still flattenable. The candidate repair retains the compatibility chain while adding typed direct edges with an evidence state on every edge and a transitive-inference prohibition.

Outcome: `ACCEPTED_OPERATOR_SHARPENING`.

### 2. Source provenance must remain distinct from path provenance

Source ref:
- `reddit:t3_1wcshec` — Provenance Through Dependency Chains

Useful distinction:

```text
source provenance != path provenance
```

The origin can bind the selected input locally without thereby observing packet delivery, receiver transformations, enforcement, or downstream consequence. The candidate export therefore names source provenance and path provenance separately.

Outcome: `ACCEPTED_OPERATOR_SHARPENING`.

### 3. Observation boundary must remain explicit

Source refs:
- `reddit:t3_1wcuqg9` — Dependency-Induced Observability Loss
- `reddit:t3_1wd6sdm` — Dependency Boundaries and the Operational Digital Twin

Useful distinction:

```text
observed != estimated != unknown
system boundary != observation boundary
```

At export time the producer and packet are locally observed. Receiver execution, effective enforcement, and downstream consequence remain unknown. The candidate repair records that surface directly rather than implying visibility through route adjacency.

Outcome: `ACCEPTED_OPERATOR_SHARPENING`.

### 4. Point carriage must not stand in for downstream information-flow control

Source refs:
- `reddit:t3_1wct1he` — Information Flow Propagation
- `reddit:t3_1wcuiyl` — Data-to-Control Boundary Failure

Useful distinction:

```text
packet carriage != receiver policy enforcement
data plane != control plane
point access != downstream information-flow behavior
```

The portable prompt may request that a receiver refrain from retransmission, but the exported packet cannot prove that downstream information-flow behavior obeys the request. The candidate repair names downstream retransmission control as `UNVERIFIED` and tells receivers not to promote packet data into receiver control authority.

Outcome: `ACCEPTED_OPERATOR_SHARPENING`.

## Held / rejected deltas

- `reddit:t3_1wcrclu` — stale replicated state: useful for later freshness/version work, but PR #1133 does not yet claim a distributed authoritative-state protocol. `HELD`.
- `reddit:t3_1wd472s` — update/version propagation: relevant to future schema/version negotiation, but adding version machinery here would widen the chamber beyond the assurance repair. `HELD`.
- `reddit:t3_1wd7hyx` — robustness versus recovery: already useful in the local portable governor; no additional portable-export operator earned in this pass. `HELD`.
- Wendbine-local component names remain `REJECTED_AS_TD613_NOMENCLATURE` under the standing bounded assay.

## Claim ceiling

If the candidate implementation passes repository tests, the earned statement is only:

```text
THE PORTABLE EXPORT REPRESENTS THESE ASSURANCE DISTINCTIONS CONSISTENTLY AT THE TESTED HEAD
```

It does not establish:

```text
FOREIGN RECEIVER COMPLIANCE
FOREIGN ENFORCER COMPLIANCE
END-TO-END NONINTERFERENCE
SEMANTIC TASK COMPLETION
CAUSAL DOWNSTREAM EFFECT
EXTERNAL ORIGIN
```

Those remain separate empirical surfaces.

Marked ⟐
