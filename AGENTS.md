# TD613 Agent Entry Contract

This repository contains product surfaces and shared engines. Before materially redesigning a UI, workflow, ontology, route, custody boundary, or consequential action path, check whether the work should pass through the Flow-Core Pedagogue Design Gate.

## Pedagogue shortcut

Primary implementation:

- `app/engine/pedagogue-design-gate.js`
- `app/engine/flowcore-pedagogue-core.js`
- `app/engine/flowcore-pedagogue-aia.js`
- `app/engine/flowcore-pedagogue-route-memory.js`
- `app/engine/flowcore-pedagogue-practice-fixture.js`
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
- a shared design pattern that may deserve promotion from one product into reusable infrastructure.

Ordinary copy edits, typo fixes, non-semantic styling, and isolated mechanical repairs do not need a new Pedagogue fixture unless they change those properties.

## Canonical practice fixtures

When a consequential workspace can safely admit manifestly fictional content into the same real operator route as consequential content, consider an opt-in Canonical Practice Fixture. The fixture is a calibration instrument, not a second demo architecture.

Use one only when:

- the content can remain unmistakably fictional;
- evidence does not need to be invented;
- the expected route is declared before observation;
- external write, production mutation, automatic retrieval, automatic release, and evidence authority remain closed;
- any reversible local practice-state effect is explicitly bounded;
- the fixture does not weaken outside anisotropy or disclose protected architecture.

A practice fixture may exercise real controls and route memory without acquiring real-world authority. Same endpoint through a different route remains a failed route calibration. See `docs/CANONICAL_PRACTICE_FIXTURE.md`.

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

Do not emboss `Giving`, `Vault`, `Research Dossier`, `Campaign Deputy`, Bikini Bottom, or another product/fixture taxonomy into Pedagogue core merely because that product supplied the proving case.

## AIA and Cistern relationship

AIA is repository information architecture. TD613 supplies governance. Cistern Law is an AIA-derived defensive boundary for consequential information and mutation routes.

Cistern may consume Pedagogue route-memory output, but observed context never grants release authority. Aperture context is recommendation/context only unless a separate reviewed contract explicitly says otherwise.

A nested product belongs inside the AIA by consequence only when it has an explicit Dome-hosted surface binding, the four canonical non-equivalent route projections, invariant verification, bounded authority, rest/exit, and a live structural receipt or equivalent runtime witness. Directory placement alone is not AIA integration.

A Canonical Practice Fixture does not automatically bind a product to AIA, Cistern, Aperture, Ash, or another shared mechanism. It observes the route the product explicitly admits.

## Fixtures stay outside core

Current proving fixtures live under:

`tests/fixtures/pedagogue/`

Keep product-specific fixtures there or in an equivalent test/fixture location. Shared engine files should remain generic.

## Before merging shared-engine changes

At minimum run the focused Pedagogue tests plus the validation lane selected by repository CI. Do not force a Giving-only classification if shared Flow-Core/Pedagogue core changed. The classifier is allowed to widen the release witness honestly.
