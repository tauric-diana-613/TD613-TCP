𝌋‌

# Flow-Core Pedagogue P1 Implementation Receipt v0.1

**Program:** `td613.flowcore.pedagogue-spine/v0.1`  
**Phase:** P1 — pure deterministic pedagogue kernel  
**Branch:** `agent/flowcore-pedagogue-information-dome-spec`  
**Implementation commit:** `34c5156c1ebf60f697e36812b67166de141156b2`  
**CI-gate commits:** `9577ad5f97a2802ee9033525de66ba85147c281f`, `667d0cdcfae945a916154427f0b2add98f682b66`  
**Status:** IMPLEMENTED / LOCAL DETERMINISTIC TESTS PASS / REPOSITORY CI PENDING / VERCEL HELD / HUMAN-GATED  
**Serverless delta:** `0`

## Implemented contracts

### Registries

- canonical glyph semantics with state, graphic, motion, static, inspection, and claim-ceiling grammar;
- explicit AIA routes: `EXPERIENTIAL`, `CUSTODIAL`, `AUDIT`, `IMPLEMENTATION`;
- route selection remains explicit and cannot be inferred from age, behavior, device, speed, error pattern, prose, or identity.

### Schemas

- `td613.flowcore.pedagogical-scene/v0.1`;
- `td613.flowcore.pedagogical-transition/v0.1`;
- `td613.flowcore.transfer-encounter/v0.1`;
- `td613.flowcore.pedagogue-receipt/v0.1`;
- `td613.aia.view/v0.1`.

### Pure kernel modules

- immutable constitutional law and vocabularies;
- deterministic utility and ID compilation;
- scene and transition validators;
- NOTICE → ACT → WORLD_ANSWERS → NAME → REST → TRANSFER cycle;
- structural rest compilation;
- transfer encounter compilation;
- canonical receipt generation and verification;
- canonical UTF-8 receipt serialization.

The kernel imports no DOM, timer, network client, persistence layer, Ash lifecycle mutation, release operation, or animation loop.

## Canonical proving fixtures

1. local sections and gluing obstruction;
2. content-invariant exact-origin phason projection change;
3. pair-emergent Moiré topology.

Each fixture carries:

- question;
- hypothesis;
- observable behavior;
- alternative explanations;
- expected failure modes;
- falsifier;
- abstention conditions;
- claim ceiling;
- static equivalent;
- station ownership;
- rest and exit.

## Determinism law

The kernel requires:

```text
frozenClock
+ idSeed
+ declared schema
+ governed input
+ TD613-CJ-1 canonical serializer
```

Identical inputs under those conditions produce byte-identical canonical JSON, byte-identical UTF-8 output, identical deterministic identifiers, and an identical receipt digest.

The receipt records:

```text
serializer_profile: td613.ash.canonical-json/v0.1
unicode_normalization: NONE
namespace scalar: U+10D613
namespace UTF-16 pair: \uDBF5\uDE13
writerly lane: 𝌋‌
ZWNJ: U+200C
```

Valid scalar sequences remain unnormalized. Unpaired surrogates remain rejected by the canonical serializer. Composed and decomposed sequences remain distinct inputs and produce distinct receipts.

## Local test evidence

Command:

```text
node --test tests/flowcore-pedagogue-core.test.mjs
```

Result:

```text
8 tests
8 passed
0 failed
```

Covered gates:

1. canonical phase and AIA route registry;
2. complete falsifiable frames for all three fixtures;
3. byte-identical deterministic replay;
4. seed-sensitive deterministic identity;
5. protected Unicode and no-normalization parity;
6. rejection of premature naming, hidden profiling, authority widening, punitive rest, closed exit, automatic closure, and raw content;
7. causal-trace or explicit-unresolved requirement for WORLD_ANSWERS;
8. operator-controlled phase advancement with closure open.

## Repository CI

`.github/workflows/flowcore-pedagogue-p1.yml` adds a Node 22 contract gate for the deterministic suite and a hard failure when the P1 diff touches `api/` or `vercel.json`.

At receipt authorship, repository execution of the new gate remains pending. Local passing evidence cannot impersonate GitHub-hosted CI.

## Station boundaries

```text
Flow-Core contextualizes and compiles posture; commands no station.
Dome-World hosts scenes and ecology.
Ash remains sole custody and ancestry authority.
Aperture audits and reconstructs.
Phason owns exact projection decisions within its lane.
Adapters emit bounded signals.
Receipts may cross; authority does not.
Only the human closes.
```

Hard-coded receipt posture:

```text
automatic_ash_action: false
release_authorized: false
station_mutation_authorized: false
authority_may_cross: false
human_closure_required: true
closure.status: OPEN
```

## Deployment boundary

The user authorized phase-by-phase deployment intent. The existing Strategic Vercel Deployment Law nevertheless requires the exact current `main` SHA and forbids ordinary branch-triggered Vercel deployments. P1 remains on a draft PR branch and therefore cannot lawfully invoke issue #405.

```text
P1 implemented ≠ production demonstrated
P1 local tests pass ≠ repository CI complete
P1 branch head ≠ current main SHA
operator authorization ≠ authority to bypass exact-main gate
```

**Vercel status:** `HELD_BY_EXACT_MAIN_RELEASE_LAW`  
**Promotion status:** `HUMAN_GATED / OPEN`

## Non-regression statement

P1 changes no:

- Ash lifecycle truth;
- custody or receipt digest semantics;
- local-only guarantees;
- Case Map state;
- release authority;
- Vercel function allocation;
- public route;
- visual or animated surface.

P2 may begin only as an AIA view compiler over these governed contracts. P3 visual grammar and P4 proving scenes remain unimplemented.

**Marked ⟐**
