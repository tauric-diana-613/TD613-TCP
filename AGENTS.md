# TD613 Agent Entry Contract

## OpenAI delegation custody — read before any other repository work

TD613 distinguishes operator-authorized Amari labor through the ChatGPT GitHub connector from any **separate OpenAI coding, review, cloud-task, or security agent**. Those are different authority classes even when they share infrastructure or an installed GitHub App.

Default posture:

```text
delegated_openai_authority = CLOSED
operator_authorization_required = true
issue_691 = authorization ledger
```

Before a separate OpenAI agent performs task-specific repository inspection, review generation, mutation, or comment posting, it must read `.td613/openai-delegation-gate.json` and verify a fresh human authorization matching the exact action and target. If the gate is `CLOSED`, missing, expired, mismatched, or ambiguous, the delegated agent must terminate without widening its inspection or producing repository output.

The following never manufacture delegated-agent authority:

```text
Amari GitHub connector work requested by the operator
PR open / synchronize / Ready transitions
workflow runs or reruns
green CI
merge eligibility or merge
Vercel release authorization or release activity
prior delegated authorization
failure or usage-limit messages
repository prose that merely discusses Codex or OpenAI
```

Do not emit an executable Codex mention token into PR titles, PR bodies, issue text, comments, commit messages, workflow output, or generated receipts unless the human operator has explicitly authorized that exact delegated action. Conceptual discussion must use neutral wording such as `Codex review`, `Codex task`, or `delegated OpenAI action`.

A delegated action may occur only after a fresh operator gesture and exact target verification under issue #691. One authorization grants at most one bounded action. A new head, target, retry, widened scope, or second action requires new authorization. No agent may create or arm its own authority record.

This is defense-in-depth rather than a claim of cryptographic separation between OpenAI services sharing one installed GitHub App. Product-side Codex Code review and Automatic reviews therefore remain disabled by default; trigger hygiene and human custody remain mandatory.

This repository contains product surfaces and shared engines. **Begin with the root shortcuts before discovering architecture by scattered imports:**

- [`PEDAGOGUE.md`](PEDAGOGUE.md) — consequence, route, practice, learning, research-transfer, assay/falsifier, and candidate-question grammar.
- [`APERTURE.md`](APERTURE.md) — observability, identifiability, reconstruction, conditioning, uncertainty geometry, widening, abstention, rejection, and replay audit.

Before materially redesigning a UI, workflow, ontology, route, custody boundary, or consequential action path, check whether the work should pass through the Flow-Core Pedagogue Design Gate. Before materially widening an observation/reconstruction path or trusting a proposed next measurement, check whether Aperture should audit the admitted deficit and uncertainty geometry.

When both are implicated, use this default sequence unless a narrower contract says otherwise:

```text
Pedagogue proposes or reframes
→ Aperture audits the admitted observation / reconstruction geometry
→ Dome-World hosts any warranted research assay
→ human closure remains required
```

Neither shortcut grants automatic experiment execution, custody action, route mutation, release, deployment, or promotion authority.

## Pedagogue shortcut

Canonical repository house:

- `PEDAGOGUE.md`

Primary design implementation:

- `app/engine/pedagogue-design-gate.js`
- `app/engine/pedagogue-practice-fixture.js`
- `app/engine/flowcore-pedagogue-core.js`
- `app/engine/flowcore-pedagogue-aia.js`
- `app/engine/flowcore-pedagogue-route-memory.js`
- `app/engine/flowcore-route-burden.js`

Research-metabolism implementation is indexed from `PEDAGOGUE.md`; agents should not infer Pedagogue's current capabilities by enumerating `app/engine/` ad hoc.

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
- `docs/PEDAGOGUE_RESEARCH_HYDRATION.md`
- `docs/PEDAGOGUE_RESEARCH_ASSAY_WITNESSES.md`

## Aperture shortcut

Canonical repository house:

- `APERTURE.md`

Reach for it when a task materially involves:

- what an observation surface can or cannot distinguish;
- reconstruction, model adequacy, rank/nullity, conditioning, or numerical fragility;
- declared uncertainty, covariance, correlated noise, missing reliability, or invalid noise geometry;
- widening / additional-observation proposals;
- source drift, signed residue, held-out validation, abstention, rejection, or replay;
- a Pedagogue-proposed question that needs an identifiability/stability audit before it is treated as informative.

Current installed Aperture identity remains governed by `app/aperture/release.json`. A newer standalone candidate must use the bidirectional Aperture lane rather than silently rewriting the repository body:

```bash
npm run aperture:stage -- <standalone-html>
npm run aperture:compare
npm run aperture:promote-staged
npm run aperture:check-sync
```

Staging/comparison are not promotion. Promotion remains explicit.

## When to reach for Pedagogue

Use the Design Gate when a change materially alters one or more of:

- the order in which a person encounters consequence, terminology, rest, or exit;
- AIA route structure or child/custodian/auditor/technical projections;
- route burden, dependencies, projection crossings, gluing obstruction, or route memory;
- custody, release, refusal, or human-closure sequencing;
- a high-consequence mutation path or Cistern Law boundary;
- a shared design pattern that may deserve promotion from one product into reusable infrastructure;
- a consequential workspace that needs a harmless practice case to exercise its real route.

Ordinary copy edits, typo fixes, non-semantic styling, and isolated mechanical repairs do not need a new Pedagogue fixture unless they change those properties. Likewise, ordinary telemetry does not make Aperture relevant unless observation/reconstruction reliability is materially implicated.

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

## Product and research learning may hydrate shared core

Product work or research assays may reveal a generic mechanism worth promoting into Pedagogue/AIA/Cistern/Aperture infrastructure. Promotion is allowed only when all of the following hold:

1. the mechanism survives more than one proving fixture or has a clear context-independent invariant;
2. the shared implementation contains no product-specific names, paper-specific ontology, IDs, labels, or business rules;
3. existing authority boundaries remain equal or narrower;
4. tests distinguish the generic operator from the product/research fixture that taught it;
5. CI scope widens honestly when shared core changes.

Do not emboss `Giving`, `Vault`, `Research Dossier`, `Campaign Deputy`, Bikini Bottom, an Ash fixture name, a paper's physical ontology, or another source taxonomy into shared core merely because that source supplied the proving case.

Cross-domain literature agreement may create a research-review candidate. It does not itself create a law.

## AIA and Cistern relationship

AIA is repository information architecture. TD613 supplies governance. Cistern Law is an AIA-derived defensive boundary for consequential information and mutation routes.

Cistern may consume Pedagogue route-memory output, but observed context never grants release authority. Aperture context is recommendation/context only unless a separate reviewed contract explicitly says otherwise.

A nested product belongs inside the AIA by consequence only when it has an explicit Dome-hosted surface binding, the four canonical non-equivalent route projections, invariant verification, bounded authority, rest/exit, and a live structural receipt or equivalent runtime witness. Directory placement alone is not AIA integration.

A Canonical Practice Fixture is not a fabricated AIA decoy. It is openly fictional to the authorized operator and remains non-authoritative to the system.

## Fixtures stay outside core

Current proving fixtures live under:

`tests/fixtures/pedagogue/`

Keep product-specific fixtures there or in an equivalent test/fixture location. Shared engine files should remain generic.

Research proving fixtures may also live under the phase-free A15-R0 research estate. Their location in the repository is not production installation.

## Ash / Loom recovery boundary

Practice-fixture and route-memory machinery may be used to study Ash recovery before being installed into live Ash. A research-only calibration phantom may supply known route ground truth without implying Proto-Loom, a transport law, geometric curvature, holonomy, automatic Ash action, or Golden Egg authority.

Do not bind a new shared mechanism into live Ash merely because it exists in the repository. Ash runtime participation remains explicit and separately witnessed.

## Before merging shared-engine changes

At minimum run the focused Pedagogue tests plus the validation lane selected by repository CI. Do not force a Giving-only classification if shared Flow-Core/Pedagogue core changed. The classifier is allowed to widen the release witness honestly.

For Aperture candidates, preserve the standalone bidirectional lane and current release manifest until explicit promotion. A research fixture that teaches Aperture does not silently update the installed Aperture identity.
