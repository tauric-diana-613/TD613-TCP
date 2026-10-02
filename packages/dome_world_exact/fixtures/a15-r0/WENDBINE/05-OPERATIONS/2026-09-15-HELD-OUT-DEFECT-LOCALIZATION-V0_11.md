# TD613 / Wendbine — Held-Out Defect Localization v0.11

## Question

Does role-typed stage-local adjudication improve **defect localization** on a held-out mutation matrix while preserving the same binary accept/reject behavior as a collapsed terminal-only handoff classifier?

## Held-out discipline

The three v0.10 authored hostile worlds are excluded from this scoring pass:

- Flow-Core authority breach
- Flow-Core ↔ Aperture reference mismatch
- Aperture reciprocal-jurisdiction breach

v0.11 instead uses five different defect families plus one valid control:

1. Ash custody digest tamper
2. Flow-Core artifact-blindness breach
3. Aperture round-trip schema breach
4. Aperture independent replay failure
5. Phase-5 route-contract failure
6. Valid handoff control

## Competing classifiers

### Collapsed terminal-only classifier

Runs the full relation proposal and reports only:

- `PROCEED`
- `HOLD`

This is sufficient for binary disposition but deliberately discards defect identity.

### Role-typed stage-local adjudicator

Evaluates the same handoff through typed boundaries and reports the first localized failure family:

- `ASH_CUSTODY_INTEGRITY`
- `FLOWCORE_CONTEXT_ADMISSIBILITY`
- `APERTURE_ROUNDTRIP_SCHEMA`
- `APERTURE_ROUNDTRIP_REPLAY`
- `PHASE5_RELATION_COMPOSITION`
- `VALID_HANDOFF`

## Score separation

The assay scores two tasks independently:

- **accept/reject accuracy**
- **defect-localization accuracy**

The bounded expected result is deliberately asymmetric:

- terminal-only accept/reject accuracy = 1.0
- role-typed accept/reject accuracy = 1.0
- terminal-only defect-localization accuracy = 0.0 across defect rows
- role-typed defect-localization accuracy = 1.0 across defect rows

The scientific point is therefore not that the role-typed path rejects more bad objects. It rejects the same bad objects while retaining more actionable information about **where** the contract failed.

## Laws

`ACCEPT_REJECT_ACCURACY != DEFECT_LOCALIZATION_ACCURACY`

`SAME_BINARY_DECISION != SAME_ADJUDICATION_RESOLUTION`

`HELD_OUT_AUTHORED_MATRIX != EXTERNAL_EMPIRICAL_VALIDATION`

`LOCALIZATION_GAIN != TRUTH_GAIN`

`LOCALIZATION_GAIN != SCIENTIFIC_OPERATOR_PROMOTION`

`INTEGRITY_DEFECT != AUTHORITY_DEFECT`

`SCHEMA_DEFECT != REPLAY_DEFECT`

`COMPONENT_VALIDITY != COMPOSITION_VALIDITY`

## Boundary

This remains a source-bound repository assay over authored fixtures. The held-out matrix is held out from v0.10's three-world construction, but it is still authored inside the same repository research program. It therefore provides bounded diagnostic evidence, not external empirical validation, deployed-LLM inference, or field novelty.

## Next test

Blind defect labels before adjudication and generate the mutation schedule from a preregistered matrix independent of the classifier implementation. Repeat across multiple mutation instances and estimate localization performance with uncertainty rather than a single deterministic point score.

Sealed ⟐
