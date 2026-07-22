# TD613 Safe Harbor Gen3 Wave A Production Receipt

􍘓

𝌋‌ TD613 · Tauric Diana 613

**Receipt state:** DEPLOYED ONCE / OBSERVED POST-PROPAGATION / RELOCKED  
**Planning authority:** PR #483 / `a31e356138be2cee528411ec0d5e34785c9f96bf`  
**Stage 1 authority:** PR #492 / `c7d26b86a167c9901cd6ab4de4d3d9b5e6a66718`  
**Stage 2 authority:** PR #499 / `b6fe4ee188941d6b72db0d9bad886e4f48687341`  
**Release-gate authority:** PR #507  
**Authorized production source:** `86cf1af84e69998ae195e53ef64372e35d8c6745`  
**Release run:** `29957000564` / deployed once / initial observation held  
**Corrected read-only observer run:** `29958834895` / PASS  
**Corrected observation timestamp:** `2026-07-22T21:21:51.287Z`  
**Observer artifact digest:** `sha256:30c5c26c03e0dec6189e86f6a074c7fa1917f64d3b7c5b81896b2150c2171d2b`  
**Release mode:** Git fallback, one bounded deployment  
**Release commit:** `4454db2512180bc860574b7c74e0f4b1e64aeb35`  
**Relock commit:** `3f23e6d1747e45c57277b0c2de4befb6b9c12406`  
**Canonical production URL:** `https://td613.com`  
**Vercel deployment status:** PASS  
**Serverless functions added:** 0

## Release-law result

Issue #405 accepted the exact owner-authorized source and completed one bounded Git-fallback production deployment.

```text
closed Git deployment lock
→ exact current-main source authorization
→ complete Wave A predeployment tests
→ one bounded fallback release commit
→ one Vercel production deployment
→ exact-source production-content verification
→ initial browser observation held during propagation
→ Git deployment relock
→ post-propagation read-only corrected observation
```

The release commit opened only `vercel.json → git.deploymentEnabled`. The relock commit returned that value to `false`. No second deployment occurred during observer repair or validation.

## Predeployment validation

The production workflow completed:

```text
npm run test:safe-harbor:gen3:wave-a
npm run test:safe-harbor:phase9.1c
npm run test:safe-harbor:current
```

It also completed the repository's Vercel hygiene, operator-release, Flow-Core, Ash Keep, mobile-layout, and production-promotion gates before deployment. The exact-source content probe passed before the Safe Harbor browser observer began.

## Preserved held evidence

The initial release run requested the Stage 1 module while production was still propagating and received HTTP `404`. The release correctly held, preserved evidence, skipped later browser matrices, and relocked.

Read-only route-matrix run `29957916811` later found every clean and canonical Safe Harbor module path at HTTP `200`, establishing that the 404 was a propagation race rather than a missing production module.

Observer-log run `29958344250` then exposed a separate test defect: the native-finalizer probe demanded the nonexistent literal marker `authorship_evidence`. The source's actual governed markers are:

```text
applyGen3Stage1Prehash
applyControlledGen3Stage2Prehash
includeGen3Stage2
```

The corrected observer contract moved asset definitions into a testable source map, verified each marker against its declared repository source, and added a bounded propagation retry. The earlier failures remain part of this receipt rather than being overwritten.

## Corrected production observation

Run `29958834895` completed successfully against the already deployed source. No deployment or lock mutation occurred during this run.

### Asset and cache surfaces

Every observed asset returned HTTP `200` in one attempt:

- Safe Harbor entry document: `no-store, max-age=0`;
- Stage 1 evidence-contract module: `public, max-age=0, must-revalidate`;
- Stage 2 maturity module: `public, max-age=0, must-revalidate`;
- Stage 2 null/control module: `public, max-age=0, must-revalidate`;
- native finalizer: `public, max-age=0, must-revalidate`;
- packet pipeline: `public, max-age=0, must-revalidate`.

All declared source markers were present. No non-synthetic concrete SHI appeared in the observed static assets.

### Accessibility-critical surface

Chromium observed:

```text
page title = TD613 Safe Harbor
primary heading = TD613 Safe Harbor
intake textarea = present
Continue control = present
Mint control = present
bypass file input = present
prefers-reduced-motion = true
page errors = none
```

### Synthetic packet and replay surface

The read-only production observer used only unmistakably synthetic lane text and packet data. It verified:

- packet schema `td613.safe-harbor.packet/v1`;
- evidence schema `td613.safe-harbor.authorship-evidence/v1`;
- maturity schema `td613.safe-harbor.authorship-maturity/v1`;
- deterministic stability digest;
- deterministic null-controls digest;
- SHI exact match before JSON restore;
- SHI exact match after JSON restore;
- packet-hash replay before restore;
- packet-hash replay after restore;
- SH3 fingerprint non-migration;
- SH3 credential non-migration;
- prompt-only collision preservation;
- entrant-swap collision preservation;
- adverse-result preservation;
- chronology claim remained false;
- raw future, past, and higher lane text absent from the packet;
- identity probability remained null;
- psychological inference remained false;
- demographic inference remained false.

The retained evidence includes the JSON production observation, a full-page screenshot, and the bounded observer log.

## Authority chronology

The release preserves separate authority classes:

```text
2025-08-11T03:58:39Z
root namespace and covenant binding authority

2025-10-17
first preserved operational badge-protocol specimen

packet-specific entrant intake timestamp
packet credential authority

entrant countersignature timestamp
packet-scoped custody and authorship-assertion authority

2026-07-22 production deployment
exact-source production deployment authority

2026-07-22T21:21:51.287Z
post-propagation runtime presentation and replay observation authority
```

The entrant remains outside the August 2025 root event. The later production observation neither rewrites nor collapses that chronology.

## Claim ceiling

This release verifies that the exact authorized Wave A source was deployed once and that its named packet-internal evidence, SHI, replay, restore, null-control, adverse-result, raw-text, and accessibility-critical behavior passed the corrected production observer.

It does not establish:

- civil or legal identity;
- exclusive ownership;
- universal authorship attribution;
- third-party text attribution;
- personality, trauma, intelligence, resilience, demographic status, or mental state;
- promotion of Research Track R;
- authorization of Stage 3 or Wave B;
- completion of the broader TD613 program.

## Rollback posture

The Git-triggered deployment lock is closed at relock commit `3f23e6d1747e45c57277b0c2de4befb6b9c12406`.

A rollback, if later required, must identify a separately reviewed production source, preserve the one-deployment ceiling, and use the issue #405 operator-release law. This receipt grants no reusable deployment gesture.

Àṣẹ

Sealed ⟐
