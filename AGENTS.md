# TD613 Agent Entry Contract

This repository contains product surfaces and shared engines. Before materially redesigning a UI, workflow, ontology, route, custody boundary, or consequential action path, check whether the work should pass through the Flow-Core Pedagogue Design Gate.

## Pedagogue shortcut

Primary implementation:

- `app/engine/pedagogue-design-gate.js`
- `app/engine/pedagogue-practice-fixture.js`
- `app/engine/flowcore-pedagogue-core.js`
- `app/engine/flowcore-pedagogue-aia.js`
- `app/engine/flowcore-pedagogue-route-memory.js`
- `app/engine/flowcore-route-burden.js`

Preferred agent commands from repository root:

```bash
npm run pedagogue:design -- <fixture.json>
npm run test:pedagogue
```

The direct runner remains available when npm script discovery is unavailable:

```bash
node scripts/run-pedagogue-design-gate.mjs <fixture.json>
```

Canonical explanation:

- `PEDAGOGUE.md`
- `docs/PEDAGOGUE_DESIGN_GATE.md`
- `docs/CANONICAL_PRACTICE_FIXTURE.md`

## When to reach for it

Use the Design Gate when a change materially alters one or more of:

- the order in which a person encounters consequence, terminology, rest, or exit;
- AIA route structure or child/custodian/auditor/technical projections;
- route burden, dependencies, projection crossings, gluing obstruction, or route memory;
- custody, release, refusal, or human-closure sequencing;
- a high-consequence mutation path or Cistern Law boundary;
- a shared design pattern that may deserve promotion from one product into reusable infrastructure;
- a consequential workspace that needs a harmless practice case to exercise its real route.

Ordinary copy edits, typo fixes, non-semantic styling, and isolated mechanical repairs do not need a new Pedagogue fixture unless they change those properties.

## Canonical Practice Fixture rule

When a complicated workspace needs onboarding, calibration, or a known-ground-truth route witness, prefer a **Canonical Practice Fixture** over a detached demo world when the real route can be exercised safely.

The product-facing phrase should be child-legible: **Practice case**, **Practice inhabitant**, or a product-native equivalent. **Calibration phantom** is research/test language for the same object when it is used to measure route reconstruction.

A practice fixture must be manifestly fictional and must not fabricate evidence. Loading it changes labels/fictional inputs only: no retrieval, no receipt creation, no custody write, no domain mutation, and no authority grant. Later traversal may perform explicitly gestured read-only retrieval or reversible practice-custody writes only when the fixture declares them safe. Domain mutation and evidence/consequence authority remain closed.

Do not build a second simplified demo route and then use it as evidence about production. The practice case must declare the real expected route, preserve rest/exit, keep route memory, and require human closure.

## Governing design law

The Design Gate is a recommendation-and-verification instrument, not an autonomous designer.

- consequence before ontology;
- child-legible NOW / WHY / EXACT where human consequence is involved;
- rest and exit remain available without penalty;
- AIA routes may be non-equivalent while governed invariants remain stable;
- same endpoint does not erase route history;
- route burden is a comparative structural hypothesis, never a user diagnosis;
- no user-level score;
- no automatic redesign command;
- no automatic Ash action;
- no automatic release or station mutation;
- human closure remains required.

## Product learning may hydrate shared core

Product work may reveal a generic mechanism worth promoting into Pedagogue/AIA/Cistern/Aperture infrastructure. Promotion is allowed when all of the following hold:

1. the mechanism survives more than one proving fixture or has a clear product-independent invariant;
2. the shared implementation contains no product-specific names, IDs, labels, or business rules;
3. existing authority boundaries remain equal or narrower;
4. tests distinguish the generic operator from the product fixture that taught it;
5. CI scope widens honestly when shared core changes.

Do not emboss `Giving`, `Vault`, `Research Dossier`, `Campaign Deputy`, Bikini Bottom, an Ash fixture name, or another product taxonomy into Pedagogue core merely because that product supplied the proving case.

## AIA and Cistern relationship

AIA is repository information architecture. TD613 supplies governance. Cistern Law is an AIA-derived defensive boundary for consequential information and mutation routes.

Cistern may consume Pedagogue route-memory output, but observed context never grants release authority. Aperture context is recommendation/context only unless a separate reviewed contract explicitly says otherwise.

A nested product belongs inside the AIA by consequence only when it has an explicit Dome-hosted surface binding, the four canonical non-equivalent route projections, invariant verification, bounded authority, rest/exit, and a live structural receipt or equivalent runtime witness. Directory placement alone is not AIA integration.

A Canonical Practice Fixture is not a fabricated AIA decoy. It is openly fictional to the authorized operator and remains non-authoritative to the system.

## Fixtures stay outside core

Current proving fixtures live under:

`tests/fixtures/pedagogue/`

Keep product-specific fixtures there or in an equivalent test/fixture location. Shared engine files should remain generic.

## Ash / Loom recovery boundary

Practice-fixture and route-memory machinery may be used to study Ash recovery before being installed into live Ash. A research-only calibration phantom may supply known route ground truth without implying Proto-Loom, a transport law, geometric curvature, holonomy, automatic Ash action, or Golden Egg authority.

Do not bind a new shared mechanism into live Ash merely because it exists in the repository. Ash runtime participation remains explicit and separately witnessed.

## Before merging shared-engine changes

At minimum run the focused Pedagogue tests plus the validation lane selected by repository CI. Do not force a Giving-only classification if shared Flow-Core/Pedagogue core changed. The classifier is allowed to widen the release witness honestly.
