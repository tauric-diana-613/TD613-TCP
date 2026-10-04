# Claim Ceiling Propagation v0.1

Status: RESEARCH-ONLY / EMSTD613 Atelier

## Purpose

Track whether a bounded claim type survives later synthesis, conclusion, table closure, or cross-domain composition.

A local qualifier such as `analogue`, `simulation`, `model`, `candidate`, `hypothesis`, `specification`, or `proposal` is not self-enforcing. If the downstream closure forgets it, the Work can regain stronger authority without adding a new witness.

## Claim-state model

For each claim atom `c_i`, record:

```text
A_i = authority / claim class
W_i = independent witness support available at this point
C_i = inherited claim ceiling
Z_i = speech-act zone
```

Examples of authority classes:

```text
A1 = analogy / metaphor
A2 = computational or mathematical model
A3 = mechanism candidate / hypothesis
A4 = validated operational relation
A5 = empirically identified target-system mechanism
A6 = broad external-world / ontological claim
```

The numbering is ordinal only for local bookkeeping. It is not a universal scientific scale.

## Propagation rule

If a source zone explicitly limits a relation to analogy/model/specification status, downstream synthesis must inherit that ceiling unless a new witness is introduced that actually licenses the stronger target claim.

```text
C_{i+1} <= C_i
```

unless:

```text
DELTA_WITNESS > 0
and
NEW_WITNESS targets the expanded claim type
```

A new equation, additional prose, a theorem name, or reuse of the same measurement does not by itself count as `DELTA_WITNESS > 0`.

## Failure class

```text
LOCAL_CLAIM_DEMOTION
-> NO_NEW_TARGET_WITNESS
-> CLOSURE_REPROMOTION
```

Label:

```text
CLAIM_CEILING_ESCAPE_AFTER_LOCAL_DEMOTION
```

When the Work oscillates between high and low authority before returning to a stronger closure state, record:

```text
AUTHORITY_HYSTERESIS
```

This refines the earlier `FORMALISM_LAUNDERED_AUTHORITY_RATCHET`: global authority accumulation need not be sentence-by-sentence monotonic.

## Hostile control

A well-typed Work may keep a local ceiling through closure:

```text
PROMPT / SPECIFICATION
-> requested future implementation
-> no claim of execution
```

or:

```text
ANALOGUE MODEL
-> bounded analogue result
-> conclusion remains analogue / simulation claim
```

## Hard anti-equivalences

```text
ANALOGUE MATCH != TARGET-SYSTEM REALIZATION
SIMULATION SUCCESS != PHYSICAL IDENTIFICATION
SPECIFICATION != IMPLEMENTATION
LOCAL CAVEAT != GLOBAL CLAIM CEILING UNLESS PROPAGATED
SAME MEASUREMENT REUSED != NEW WITNESS
```

## Falsifier

A candidate ceiling escape fails if a new source-specific experiment, calibration, theorem with applicable premises, or validated transducer enters between the local demotion and the stronger closure and directly supports the expanded claim.

## Working maxim

> A caveat that does not travel can be laundered away by the conclusion.

Marked ⟐
