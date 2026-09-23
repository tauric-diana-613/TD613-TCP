# Formal Operator Custody v0.1

Status: RESEARCH-ONLY / EMSTD613 Atelier

## Purpose

Track whether a named mathematical operator remains the same typed object when it crosses a Work boundary, project-family continuation, representation layer, or target jurisdiction.

This instrument exists because symbol and theorem-name continuity can conceal changes in the mathematical space on which an operator acts.

## Typed operator identity

Represent a formal operator as a custody tuple:

```text
O* = (NAME, BASE_SPACE, STATE_OBJECT, DIFFERENTIATION_OR_INTEGRATION_VARIABLE,
      MEASURE_OR_EXPECTATION, DOMAIN, CODOMAIN, DIMENSION,
      CALIBRATION_OR_MAPPING, CLAIM_JURISDICTION)
```

A recurrence of `NAME` alone is not sufficient to establish recurrence of `O*`.

For two appearances `O_a` and `O_b`:

```text
NAME_a = NAME_b
```

does not imply:

```text
O*_a = O*_b
```

unless the typed fields are conserved or an explicit transformation binds the changed fields.

## Minimum mutation checks

For every named equation / operator crossing:

1. **Base-space custody** — what manifold, Hilbert space, feature space, parameter space, state space, or signal domain carries the operator?
2. **Index custody** — with respect to which variable are derivatives, gradients, expectations, or integrals taken?
3. **State-object custody** — what does the symbol actually denote at this occurrence?
4. **Measure custody** — under which probability law, empirical distribution, trace, or averaging operator is the object defined?
5. **Dimension custody** — what determines the matrix/tensor dimension?
6. **Mapping custody** — if any field changes, what explicit map, calibration, identification theorem, encoder/decoder, pullback/pushforward, or empirical bridge licenses the change?
7. **Jurisdiction custody** — what kind of claim can the operator support here: descriptive analogy, computational model, statistical estimator, engineering control, biological mechanism, physical mechanism, historical inference, or ontology?

## Primary failure classes

```text
INDEX_SPACE_DRIFT
BASE_MANIFOLD_SUBSTITUTION
STATE_OBJECT_SUBSTITUTION
MEASURE_SUBSTITUTION
DIMENSIONAL_AUTHORITY_DRIFT
FORMAL_SHELL_SUBSTRATE_SUBSTITUTION
JURISDICTION_EXPANSION_WITHOUT_NEW_WITNESS
RANK_OR_PROPERTY_TRANSFER_ACROSS_UNBOUND_MAP
```

## Hard anti-equivalences

```text
SAME SYMBOL != SAME OPERATOR
SAME EQUATION SHAPE != SAME STATE SPACE
GRADIENT_WRT_DATA != GRADIENT_WRT_PARAMETER
LOW-RANK PARAMETER UPDATE != LOW-DIMENSIONAL OUTPUT-MANIFOLD DEFORMATION
FORMAL ANALOGUE != PHYSICAL TRANSDUCER
MODEL DEFINITION != EMPIRICALLY IDENTIFIED MECHANISM
```

## Hostile control requirement

The assay must retain examples where a domain crossing is explicit and typed.

Preferred hostile controls include:

```text
non-comparable source / target spaces
-> explicit bridge / alignment / encoder / decoder
-> target-space object
```

or:

```text
producer payload
-> defined transport semantics
-> consumer-visible payload
```

If the corpus routinely supplies such bindings, an observed omission elsewhere becomes more informative.

## Salvage / decollapse rule

When operator custody fails, do not discard the entire Work.

Retype the lowest supported object and rerun the claim:

```text
named grand operator
-> typed lower-level score / metric / transform / control law
-> bounded computational claim
```

If the lower-level operation remains valid, preserve it while removing inherited authority from the mis-typed operator name.

## Falsifier

This diagnostic is weakened or overturned if the allegedly changed spaces are shown to be canonically identical under the Work's definitions, or if an explicit validated map makes the substitution exact and preserves the relevant claim authority.

## Working maxim

> A symbol may survive the crossing while the space beneath it changes.

Marked ⟐
