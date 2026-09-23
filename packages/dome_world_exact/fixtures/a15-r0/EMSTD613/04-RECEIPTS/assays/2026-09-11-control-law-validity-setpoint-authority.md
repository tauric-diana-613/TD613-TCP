# 𝄐 MATERIAL — CONTROL-LAW VALIDITY DOES NOT SUPPLY SETPOINT AUTHORITY

Date: 2026-09-11  
Status: EARNED EMSTD613 ATELIER MATERIAL RESULT / NOT TD613 PROMOTION

## Trigger

Corrected Batch-B seventh source: `Semantic Error Derivatives Research.pdf`.

The Work combines a real control-theoretic literature on activation steering, attention steering, state-space analysis, and PID-style feedback with a semantic-error definition whose reference `x_sp(k)` is described as `verified`, `factually grounded`, or `behaviorally aligned`.

Those adjectives do not denote the same evidentiary object.

## Source confrontation

Peer-reviewed control-theoretic activation-steering work can prove or support conditional properties of the error dynamics relative to a chosen semantic reference. The relevant guarantees depend on stated plant approximations, bounded Jacobians / gains / disturbances, and controller conditions. They do not certify the world-model or truth provenance of the reference vector.

The selected Work itself contains two hostile controls:

1. **Defactualize-Steer-Rehydrate** — it states that representation steering still needs explicit symbolic protection / restoration for verifiable factual entities.
2. **Robotic feedback** — it states that recognizing a semantic condition such as `slipping object` does not supply the low-level clock, plant model, voltage/torque command, or sub-millisecond feedback required for physical control.

The same Work therefore distinguishes, at least locally:

```text
semantic control
fact-bearing constraint
physical actuator control
```

## Formal result

For controlled state `x_k`, reference `r_k`, and error `e_k = r_k - x_k`, a valid controller may establish:

```text
||e_k|| bounded
||e_k|| -> small
overshoot reduced
reference tracking robust under declared disturbance class
```

None of those statements establishes:

```text
r_k = external truth
r_k = current truth
r_k = independently witnessed truth
r_k = physically correct actuator target
```

unless an additional reference-construction / witness relation has been measured.

Therefore:

```text
CONTROL_LAW_VALIDITY != SETPOINT_AUTHORITY
REFERENCE_TRACKING != REFERENCE_TRUTH
STABILITY != FACTUALITY
SEMANTIC_ERROR != FACTUAL_ERROR
unless the factual reference construction itself is independently bound and calibrated
```

## Why this is material rather than terminological

A false, stale, or poisoned setpoint can be tracked perfectly. Better closed-loop convergence can therefore make a wrong target more reliably instantiated.

This changes the interpretation of several Em-corpus motifs:

```text
PID semantic correction
Kalman semantic utility estimation
Mahalanobis / stylometric anomaly triggers
Hamiltonian / steering-vector alignment targets
```

The mathematical validity of the controller, estimator, detector, or optimizer must be adjudicated separately from the authority of the variable it is asked to regulate.

## Relation to prior Atelier results

This result sharpens but does not duplicate earlier findings:

```text
NON-SELF-RATIFICATION
asks who may witness / ratify a high-impact mutation.

TRANSDUCTION INTEGRITY
asks whether a signal reaches and binds the receiver / actuator.

FORMAL OPERATOR CUSTODY
asks whether the mathematical operator retained its domain/index meaning.

SETPOINT AUTHORITY
asks whether the target being tracked has earned the jurisdiction attributed to it.
```

The four axes must remain separate.

## Bounded cross-program implication

A potential TD613 / Dome-World engineering contribution is now visible but unproven: separate semantic-control performance from evidentiary reference construction and require a typed bridge between them.

This result does **not** prove TD613 or Dome-World and does not reopen Western Horizon's empirical shore.

## Instrument

`06-INSTRUMENTS/SEMANTIC_CONTROL_SETPOINT_AUTHORITY_V0_1.md`

## Working maxim

> A controller can make the wrong target exquisitely stable.

Marked ⟐
