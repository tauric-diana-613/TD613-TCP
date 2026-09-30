# Pedagogue Design Gate

The Flow-Core Pedagogue already exists as a Dome-World program. `app/engine/pedagogue-design-gate.js` is the agent-facing design-review entrypoint into that existing program; it is not a new Pedagogue ontology and it must not absorb product-specific taxonomy.

## When an agent should reach for it

Use the Design Gate when authoring or materially revising a human-facing surface whose explanation, sequence, route burden, custody meaning, or exit/return behavior could be made easier to understand without weakening the governed contract.

Good candidates include:

- consequence-heavy controls whose mechanism is currently explained before their effect;
- custody/security surfaces where operator authority and system authority are easy to confuse;
- multi-step research flows with avoidable route crossings or gluing burden;
- interfaces where a simpler route must preserve missingness, contradiction, rest, exit, and human closure;
- design recovery work where two projections reach the same apparent endpoint by materially different histories.

Do **not** use the gate to diagnose a user, assign a universal usability score, crown one projection as ontology, auto-redesign a surface, or authorize an external mutation.

## Agent shortcut

Run a fixture through the existing Pedagogue cycle, AIA route compiler, and comparative route-burden models:

```bash
node scripts/run-pedagogue-design-gate.mjs tests/fixtures/pedagogue/giving-vault-design.json
```

For the complete machine-readable review:

```bash
node scripts/run-pedagogue-design-gate.mjs tests/fixtures/pedagogue/giving-vault-design.json --json
```

The runner returns PASS only when the fixture preserves consequence-before-ontology, rest/exit, AIA non-equivalence, non-worsening comparative route burden, the prohibition on user-level scoring/automatic redesign, and human closure.

## Canonical Practice Fixture / calibration phantom

The same runner also accepts `td613.pedagogue-practice-fixture/v0.1` fixtures.

A Canonical Practice Fixture is a manifestly fictional, authority-closed practice case that declares the expected route through a real workspace. Human-facing surfaces should call it a **Practice case**, **Practice inhabitant**, or another product-native phrase. **Calibration phantom** is the research/test term used when the fixture supplies known route ground truth for reconstruction experiments.

Example:

```bash
node scripts/run-pedagogue-design-gate.mjs tests/fixtures/pedagogue/giving-bikini-bottom-practice.json
```

Practice admission is stricter than ordinary sample data:

- container before content;
- route before jargon;
- no fabricated records, receipts, source bytes, or evidentiary claims;
- loading the fixture performs zero retrieval, custody write, domain mutation, or authority grant;
- read-only retrieval may occur later only after an explicit operator gesture when the fixture declares it safe;
- reversible practice-custody writes may occur later only after an explicit operator gesture when the fixture declares that route;
- domain mutations and evidence/consequence authority remain forbidden;
- a separate simplified demo route is forbidden;
- route memory remains explicit even when the endpoint matches;
- human closure remains required.

The practice fixture is **not** an AIA decoy. AIA still forbids fabricated decoys. The fixture is openly fictional to the authorized operator and uses the real declared route as a calibration object.

See `docs/CANONICAL_PRACTICE_FIXTURE.md` for the full contract.

## Fixture custody law

Product-specific proving cases belong under `tests/fixtures/pedagogue/` or another test-only fixture tree. Do not place Pedagogue/AIA fixtures inside a deployable product directory merely because that product is being reviewed. A product may be evaluated by the engine without exposing the engine's internal nomenclature to its users.

Current Giving proving cases:

- `tests/fixtures/pedagogue/giving-vault-design.json`
- `tests/fixtures/pedagogue/giving-research-dossier-design.json`
- `tests/fixtures/pedagogue/giving-bikini-bottom-practice.json`

Current Ash/Loom research-only calibration fixture:

- `tests/fixtures/pedagogue/ash-tomography-calibration-phantom-v01.json`

These fixtures prove generic mechanics; they do not teach the Pedagogue engine a Giving or Ash taxonomy.

## Route-history / tomography discipline

The Design Gate may use implemented route-memory, projection-crossing, and gluing-obstruction surrogates to compare structural demand. Keep the claim ceiling exact:

- same endpoint does not establish same route;
- same route does not establish same authority;
- route-memory diagnostics are comparative engineering evidence, not a claim of literal differential geometry in ordinary application code;
- a calibration phantom may provide known ground truth for route-reconstruction error without supplying a transport law;
- tomography/holonomy vocabulary stays in research/test architecture unless a public instrument intentionally exposes it.

## CI expectation

A product PR may carry new generic, additive Design Gate fixtures or helpers without becoming a full-product/Ash release **only when** those shared files are not imported by unrelated production surfaces. The validation-scope classifier must enumerate that narrow exception explicitly and the Giving CI lane must execute the Design Gate tests.

A shared-core practice-fixture implementation is different: changing the generic compiler is a shared architecture change and CI should widen honestly. Product-specific fixture updates may stay narrow only when they do not alter shared runtime mechanics.

The gate is a design witness, never deployment authority.
