# 𝄐 MATERIAL — DERIVATIVE AUTHORITY IS CLOCK-INDEXED

Date: 2026-09-11  
Status: EARNED EMSTD613 ATELIER MATERIAL RESULT / NOT TD613 PROMOTION

## Trigger

`Semantic Error Derivatives Research.pdf` uses derivative / rate language across at least four distinct coordinates:

```text
transformer layer index k
-> PID Steering error difference e(k)-e(k-1)

autoregressive generation step t
-> COMPASS risk / attention feedback

continuous-depth coordinate t
-> state-space / ODE treatments of attention

physical plant time
-> robotics / actuator feedback
```

The Work sometimes describes cross-layer difference as a `temporal derivative` and as predictive / anticipatory damping. Later, its robotics section explicitly states that an LLM lacks the clock / temporal derivative tracking needed for sub-millisecond physical stability and delegates that work to a classical low-level controller.

This provides a same-Work hostile control against clock collapse.

## Material result

A derivative operator does not carry its jurisdiction through notation alone.

Let:

```text
D_chi e = change of e with respect to independent coordinate chi
```

Then:

```text
chi = K_LAYER
!= chi = N_TOKEN
!= chi = TAU_CONTINUOUS_DEPTH
!= chi = T_WALL
!= chi = T_PLANT
```

Therefore:

```text
SAME DERIVATIVE SHAPE != SAME DERIVATIVE OPERATOR
SAME SYMBOL t != SAME CLOCK
LAYERWISE SLOPE != WALL-CLOCK VELOCITY
TOKENWISE TREND != PHYSICAL PLANT RATE
CONTINUOUS-DEPTH MODEL TIME != EMPIRICAL CLOCK TIME
```

unless an explicit coordinate map and calibration bind the two.

## Consequence for project-family reading

This sharply improves the interpretation of earlier Em-corpus passages:

- `PID semantic recovery`: derivative may be meaningful over discrete semantic steps without becoming a physical-time derivative.
- `Quantum Tensor Bridge`: `de/dt` inside a steered Hamiltonian notation requires a declared state and clock; formal resemblance to physical dynamics cannot donate physical time authority.
- `Cognitive Time`: neural, phenomenological, synchronization, quantum-filtering, and physical-clock variables cannot be merged merely because each is called `time`.
- DSP / robotics controls remain strong precisely because their clocks are physically anchored.

## Relation to prior formal-operator custody

This is a specialization with independent practical bite:

```text
FORMAL_OPERATOR_CUSTODY
-> asks which variable an operator acts over

DERIVATIVE_CLOCK_CUSTODY
-> forces explicit temporal / ordinal / depth-coordinate identity and units
```

## Instrument

`06-INSTRUMENTS/DERIVATIVE_CLOCK_CUSTODY_V0_1.md`

## Ceiling

This result is methodological. It establishes no physical theory of time and does not reopen Western Horizon.

## Working maxim

> Before asking what the derivative predicts, ask what its clock is allowed to mean.

Marked ⟐
