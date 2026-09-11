# SEMANTIC CONTROL SETPOINT AUTHORITY v0.1

Status: RESEARCH INSTRUMENT / EMSTD613 ONLY

## Question

When a semantic-control system defines an error and proves or empirically demonstrates stable reference tracking, what authority—if any—has been earned for the reference itself?

## Minimal model

Let:

```text
x_k = controlled model state
r_k = declared reference / setpoint
e_k = r_k - x_k
u_k = controller output
W = witness / provenance construction mapping from claimed external fact or policy to r_k
```

A control result can establish properties such as boundedness, convergence, overshoot reduction, or robustness of `e_k` under declared assumptions.

It does not, by itself, establish:

```text
r_k = external truth
r_k = current truth
r_k = safe policy
r_k = lawful objective
r_k = physically realizable target
W = calibrated or independent witness
```

## Hard non-equivalences

```text
REFERENCE_TRACKING != REFERENCE_TRUTH
STABILITY != FACTUALITY
LOW_SEMANTIC_ERROR != LOW_EXTERNAL_FACTUAL_ERROR
BEHAVIORAL_ALIGNMENT != FACTUAL_CORRECTNESS
CONTEXT_RELIANCE != CONTEXT_TRUTH
MODEL_CONFIDENCE != WITNESS AUTHORITY
CONTROLLER ROBUSTNESS != SENSOR / REFERENCE CALIBRATION
```

## Required custody tuple

For every controlled semantic reference, record:

```text
R* = (
  REFERENCE_NAME,
  STATE_SPACE,
  REFERENCE_CONSTRUCTOR,
  SOURCE_OR_WITNESS,
  SOURCE_TIME,
  CALIBRATION,
  UPDATE_POLICY,
  ERROR_METRIC,
  CONTROL_CLOCK,
  CLAIM_JURISDICTION,
  FAILURE_FALLBACK
)
```

Missing fields must remain missing; they cannot be inferred from controller performance.

## Hostile tests

A candidate semantic controller should be tested against at least:

1. **False but geometrically coherent reference** — controller should track well while factual score remains wrong.
2. **Stale reference** — reference was once supported but external state changed.
3. **Adversarial reference constructor** — witness-to-reference mapping is poisoned while the controller remains stable.
4. **Conflicting witnesses** — multiple evidence channels disagree.
5. **Context-is-wrong control** — supplied prompt context is internally clear but factually false.
6. **Fact/style interference** — steering improves target style while altering protected factual entities.
7. **Witness outage** — controller continues operating after external validation becomes unavailable.

## Promotion rule

A semantic-control result may be promoted from `TRACKING_VALIDATED` toward `FACTUAL_CONTROL_CANDIDATE` only when the reference constructor and witness relation are separately measured.

```text
TRACKING_VALIDATED
+
REFERENCE_PROVENANCE_VALIDATED
+
MEASUREMENT_CALIBRATED
+
CLAIM_CEILING_PRESERVED
->
FACTUAL_CONTROL_CANDIDATE
```

Even then, `CANDIDATE` is not universal factual certification.

## Positive design implication

Separating semantic-control state from fact-bearing state permits a useful architecture:

```text
STEERABLE SEMANTIC PLANE
<typed transducer>
WITNESS / FACT PLANE
```

This instrument does not require either plane to be metaphysically privileged. It requires only that control authority and evidentiary authority not be silently conflated.

Marked ⟐
