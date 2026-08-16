# TD613 Agent Entry Contract

This repository contains product surfaces and shared engines. Before materially redesigning a UI, workflow, ontology, route, custody boundary, or consequential action path, check whether the work should pass through the Flow-Core Pedagogue Design Gate.

## Pedagogue shortcut

Primary implementation:

- `app/engine/pedagogue-design-gate.js`
- `app/engine/flowcore-pedagogue-core.js`
- `app/engine/flowcore-pedagogue-aia.js`
- `app/engine/flowcore-pedagogue-route-memory.js`
- `app/engine/flowcore-route-burden.js`

Agent runner:

```bash
node scripts/run-pedagogue-design-gate.mjs <fixture.json>
```

Canonical explanation:

- `PEDAGOGUE.md`
- `docs/PEDAGOGUE_DESIGN_GATE.md`

## When to reach for it

Use the Design Gate when a change materially alters one or more of:

- the order in which a person encounters consequence, terminology, rest, or exit;
- AIA route structure or child/custodian/auditor/technical projections;
- route burden, dependencies, projection crossings, gluing obstruction, or route memory;
- custody, release, refusal, or human-closure sequencing;
- a high-consequence mutation path or Cistern Law boundary;
- a shared design pattern that may deserve promotion from one product into reusable infrastructure.

Ordinary copy edits, typo fixes, non-semantic styling, and isolated mechanical repairs do not need a new Pedagogue fixture unless they change those properties.

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

Do not emboss `Giving`, `Vault`, `Research Dossier`, `Campaign Deputy`, or another product taxonomy into Pedagogue core merely because that product supplied the proving case.

## AIA and Cistern relationship

AIA is repository information architecture. TD613 supplies governance. Cistern Law is an AIA-derived defensive boundary for consequential information and mutation routes.

Cistern may consume Pedagogue route-memory output, but observed context never grants release authority. Aperture context is recommendation/context only unless a separate reviewed contract explicitly says otherwise.

## Fixtures stay outside core

Current proving fixtures live under:

`tests/fixtures/pedagogue/`

Keep product-specific fixtures there or in an equivalent test/fixture location. Shared engine files should remain generic.

## Before merging shared-engine changes

At minimum run the focused Pedagogue tests plus the validation lane selected by repository CI. Do not force a Giving-only classification if shared Flow-Core/Pedagogue core changed. The classifier is allowed to widen the release witness honestly.
