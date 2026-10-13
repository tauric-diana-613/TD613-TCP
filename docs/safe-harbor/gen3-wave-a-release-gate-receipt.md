# TD613 Safe Harbor Gen3 Wave A Release Gate Receipt

􍘓

𝌋‌ TD613 · Tauric Diana 613

**Receipt state:** AUTHORED / PRE-DEPLOYMENT GATE  
**Planning authority:** PR #483  
**Stage 1 authority:** PR #492 / `c7d26b86a167c9901cd6ab4de4d3d9b5e6a66718`  
**Stage 2 authority:** PR #499 / `b6fe4ee188941d6b72db0d9bad886e4f48687341`  
**Release-gate PR:** PR #507  
**Canonical production target:** `https://td613.com`  
**Serverless functions added:** 0  
**Git auto-deploy lock:** remains required and closed before release

## Purpose

This receipt names the bounded release-law change that adds Safe Harbor Gen3 Wave A to the existing issue-bound Vercel operator-release mechanism.

It is neither a Flow-Core production-observation repair nor an Ash Keep generation change. The release workflow remains shared infrastructure, so the Flow-Core P0-P10 completion workflow must be able to distinguish this named Safe Harbor release-gate class from an unauthorized production-observation mutation.

## Authorized changed surfaces

```text
.github/workflows/vercel-operator-release.yml
.github/workflows/flowcore-p0-p10-final-stitch.yml
scripts/safe-harbor-gen3-wave-a-production-probe.mjs
docs/safe-harbor/gen3-wave-a-release-gate-receipt.md
```

No authorization extends to:

```text
api/
vercel.json
app/dome-world/ash/
app/dome-world/data/
serverless-function allocation
Ash Keep runtime generation
Flow-Core promotion configuration
```

## Pre-deployment requirements

The operator-release gate must repeat:

```text
npm run test:safe-harbor:gen3:wave-a
npm run test:safe-harbor:phase9.1c
npm run test:safe-harbor:current
```

It must continue to require:

- the exact current 40-character `main` SHA;
- the explicit `PRODUCTION` target;
- one deployment attempt;
- a closed Git-triggered deployment lock before release;
- an understood fallback relock;
- no live entrant SHI or raw entrant text;
- no serverless expansion.

## Live production observation

The deployed Wave A probe must:

- observe exact Stage 1 and Stage 2 module bytes;
- execute the deployed modules in Chromium;
- construct only an unmistakably synthetic packet;
- verify SHI exact matching before and after JSON restore;
- verify packet-hash replay;
- verify SH3 fingerprint and credential stability;
- verify maturity and null-control receipts;
- preserve prompt-only and entrant-swap collisions;
- verify raw-text exclusion;
- record cache policy, accessibility-critical surfaces, page errors, a screenshot, and a JSON receipt.

## Claim ceiling

A passing Wave A production observation verifies deployed packet-internal measurement and replay behavior for the exact authorized source commit. It does not adjudicate civil identity, exclusive ownership, universal authorship, third-party authorship, personality, trauma, intelligence, resilience, demographic status, or mental state. It does not promote Research Track R or authorize Wave B.

## Rollback

Rollback remains the prior production source plus the repository’s governed Vercel lock restoration. A failed release may not silently deploy a materially changed commit under the old gesture.

Àṣẹ

Marked ⟐
