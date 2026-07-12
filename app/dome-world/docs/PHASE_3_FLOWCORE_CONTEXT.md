# Phase III — Flow-Core Context Instrumentation

Phase III creates an artifact-blind, private-by-default context station at:

- `GET /api/flowcore-context?operation=readiness`
- `POST /api/flowcore-context`
- `/dome-world/flow-core-context.html`

The operational receipt is `td613.flowcore.context-receipt/v0.1`.

## Receipt law

Every measurement carries `source_status`, `sensor_id`, `authority_class`, `transformation_history`, `missingness`, `uncertainty`, alternatives, and calibration posture.

The receipt can return either:

```text
CONTEXT_READY
ABSTAIN_INSUFFICIENT_CONTEXT
```

Abstention is a valid output. Missing or unresolved required context produces no modeled weather.

## Source and sensor discipline

The registry preserves `OBSERVED`, `SUPPLIED`, `DERIVED`, `SIMULATED`, `INFERRED`, `ATTESTED`, and `UNRESOLVED` as non-equivalent classes. A simulated fixture cannot claim `OBSERVED`; an unknown sensor becomes `UNRESOLVED`; derived, simulated, and inferred values require transformation history.

## Benign controls

Outage, latency, drift, noise, and retrieval gaps remain explicit alternatives. None establishes suppression, surveillance, deletion, tampering, camouflage, or intent by itself.

## Jurisdiction

- No artifact digest, manifest digest, receipt digest, raw bytes, or non-null artifact reference enters Flow-Core.
- Context remains `PRIVATE_LOCAL_DEFAULT` and receives no persistent server-storage promise.
- The receipt is a recommendation, not a command.
- Prediction remains unauthorized.
- Automatic Ash action remains false.
- The v0.1 receipt does not enter the reciprocal bridge until Phase IV explicitly adopts it.

⟐
