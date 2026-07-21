# Strategic Vercel Deployment Law

𝌋‌ U+10D613

Vercel deployment remains authorized. It is a governed release witness, not the default development loop.

```text
branch work ≠ deployment requirement
local CI ≠ public release
green packet ≠ automatic deployment
merge ≠ automatic deployment
cost control ≠ evidentiary weakening
```

## Canonical route

1. Develop and test without Vercel deployment.
2. Complete the packet and select the exact green `main` commit.
3. Receive one explicit operator release gesture in chat.
4. The assistant/Codex executes the bounded Vercel release route.
5. One deployment is attempted.
6. The deployed Flow-Core bytes, Flow-Core browser surfaces, and current Ash Keep generation are observed.
7. The exact result is reported and sealed.

```text
operator authorization → assistant/Codex execution → one Vercel deployment
```

The operator is not required to operate Vercel, GitHub Actions, or deployment plumbing. The operator authorizes. The assistant/Codex executes, observes, and reports.

## Cost and attempt ceiling

The normal ceiling is one deliberate Vercel deployment per completed packet or release candidate. Additional deployments require a named deployment-specific defect, failed public-runtime observation, rollback verification, or a new explicit operator decision.

Ordinary branches, pull requests, and `main` pushes must not trigger Vercel.

```text
one authorization = one deployment ceiling
failed deployment ≠ automatic retry authorization
bookkeeping commit ≠ deployment reason
browser observation ≠ second deployment
```

## Executable lock

`vercel.json` disables Git-triggered deployment for every branch:

```json
{
  "git": {
    "deploymentEnabled": false
  }
}
```

A merge, push, green workflow, release-candidate label, or branch name cannot create a Vercel deployment.

## Assistant/Codex release conduit

The permanent conduit is GitHub issue **#405, “TD613 Vercel Release Gate.”** After explicit operator authorization in chat, the assistant/Codex posts one exact release command to that issue:

```text
/td613-vercel-release PRODUCTION <40-character-current-main-sha>
```

The release workflow accepts only:

- issue #405;
- the repository-owner identity;
- the exact current `main` SHA;
- the named `PRODUCTION` target;
- one mutually exclusive credential route;
- one deployment invocation.

The issue comment is an execution mechanism used by the assistant/Codex. It is not a task transferred to the operator.

```text
merge ≠ deploy
main push ≠ operator gesture
workflow success ≠ operator gesture
operator authorization in chat = release authority
assistant/Codex gate invocation = permitted execution route
```

## Credential routes

The **direct token bridge** is preferred. When `VERCEL_TOKEN` is present, the gate links the existing project, pulls the production environment, builds once, and invokes one prebuilt production deployment.

When the token bridge is absent, the gate may use the repository's **bounded Git fallback**:

1. begin only while `git.deploymentEnabled` is `false`;
2. change only the Vercel Git deployment lock to `true`;
3. create and push one transient release commit;
4. allow the connected Vercel Git integration to create one production deployment;
5. observe exact application-content parity against the authorized source packet;
6. restore the lock to `false` in a relock commit, even when observation fails.

```text
direct token bridge OR bounded Git fallback
credential route count = 1
deployment count ceiling = 1
fallback application-tree drift = none
relock push with deployment disabled ≠ second deployment
```

The fallback may not alter application code, protected law, custody state, API allocation, or the selected source packet. Its transient commits exist only to open and close the deployment lock.

## Required terminal receipt

A successful release receipt must name the authorized packet with the exact field:

```text
source_packet_commit = <40-character-current-main-sha>
```

It must also report the credential route, release and relock commits when applicable, deployment URL, deployment count, exact-source content result, Flow-Core browser matrix, current Ash Keep generation matrix, mobile evidence, application-tree drift, and final lock state.

Gate acceptance alone is not a terminal receipt.

```text
selected_commit = accepted authorization
source_packet_commit = terminal observed release identity
accepted gesture ≠ completed deployment
completed deployment ≠ human empirical validation
```

## Flow-Core production observation

The release witness must run the complete P0–P10 closure contracts before deployment and observe the deployed Flow-Core surfaces after deployment.

The **Flow-Core browser matrix** covers:

- Chromium desktop and Android-sized viewport;
- Firefox desktop;
- WebKit iOS-sized viewport;
- 390-pixel portrait;
- landscape and rotation-equivalent layout;
- keyboard-only reachability;
- reduced-motion runtime parity;
- 200%-zoom-equivalent reflow;
- forced-colors/high-contrast behavior;
- bounded navigation and long-task observations.

The production content observer hashes declared Flow-Core files locally and compares them with the deployed bytes. A successful receipt requires:

```text
exact_source_content = PASS
application_tree_drift = none
flowcore_browser_matrix = PASS
```

Runtime observation remains non-promotional:

```text
runtime observation counts as human evidence: false
runtime observation authorizes public route promotion: false
runtime observation closes the program: false
```

## Ash Keep AIA3 production observation

The release witness must execute the current **Ash Keep AIA3** task-continuity browser witness, `scripts/ash-keep-aia3-task-journey-v3.mjs`, in Chromium, Firefox, and WebKit.

The AIA3 witness must observe:

- fixed first-use ingress without an obstructing AIA crown;
- exact profile and New Case controls;
- local case creation and pointer preservation;
- exact main and workspace-rail availability after case creation;
- local-document opening without transport;
- deterministic tutorial non-mutation;
- route continuity across Experiential, Custodial, Audit, and Implementation;
- desktop and 390×844 mobile geometry;
- stale-client eviction of retired AIA2 CacheStorage and service-worker graphs;
- preservation of IndexedDB cases, case pointer, and session continuity;
- absence of unexpected external or write requests.

```text
ash_keep_aia3_task_matrix = PASS
ash_keep_fresh_client = PASS
ash_keep_retired_aia2_eviction = PASS
ash_keep_case_preservation = PASS
```

A retired AIA2 witness cannot certify an AIA3 release. Generation-specific release and read-only observation infrastructure must name and execute the current AIA3 witness. AIA2 remains a migration adversary to evict, not a production authority.

The read-only observation command is:

```text
/td613-ash-aia3-observe PRODUCTION <40-character-ancestor-sha>
```

That conduit may observe an already-deployed source packet but has zero deployment, branch-write, retry, child-study, release, or closure authority.

## Final-cut convergence guard

A public release candidate must be verified as the complete merge result, not merely as an older feature head.

```text
feature-head green ≠ final cut complete
newer main change ≠ permission to strand an older packet
merge-ref verification = required
exact deployed source packet = required
partial surface success ≠ whole-product release success
```

The release witness must prove the intended surfaces together: TD613 Flight behavior, Ash ingress geometry, cache-epoch transition, local-custody preservation, profile hydration, Flow-Core exact-source parity, the Flow-Core browser matrix, Ash Keep AIA3 task continuity, stale-client recovery, and the deployment lock.

## Cache-epoch storage boundary

`td613.ash.cache-flush.epoch` is maintenance state used only to make one-time cache eviction idempotent across navigation. It remains outside Case Maps, receipts, Save Points, Capsules, source material, and user-authored content.

```text
cache epoch marker = permitted maintenance state
cache epoch marker ≠ case data
cache eviction ≠ IndexedDB deletion
cache eviction ≠ local-custody erasure
```

Sealed ⟐