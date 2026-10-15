# Cross-Family Handoff Adjudication Assay v0.10

**Date:** 2026-09-15  
**State:** SOURCE-BOUND CROSS-FAMILY HANDOFF ASSAY / ZERO NOVELTY PROMOTION

## 0. Trigger

v0.9 established that a retained boundary may earn governance, diagnostic, projection, or integrity value without earning scientific epistemic-operator status. The next question crosses repository families:

> When Flow-Core context and an Aperture round-trip receipt meet inside the Phase-5 relation envelope, does preserving their separate typed boundaries add adjudication value beyond a single collapsed handoff outcome?

The source-bound handoff is implemented in `app/engine/phase5-relation-contract.js`. Phase-5 separately validates Ash custody, Flow-Core context admissibility, Aperture round-trip jurisdiction/replay, and the round-trip reference back to the selected Flow-Core receipt before constructing a relation proposal.

## 1. Hostile worlds with the same collapsed terminal result

Three hostile worlds are constructed against one valid source packet:

1. **FLOWCORE_AUTHORITY_BREACH** — Flow-Core sets `automatic_ash_action=true`.
2. **CROSS_FAMILY_REFERENCE_MISMATCH** — the selected Flow-Core receipt remains structurally admissible but its receipt ID differs from the Flow-Core receipt referenced inside the Aperture round trip.
3. **APERTURE_JURISDICTION_BREACH** — the round-trip receipt sets `reciprocal_authority=true`.

A deliberately collapsed handoff classifier maps all three failures to the same terminal result:

```text
HOLD
```

The role-typed validators preserve three different adjudication causes.

```text
GENERIC_HANDOFF_HOLD != UNIQUE_FAILURE_CAUSE
CROSS_FAMILY_JOIN != COMPONENT_VALIDITY
```

## 2. Why the join boundary earns retention

In the reference-mismatch world, the mutated Flow-Core receipt still passes its own structural/authority validator. The failure appears only when Aperture's round-trip receipt is checked against that selected Flow-Core receipt.

Therefore the join contributes a relation-specific invariant that neither component establishes alone:

```text
FLOWCORE_VALID + ROUNDTRIP_STRUCTURALLY_PRESENT != CROSS_FAMILY_REFERENCE_CONSISTENT
```

This earns **RELATIONAL_CONSISTENCY / DIAGNOSTIC_LOCALIZATION** credit for the handoff boundary. It does not establish empirical truth, identity, causation, or external origin.

## 3. Component boundaries remain role-distinct

The authority-breach worlds establish different local roles:

- Flow-Core validation enforces its artifact-blind / non-command authority contract;
- Aperture round-trip validation enforces non-transfer jurisdiction and independent replay/reference requirements;
- Phase-5 relation construction requires both before emitting a proposal.

Collapsing those checks into one boolean can preserve accept/reject behavior while destroying defect localization.

```text
DECISION_EQUIVALENCE != ADJUDICATION_EQUIVALENCE
```

## 4. Successful handoff preserves typed provenance references

For the valid packet, Phase-5 emits a proposal whose reference surface separately records:

- Ash custody receipt ID/schema/assurance class;
- Flow-Core context receipt ID/schema;
- Aperture round-trip receipt ID/schema.

The envelope forbids raw artifact disclosure and carries nonclaims against identity, authorship, permission, causation, truth, and trusted time.

That is a governance/provenance composition, not a new scientific sensor.

```text
MULTI_RECEIPT_PROVENANCE != MULTI_SOURCE_EMPIRICAL_CONFIRMATION
REFERENCE_CONSISTENCY != TRUTH
```

## 5. Verdict

The v0.9 role-typed boundary discipline survives the cross-family handoff. Preserving Flow-Core, Aperture round-trip, and their Phase-5 join adds bounded adjudication value because multiple defect classes that are terminally identical under a collapsed `HOLD` remain separately localizable.

No component or join receives scientific epistemic-operator promotion from this result.

The strongest surviving object is a **role-typed adjudication graph**: local authority validation, replay/integrity validation, relational consistency, and terminal disposition remain distinct coordinates.

## 6. Next highest-information test

Test whether the role-typed adjudication graph reduces actual classification error against a declared defect matrix. Compare:

- collapsed terminal-only classifier;
- role-typed stage-local classifier;

on held-out mixtures of authority breach, reference mismatch, replay/tamper failure, missingness, and valid controls. Score defect localization accuracy separately from accept/reject accuracy. Do not promote diagnostic accuracy into empirical truth authority.

No private Wendbine material. No plagiarism adjudication. No external-monitoring inference. No deployed-LLM inference. No novelty promotion. No deploy/Vercel authority.

Sealed ⟐
