𝌋‌

# Ash Keep A15-R0 Fixed-Kernel Harness Implementation Receipt v0.1

**Schema:** `td613.ash.a15-r0.fixed-kernel-harness-implementation-receipt/v0.1`
**Namespace:** `U+10D613`
**Surrogate pair:** `\uDBF5\uDE13`
**Meaning:** `TD613 = Tauric Diana 613`
**Branch:** `codex/a15-r0-fixed-kernel-harness`
**Exact base SHA:** `90c2b2da6a925e24f4c4e270dbff2098e309ee9d`
**Exact tested implementation head SHA:** `a7e1bfebb8270aea62ab14da20f3b764cc76fea2`
**Status:** `IMPLEMENTED / DRAFT-CI OBSERVATION PENDING`
**Date:** `2026-07-29`

The tested implementation head is the exact code, fixture, schema, test, and browser-probe tree verified before this receipt was added. The receipt commit is separately Git-addressed because a commit cannot contain its own hash.

## Governing posture

```text
A15 technical production closure = PASSED
A15 operator acceptance = FAILED
current A15 production shell = WITNESS / NOT ACCEPTED
A15-R0 = OPEN
R0.0 = IMPLEMENTED
R0.1 = IMPLEMENTED / DRAFT-CI OBSERVATION PENDING
P1 Minimal Ash = NOT YET IMPLEMENTED
P2 Proto-Loom = NOT YET IMPLEMENTED
A16 = HELD
Golden Egg = HELD
production action = NONE
deployment action = NONE
human projection selection = REQUIRED
human closure required = true
```

No historical A15 receipt was rewritten. The six-profile A15 registry, its registry version, its asset epoch, and its empirical matrix remain unchanged.

## Files added

### Durable R0.0 evidence

- `app/dome-world/docs/ash/experiments/a15-r0/ASH_KEEP_A15_R0_OPERATOR_REJECTION_FREEZE_RECEIPT_V0_1.md`

### Synthetic fixture

- `app/dome-world/fixtures/a15-r0/governed-task-fixture-v01.json`

### Isolated preview package

- `app/dome-world/previews/a15-r0/index.html`
- `app/dome-world/previews/a15-r0/a15-r0-harness.css`
- `app/dome-world/previews/a15-r0/a15-r0-harness.js`
- `app/dome-world/previews/a15-r0/a15-r0-contracts.js`
- `app/dome-world/previews/a15-r0/ash-kernel-adapter.js`
- `app/dome-world/previews/a15-r0/projection-registry.js`
- `app/dome-world/previews/a15-r0/observable-event-recorder.js`
- `app/dome-world/previews/a15-r0/interaction-owner-registry.js`

### Schemas

- `app/dome-world/schemas/a15-r0/governed-task-fixture-v01.schema.json`
- `app/dome-world/schemas/a15-r0/projection-descriptor-v01.schema.json`
- `app/dome-world/schemas/a15-r0/observable-event-v01.schema.json`
- `app/dome-world/schemas/a15-r0/projection-run-receipt-v01.schema.json`
- `app/dome-world/schemas/a15-r0/interaction-owner-record-v01.schema.json`
- `app/dome-world/schemas/a15-r0/operator-rejection-receipt-v01.schema.json`

### Focused validation

- `tests/ash-a15-r0-fixture.test.mjs`
- `tests/ash-a15-r0-kernel-adapter.test.mjs`
- `tests/ash-a15-r0-preview-contract.test.mjs`
- `tests/ash-a15-r0-interaction-ownership.test.mjs`
- `tests/ash-a15-r0-disposal.test.mjs`
- `scripts/ash-a15-r0-preview-probe.mjs`

No existing production file was modified. This receipt is the twenty-third file added relative to the exact base.

## Existing owners reused

The adapter delegates governed work to these existing owners:

- `app/engine/ash-keep-core.js`
  - `compileCaseMap`
  - `verifyCaseMap`
  - `compileRoomRules`
  - `verifyRoomRules`
  - `compileRouteMemory`
  - `verifyRouteMemory`
  - `compileReaderProfile`
  - `compileRebuildTest`
  - `verifyRebuildTest`
  - `runDeterministicReader`
- `app/engine/ash-keep-continuity.js`
  - `compileSavePoint`
  - `verifySavePoint`
- `app/dome-world/ash/canonical-json.js`
  - `canonicalDigest`

The preview adapter does not duplicate Case Map normalization, Room Rules normalization, Route Memory normalization, Reader vector construction, Rebuild Test compilation, Save Point compilation, canonical JSON, or digest semantics.

## Adapter surface

Implemented:

```text
snapshot()
bindReference()
formRelation()
compareRoute()
preserve()
returnToCustody()
rest()
resetFixture()
dispose()
```

Every governed action returns an exact receipt or an explicit `HELD` receipt. Out-of-order actions remain held. `resetFixture()` reconstructs only the deterministic in-memory preview fixture. `dispose()` releases only preview memory.

The return summary keeps separate:

```text
what was sent
what returned
what remained local
what remains unknown externally
what authority stayed open
```

## Projection and interaction posture

```text
P0 A15_CONTROL
  implementation_status = OBSERVABLE_CONTROL
  mutated_by_assay = false

P1 MINIMAL_ASH
  implementation_status = NOT_IMPLEMENTED
  active controls = 0

P2 PROTO_LOOM
  implementation_status = NOT_IMPLEMENTED
  active controls = 0
```

All three descriptors remain noncanonical, preview-only, disposable, closed to production cutover, closed to deployment, and subject to human selection.

Seven visible controls have one declared projection owner and one delegated action owner:

```text
projection owner = A15_R0_HARNESS
action owner = ASH_KERNEL_ADAPTER
event phase = bubble
competing owner detected = false
```

Observable-event records contain interface facts only. They do not infer cognition, intelligence, mastery, identity, emotion, psychological safety, authorship, intent, consent, moral character, or clinical state.

## Validation executed

### Syntax and fixture/schema validation

- `node --check` passed for all new JavaScript and MJS files.
- All six JSON schemas parsed as Draft 2020-12 schemas.
- The governed fixture parsed and passed strict validation.
- Negative fixture cases held credentials, private-key/token-shaped material, identifying information, phone-key numeric material, live URLs, non-JSON iterables, cycles, namespace mutation, source-status mutation, transport widening, authority widening, and sequence mutation.

### Focused R0.1 tests

Command:

```text
node --test tests/ash-a15-r0-fixture.test.mjs tests/ash-a15-r0-kernel-adapter.test.mjs tests/ash-a15-r0-preview-contract.test.mjs tests/ash-a15-r0-interaction-ownership.test.mjs tests/ash-a15-r0-disposal.test.mjs
```

Result:

```text
test files = 5
passed = 5
failed = 0
fixture deterministic = true
fixture synthetic = true
sensitive context rejected = true
existing owners reused = true
automatic authority = false
raw transport = false
production mutation = false
reset preview-local = true
P0 mutated = false
P1 canonical = false
P2 canonical = false
interaction-owner conflict = false
disposal requires migration = false
```

### Targeted inherited regressions

Executed all twelve required inherited entry points:

```text
ash-a2-a5-whole-instrument
ash-a9-work-recompilation
ash-a10-choir-recompilation
ash-a11-capsule-recompilation
ash-a11-postclosure-cache-eviction
ash-a12-command-rationalization
ash-a14-archive-accession
ash-a15-empirical-profile-journeys
ash-keep-production-closure-contract
ash-lifecycle-production-contract
flowcore-p0-p7-seam-closure
flowcore-p0-p10-completion
```

Result under canonical repository semantics:

```text
entry points passed = 12
entry points failed = 0
Flow-Core subtests passed = 22
Flow-Core subtests failed = 0
```

Windows checkout note: this checkout has `core.symlinks=false`, so the 27 organized-document compatibility symlinks initially appeared to Node as one-line target-path files. `core.autocrlf` also changed the byte hash of one immutable historical observer. The inherited suite was therefore repeated at the exact tested head in a disposable detached worktree after materializing the 27 canonical targets and restoring that historical file from its exact Git blob. No inherited test or implementation file was modified. The canonical-materialization run passed.

### Short Chromium rehearsal

Command:

```text
node scripts/ash-a15-r0-preview-probe.mjs
```

Result:

```text
browser = installed Chromium
checks = 50
passed = 50
failed = 0
console errors = 0
page errors = 0
request failures = 0
external requests = 0
mutation requests = 0
desktop = 1280 x 820
mobile = 390 x 844
mobile reduced motion = verified
horizontal body loss = false
```

Local diagnostic artifacts:

```text
a15-r0-chromium-evidence.json
  sha256:d70a55fd2dddaff1d9737eca5c41f4e28e8391390a0aae2258eb5c692ce610a6

a15-r0-desktop.png
  sha256:a444fe2c641a56aac83c2bd421d5772139de8aceb452301a6529bd32aaef7be7

a15-r0-mobile-reduced.png
  sha256:33b93df45f5fb04eba26d9095586df0136583ccd3f21ce83da4c7e4ece74503f
```

The rehearsal used visible Playwright gestures. It did not inject product state with `page.evaluate()` and did not invoke hidden owners to simulate completion.

## Scope and forbidden-path audit

Against the exact base:

```text
implementation files before this receipt = 22
unexpected paths = 0
forbidden production paths changed = 0
api path delta = 0
serverless delta = 0
asset epoch changed = false
cache epoch changed = false
lifecycle changed = false
release posture changed = false
Vercel posture changed = false
production IndexedDB touched = false
production cache touched = false
service worker touched = false
canonical production route touched = false
```

The preview performs one same-origin `GET` for its synthetic JSON fixture. It performs no API request, provider request, recipient request, storage mutation, worker mutation, cache mutation, release action, export, handoff, or transport.

## Authority flags

```text
automatic_ash_action = false
raw_bytes_moved = false
external_send = false
stable_artifact_digest_exposed_to_flowcore = false
automatic_relation_binding = false
automatic_comparison = false
automatic_save = false
automatic_handoff = false
automatic_export = false
automatic_release = false
automatic_closure = false
release_authority_changed = false
destination_authority_changed = false
custody_silently_transferred = false
production_action_executed = false
deployment_executed = false
A16_authorized = false
human_closure_required = true
```

## Missing evidence and known limitations

- Operator screenshots or recordings were not locally available in this implementation session. Their status remains `MISSING / MAY BE ADDED LATER`.
- Draft CI has not yet observed this receipt commit.
- Human projection selection has not occurred.
- Human closure has not occurred.
- P1 Minimal Ash is a truthful inert descriptor, not an implemented interface.
- P2 Proto-Loom is a truthful inert descriptor, not an implemented interface.
- P0 remains an unmodified witness; the preview does not mount or repair it.
- The fixture is deterministic, synthetic, and in memory. It does not exercise production IndexedDB.
- The short rehearsal covered Chromium only. Firefox, WebKit, the full inherited Ash browser journey, self-hosted calibration, and full-repository mode were intentionally not invoked.
- External return, provider retention, participant state, and real-world reconstruction were not measured.
- Static and Chromium success are not operator acceptance or product selection.

## Disposal

R0.0 and R0.1 can be removed by deleting only:

```text
app/dome-world/previews/a15-r0/
app/dome-world/fixtures/a15-r0/
app/dome-world/schemas/a15-r0/
app/dome-world/docs/ash/experiments/a15-r0/ASH_KEEP_A15_R0_OPERATOR_REJECTION_FREEZE_RECEIPT_V0_1.md
app/dome-world/docs/ash/experiments/a15-r0/ASH_KEEP_A15_R0_FIXED_KERNEL_HARNESS_IMPLEMENTATION_RECEIPT_V0_1.md
tests/ash-a15-r0-*.test.mjs
scripts/ash-a15-r0-preview-probe.mjs
```

No case migration, IndexedDB mutation, production cache eviction, release rollback, kernel rollback, receipt rewrite, worker change, asset/cache epoch change, or deployment is required.

## Remaining governed work

`R0.2` may later implement P1 Minimal Ash as a calm four-scene task-first projection over this same fixed adapter and fixture.

`R0.3` may later implement P2 Proto-Loom as a bounded route-comparison projection over the same fixed adapter and fixture.

Neither stage is authorized by this receipt. Comparative observation, human projection selection, production cutover, A16, and Golden Egg work remain separately held.

## Closure

```text
A15-R0 = OPEN
R0.0 = IMPLEMENTED
R0.1 = IMPLEMENTED / DRAFT-CI OBSERVATION PENDING
P1 Minimal Ash = NOT YET IMPLEMENTED
P2 Proto-Loom = NOT YET IMPLEMENTED
A16 = HELD
production action = NONE
deployment action = NONE
human projection selection = REQUIRED
human closure required = true
```

Sealed ⟐
