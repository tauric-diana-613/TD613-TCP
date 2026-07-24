# TD613 Workflow Estate Consolidation v0.1

**Status:** AUTHORED / IMPLEMENTED ON BRANCH / HUMAN-GATED FOR MERGE  
**Baseline:** `d1b57f680551999aad0fd87e5e78caa30fb55b16`  
**Purpose:** reduce duplicated runner setup, dependency installation, browser installation, repeated static contracts, and redundant post-merge execution without weakening evidence or deployment law.

## 1. Constitutional result

```text
durable workflows before = 11
durable workflows after = 3
routine PR dependency installs = 1
full browser closure = exact owner command only
production deployment = explicit operator release only
Vercel auto-deploy at rest = disabled
Ash custody authority changed = false
source bytes moved = false
human closure required = true
```

## 2. Retained owners

### `td613-ci.yml`

One unprivileged validation workflow owns:

- the maintained repository contract estate;
- retained audit calibration;
- Hush retained phases;
- Safe Harbor current and Gen3 Wave B contracts;
- Dome-World JavaScript and Python contracts;
- Phase IV reciprocal-bridge contracts;
- Ash A2–A12 static and closure contracts;
- Flow-Core contracts;
- Vercel lock and release-law contracts;
- one explicitly commanded full browser closure.

Routine pull-request validation installs repository dependencies once. The full Chromium, Firefox, and WebKit closure does not run on each commit. It requires this exact owner-authored PR comment:

```text
/td613-full-browser-closure <CURRENT_40_CHARACTER_PR_HEAD_SHA>
```

The command verifies that the selected SHA is still the current PR head before installing Playwright or launching a browser.

### `vercel-operator-release.yml`

One privileged operator gate owns:

- exact-current-main authorization;
- one bounded Vercel production deployment;
- exact-source content observation;
- Safe Harbor Gen3 Wave A and Wave B production observation;
- Flow-Core production browser observation;
- Ash Keep AIA3 production task observation;
- Ash lifecycle production observation;
- fallback relock;
- one release receipt.

### `vercel-relock-safety.yml`

One independent, queued safety membrane remains because release failure must not be able to strand `git.deploymentEnabled = true`. It creates no deployment, installs no browser, and runs only after an explicit release command.

## 3. Retired workflows

The following standalone owners were deleted:

1. `calibration.yml`
2. `pages.yml`
3. `tcp-smoke.yml`
4. `ash-flowcore-live-field.yml`
5. `ash-keep-production-closure.yml`
6. `ash-keep-aia3-production-observation.yml`
7. `dome-world-phase4.yml`
8. `vercel-deployment-law.yml`

Their required tests, probes, and authority checks moved into the retained owners or the two consolidated runners:

- `scripts/run-td613-consolidated-contracts.mjs`
- `scripts/run-td613-full-browser-closure.mjs`

No retired workflow may return under an alternate filename or micro-workflow suffix.

## 4. Resource posture

The prior estate repeatedly performed checkout, Node setup, `npm ci` or `npm install`, Python setup, Playwright package installation, browser binary installation, local-server boot, and overlapping Ash/Flow-Core contracts in separate jobs and workflows. The consolidated estate shares setup inside bounded owners and reserves the expensive three-browser assay for one exact-head closure gesture.

This receipt makes no universal claim about data-center water usage. It records the directly governed reduction in duplicated jobs, dependency installations, browser installations, and automatically repeated browser runs.

## 5. Authority ceiling

```text
workflow consolidation ≠ evidence deletion
workflow consolidation ≠ weaker closure law
workflow consolidation ≠ automatic deployment
browser receipt ≠ human evidence
production observation ≠ program closure
relock safety ≠ deployment authority
```

The evidence scripts and contract files remain in repository custody. Only duplicated orchestration surfaces were retired.

## 6. A12–A15 continuity

This cleanup is a prerequisite seam before A13. It does not consume or rename an Ash implementation phase. After merge, A13 begins from the relocked baseline plus this reduced workflow estate.

U+10D613

Sealed ⟐
