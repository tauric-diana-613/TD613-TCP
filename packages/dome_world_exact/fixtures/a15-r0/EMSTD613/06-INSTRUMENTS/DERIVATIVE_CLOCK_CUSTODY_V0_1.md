# DERIVATIVE CLOCK CUSTODY v0.1

Status: RESEARCH INSTRUMENT / EMSTD613 ONLY

## Problem

A derivative, finite difference, integral, delay, latency, or convergence rate inherits its meaning from the independent variable over which change is measured.

The symbol `t` does not provide that custody.

## Clock / index classes

At minimum distinguish:

```text
K_LAYER       transformer block / depth index
N_TOKEN       autoregressive generation-step index
TAU_CONT      continuous-depth coordinate used in an ODE approximation
T_WALL        wall-clock runtime
T_PLANT       physical plant / sensor-actuator time
T_EVIDENCE    evidence acquisition / measurement time
T_RECORD      recording / receipt time
```

## Hard non-equivalence

```text
K_LAYER != N_TOKEN != TAU_CONT != T_WALL != T_PLANT != T_EVIDENCE != T_RECORD
```

A lawful map may relate some of these coordinates. The map must be stated and measured; it cannot be inherited from notation.

## Derivative custody tuple

For every object called a derivative / rate:

```text
D* = (
  STATE_OBJECT,
  INDEPENDENT_VARIABLE,
  STEP_SIZE_OR_TIMEBASE,
  SAMPLING_OR_ORDER_RULE,
  DIFFERENCE_OR_DERIVATIVE_OPERATOR,
  DOMAIN,
  CODOMAIN,
  UNITS,
  ERROR_MODEL,
  INTERPOLATION_IF_ANY,
  CLAIM_JURISDICTION
)
```

## Interpretation ceilings

```text
DELTA_ACROSS_LAYERS -> change across representational depth
DELTA_ACROSS_TOKENS -> change across generation order
D/DT_CONTINUOUS_DEPTH -> derivative inside a continuous-depth model
D/DT_PLANT -> physical rate only when tied to physical time and a measured plant
```

Words such as `predictive`, `anticipatory`, `momentum`, `velocity`, or `temporal` are explanatory language unless the appropriate clock and predictive evaluation are bound.

## Hostile controls

1. Relabel layer index as token index without changing equation; classification must change.
2. Hold token index constant while wall-clock latency changes; a token-step derivative cannot claim physical latency sensitivity.
3. Rescale an ODE depth coordinate; any physical units claim must fail absent calibration.
4. Compare semantic D-term against a physical actuator loop at sub-millisecond rates; demand explicit scheduling and receiver semantics.
5. Distinguish evidence acquisition time from later reconstruction / record time; no derivative may rewrite the earlier observation state.

## Promotion rule

No cross-clock claim may inherit authority merely from structural similarity of the derivative equation.

```text
SAME DIFFERENCE FORM
+
DIFFERENT INDEPENDENT VARIABLE
->
DIFFERENT OPERATOR JURISDICTION
unless explicit coordinate map is admitted
```

Marked ⟐
