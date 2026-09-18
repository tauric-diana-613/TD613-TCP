# Strategic Vercel Deployment Law

𝌋‌ U+10D613

Vercel deployment remains authorized as a governed release witness, never the default development loop.

```text
branch work ≠ deployment requirement
local CI ≠ public release
green packet ≠ automatic deployment
merge ≠ automatic deployment
cost control ≠ evidentiary weakening
repeating the same browser matrix after deployment ≠ stronger evidence
```

## Canonical route

1. Develop and validate without Vercel deployment.
2. Complete the packet on an exact pull-request head.
3. Require scope-aligned three-engine evidence before merge through `TD613 Consolidated Validation`.
4. Merge the exact green head and identify the exact current `main` commit.
5. Receive one explicit operator release gesture in chat.
6. The assistant/Codex invokes issue #405 with that exact SHA.
7. One Vercel deployment is attempted.
8. When the bounded Git fallback is used, the one deployable release commit must first receive bounded GitHub/Vercel adoption acknowledgement for that exact transient SHA; the lock is then restored before any production-source waiting or browser observation begins.
9. The deployed application bytes are compared with the authorized packet.
10. The authorized source receipt must remain stable through a bounded stale-queue window, then exact application bytes are reconfirmed.
11. One scope-aligned bounded Chromium production confirmation observes the released surface: Giving for Giving-only packets, or desktop/mobile and Ash lifecycle continuity for full-product packets.
12. A final source-receipt guard confirms production still belongs to the authorized packet before the release is sealed.

```text
operator authorization → assistant/Codex execution → one Vercel deployment
one deployable fallback commit → bounded Vercel adoption acknowledgement → relock → production observation
```

The operator is not required to operate Vercel, GitHub Actions, or deployment plumbing. The operator authorizes. The assistant/Codex transports that authorization through the governed conduit, executes, observes, relocks, and reports. Relay identity does not create release authority.

## Evidence placement

The costly cross-browser proof belongs before merge, where a defect can still stop promotion without creating a public release.

```text
Giving-only premerge authority = Giving Chromium + Firefox + WebKit
full-product premerge authority = full-product Chromium + Firefox + WebKit
Giving-only production confirmation = one Giving Chromium witness
full-product production confirmation = one Chromium desktop/mobile witness + Ash lifecycle observation
```

The premerge witness must cover every principal journey affected by the classified packet, plus static truth, reduced motion, accessibility-relevant controls, and the relevant generation contracts. A Giving-only diff runs the common release membrane, Giving contracts, and the Giving export journey across Chromium, Firefox, and WebKit; it does not invoke Ash, Dome-World, or Flow-Core product suites. A full-product diff invokes the full Ash, Dome-World, Flow-Core, and related matrix. Classification fails closed to the full-product witness whenever any changed application file falls outside Giving.

The production confirmation follows the same classification. Giving-only releases run the bounded Giving Chromium probe and do not start Ash. Full-product releases retain the bounded registry, Archive, desktop/mobile, and Ash lifecycle observation. Production verifies deployment identity and a bounded live consequence path; it does not replay the entire cross-browser estate.

This separation preserves evidence while avoiding repeated browser downloads, duplicated local servers, repeated fixture construction, and parallel workflows proving the same source packet.

## Cost and attempt ceiling

The normal ceiling is one deliberate Vercel deployment per completed packet or release candidate. Additional deployments require a named deployment-specific defect, failed public-runtime observation, rollback verification, or a new explicit operator decision.

Ordinary branches, pull requests, and `main` pushes must not trigger Vercel.

```text
one authorization = one deployment ceiling
failed deployment ≠ automatic retry authorization
bookkeeping commit ≠ deployment reason
browser observation ≠ second deployment
provider-transport hold ≠ code defect
provider-held re-observation ≠ deployment authority
```

A held public-runtime observation may justify further diagnosis, but the failed run itself does not spend or mint a second deployment. When the deployed source remains unchanged and the first failing condition was transient provider transport, the missing live witness may instead be acquired through the observation-only conduit defined below.

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

The permanent conduit is GitHub issue **#405, “TD613 Vercel Release Gate.”** After explicit operator authorization in chat, the assistant/Codex posts:

```text
/td613-vercel-release PRODUCTION <40-character-current-main-sha>
```

The release workflow accepts only:

- issue #405;
- the repository-owner identity **or the exact installed `chatgpt-codex-connector[bot]` relay carrying an explicit in-chat operator authorization**;
- the exact current `main` SHA;
- the named `PRODUCTION` target;
- one mutually exclusive credential route;
- one deployment invocation.

The allowlisted chat relay is a transport mechanism, not an independent operator. Its presence cannot substitute for the operator gesture, widen the target, choose a different SHA, open a closed release without authorization, or bypass any later release check. No wildcard bot identity, generic GitHub App identity, or arbitrary collaborator may inherit this conduit.

The issue comment is an execution mechanism used by the assistant/Codex, not a task transferred to the operator.

## Credential routes

The **direct token bridge** is preferred. When `VERCEL_TOKEN` is present, the gate links the existing project, pulls the production environment, builds once, and invokes one prebuilt production deployment.

When the token bridge is absent, the gate may use the repository's **bounded Git fallback**:

1. begin only while `git.deploymentEnabled` is `false`;
2. materialize the exact-source release receipt;
3. change only the Vercel Git deployment lock to `true`;
4. create and push one transient deployable release commit;
5. wait boundedly for GitHub to expose a `Vercel` status context on that exact transient release SHA; this proves only that the Git integration adopted the deployable commit;
6. immediately restore the lock to `false` in a second non-deployable commit after adoption acknowledgement, before waiting for served production source or installing a production browser;
7. observe exact application-content parity against the authorized source packet;
8. require the source receipt to remain unchanged through the bounded stale-queue stability window;
9. reconfirm exact application bytes after that window;
10. run the scope-aligned production witness and perform one final source-receipt guard.

```text
direct token bridge OR bounded Git fallback
credential route count = 1
deployment count ceiling = 1
fallback deployable commit count = 1
fallback open-gate duration = one deployable commit plus bounded adoption-acknowledgement interval
fallback application-tree drift = none
relock push with deployment disabled ≠ second deployment
```

The fallback may keep the gate open only during the bounded adoption handshake for the exact transient release SHA. The presence of any `Vercel` status context is sufficient to prove adoption; it is not deployment-success proof. If no acknowledgement appears within the bounded interval, the workflow relocks and HOLDS. The gate may never remain open during source settlement, browser installation, browser witness, or evidence upload.

The exact-source receipt is deployment metadata used to distinguish the authorized packet from a stale queued deployment. It grants no custody, authorship, human-evidence, or program-closure authority.

The fallback may not alter application code, custody state, API allocation, source artifacts, or the selected source packet. Its transient commits exist only to bind the source receipt, admit one deployment, and close the deployment lock.

## Stale-queue defense

Vercel status metadata is useful only as a bounded **adoption acknowledgement** before relock; it cannot outrank served production bytes or establish release success. A delayed or missing GitHub `Vercel` status may keep the gate open only inside the finite adoption interval. At the interval ceiling the workflow must relock and HOLD.

After production first matches the authorized source packet:

```text
authorized source receipt = stable through bounded queue window
→ exact application bytes = reconfirmed
→ scope-aligned production witness
→ post-witness source receipt = still authorized packet
```

Any later stale deployment that replaces the authorized receipt holds the release. Production cannot be sealed from a momentary match that is displaced during the stability window.

## Provider-held production re-observation

A full-product release can reach the live AI canary only after exact-source acquisition, the stale-queue window, post-window byte parity, bounded Chromium production confirmation, and Ash lifecycle observation have already passed. If that canary then stops **first** at provider transport, the observation is HELD rather than product-failed.

The provider-held re-observation conduit exists for that narrow case. It is a distinct authority surface because observation authority and deployment authority must not collapse into one another.

After a fresh explicit operator gesture in chat, the assistant/Codex may post to issue #405:

```text
/td613-production-reobserve PRODUCTION <40-character-deployed-source-sha> <prior-held-release-run-id>
```

The conduit accepts only:

- issue #405;
- the repository owner or the exact installed `chatgpt-codex-connector[bot]` carrying the operator gesture;
- a 40-character source SHA;
- the numeric workflow-run ID of the prior governed Vercel Operator Release;
- a prior run whose preserved evidence proves that the **first failing canary condition** was provider transport;
- an unchanged production source receipt matching the named source packet;
- the same release concurrency group used by deployment, preventing observation and deployment from overlapping.

The re-observation workflow has `contents: read`, `actions: read`, and `issues: write` only. It carries no Vercel credential, no Git push route, no lock-opening assignment, and no deployment invocation. It checks exact application bytes before the live Loom/Marrowline witness, checks source ownership again afterward, and reconfirms exact bytes after the witness.

```text
provider-held release = historical HELD state
later unchanged-source re-observation = supplementary witness
later PASS ≠ retroactive rewrite of earlier HELD state
deployment_count = 0
deployment_authority = false
counts_as_human_evidence = false
```

Temporal non-retroactivity is mandatory. A later successful provider-backed witness may complete the evidence missing from the unchanged deployed packet, but it cannot rewrite what the earlier release run observed, erase its provider outage, or relabel that historical run as successful. A re-observation failure likewise creates no deployment authority and no automatic retry authority.

This lane must never become a generic production-test escape hatch. A prior output-admission failure, malformed response, relay-admission failure, source mismatch, browser defect, application-byte mismatch, or client transport failure cannot enter through the provider-held gate merely because some other provider attempt also failed.

## Independent relock safety

`vercel-relock-safety.yml` remains separate because its authority differs from validation, deployment, and provider-held observation:

```text
independent relock safety
→ contents write permitted only to close a stranded lock
→ deployment count = 0
→ no browser installation
→ no Vercel invocation
```

Combining this membrane into the validator would widen validator write authority. Deleting it would leave an interrupted fallback capable of stranding the lock open. Provider-held re-observation likewise remains separate because granting its read-only observational authority to the deployment workflow would make a later witness indistinguishable from a second release attempt. These therefore remain distinct members of the five durable workflow authority surfaces.

## Required terminal receipt

A successful receipt must name:

```text
source_packet_commit = <40-character-current-main-sha>
deployment_count = 1
exact_source_content = PASS
stale_queue_stability_window = PASS
post_witness_source_guard = PASS
premerge_chromium_firefox_webkit = REQUIRED_AND_PASSED_BEFORE_MERGE
validation_scope = giving OR practice OR full
production_giving_history = PASS OR NOT_APPLICABLE
production_practice_fixture = PASS OR NOT_APPLICABLE
production_chromium_desktop_mobile = PASS OR NOT_APPLICABLE
ash_lifecycle_deployed_observation = PASS OR NOT_APPLICABLE
application_tree_drift = none
git_auto_deploy = disabled
```

For a provider-held unchanged-source re-observation, the supplementary receipt instead names the prior held run, preserves `prior_release_state = HELD_UNCHANGED`, records `deployment_count = 0`, and binds exact-source evidence on both sides of the live witness. That supplementary receipt does not replace the historical release receipt.

Gate acceptance alone is not a terminal receipt. Deployment success does not become human empirical evidence, child-study authority, custody authority, future release authority, public-route promotion, or program closure.

## Final-cut convergence guard

A public release candidate must be the complete merge result rather than an older feature head.

```text
feature-head green ≠ final cut complete
merge-ref verification = required
exact deployed source packet = required
partial surface success ≠ whole-product release success
```

## Cache-epoch storage boundary

`td613.ash.cache-flush.epoch` is maintenance state used only to make one-time mass eviction idempotent. It remains outside Case Maps, receipts, Save Points, Capsules, source material, and user-authored content.

```text
cache epoch marker = permitted maintenance state
cache epoch marker ≠ case data
cache eviction ≠ IndexedDB deletion
cache eviction ≠ local-custody erasure
```

For A12–A15, graph-wide mass eviction remains reserved for A15 postclosure. A12–A14 use ordinary monotonic asset-version advancement only.

Sealed ⟐