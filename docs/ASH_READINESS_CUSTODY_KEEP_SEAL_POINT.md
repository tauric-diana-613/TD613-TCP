𝌋‌ U+10D613

# Ash Readiness + Ash Custody → Ash Keep Strategic Seal Point

Date: `2026-07-14`

Status: `ACTIVE_INTEGRATION_LANE / ROADMAP_RETURN_PRESERVED`

Branch: `agent/resume-ash-readiness-custody-keep`

Base anchor: `025aed74f07679dfeeb6a1de67dc7bbc75c1d26c`

## Purpose

This checkpoint preserves one bounded priority:

> Finish integrating Ash Readiness and Ash Custody into Ash Keep as one coherent, enforceable product workflow before returning to the repository roadmap or anti-drift ledger.

The roadmap and anti-drift ledger remain available as the governing strategic archive, but neither file should be advanced, rescored, reordered, or used to select another packet while this seal point remains active.

## Active product route

```text
Dome Ash threshold
→ session-only Ash Readiness / Quick Scan receipt
→ Ash Keep Custody workspace
→ browser-local artifact commitment or metadata-only root
→ custody registration and digest verification
→ custody-root binding into the current Case Map
→ current Rebuild Test
→ custody-bound Draft and Review
→ Release Receipt
→ post-release Save Point / continuity seal
```

## Binding product laws

```text
arrival ≠ consent
readiness ≠ custody
custody ≠ authenticity
case binding ≠ truth
rebuild eligibility ≠ release authority
continuity ≠ transport
receipt ≠ command
```

## Recovered unresolved integration seams

These seams belong to the active lane and must be closed before the roadmap is reopened.

### 1. Action-level lifecycle enforcement

Workspace-tab gating alone remains insufficient. A restored or stale workspace can already be open while its mutation buttons remain callable.

Required repair:

- guard lifecycle-sensitive actions at execution time;
- prevent `keepDraft`, `reviewDraft`, `approveRelease`, `makeSavePoint`, Capsule export, and any equivalent mutation from running when its lifecycle gate is held;
- preserve a visible hold reason and return route to Custody;
- test restored-workspace and stale-visible-workspace cases.

### 2. Post-release continuity ordering

A Save Point created before the current Release Receipt must never satisfy `CONTINUITY_SEALED` merely because the case ID and Case Map digest still match.

Required repair:

- bind the continuity-qualifying Save Point to the current release, or prove that it was created after that release through a canonical contract;
- keep older valid Save Points as evidence without granting terminal lifecycle posture;
- add regression coverage for pre-release Save Point reuse.

### 3. Idempotent custody-root rebinding

Binding the same verified custody root again must preserve the current Case Map digest.

Required repair:

- deduplicate custody evidence-basis entries;
- deduplicate the `ASH_CUSTODY_ROOT_BOUND` observation by custody reference and digest;
- avoid recompiling or persisting a successor Case Map when the exact root is already bound and the canonical content would remain unchanged;
- add a digest-stability regression, not merely a node-count assertion.

## Definition of integration complete

The seal may be lifted only after all of the following hold:

1. Ash Readiness enters Ash Keep through the session-scoped receipt without raw-content persistence.
2. Ash Custody appears and operates as a native Ash Keep workspace rather than a detached product surface.
3. L0 metadata-only and L1 browser-local commitments remain supported and bounded.
4. Custody receipt digests verify before Case Map binding.
5. First-time root binding changes the Case Map exactly once and invalidates stale downstream authority.
6. Rebinding the same root leaves the Case Map digest unchanged.
7. Lifecycle gates control both navigation and mutation actions.
8. A pre-release Save Point cannot satisfy post-release continuity.
9. Draft, Review, Release, Save Point, and Capsule retain the current custody-bound Case Map relationship.
10. Reload and restored-workspace states preserve the same authority boundaries.
11. Integration tests pass without modifying unrelated Marrowline, Choir, transport, provider, Cinder, or Safe Harbor jurisdictions.
12. Production status, maturity scores, and roadmap ordering remain unchanged until a separate evidence-backed ledger return.

## Immediate implementation order

```text
1. Add failing regression tests for the three unresolved seams.
2. Repair lifecycle derivation and continuity binding.
3. Repair custody-root canonical idempotence.
4. Add action-level runtime gates in the delivered Ash Keep surface.
5. Run the bounded Ash lifecycle, custody bridge, Draft, continuity, UI, shell, and deploy-hygiene suites.
6. Inspect the deployed route only after the candidate is internally green.
7. Record integration closure separately from roadmap advancement.
```

## Files inside the active lane

Primary implementation surfaces:

- `app/engine/ash-lifecycle.js`
- `app/dome-world/ash-lifecycle.js`
- `app/dome-world/ash-keep.js`
- `app/dome-world/ash-keep-entry.js`
- `api/dome-world-shell.js`

Primary validation surfaces:

- `tests/ash-lifecycle.test.mjs`
- `tests/ash-draft-lifecycle-binding.test.mjs`
- `tests/ash-custody-workspace-bridge.test.mjs`
- `tests/ash-product-architecture.test.mjs`
- `tests/ash-keep-continuity.test.mjs`
- `tests/ash-keep-ui.test.mjs`
- `tests/dome-world-integration.test.mjs`
- `tests/vercel-deploy-hygiene.test.mjs`

## Held outside this lane

Until this seal point closes, do not:

- advance `ROADMAP.md`;
- advance or rescore `docs/ASH_KEEP_BUILDOUT_LEDGER.md`;
- begin Choir calibration receipt binding;
- promote any maturity status;
- add recipient transport;
- add automatic Cinder behavior;
- widen provider execution;
- redesign Safe Harbor ingress;
- repair unrelated Marrowline failures merely to produce a uniformly green repository.

## Deliberate return route

After the integration definition of done is satisfied and the implementation has an immutable merge/evidence anchor, return through a separate documentation-only step:

```text
Ash Readiness + Custody integration closure
→ verify exact merged commit and bounded test evidence
→ reopen ROADMAP.md
→ reopen docs/ASH_KEEP_BUILDOUT_LEDGER.md
→ record only earned maturity movement
→ select the next packet deliberately
```

The future roadmap return must cite the integration merge commit, relevant workflow runs, any production observation artifact, and remaining boundaries. Completion of this lane grants no automatic right to advance Choir, transport, Cinder, or any adjacent workstream.

## Resume instruction

When work resumes from this checkpoint, begin with the three unresolved integration seams above. Do not infer a new selected packet from the current roadmap while this document remains `ACTIVE_INTEGRATION_LANE`.

I was broken into a circle.

Sealed for bounded return ⟐SAC[X6ZNK5NO51]